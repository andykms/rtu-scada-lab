import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EDataTypes } from '../../../../../../electron/types/data-types/base-data-type.type';
import {
  ConfirmDialogComponent,
  DialogService,
} from '../../../../libraries/dialog';
import { LanguageProvider } from '../../../../libraries/language/language.directive';
import { ProjectService } from '../../../../libraries/project/project.service';
import { SceneActionsBarComponent } from './actions-bar/actions-bar.component';
import { SceneBlockComponent } from './blocks/scene-block/scene-block.component';
import { buildSceneEdges, buildSceneNodes } from './scene-view.builder';
import { ISceneEdge, ISceneNode, IScenePort, TSceneMode } from './scene.models';

interface IPortAnchor {
  x: number;
  y: number;
}

@Component({
  selector: 'constructor-app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SceneActionsBarComponent, SceneBlockComponent],
})
export class ConstructorAppSceneComponent extends LanguageProvider {
  private readonly projectService = inject(ProjectService);
  private readonly dialogService = inject(DialogService);
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');

  readonly editNode = output<ISceneNode>();

  readonly mode = signal<TSceneMode>('idle');
  readonly panX = signal(0);
  readonly panY = signal(0);
  readonly zoom = signal(1);
  readonly linkFromPort = signal<IScenePort | null>(null);
  readonly previewCursor = signal<{ x: number; y: number } | null>(null);
  readonly portAnchors = signal<Record<string, IPortAnchor>>({});

  private readonly positionsLocal = signal<Record<string, { x: number; y: number }>>({});
  private readonly positionsSave$ = new Subject<Record<string, { x: number; y: number }>>();

  private panning = false;
  private panLast: { x: number; y: number } | null = null;
  private draggingNodeId: string | null = null;
  private dragOrigin: { x: number; y: number; nodeX: number; nodeY: number } | null =
    null;

  readonly nodes = computed(() => {
    const file = this.projectService.projectFile();
    if (!file) {
      return [] as ISceneNode[];
    }
    const labels = this.labels() as Record<string, string>;
    const built = buildSceneNodes(file, labels);
    const local = this.positionsLocal();
    return built.map((node) => {
      const override = local[node.nodeId];
      return override ? { ...node, x: override.x, y: override.y } : node;
    });
  });

  readonly edges = computed(() => {
    const file = this.projectService.projectFile();
    if (!file) {
      return [] as ISceneEdge[];
    }
    return buildSceneEdges(file, this.nodes());
  });

  readonly worldTransform = computed(
    () => `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoom()})`,
  );

  readonly edgePaths = computed(() => {
    const anchors = this.portAnchors();
    return this.edges().map((edge) => {
      const from = anchors[edge.fromPortId];
      const to = anchors[edge.toPortId];
      if (!from || !to) {
        return { ...edge, d: '' };
      }
      return { ...edge, d: this.bezier(from.x, from.y, to.x, to.y) };
    });
  });

  readonly previewPath = computed(() => {
    const fromPort = this.linkFromPort();
    const cursor = this.previewCursor();
    if (!fromPort || !cursor) {
      return '';
    }
    const from = this.portAnchors()[fromPort.portId];
    if (!from) {
      return '';
    }
    return this.bezier(from.x, from.y, cursor.x, cursor.y);
  });

  constructor() {
    super();

    this.positionsSave$
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe((positions) => {
        this.projectService.setSceneNodePositions(positions).subscribe({
          error: () => undefined,
        });
      });

    let lastProjectKey = '';
    effect(() => {
      const file = this.projectService.projectFile();
      const projectKey = file
        ? `${file.projectId}:${file.path}`
        : '';
      if (projectKey === lastProjectKey) {
        return;
      }
      lastProjectKey = projectKey;
      this.positionsLocal.set({});
      this.resetMode();
    });

    effect(() => {
      this.nodes();
      queueMicrotask(() => this.refreshPortAnchors());
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.resetMode();
  }

  protected onModeChange(mode: TSceneMode): void {
    this.mode.set(mode);
    this.linkFromPort.set(null);
    this.previewCursor.set(null);
  }

  protected onViewportWheel(event: WheelEvent): void {
    event.preventDefault();
    const viewport = this.viewport()?.nativeElement;
    if (!viewport) {
      return;
    }
    if (event.ctrlKey) {
      const rect = viewport.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      const oldZoom = this.zoom();
      const next = Math.min(2.5, Math.max(0.35, oldZoom * (event.deltaY < 0 ? 1.1 : 0.9)));
      const scale = next / oldZoom;
      this.panX.set(mx - (mx - this.panX()) * scale);
      this.panY.set(my - (my - this.panY()) * scale);
      this.zoom.set(next);
      return;
    }
    this.panX.update((x) => x - event.deltaX);
    this.panY.update((y) => y - event.deltaY);
  }

  protected onViewportPointerDown(event: PointerEvent): void {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }
    const target = event.target as Element | null;
    if (
      target?.closest('.scene-block') ||
      target?.closest('.actions-bar') ||
      target?.closest('.edge-hit') ||
      target?.closest('.edge-line')
    ) {
      return;
    }
    this.panning = true;
    this.panLast = { x: event.clientX, y: event.clientY };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onViewportPointerMove(event: PointerEvent): void {
    if (this.mode() === 'link' && this.linkFromPort()) {
      this.previewCursor.set(this.clientToWorld(event.clientX, event.clientY));
    }

    if (this.draggingNodeId && this.dragOrigin) {
      const dx = (event.clientX - this.dragOrigin.x) / this.zoom();
      const dy = (event.clientY - this.dragOrigin.y) / this.zoom();
      const next = {
        x: this.dragOrigin.nodeX + dx,
        y: this.dragOrigin.nodeY + dy,
      };
      this.positionsLocal.update((map) => ({
        ...map,
        [this.draggingNodeId!]: next,
      }));
      queueMicrotask(() => this.refreshPortAnchors());
      return;
    }

    if (this.panning && this.panLast) {
      this.panX.update((x) => x + (event.clientX - this.panLast!.x));
      this.panY.update((y) => y + (event.clientY - this.panLast!.y));
      this.panLast = { x: event.clientX, y: event.clientY };
    }
  }

  protected onViewportPointerUp(event: PointerEvent): void {
    if (this.draggingNodeId) {
      const pos = this.positionsLocal()[this.draggingNodeId];
      if (pos) {
        this.positionsSave$.next({ [this.draggingNodeId]: pos });
      }
      this.draggingNodeId = null;
      this.dragOrigin = null;
    }
    this.panning = false;
    this.panLast = null;
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  protected onNodeDragStart(node: ISceneNode, event: PointerEvent): void {
    if (this.mode() !== 'idle') {
      return;
    }
    event.stopPropagation();
    this.draggingNodeId = node.nodeId;
    this.dragOrigin = {
      x: event.clientX,
      y: event.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  }

  protected onBlockClick(node: ISceneNode): void {
    if (this.mode() === 'edit') {
      this.editNode.emit(node);
      this.resetMode();
      return;
    }
    if (this.mode() === 'delete') {
      this.onNodeDelete(node);
    }
  }

  protected onNodeDelete(node: ISceneNode): void {
    const labels = this.labels() as Record<string, string>;
    this.dialogService
      .open<boolean, { message: string }>(ConfirmDialogComponent, {
        label: labels['delete'] ?? 'Delete',
        data: {
          message: labels['confirmDeleteBlock'] ?? 'Delete this block?',
        },
        mainActionLabel: labels['delete'] ?? 'Delete',
        secondaryActionLabel: labels['cancel'] ?? 'Cancel',
        size: 's',
      })
      .pipe(filter((confirmed): confirmed is true => confirmed === true))
      .subscribe(() => {
        this.projectService.deleteBlocks(node.memberBlockIds).subscribe({
          next: () => {
            this.positionsLocal.update((map) => {
              const next = { ...map };
              delete next[node.nodeId];
              return next;
            });
            this.resetMode();
            queueMicrotask(() => this.refreshPortAnchors());
          },
        });
      });
  }

  protected onPortClick(port: IScenePort): void {
    if (this.mode() !== 'link') {
      return;
    }
    const from = this.linkFromPort();
    if (!from) {
      if (port.side !== 'right') {
        return;
      }
      this.linkFromPort.set(port);
      return;
    }
    if (port.side !== 'left') {
      return;
    }
    if (!this.isCompatible(from, port)) {
      return;
    }

    const targetNode = this.nodes().find((n) => n.memberBlockIds.includes(port.blockId));
    const uniqueTargets =
      targetNode?.kind === 'httpClient'
        ? [...new Set(targetNode.memberBlockIds)]
        : [port.blockId];

    let remaining = uniqueTargets.length;
    for (const toId of uniqueTargets) {
      this.projectService.connectBlocks(from.blockId, toId).subscribe({
        next: () => {
          remaining -= 1;
          if (remaining <= 0) {
            this.resetMode();
          }
        },
        error: () => {
          remaining -= 1;
          if (remaining <= 0) {
            this.resetMode();
          }
        },
      });
    }
  }

  protected onEdgePointerDown(edge: ISceneEdge, event: PointerEvent): void {
    if (this.mode() !== 'delete') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.projectService.disconnectBlocks(edge.fromBlockId, edge.toBlockId).subscribe({
      next: () => this.resetMode(),
      error: () => this.resetMode(),
    });
  }

  protected isNodeDimmed(node: ISceneNode): boolean {
    const from = this.linkFromPort();
    if (this.mode() !== 'link' || !from) {
      return false;
    }
    if (node.memberBlockIds.includes(from.blockId)) {
      return false;
    }
    return !node.ports.some(
      (port) => port.side === 'left' && this.isCompatible(from, port),
    );
  }

  private isCompatible(from: IScenePort, to: IScenePort): boolean {
    if (to.side !== 'left' || from.side !== 'right') {
      return false;
    }
    if (to.role === 'signal') {
      // Untyped signal (Modbus / HTTP BY_SIGNAL): any producer output triggers.
      if (to.dataType === EDataTypes.NOTHING) {
        return true;
      }
      return from.dataType === to.dataType;
    }
    const targetNode = this.nodes().find((n) => n.memberBlockIds.includes(to.blockId));
    if (targetNode?.kind === 'graphs') {
      return from.dataType === EDataTypes.NUMBER || from.dataType === EDataTypes.STRING;
    }
    return from.dataType === to.dataType;
  }

  private resetMode(): void {
    this.mode.set('idle');
    this.linkFromPort.set(null);
    this.previewCursor.set(null);
  }

  private clientToWorld(clientX: number, clientY: number): { x: number; y: number } {
    const viewport = this.viewport()?.nativeElement;
    if (!viewport) {
      return { x: 0, y: 0 };
    }
    const rect = viewport.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.panX()) / this.zoom(),
      y: (clientY - rect.top - this.panY()) / this.zoom(),
    };
  }

  private bezier(x1: number, y1: number, x2: number, y2: number): string {
    const dx = Math.max(40, Math.abs(x2 - x1) * 0.45);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  private refreshPortAnchors(): void {
    const viewport = this.viewport()?.nativeElement;
    if (!viewport) {
      return;
    }
    const world = viewport.querySelector('.scene-world') as HTMLElement | null;
    if (!world) {
      return;
    }
    const worldRect = world.getBoundingClientRect();
    const zoom = this.zoom();
    const next: Record<string, IPortAnchor> = {};
    const rows = world.querySelectorAll<HTMLElement>('[data-port-id]');
    rows.forEach((row) => {
      const portId = row.dataset['portId'];
      const dot = row.querySelector('.port-dot') as HTMLElement | null;
      if (!portId || !dot) {
        return;
      }
      const r = dot.getBoundingClientRect();
      next[portId] = {
        x: (r.left + r.width / 2 - worldRect.left) / zoom,
        y: (r.top + r.height / 2 - worldRect.top) / zoom,
      };
    });
    this.portAnchors.set(next);
  }
}

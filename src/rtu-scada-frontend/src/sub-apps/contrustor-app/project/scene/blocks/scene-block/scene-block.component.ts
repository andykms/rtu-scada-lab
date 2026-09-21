import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PaperText } from '../../../../../../paper-ui/base/text/text.directive';
import { ISceneNode, IScenePort } from '../../scene.models';

@Component({
  selector: 'constructor-scene-block',
  templateUrl: './scene-block.component.html',
  styleUrls: ['./scene-block.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaperText],
})
export class SceneBlockComponent {
  readonly node = input.required<ISceneNode>();
  readonly dimmed = input(false);
  readonly highlightPortId = input<string | null>(null);
  readonly linkMode = input(false);
  readonly deleteMode = input(false);
  readonly editMode = input(false);

  readonly portClick = output<IScenePort>();
  readonly dragStart = output<PointerEvent>();
  readonly blockClick = output<void>();

  protected leftPorts(): IScenePort[] {
    return this.node().ports.filter((p) => p.side === 'left');
  }

  protected rightPorts(): IScenePort[] {
    return this.node().ports.filter((p) => p.side === 'right');
  }

  private isSelectMode(): boolean {
    return this.deleteMode() || this.editMode();
  }

  protected onPortPointerDown(event: PointerEvent, port: IScenePort): void {
    event.stopPropagation();
    event.preventDefault();
    this.portClick.emit(port);
  }

  protected onHeaderPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    if (this.isSelectMode()) {
      event.stopPropagation();
      event.preventDefault();
      this.blockClick.emit();
      return;
    }
    this.dragStart.emit(event);
  }

  protected onBlockPointerDown(event: PointerEvent): void {
    if (!this.isSelectMode() || event.button !== 0) {
      return;
    }
    const target = event.target as Element | null;
    if (target?.closest('.port-row')) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.blockClick.emit();
  }
}

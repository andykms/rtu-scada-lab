import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { EDataTypes } from '../../../../../../../../electron/types/data-types/base-data-type.type';
import { LanguageProvider } from '../../../../../../libraries/language/language.directive';
import { ProjectService } from '../../../../../../libraries/project/project.service';
import { IProjectBlockInfo } from '../../../../../../libraries/project/project-block-info.type';
import { PaperButton } from '../../../../../../paper-ui/base/button/button.directive';
import { PaperText } from '../../../../../../paper-ui/base/text/text.directive';
import { PaperCard } from '../../../../../../paper-ui/layout/card/card.directive';
import { dataTypeLabelKey } from '../data-type-options';

@Component({
  selector: 'constructor-block-connections-ribbon',
  templateUrl: './block-connections-ribbon.component.html',
  styleUrls: ['./block-connections-ribbon.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaperCard, PaperText, PaperButton],
})
export class BlockConnectionsRibbonComponent extends LanguageProvider {
  private readonly projectService = inject(ProjectService);

  readonly direction = input.required<'inputs' | 'outputs'>();
  readonly matchDataType = input<EDataTypes | null>(null);
  /** When true, list any producers/consumers regardless of data type (e.g. Modbus BY_SIGNAL). */
  readonly matchAny = input(false);
  readonly excludeBlockId = input.required<number>();
  readonly selectedIds = model<number[]>([]);
  readonly title = input<string>('');

  readonly picking = signal(false);

  readonly canPick = computed(() => this.matchAny() || this.matchDataType() != null);

  readonly selectedBlocks = computed(() => {
    const selected = new Set(this.selectedIds());
    return this.projectService.listBlocks().filter((block) => selected.has(block.blockId));
  });

  readonly availableBlocks = computed(() => {
    const selected = new Set(this.selectedIds());
    const exclude = this.excludeBlockId();

    if (this.matchAny()) {
      const candidates =
        this.direction() === 'inputs'
          ? this.projectService.listAnyProducers(exclude)
          : this.projectService.listAnyConsumers(exclude);
      return candidates.filter((block) => !selected.has(block.blockId));
    }

    const dataType = this.matchDataType();
    if (dataType == null) {
      return [] as IProjectBlockInfo[];
    }
    const candidates =
      this.direction() === 'inputs'
        ? this.projectService.listProducersOf(dataType, exclude)
        : this.projectService.listConsumersOf(dataType, exclude);
    return candidates.filter((block) => !selected.has(block.blockId));
  });

  protected dataTypeLabel(type: EDataTypes | null): string {
    const key = dataTypeLabelKey(type);
    if (!key) {
      return '—';
    }
    const labels = this.labels() as Record<string, string>;
    return labels[key] ?? '—';
  }

  protected openPicker(): void {
    if (!this.canPick()) {
      return;
    }
    this.picking.set(true);
  }

  protected closePicker(): void {
    this.picking.set(false);
  }

  protected addBlock(blockId: number): void {
    if (this.selectedIds().includes(blockId)) {
      return;
    }
    this.selectedIds.update((ids) => [...ids, blockId]);
  }

  protected removeBlock(blockId: number): void {
    this.selectedIds.update((ids) => ids.filter((id) => id !== blockId));
  }
}

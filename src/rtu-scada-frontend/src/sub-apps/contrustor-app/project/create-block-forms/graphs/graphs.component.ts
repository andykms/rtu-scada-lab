import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IGraphBlock } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/graphs.type';
import { EGraphType } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/graph-type';
import { TGraphBlockRequestData } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/data-types/graphs.request-data.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import { ProjectService } from '../../../../../libraries/project/project.service';
import { PaperInput, PaperLabel, PaperSelectList, PaperTextfield } from '../../../../../paper-ui/base';
import {
  ICreateBlockDialogData,
  ICreateBlockFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey, dataTypeValues } from '../shared/data-type-options';
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';

const GRAPH_INPUT_TYPES: TGraphBlockRequestData[] = [EDataTypes.NUMBER, EDataTypes.STRING];

@Component({
  selector: 'constructor-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['../shared/create-block-form.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PaperTextfield,
    PaperInput,
    PaperLabel,
    PaperSelectList,
    BlockConnectionsRibbonComponent,
  ],
})
export class GraphsComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IGraphBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();
  private readonly projectService = inject(ProjectService);

  readonly dataTypeVariants = dataTypeValues(GRAPH_INPUT_TYPES);
  readonly inputBlocks = signal<number[]>([]);
  readonly blockId = this.context.data.blockId;
  readonly matchRequestType = signal<EDataTypes>(EDataTypes.NUMBER);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    typeRequestData: [EDataTypes.NUMBER as TGraphBlockRequestData, Validators.required],
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  constructor() {
    super();
    this.form.controls.typeRequestData.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.matchRequestType.set(value));
    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  private submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const blocks = this.projectService.listBlocks();
    const sources = this.inputBlocks().map((sourceBlockId) => {
      const source = blocks.find((block) => block.blockId === sourceBlockId);
      const typeRequestData =
        (source?.typeResponseData as TGraphBlockRequestData | null) ?? raw.typeRequestData;
      return {
        sourceBlockId,
        typeRequestData,
        unit: null,
      };
    });

    this.context.completeWith({
      block: {
        blockId: raw.blockId,
        blockName: raw.blockName.trim(),
        graphType: EGraphType.LINE,
        lineConfig: { sources },
        barConfig: null,
        groupedBarConfig: null,
        histogramConfig: null,
      },
      inputBlocks: this.inputBlocks(),
      outputBlocks: [],
    });
  }
}

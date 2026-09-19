import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { merge, startWith } from 'rxjs';
import { IGraphBlock } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/graphs.type';
import { EGraphType } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/graph-type';
import { TGraphBlockRequestData } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/data-types/graphs.request-data.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import { ProjectService } from '../../../../../libraries/project/project.service';
import {
  PaperButton,
  PaperInput,
  PaperLabel,
  PaperSelectList,
  PaperTextfield,
} from '../../../../../paper-ui/base';
import { PaperText } from '../../../../../paper-ui/base/text/text.directive';
import { PaperCard } from '../../../../../paper-ui/layout/card/card.directive';
import { PaperDivingLine } from '../../../../../paper-ui/layout/diving-line/diving-line.component';
import {
  ICreateBlockDialogData,
  ICreateGraphBlockEntry,
  ICreateGraphsFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey } from '../shared/data-type-options';

const GRAPH_TYPES = [
  EGraphType.LINE,
  EGraphType.BAR,
  EGraphType.GROUPED_BAR,
  EGraphType.HISTOGRAM,
] as const;

const SOURCE_TYPES = new Set<EDataTypes>([EDataTypes.NUMBER, EDataTypes.STRING]);

@Component({
  selector: 'constructor-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['../shared/create-block-form.css', './graphs.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PaperTextfield,
    PaperInput,
    PaperLabel,
    PaperSelectList,
    PaperButton,
    PaperText,
    PaperCard,
    PaperDivingLine,
  ],
})
export class GraphsComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateGraphsFormResult,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();
  private readonly projectService = inject(ProjectService);
  private nextAllocatedId = this.context.data.blockId;

  readonly graphTypeVariants = [...GRAPH_TYPES];
  readonly graphTypes = EGraphType;
  readonly startBlockId = this.context.data.blockId;
  readonly formDirtyExtra = signal(false);

  readonly form = this.fb.nonNullable.group({
    blockName: ['', Validators.required],
    graphs: this.fb.nonNullable.array([this.createGraphGroup()]),
  });

  private readonly formSnapshot = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(startWith(null)),
    { initialValue: null },
  );

  readonly sourceBlockVariants = computed(() => {
    this.formSnapshot();
    const ids = this.projectService
      .listBlocks()
      .filter(
        (block) =>
          block.typeResponseData != null &&
          SOURCE_TYPES.has(block.typeResponseData) &&
          block.blockId !== this.startBlockId,
      )
      .map((block) => block.blockId);
    return [0, ...ids];
  });

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.formDirtyExtra();
    if (!this.form.dirty && !this.formDirtyExtra()) {
      return false;
    }
    if (!this.form.controls.blockName.value.trim()) {
      return false;
    }
    return this.graphs.length > 0;
  });

  readonly resolveGraphTypeLabel = (value: EGraphType | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EGraphType.LINE:
        return map['graphTypeLine'] ?? '';
      case EGraphType.BAR:
        return map['graphTypeBar'] ?? '';
      case EGraphType.GROUPED_BAR:
        return map['graphTypeGroupedBar'] ?? '';
      case EGraphType.HISTOGRAM:
        return map['graphTypeHistogram'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveSourceBlockLabel = (value: number | null): string => {
    if (value == null || value <= 0) {
      return (this.labels() as Record<string, string>)['graphNoSourceBlock'] ?? '';
    }
    const block = this.projectService.listBlocks().find((item) => item.blockId === value);
    if (!block) {
      return `#${value}`;
    }
    const typeKey = dataTypeLabelKey(block.typeResponseData);
    const typeLabel = typeKey
      ? (this.labels() as Record<string, string>)[typeKey] ?? ''
      : '';
    return `${block.blockName} (#${block.blockId})${typeLabel ? ` · ${typeLabel}` : ''}`;
  };

  constructor() {
    super();

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  get graphs(): FormArray {
    return this.form.controls.graphs;
  }

  protected graphTypeOf(group: FormGroup): EGraphType {
    return group.controls['graphType'].value as EGraphType;
  }

  protected sourcesOf(group: FormGroup): FormArray {
    return group.controls['sources'] as FormArray;
  }

  protected columnsOf(group: FormGroup): FormArray {
    return group.controls['columns'] as FormArray;
  }

  protected addGraph(): void {
    this.graphs.push(this.createGraphGroup());
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected removeGraph(index: number): void {
    this.graphs.removeAt(index);
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected addSource(graphIndex: number): void {
    this.sourcesOf(this.graphs.at(graphIndex) as FormGroup).push(this.createSourceRow());
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected removeSource(graphIndex: number, sourceIndex: number): void {
    this.sourcesOf(this.graphs.at(graphIndex) as FormGroup).removeAt(sourceIndex);
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected addColumn(graphIndex: number): void {
    this.columnsOf(this.graphs.at(graphIndex) as FormGroup).push(this.createColumnRow());
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected removeColumn(graphIndex: number, columnIndex: number): void {
    this.columnsOf(this.graphs.at(graphIndex) as FormGroup).removeAt(columnIndex);
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected syncSourceType(sourceGroup: FormGroup): void {
    const blockId = Number(sourceGroup.controls['sourceBlockId'].value);
    sourceGroup.controls['typeRequestData'].setValue(this.resolveSourceType(blockId), {
      emitEvent: false,
    });
  }

  private allocateId(): number {
    return this.nextAllocatedId++;
  }

  private createGraphGroup(): FormGroup {
    return this.fb.nonNullable.group({
      blockId: [this.allocateId()],
      graphType: [EGraphType.LINE as EGraphType, Validators.required],
      sources: this.fb.nonNullable.array([this.createSourceRow()]),
      columns: this.fb.nonNullable.array([this.createColumnRow()]),
      defaultStartValue: [0, Validators.required],
      defaultEndValue: [100, Validators.required],
      defaultStep: [10, [Validators.required, Validators.min(0.000001)]],
    });
  }

  private createSourceRow(): FormGroup {
    return this.fb.nonNullable.group({
      sourceBlockId: [0 as number],
      typeRequestData: [EDataTypes.NUMBER as TGraphBlockRequestData],
      unit: [''],
    });
  }

  private createColumnRow(): FormGroup {
    return this.fb.nonNullable.group({
      columnName: [''],
      sourceBlockId: [0 as number],
      typeRequestData: [EDataTypes.NUMBER as TGraphBlockRequestData],
    });
  }

  private resolveSourceType(blockId: number | null): TGraphBlockRequestData {
    if (blockId == null || blockId <= 0) {
      return EDataTypes.NUMBER;
    }
    const block = this.projectService.listBlocks().find((item) => item.blockId === blockId);
    if (block?.typeResponseData === EDataTypes.STRING) {
      return EDataTypes.STRING;
    }
    return EDataTypes.NUMBER;
  }

  private buildBlock(
    graph: {
      blockId: number;
      graphType: EGraphType;
      sources: Array<{
        sourceBlockId: number;
        typeRequestData: TGraphBlockRequestData;
        unit?: string;
      }>;
      columns: Array<{
        columnName: string;
        sourceBlockId: number;
        typeRequestData: TGraphBlockRequestData;
      }>;
      defaultStartValue: number;
      defaultEndValue: number;
      defaultStep: number;
    },
    blockName: string,
  ): ICreateGraphBlockEntry | null {
    const graphType = graph.graphType;
    const blockId = Number(graph.blockId);

    const empty: IGraphBlock = {
      blockId,
      blockName,
      graphType,
      lineConfig: null,
      barConfig: null,
      groupedBarConfig: null,
      histogramConfig: null,
    };

    if (graphType === EGraphType.LINE) {
      const sources = graph.sources
        .filter((row) => row.sourceBlockId > 0)
        .map((row) => ({
          sourceBlockId: Number(row.sourceBlockId),
          typeRequestData: this.resolveSourceType(row.sourceBlockId),
          unit: (row.unit ?? '').trim() || null,
        }));
      return {
        block: { ...empty, lineConfig: { sources } },
        inputBlocks: sources.map((source) => source.sourceBlockId),
        outputBlocks: [],
      };
    }

    if (graphType === EGraphType.BAR) {
      const columns = graph.columns
        .filter((row) => row.sourceBlockId > 0 && row.columnName.trim())
        .map((row) => ({
          columnName: row.columnName.trim(),
          sourceBlockId: Number(row.sourceBlockId),
          typeRequestData: this.resolveSourceType(row.sourceBlockId),
        }));
      return {
        block: { ...empty, barConfig: { columns } },
        inputBlocks: columns.map((column) => column.sourceBlockId),
        outputBlocks: [],
      };
    }

    if (graphType === EGraphType.GROUPED_BAR) {
      const sources = graph.sources
        .filter((row) => row.sourceBlockId > 0)
        .map((row) => ({
          sourceBlockId: Number(row.sourceBlockId),
          typeRequestData: this.resolveSourceType(row.sourceBlockId),
        }));
      return {
        block: { ...empty, groupedBarConfig: { sources } },
        inputBlocks: sources.map((source) => source.sourceBlockId),
        outputBlocks: [],
      };
    }

    if (graphType === EGraphType.HISTOGRAM) {
      const sources = graph.sources
        .filter((row) => row.sourceBlockId > 0)
        .map((row) => ({
          sourceBlockId: Number(row.sourceBlockId),
          typeRequestData: this.resolveSourceType(row.sourceBlockId),
        }));
      return {
        block: {
          ...empty,
          histogramConfig: {
            sources,
            defaultStartValue: Number(graph.defaultStartValue),
            defaultEndValue: Number(graph.defaultEndValue),
            defaultStep: Number(graph.defaultStep),
          },
        },
        inputBlocks: sources.map((source) => source.sourceBlockId),
        outputBlocks: [],
      };
    }

    return null;
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const blockName = raw.blockName.trim();
    const entries: ICreateGraphBlockEntry[] = [];

    for (const graph of raw.graphs as Array<{
      blockId: number;
      graphType: EGraphType;
      sources: Array<{
        sourceBlockId: number;
        typeRequestData: TGraphBlockRequestData;
        unit?: string;
      }>;
      columns: Array<{
        columnName: string;
        sourceBlockId: number;
        typeRequestData: TGraphBlockRequestData;
      }>;
      defaultStartValue: number;
      defaultEndValue: number;
      defaultStep: number;
    }>) {
      const entry = this.buildBlock(graph, blockName);
      if (entry) {
        entries.push(entry);
      }
    }

    if (!entries.length) {
      return;
    }

    this.context.completeWith({ blocks: entries });
  }
}

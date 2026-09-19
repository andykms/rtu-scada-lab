import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { merge, startWith } from 'rxjs';
import { IIndicatorsBlock } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/indicators.type';
import {
  EIndicatorTriggerType,
  IIndicatorTrigger,
} from '../../../../../../../electron/types/blocks/internal-blocks/indicators/data-types/indicators.trigger.type';
import { IIndicatorNumberConfig } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/data-types/value-configs/indicators.number-config.type';
import { TIndicatorsBlockRequestData } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/data-types/indicators.request-data.type';
import { TIndicatorsBlockResponseData } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/data-types/indicators.response-data.type';
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
  ICreateIndicatorBlockEntry,
  ICreateIndicatorsFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey } from '../shared/data-type-options';

const SOURCE_TYPES = new Set<EDataTypes>([
  EDataTypes.NUMBER,
  EDataTypes.STRING,
  EDataTypes.ARRAY_NUMBERS,
]);

const TRIGGER_TYPES = [
  EIndicatorTriggerType.MAX,
  EIndicatorTriggerType.MIN,
  EIndicatorTriggerType.RANGE,
  EIndicatorTriggerType.EXACT_VALUE,
] as const;

@Component({
  selector: 'constructor-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['../shared/create-block-form.css', './indicators.component.css'],
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
export class IndicatorsComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateIndicatorsFormResult,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();
  private readonly projectService = inject(ProjectService);
  private nextAllocatedId = this.context.data.blockId;

  readonly dataTypes = EDataTypes;
  readonly triggerTypes = EIndicatorTriggerType;
  readonly triggerTypeVariants = [...TRIGGER_TYPES];
  readonly startBlockId = this.context.data.blockId;
  readonly formDirtyExtra = signal(false);

  readonly form = this.fb.nonNullable.group({
    blockName: ['', Validators.required],
    indicators: this.fb.nonNullable.array([this.createIndicatorGroup()]),
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

  readonly outputBlockVariants = computed(() => {
    this.formSnapshot();
    const allocated = new Set(
      this.indicators.controls.map((group) => Number(group.value.blockId)),
    );
    const ids = this.projectService
      .listBlocks()
      .filter(
        (block) =>
          block.typeRequestData === EDataTypes.NUMBER &&
          block.blockId !== this.startBlockId &&
          !allocated.has(block.blockId),
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
    if (this.indicators.length === 0) {
      return false;
    }
    for (const group of this.indicators.controls) {
      const sourceBlockId = Number(group.value.sourceBlockId);
      if (!(sourceBlockId > 0)) {
        return false;
      }
      const sourceType = this.sourceTypeOf(group as FormGroup);
      if (sourceType === EDataTypes.ARRAY_NUMBERS) {
        const index = Number(group.value.valueIndex);
        if (!Number.isFinite(index) || index < 0) {
          return false;
        }
      }
      if (sourceType === EDataTypes.NUMBER || sourceType === EDataTypes.ARRAY_NUMBERS) {
        for (const trigger of this.triggersOf(group as FormGroup).controls) {
          if (!this.isTriggerValid(trigger as FormGroup)) {
            return false;
          }
        }
      }
    }
    return true;
  });

  readonly resolveSourceBlockLabel = (value: number | null): string => {
    if (value == null || value <= 0) {
      return (this.labels() as Record<string, string>)['indicatorNoBlock'] ?? '';
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

  readonly resolveOutputBlockLabel = (value: number | null): string => {
    if (value == null || value <= 0) {
      return (this.labels() as Record<string, string>)['indicatorNoBlock'] ?? '';
    }
    const block = this.projectService.listBlocks().find((item) => item.blockId === value);
    if (!block) {
      return `#${value}`;
    }
    const typeKey = dataTypeLabelKey(block.typeRequestData);
    const typeLabel = typeKey
      ? (this.labels() as Record<string, string>)[typeKey] ?? ''
      : '';
    return `${block.blockName} (#${block.blockId})${typeLabel ? ` · ${typeLabel}` : ''}`;
  };

  readonly resolveTriggerTypeLabel = (value: EIndicatorTriggerType | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EIndicatorTriggerType.MAX:
        return map['indicatorTriggerMax'] ?? '';
      case EIndicatorTriggerType.MIN:
        return map['indicatorTriggerMin'] ?? '';
      case EIndicatorTriggerType.RANGE:
        return map['indicatorTriggerRange'] ?? '';
      case EIndicatorTriggerType.EXACT_VALUE:
        return map['indicatorTriggerExact'] ?? '';
      default:
        return '';
    }
  };

  constructor() {
    super();

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  get indicators(): FormArray {
    return this.form.controls.indicators;
  }

  protected sourceTypeOf(group: FormGroup): EDataTypes | null {
    const blockId = Number(group.controls['sourceBlockId'].value);
    if (!(blockId > 0)) {
      return null;
    }
    return (
      this.projectService.listBlocks().find((block) => block.blockId === blockId)
        ?.typeResponseData ?? null
    );
  }

  protected triggersOf(group: FormGroup): FormArray {
    return group.controls['triggers'] as FormArray;
  }

  protected triggerTypeOf(group: FormGroup): EIndicatorTriggerType {
    return group.controls['triggerType'].value as EIndicatorTriggerType;
  }

  protected addIndicator(): void {
    this.indicators.push(this.createIndicatorGroup());
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected removeIndicator(index: number): void {
    this.indicators.removeAt(index);
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected addTrigger(indicatorIndex: number): void {
    this.triggersOf(this.indicators.at(indicatorIndex) as FormGroup).push(
      this.createTriggerGroup(),
    );
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected removeTrigger(indicatorIndex: number, triggerIndex: number): void {
    this.triggersOf(this.indicators.at(indicatorIndex) as FormGroup).removeAt(triggerIndex);
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  private allocateId(): number {
    return this.nextAllocatedId++;
  }

  private createIndicatorGroup(): FormGroup {
    return this.fb.nonNullable.group({
      blockId: [this.allocateId()],
      sourceBlockId: [0 as number],
      unit: [''],
      valueIndex: [0, [Validators.required, Validators.min(0)]],
      triggers: this.fb.nonNullable.array([] as FormGroup[]),
    });
  }

  private createTriggerGroup(): FormGroup {
    return this.fb.nonNullable.group({
      triggerType: [EIndicatorTriggerType.MAX as EIndicatorTriggerType, Validators.required],
      outputBlockId: [0 as number],
      maxValue: [0, Validators.required],
      minValue: [0, Validators.required],
      rangeMin: [0, Validators.required],
      rangeMax: [0, Validators.required],
      exactValue: [0, Validators.required],
    });
  }

  private isTriggerValid(group: FormGroup): boolean {
    const outputBlockId = Number(group.controls['outputBlockId'].value);
    if (!(outputBlockId > 0)) {
      return false;
    }
    const type = group.controls['triggerType'].value as EIndicatorTriggerType;
    if (type === EIndicatorTriggerType.MAX) {
      return Number.isFinite(Number(group.controls['maxValue'].value));
    }
    if (type === EIndicatorTriggerType.MIN) {
      return Number.isFinite(Number(group.controls['minValue'].value));
    }
    if (type === EIndicatorTriggerType.RANGE) {
      return (
        Number.isFinite(Number(group.controls['rangeMin'].value)) &&
        Number.isFinite(Number(group.controls['rangeMax'].value))
      );
    }
    if (type === EIndicatorTriggerType.EXACT_VALUE) {
      return Number.isFinite(Number(group.controls['exactValue'].value));
    }
    return false;
  }

  private buildNumberConfig(raw: {
    unit: string;
    triggers: Array<{
      triggerType: EIndicatorTriggerType;
      outputBlockId: number;
      maxValue: number;
      minValue: number;
      rangeMin: number;
      rangeMax: number;
      exactValue: number;
    }>;
  }): IIndicatorNumberConfig {
    return {
      unit: raw.unit.trim() || null,
      triggers: raw.triggers
        .filter((row) => row.outputBlockId > 0)
        .map((row) => this.buildTrigger(row)),
    };
  }

  private buildTrigger(row: {
    triggerType: EIndicatorTriggerType;
    outputBlockId: number;
    maxValue: number;
    minValue: number;
    rangeMin: number;
    rangeMax: number;
    exactValue: number;
  }): IIndicatorTrigger {
    const base: IIndicatorTrigger = {
      triggerType: row.triggerType,
      outputBlockId: Number(row.outputBlockId),
      maxConfig: null,
      minConfig: null,
      rangeConfig: null,
      exactValueConfig: null,
    };
    switch (row.triggerType) {
      case EIndicatorTriggerType.MAX:
        return { ...base, maxConfig: { maxValue: Number(row.maxValue) } };
      case EIndicatorTriggerType.MIN:
        return { ...base, minConfig: { minValue: Number(row.minValue) } };
      case EIndicatorTriggerType.RANGE:
        return {
          ...base,
          rangeConfig: {
            minValue: Number(row.rangeMin),
            maxValue: Number(row.rangeMax),
          },
        };
      case EIndicatorTriggerType.EXACT_VALUE:
        return { ...base, exactValueConfig: { value: Number(row.exactValue) } };
      default:
        return base;
    }
  }

  private buildEntry(
    raw: {
      blockId: number;
      sourceBlockId: number;
      unit: string;
      valueIndex: number;
      triggers: Array<{
        triggerType: EIndicatorTriggerType;
        outputBlockId: number;
        maxValue: number;
        minValue: number;
        rangeMin: number;
        rangeMax: number;
        exactValue: number;
      }>;
    },
    blockName: string,
  ): ICreateIndicatorBlockEntry | null {
    const sourceBlockId = Number(raw.sourceBlockId);
    if (!(sourceBlockId > 0)) {
      return null;
    }
    const source = this.projectService
      .listBlocks()
      .find((block) => block.blockId === sourceBlockId);
    const sourceType = source?.typeResponseData;
    if (sourceType == null || !SOURCE_TYPES.has(sourceType)) {
      return null;
    }

    const typeRequestData = sourceType as TIndicatorsBlockRequestData;
    const numberConfig = this.buildNumberConfig(raw);
    const hasTriggers = numberConfig.triggers.length > 0;
    const typeResponseData: TIndicatorsBlockResponseData = hasTriggers
      ? EDataTypes.NUMBER
      : EDataTypes.NOTHING;

    const empty: IIndicatorsBlock = {
      blockId: Number(raw.blockId),
      blockName,
      typeRequestData,
      typeResponseData,
      numberConfig: null,
      stringConfig: null,
      arrayNumbersConfig: null,
    };

    let block: IIndicatorsBlock;
    if (sourceType === EDataTypes.STRING) {
      block = {
        ...empty,
        stringConfig: { unit: raw.unit.trim() || null },
      };
    } else if (sourceType === EDataTypes.ARRAY_NUMBERS) {
      block = {
        ...empty,
        arrayNumbersConfig: {
          valueIndex: Number(raw.valueIndex),
          numberConfig,
        },
      };
    } else {
      block = {
        ...empty,
        numberConfig,
      };
    }

    const outputBlocks = [
      ...new Set(
        numberConfig.triggers
          .map((trigger) => trigger.outputBlockId)
          .filter((id) => id > 0),
      ),
    ];

    return {
      block,
      inputBlocks: [sourceBlockId],
      outputBlocks: sourceType === EDataTypes.STRING ? [] : outputBlocks,
    };
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const blockName = raw.blockName.trim();
    const entries: ICreateIndicatorBlockEntry[] = [];

    for (const indicator of raw.indicators as Array<{
      blockId: number;
      sourceBlockId: number;
      unit: string;
      valueIndex: number;
      triggers: Array<{
        triggerType: EIndicatorTriggerType;
        outputBlockId: number;
        maxValue: number;
        minValue: number;
        rangeMin: number;
        rangeMax: number;
        exactValue: number;
      }>;
    }>) {
      const entry = this.buildEntry(indicator, blockName);
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

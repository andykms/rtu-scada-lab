import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { merge, startWith } from 'rxjs';
import type { IInteractionBlock } from '../../../../../../../electron/types/blocks/internal-blocks/interaction/interaction.type';
import {
  EInteractionTypes,
} from '../../../../../../../electron/types/blocks/internal-blocks/interaction/interaction-types.type';
import type { TInteractionButtonPayloadType } from '../../../../../../../electron/types/blocks/internal-blocks/interaction/data-types/interaction.button-config.type';
import {
  INTERACTION_COORDINATE_PLANE_DEFAULT_MAX,
  INTERACTION_COORDINATE_PLANE_DEFAULT_MIN,
} from '../../../../../../../electron/types/blocks/internal-blocks/interaction/data-types/interaction.coordinate-plane-config.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import {
  PaperCheckbox,
  PaperInput,
  PaperLabel,
  PaperSelectList,
  PaperTextfield,
  PaperButton,
} from '../../../../../paper-ui/base';
import { PaperText } from '../../../../../paper-ui/base/text/text.directive';
import { PaperCard } from '../../../../../paper-ui/layout/card/card.directive';
import { PaperDivingLine } from '../../../../../paper-ui/layout/diving-line/diving-line.component';
import {
  ICreateBlockDialogData,
  ICreateBlockFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey } from '../shared/data-type-options';
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';
import { createFormRevisionTracker } from '../shared/form-revision';

const INTERACTION_TYPE_VARIANTS = [
  EInteractionTypes.BUTTON,
  EInteractionTypes.INPUT_TEXT,
  EInteractionTypes.INPUT_NUMBER,
  EInteractionTypes.TOGGLE_BUTTON,
  EInteractionTypes.GROUP_SWITCH,
  EInteractionTypes.COORDINATE_PLANE,
  EInteractionTypes.SLIDER,
] as const;

const BUTTON_PAYLOAD_TYPES: TInteractionButtonPayloadType[] = [
  EDataTypes.NUMBER,
  EDataTypes.STRING,
  EDataTypes.JSON,
  EDataTypes.BOOLEAN,
];

const BOOLEAN_VALUE_VARIANTS = ['true', 'false'] as const;

type TBooleanValueMode = (typeof BOOLEAN_VALUE_VARIANTS)[number];

@Component({
  selector: 'constructor-interaction',
  templateUrl: './interaction.component.html',
  styleUrls: ['../shared/create-block-form.css', './interaction.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PaperTextfield,
    PaperInput,
    PaperLabel,
    PaperSelectList,
    PaperCheckbox,
    PaperButton,
    PaperText,
    PaperCard,
    PaperDivingLine,
    BlockConnectionsRibbonComponent,
  ],
})
export class InteractionComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IInteractionBlock>,
    ICreateBlockDialogData<IInteractionBlock>
  >();
  private readonly fb = new FormBuilder();

  readonly interactionTypeVariants = [...INTERACTION_TYPE_VARIANTS];
  readonly buttonPayloadTypeVariants = [...BUTTON_PAYLOAD_TYPES];
  readonly booleanValueVariants = [...BOOLEAN_VALUE_VARIANTS];
  readonly interactionTypes = EInteractionTypes;
  readonly dataTypes = EDataTypes;
  readonly blockId = this.context.data.blockId;

  readonly inputBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly connectionsDirty = signal(false);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    interactionType: [null as EInteractionTypes | null],
    // button
    buttonLabel: [''],
    buttonPayloadType: [EDataTypes.STRING as TInteractionButtonPayloadType],
    buttonNumberValue: [0],
    buttonStringValue: [''],
    buttonJsonValue: ['{}'],
    buttonBooleanValue: ['true' as TBooleanValueMode],
    // input text
    textFieldLabel: [''],
    enableTextValidation: [false],
    textMinLength: [null as number | null],
    textMaxLength: [null as number | null],
    textExactLength: [null as number | null],
    textRegex: [''],
    useTextMinLength: [false],
    useTextMaxLength: [false],
    useTextExactLength: [false],
    useTextRegex: [false],
    // input number
    numberFieldLabel: [''],
    numberUnit: [''],
    enableNumberValidation: [false],
    useNumberMin: [false],
    useNumberMax: [false],
    numberMin: [null as number | null],
    numberMax: [null as number | null],
    // toggle
    toggleLabel: [''],
    // group switch
    groupSwitchLabel: [''],
    groupPositions: this.fb.nonNullable.array([
      this.fb.nonNullable.control(''),
      this.fb.nonNullable.control(''),
    ]),
    // coordinate plane
    planeName: [''],
    xAxisName: ['X'],
    yAxisName: ['Y'],
    xMin: [INTERACTION_COORDINATE_PLANE_DEFAULT_MIN],
    xMax: [INTERACTION_COORDINATE_PLANE_DEFAULT_MAX],
    yMin: [INTERACTION_COORDINATE_PLANE_DEFAULT_MIN],
    yMax: [INTERACTION_COORDINATE_PLANE_DEFAULT_MAX],
    // slider
    sliderLabel: [''],
    sliderMin: [0],
    sliderMax: [100],
    sliderStep: [1],
    sliderDefault: [0],
    sliderUnit: [''],
  });

  private readonly formSnapshot = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(startWith(null)),
    { initialValue: null },
  );
  private readonly formRx = createFormRevisionTracker(this.form);

  readonly interactionType = toSignal(
    this.form.controls.interactionType.valueChanges.pipe(
      startWith(this.form.controls.interactionType.value),
    ),
    { initialValue: null as EInteractionTypes | null },
  );

  readonly buttonPayloadType = toSignal(
    this.form.controls.buttonPayloadType.valueChanges.pipe(
      startWith(this.form.controls.buttonPayloadType.value),
    ),
    { initialValue: EDataTypes.STRING as TInteractionButtonPayloadType },
  );

  readonly enableTextValidation = toSignal(
    this.form.controls.enableTextValidation.valueChanges.pipe(
      startWith(this.form.controls.enableTextValidation.value),
    ),
    { initialValue: false },
  );

  readonly useTextMinLength = toSignal(
    this.form.controls.useTextMinLength.valueChanges.pipe(
      startWith(this.form.controls.useTextMinLength.value),
    ),
    { initialValue: false },
  );
  readonly useTextMaxLength = toSignal(
    this.form.controls.useTextMaxLength.valueChanges.pipe(
      startWith(this.form.controls.useTextMaxLength.value),
    ),
    { initialValue: false },
  );
  readonly useTextExactLength = toSignal(
    this.form.controls.useTextExactLength.valueChanges.pipe(
      startWith(this.form.controls.useTextExactLength.value),
    ),
    { initialValue: false },
  );
  readonly useTextRegex = toSignal(
    this.form.controls.useTextRegex.valueChanges.pipe(
      startWith(this.form.controls.useTextRegex.value),
    ),
    { initialValue: false },
  );

  readonly enableNumberValidation = toSignal(
    this.form.controls.enableNumberValidation.valueChanges.pipe(
      startWith(this.form.controls.enableNumberValidation.value),
    ),
    { initialValue: false },
  );
  readonly useNumberMin = toSignal(
    this.form.controls.useNumberMin.valueChanges.pipe(
      startWith(this.form.controls.useNumberMin.value),
    ),
    { initialValue: false },
  );
  readonly useNumberMax = toSignal(
    this.form.controls.useNumberMax.valueChanges.pipe(
      startWith(this.form.controls.useNumberMax.value),
    ),
    { initialValue: false },
  );

  readonly showButton = computed(
    () => this.interactionType() === EInteractionTypes.BUTTON,
  );
  readonly showInputText = computed(
    () => this.interactionType() === EInteractionTypes.INPUT_TEXT,
  );
  readonly showInputNumber = computed(
    () => this.interactionType() === EInteractionTypes.INPUT_NUMBER,
  );
  readonly showToggle = computed(
    () => this.interactionType() === EInteractionTypes.TOGGLE_BUTTON,
  );
  readonly showGroupSwitch = computed(
    () => this.interactionType() === EInteractionTypes.GROUP_SWITCH,
  );
  readonly showCoordinatePlane = computed(
    () => this.interactionType() === EInteractionTypes.COORDINATE_PLANE,
  );
  readonly showSlider = computed(
    () => this.interactionType() === EInteractionTypes.SLIDER,
  );

  readonly showFeedbackRibbon = computed(() => {
    const type = this.interactionType();
    return (
      type === EInteractionTypes.TOGGLE_BUTTON ||
      type === EInteractionTypes.GROUP_SWITCH ||
      type === EInteractionTypes.COORDINATE_PLANE ||
      type === EInteractionTypes.SLIDER
    );
  });

  readonly showOutputRibbon = computed(() => this.interactionType() != null);

  readonly outputDataType = computed((): EDataTypes | null => {
    const type = this.interactionType();
    switch (type) {
      case EInteractionTypes.BUTTON:
        return this.buttonPayloadType();
      case EInteractionTypes.INPUT_TEXT:
      case EInteractionTypes.GROUP_SWITCH:
        return EDataTypes.STRING;
      case EInteractionTypes.INPUT_NUMBER:
      case EInteractionTypes.SLIDER:
        return EDataTypes.NUMBER;
      case EInteractionTypes.TOGGLE_BUTTON:
        return EDataTypes.BOOLEAN;
      case EInteractionTypes.COORDINATE_PLANE:
        return EDataTypes.ARRAY_NUMBERS;
      default:
        return null;
    }
  });

  readonly feedbackDataType = computed((): EDataTypes | null => {
    const type = this.interactionType();
    switch (type) {
      case EInteractionTypes.TOGGLE_BUTTON:
        return EDataTypes.BOOLEAN;
      case EInteractionTypes.GROUP_SWITCH:
        return EDataTypes.STRING;
      case EInteractionTypes.COORDINATE_PLANE:
        return EDataTypes.ARRAY_NUMBERS;
      case EInteractionTypes.SLIDER:
        return EDataTypes.NUMBER;
      default:
        return null;
    }
  });

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.formRx.formRev();
    this.connectionsDirty();
    if (!this.form.controls.blockName.value.trim()) {
      return false;
    }
    const type = this.interactionType();
    if (type == null) {
      return true;
    }
    switch (type) {
      case EInteractionTypes.BUTTON: {
        if (!this.form.controls.buttonLabel.value.trim()) {
          return false;
        }
        const payload = this.buttonPayloadType();
        if (payload === EDataTypes.NUMBER) {
          return !Number.isNaN(Number(this.form.controls.buttonNumberValue.value));
        }
        if (payload === EDataTypes.JSON) {
          return this.isValidJson(this.form.controls.buttonJsonValue.value);
        }
        return true;
      }
      case EInteractionTypes.INPUT_TEXT:
        return !!this.form.controls.textFieldLabel.value.trim();
      case EInteractionTypes.INPUT_NUMBER:
        return !!this.form.controls.numberFieldLabel.value.trim();
      case EInteractionTypes.TOGGLE_BUTTON:
        return !!this.form.controls.toggleLabel.value.trim();
      case EInteractionTypes.GROUP_SWITCH: {
        if (!this.form.controls.groupSwitchLabel.value.trim()) {
          return false;
        }
        const positions = this.groupPositions.getRawValue() as string[];
        const filled = positions.map((p) => p.trim()).filter(Boolean);
        return filled.length >= 2;
      }
      case EInteractionTypes.COORDINATE_PLANE:
        return (
          !!this.form.controls.planeName.value.trim() &&
          !!this.form.controls.xAxisName.value.trim() &&
          !!this.form.controls.yAxisName.value.trim()
        );
      case EInteractionTypes.SLIDER:
        return !!this.form.controls.sliderLabel.value.trim();
      default:
        return true;
    }
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  readonly resolveInteractionTypeLabel = (
    value: EInteractionTypes | null,
  ): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EInteractionTypes.BUTTON:
        return map['interactionTypeButton'] ?? '';
      case EInteractionTypes.INPUT_TEXT:
        return map['interactionTypeInputText'] ?? '';
      case EInteractionTypes.INPUT_NUMBER:
        return map['interactionTypeInputNumber'] ?? '';
      case EInteractionTypes.TOGGLE_BUTTON:
        return map['interactionTypeToggle'] ?? '';
      case EInteractionTypes.GROUP_SWITCH:
        return map['interactionTypeGroupSwitch'] ?? '';
      case EInteractionTypes.COORDINATE_PLANE:
        return map['interactionTypeCoordinatePlane'] ?? '';
      case EInteractionTypes.SLIDER:
        return map['interactionTypeSlider'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveBooleanValueLabel = (value: string | null): string => {
    return value === 'false' ? 'false' : 'true';
  };

  constructor() {
    super();
    this.applyInitialState();
    this.context.setMainActionEnabled(this.canSave());
    // keep main action in sync
    merge(this.form.valueChanges, this.form.statusChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.context.setMainActionEnabled(this.canSave()));
    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  get groupPositions(): FormArray {
    return this.form.controls.groupPositions as FormArray;
  }

  protected onFormDomEvent(): void {
    this.formRx.onFormDomEvent();
    this.context.setMainActionEnabled(this.canSave());
  }

  protected onInputBlocksChange(ids: number[]): void {
    this.inputBlocks.set(ids);
    this.connectionsDirty.set(true);
    this.context.setMainActionEnabled(this.canSave());
  }

  protected onOutputBlocksChange(ids: number[]): void {
    this.outputBlocks.set(ids);
    this.connectionsDirty.set(true);
    this.context.setMainActionEnabled(this.canSave());
  }

  protected addGroupPosition(): void {
    this.groupPositions.push(this.fb.nonNullable.control(''));
    this.form.markAsDirty();
    this.onFormDomEvent();
  }

  protected removeGroupPosition(index: number): void {
    if (this.groupPositions.length <= 2) {
      return;
    }
    this.groupPositions.removeAt(index);
    this.form.markAsDirty();
    this.onFormDomEvent();
  }

  private applyInitialState(): void {
    const data = this.context.data;
    if (data.inputBlocks?.length) {
      this.inputBlocks.set([...data.inputBlocks]);
    }
    if (data.outputBlocks?.length) {
      this.outputBlocks.set([...data.outputBlocks]);
    }
    const block = data.initialBlock;
    if (!block) {
      return;
    }

    this.form.patchValue({
      blockName: block.blockName,
      interactionType: block.interactionType,
    });

    if (block.buttonConfig) {
      this.form.patchValue({
        buttonLabel: block.buttonConfig.buttonLabel,
        buttonPayloadType: block.buttonConfig.payloadType,
        buttonNumberValue: block.buttonConfig.numberValue ?? 0,
        buttonStringValue: block.buttonConfig.stringValue ?? '',
        buttonJsonValue: block.buttonConfig.jsonValue ?? '{}',
        buttonBooleanValue: block.buttonConfig.booleanValue === false ? 'false' : 'true',
      });
    }
    if (block.inputTextConfig) {
      const v = block.inputTextConfig.validation;
      this.form.patchValue({
        textFieldLabel: block.inputTextConfig.fieldLabel,
        enableTextValidation: !!v,
        useTextMinLength: v?.minLength != null,
        textMinLength: v?.minLength ?? null,
        useTextMaxLength: v?.maxLength != null,
        textMaxLength: v?.maxLength ?? null,
        useTextExactLength: v?.length != null,
        textExactLength: v?.length ?? null,
        useTextRegex: !!v?.regularExpression,
        textRegex: v?.regularExpression ?? '',
      });
    }
    if (block.inputNumberConfig) {
      const v = block.inputNumberConfig.validation;
      this.form.patchValue({
        numberFieldLabel: block.inputNumberConfig.fieldLabel,
        numberUnit: block.inputNumberConfig.unit ?? '',
        enableNumberValidation: !!v,
        useNumberMin: v?.min != null,
        numberMin: v?.min ?? null,
        useNumberMax: v?.max != null,
        numberMax: v?.max ?? null,
      });
    }
    if (block.toggleConfig) {
      this.form.patchValue({ toggleLabel: block.toggleConfig.toggleLabel });
    }
    if (block.groupSwitchConfig) {
      this.form.patchValue({
        groupSwitchLabel: block.groupSwitchConfig.switchLabel,
      });
      this.groupPositions.clear();
      const positions = block.groupSwitchConfig.positions.length
        ? block.groupSwitchConfig.positions
        : ['', ''];
      for (const position of positions) {
        this.groupPositions.push(this.fb.nonNullable.control(position));
      }
      while (this.groupPositions.length < 2) {
        this.groupPositions.push(this.fb.nonNullable.control(''));
      }
    }
    if (block.coordinatePlaneConfig) {
      const c = block.coordinatePlaneConfig;
      this.form.patchValue({
        planeName: c.planeName,
        xAxisName: c.xAxisName,
        yAxisName: c.yAxisName,
        xMin: c.xMin,
        xMax: c.xMax,
        yMin: c.yMin,
        yMax: c.yMax,
      });
    }
    if (block.sliderConfig) {
      const s = block.sliderConfig;
      this.form.patchValue({
        sliderLabel: s.sliderLabel,
        sliderMin: s.min,
        sliderMax: s.max,
        sliderStep: s.step,
        sliderDefault: s.defaultValue,
        sliderUnit: s.unit ?? '',
      });
    }
  }

  private isValidJson(raw: string): boolean {
    try {
      JSON.parse(raw);
      return true;
    } catch {
      return false;
    }
  }

  private buildBlock(raw: ReturnType<typeof this.form.getRawValue>): IInteractionBlock {
    const type = raw.interactionType;
    const empty: IInteractionBlock = {
      blockId: raw.blockId,
      blockName: raw.blockName.trim(),
      interactionType: type,
      buttonConfig: null,
      inputTextConfig: null,
      inputNumberConfig: null,
      toggleConfig: null,
      groupSwitchConfig: null,
      coordinatePlaneConfig: null,
      sliderConfig: null,
    };

    switch (type) {
      case EInteractionTypes.BUTTON: {
        const payload = raw.buttonPayloadType;
        return {
          ...empty,
          buttonConfig: {
            buttonLabel: raw.buttonLabel.trim(),
            payloadType: payload,
            numberValue: payload === EDataTypes.NUMBER ? Number(raw.buttonNumberValue) : null,
            stringValue: payload === EDataTypes.STRING ? raw.buttonStringValue : null,
            jsonValue: payload === EDataTypes.JSON ? raw.buttonJsonValue : null,
            booleanValue:
              payload === EDataTypes.BOOLEAN
                ? raw.buttonBooleanValue === 'true'
                : null,
          },
        };
      }
      case EInteractionTypes.INPUT_TEXT: {
        const validation = raw.enableTextValidation
          ? {
              minLength: raw.useTextMinLength ? Number(raw.textMinLength) : null,
              maxLength: raw.useTextMaxLength ? Number(raw.textMaxLength) : null,
              length: raw.useTextExactLength ? Number(raw.textExactLength) : null,
              regularExpression: raw.useTextRegex
                ? raw.textRegex.trim() || null
                : null,
            }
          : null;
        const hasValidation =
          validation &&
          (validation.minLength != null ||
            validation.maxLength != null ||
            validation.length != null ||
            validation.regularExpression != null);
        return {
          ...empty,
          inputTextConfig: {
            fieldLabel: raw.textFieldLabel.trim(),
            validation: hasValidation ? validation : null,
          },
        };
      }
      case EInteractionTypes.INPUT_NUMBER: {
        const validation = raw.enableNumberValidation
          ? {
              min: raw.useNumberMin ? Number(raw.numberMin) : null,
              max: raw.useNumberMax ? Number(raw.numberMax) : null,
            }
          : null;
        const hasValidation =
          validation && (validation.min != null || validation.max != null);
        return {
          ...empty,
          inputNumberConfig: {
            fieldLabel: raw.numberFieldLabel.trim(),
            unit: raw.numberUnit.trim() || null,
            validation: hasValidation ? validation : null,
          },
        };
      }
      case EInteractionTypes.TOGGLE_BUTTON:
        return {
          ...empty,
          toggleConfig: { toggleLabel: raw.toggleLabel.trim() },
        };
      case EInteractionTypes.GROUP_SWITCH: {
        const positions = (raw.groupPositions as string[])
          .map((p) => p.trim())
          .filter(Boolean);
        return {
          ...empty,
          groupSwitchConfig: {
            switchLabel: raw.groupSwitchLabel.trim(),
            positions,
          },
        };
      }
      case EInteractionTypes.COORDINATE_PLANE:
        return {
          ...empty,
          coordinatePlaneConfig: {
            planeName: raw.planeName.trim(),
            xAxisName: raw.xAxisName.trim(),
            yAxisName: raw.yAxisName.trim(),
            xMin: Number(raw.xMin),
            xMax: Number(raw.xMax),
            yMin: Number(raw.yMin),
            yMax: Number(raw.yMax),
          },
        };
      case EInteractionTypes.SLIDER:
        return {
          ...empty,
          sliderConfig: {
            sliderLabel: raw.sliderLabel.trim(),
            min: Number(raw.sliderMin),
            max: Number(raw.sliderMax),
            step: Number(raw.sliderStep),
            defaultValue: Number(raw.sliderDefault),
            unit: raw.sliderUnit.trim() || null,
          },
        };
      default:
        return empty;
    }
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const type = raw.interactionType;
    const inputBlocks = this.showFeedbackRibbon() ? this.inputBlocks() : [];
    const outputBlocks = type != null ? this.outputBlocks() : [];
    this.context.completeWith({
      block: this.buildBlock(raw),
      inputBlocks,
      outputBlocks,
    });
  }
}

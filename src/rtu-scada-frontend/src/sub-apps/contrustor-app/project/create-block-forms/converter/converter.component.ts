import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
import { IConverterBlock } from '../../../../../../../electron/types/blocks/internal-blocks/converter/converter.type';
import {
  EConverterInputArrayNumbersOutputNumberType,
  IConverterTypeConfig,
} from '../../../../../../../electron/types/blocks/internal-blocks/converter/converter.type-config.type';
import {
  EConverterValueNumberType,
  EConverterValueStringType,
  IConverterValueConfig,
  IConverterValueNumberConfig,
  IConverterValueStringConfig,
} from '../../../../../../../electron/types/blocks/internal-blocks/converter/converter.value-config.type';
import {
  IConverterFilterJsonField,
  IConverterFilterNumberConfig,
  IConverterFilterStringConfig,
  ICoverterFilterConfig,
} from '../../../../../../../electron/types/blocks/internal-blocks/converter/converter.filter-config.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import {
  PaperButton,
  PaperCheckbox,
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
  ICreateBlockFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey, dataTypeValues } from '../shared/data-type-options';
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';
import { createFormRevisionTracker } from '../shared/form-revision';

const INPUT_TYPES = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.BYTES,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.ANY_FILE,
  EDataTypes.JSON,
  EDataTypes.ARRAY_NUMBERS,
] as const;

const OUTPUT_BY_INPUT: Partial<Record<EDataTypes, EDataTypes[]>> = {
  [EDataTypes.STRING]: [EDataTypes.STRING, EDataTypes.NUMBER, EDataTypes.BYTES],
  [EDataTypes.NUMBER]: [EDataTypes.NUMBER, EDataTypes.STRING, EDataTypes.BYTES],
  [EDataTypes.BYTES]: [
    EDataTypes.BYTES,
    EDataTypes.IMAGE,
    EDataTypes.VIDEO,
    EDataTypes.AUDIO,
    EDataTypes.ANY_FILE,
    EDataTypes.PDF,
    EDataTypes.STRING,
    EDataTypes.NUMBER,
  ],
  [EDataTypes.IMAGE]: [EDataTypes.IMAGE, EDataTypes.BYTES, EDataTypes.ANY_FILE],
  [EDataTypes.VIDEO]: [EDataTypes.VIDEO, EDataTypes.BYTES, EDataTypes.ANY_FILE],
  [EDataTypes.AUDIO]: [EDataTypes.AUDIO, EDataTypes.BYTES, EDataTypes.ANY_FILE],
  [EDataTypes.ANY_FILE]: [EDataTypes.ANY_FILE, EDataTypes.BYTES],
  [EDataTypes.JSON]: [
    EDataTypes.JSON,
    EDataTypes.STRING,
    EDataTypes.NUMBER,
    EDataTypes.BYTES,
    EDataTypes.ARRAY_NUMBERS,
    EDataTypes.IMAGE,
    EDataTypes.VIDEO,
    EDataTypes.AUDIO,
    EDataTypes.ANY_FILE,
    EDataTypes.PDF,
  ],
  [EDataTypes.ARRAY_NUMBERS]: [
    EDataTypes.ARRAY_NUMBERS,
    EDataTypes.JSON,
    EDataTypes.STRING,
    EDataTypes.NUMBER,
  ],
};

/** JSON→X: field path is optional (checkbox). Other JSON outputs require a path. */
const JSON_OPTIONAL_PATH_OUTPUTS = new Set<EDataTypes>([
  EDataTypes.STRING,
  EDataTypes.BYTES,
  EDataTypes.ARRAY_NUMBERS,
]);

const JSON_FILTER_FIELD_TYPES: EDataTypes[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.JSON,
  EDataTypes.ARRAY_ANY,
];

const ARRAY_NUMBER_OPS = [
  EConverterInputArrayNumbersOutputNumberType.INDEX,
  EConverterInputArrayNumbersOutputNumberType.MIN,
  EConverterInputArrayNumbersOutputNumberType.MAX,
  EConverterInputArrayNumbersOutputNumberType.SUM,
  EConverterInputArrayNumbersOutputNumberType.AVG,
  EConverterInputArrayNumbersOutputNumberType.MODE,
] as const;

const STRING_VALUE_OPS = [
  EConverterValueStringType.CLEAR_RIGHT_PADS,
  EConverterValueStringType.CLEAR_LEFT_PADS,
  EConverterValueStringType.CLEAR_PADS,
  EConverterValueStringType.ADD_STRING_RIGHT,
  EConverterValueStringType.ADD_STRING_LEFT,
  EConverterValueStringType.CUT_STRING,
  EConverterValueStringType.TO_LOWER_CASE,
  EConverterValueStringType.TO_UPPER_CASE,
] as const;

const NUMBER_VALUE_OPS = [
  EConverterValueNumberType.MULTIPLY,
  EConverterValueNumberType.DIVIDE,
  EConverterValueNumberType.PLUS,
  EConverterValueNumberType.MINUS,
  EConverterValueNumberType.ROOT_DEGREE,
  EConverterValueNumberType.LOG,
  EConverterValueNumberType.LN,
  EConverterValueNumberType.SIN,
  EConverterValueNumberType.COS,
  EConverterValueNumberType.TAN,
  EConverterValueNumberType.CAT,
] as const;

const REGEX_PRESETS = ['custom', 'email', 'phone'] as const;

const EMAIL_REGEX = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
const PHONE_REGEX = '^\\+?[0-9\\s()-]{7,20}$';

type TJsonFilterFieldType =
  | EDataTypes.STRING
  | EDataTypes.NUMBER
  | EDataTypes.JSON
  | EDataTypes.ARRAY_ANY;

@Component({
  selector: 'constructor-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['../shared/create-block-form.css', './converter.component.css'],
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
export class ConverterComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IConverterBlock>,
    ICreateBlockDialogData<IConverterBlock>
  >();
  private readonly fb = new FormBuilder();

  readonly inputTypeVariants = dataTypeValues([...INPUT_TYPES]);
  readonly jsonFilterFieldTypeVariants = dataTypeValues(JSON_FILTER_FIELD_TYPES);
  readonly arrayNumberOpVariants = [...ARRAY_NUMBER_OPS];
  readonly stringValueOpVariants = [...STRING_VALUE_OPS];
  readonly numberValueOpVariants = [...NUMBER_VALUE_OPS];
  readonly regexPresetVariants = [...REGEX_PRESETS];
  readonly dataTypes = EDataTypes;
  readonly arrayNumberOps = EConverterInputArrayNumbersOutputNumberType;
  readonly stringValueOps = EConverterValueStringType;
  readonly numberValueOps = EConverterValueNumberType;

  readonly inputBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly connectionsDirty = signal(false);
  readonly blockId = this.context.data.blockId;

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    inputDataType: [EDataTypes.STRING as EDataTypes, Validators.required],
    outputDataType: [EDataTypes.STRING as EDataTypes, Validators.required],
    jsonExtractField: [false],
    jsonFieldPath: [''],
    arrayNumberOp: [
      EConverterInputArrayNumbersOutputNumberType.INDEX as EConverterInputArrayNumbersOutputNumberType,
      Validators.required,
    ],
    arrayNumberIndex: [0, [Validators.min(0)]],
    enableFilter: [false],
    // string filter
    useMinLength: [false],
    minLength: [0 as number | null],
    useMaxLength: [false],
    maxLength: [0 as number | null],
    useExactLength: [false],
    exactLength: [0 as number | null],
    useIsNumber: [false],
    useRegex: [false],
    regexPreset: ['custom' as (typeof REGEX_PRESETS)[number]],
    regularExpression: [''],
    // number filter
    useMoreThan: [false],
    moreThan: [null as number | null],
    useLessThan: [false],
    lessThan: [null as number | null],
    useMoreOrEqual: [false],
    moreOrEqualThan: [null as number | null],
    useLessOrEqual: [false],
    lessOrEqualThan: [null as number | null],
    useEqual: [false],
    equal: [null as number | null],
    useNotEqual: [false],
    notEqual: [null as number | null],
    stringValueSteps: this.fb.nonNullable.array([] as never[]),
    numberValueSteps: this.fb.nonNullable.array([] as never[]),
    jsonFilterFields: this.fb.nonNullable.array([] as never[]),
  });

  private readonly formSnapshot = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(startWith(null)),
    { initialValue: null },
  );
  private readonly formRx = createFormRevisionTracker(this.form);

  readonly inputDataType = toSignal(
    this.form.controls.inputDataType.valueChanges.pipe(
      startWith(this.form.controls.inputDataType.value),
    ),
    { initialValue: EDataTypes.STRING as EDataTypes },
  );

  readonly outputDataType = toSignal(
    this.form.controls.outputDataType.valueChanges.pipe(
      startWith(this.form.controls.outputDataType.value),
    ),
    { initialValue: EDataTypes.STRING as EDataTypes },
  );

  readonly jsonExtractField = toSignal(
    this.form.controls.jsonExtractField.valueChanges.pipe(
      startWith(this.form.controls.jsonExtractField.value),
    ),
    { initialValue: false },
  );

  readonly arrayNumberOp = toSignal(
    this.form.controls.arrayNumberOp.valueChanges.pipe(
      startWith(this.form.controls.arrayNumberOp.value),
    ),
    { initialValue: EConverterInputArrayNumbersOutputNumberType.INDEX },
  );

  readonly enableFilter = toSignal(
    this.form.controls.enableFilter.valueChanges.pipe(
      startWith(this.form.controls.enableFilter.value),
    ),
    { initialValue: false },
  );

  readonly regexPreset = toSignal(
    this.form.controls.regexPreset.valueChanges.pipe(
      startWith(this.form.controls.regexPreset.value),
    ),
    { initialValue: 'custom' as (typeof REGEX_PRESETS)[number] },
  );

  readonly outputTypeVariants = computed(() => {
    const input = this.inputDataType();
    return dataTypeValues(OUTPUT_BY_INPUT[input] ?? [EDataTypes.STRING]);
  });

  /** Effective block output after type conversion — driven only by signals. */
  readonly effectiveOutputType = computed(() => {
    return this.outputDataType();
  });

  readonly showJsonPathCheckbox = computed(
    () =>
      this.inputDataType() === EDataTypes.JSON &&
      JSON_OPTIONAL_PATH_OUTPUTS.has(this.outputDataType()),
  );

  readonly showJsonPathField = computed(() => {
    if (this.inputDataType() !== EDataTypes.JSON) {
      return false;
    }
    if (JSON_OPTIONAL_PATH_OUTPUTS.has(this.outputDataType())) {
      return this.jsonExtractField();
    }
    return true;
  });

  readonly jsonPathRequired = computed(() => {
    if (this.inputDataType() !== EDataTypes.JSON) {
      return false;
    }
    if (JSON_OPTIONAL_PATH_OUTPUTS.has(this.outputDataType())) {
      return this.jsonExtractField();
    }
    return true;
  });

  readonly showArrayNumberOp = computed(
    () =>
      this.inputDataType() === EDataTypes.ARRAY_NUMBERS &&
      this.outputDataType() === EDataTypes.NUMBER,
  );

  readonly showArrayIndex = computed(
    () =>
      this.showArrayNumberOp() &&
      this.arrayNumberOp() === EConverterInputArrayNumbersOutputNumberType.INDEX,
  );

  readonly showStringValueSteps = computed(
    () => this.effectiveOutputType() === EDataTypes.STRING,
  );

  readonly showNumberValueSteps = computed(
    () => this.effectiveOutputType() === EDataTypes.NUMBER,
  );

  readonly showValueStepsSection = computed(
    () => this.showStringValueSteps() || this.showNumberValueSteps(),
  );

  readonly showStringFilter = computed(
    () => this.enableFilter() && this.effectiveOutputType() === EDataTypes.STRING,
  );

  readonly showNumberFilter = computed(
    () => this.enableFilter() && this.effectiveOutputType() === EDataTypes.NUMBER,
  );

  readonly showJsonFilter = computed(
    () => this.enableFilter() && this.effectiveOutputType() === EDataTypes.JSON,
  );

  readonly showFilterSection = computed(() => {
    const type = this.effectiveOutputType();
    return (
      type === EDataTypes.STRING ||
      type === EDataTypes.NUMBER ||
      type === EDataTypes.JSON
    );
  });

  readonly useMinLength = toSignal(
    this.form.controls.useMinLength.valueChanges.pipe(
      startWith(this.form.controls.useMinLength.value),
    ),
    { initialValue: false },
  );
  readonly useMaxLength = toSignal(
    this.form.controls.useMaxLength.valueChanges.pipe(
      startWith(this.form.controls.useMaxLength.value),
    ),
    { initialValue: false },
  );
  readonly useExactLength = toSignal(
    this.form.controls.useExactLength.valueChanges.pipe(
      startWith(this.form.controls.useExactLength.value),
    ),
    { initialValue: false },
  );
  readonly useRegex = toSignal(
    this.form.controls.useRegex.valueChanges.pipe(
      startWith(this.form.controls.useRegex.value),
    ),
    { initialValue: false },
  );
  readonly useMoreThan = toSignal(
    this.form.controls.useMoreThan.valueChanges.pipe(
      startWith(this.form.controls.useMoreThan.value),
    ),
    { initialValue: false },
  );
  readonly useLessThan = toSignal(
    this.form.controls.useLessThan.valueChanges.pipe(
      startWith(this.form.controls.useLessThan.value),
    ),
    { initialValue: false },
  );
  readonly useMoreOrEqual = toSignal(
    this.form.controls.useMoreOrEqual.valueChanges.pipe(
      startWith(this.form.controls.useMoreOrEqual.value),
    ),
    { initialValue: false },
  );
  readonly useLessOrEqual = toSignal(
    this.form.controls.useLessOrEqual.valueChanges.pipe(
      startWith(this.form.controls.useLessOrEqual.value),
    ),
    { initialValue: false },
  );
  readonly useEqual = toSignal(
    this.form.controls.useEqual.valueChanges.pipe(
      startWith(this.form.controls.useEqual.value),
    ),
    { initialValue: false },
  );
  readonly useNotEqual = toSignal(
    this.form.controls.useNotEqual.valueChanges.pipe(
      startWith(this.form.controls.useNotEqual.value),
    ),
    { initialValue: false },
  );

  /** Forces @for to rebind after FormArray replacement. */
  readonly valueStepsRenderKey = signal(0);

  readonly stringStepsView = computed(() => {
    this.valueStepsRenderKey();
    return [...this.stringValueSteps.controls];
  });

  readonly numberStepsView = computed(() => {
    this.valueStepsRenderKey();
    return [...this.numberValueSteps.controls];
  });

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.formRx.formRev();
    this.connectionsDirty();
    this.effectiveOutputType();
    if (!this.form.controls.blockName.value.trim()) {
      return false;
    }
    if (this.jsonPathRequired() && !this.form.controls.jsonFieldPath.value.trim()) {
      return false;
    }
    return true;
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  readonly resolveArrayNumberOpLabel = (
    value: EConverterInputArrayNumbersOutputNumberType | null,
  ): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EConverterInputArrayNumbersOutputNumberType.INDEX:
        return map['converterArrayIndex'] ?? '';
      case EConverterInputArrayNumbersOutputNumberType.MIN:
        return map['converterArrayMin'] ?? '';
      case EConverterInputArrayNumbersOutputNumberType.MAX:
        return map['converterArrayMax'] ?? '';
      case EConverterInputArrayNumbersOutputNumberType.SUM:
        return map['converterArraySum'] ?? '';
      case EConverterInputArrayNumbersOutputNumberType.AVG:
        return map['converterArrayAvg'] ?? '';
      case EConverterInputArrayNumbersOutputNumberType.MODE:
        return map['converterArrayMode'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveStringValueOpLabel = (value: EConverterValueStringType | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EConverterValueStringType.CLEAR_RIGHT_PADS:
        return map['converterTrimRight'] ?? '';
      case EConverterValueStringType.CLEAR_LEFT_PADS:
        return map['converterTrimLeft'] ?? '';
      case EConverterValueStringType.CLEAR_PADS:
        return map['converterTrimBoth'] ?? '';
      case EConverterValueStringType.ADD_STRING_RIGHT:
        return map['converterAddRight'] ?? '';
      case EConverterValueStringType.ADD_STRING_LEFT:
        return map['converterAddLeft'] ?? '';
      case EConverterValueStringType.CUT_STRING:
        return map['converterCut'] ?? '';
      case EConverterValueStringType.TO_LOWER_CASE:
        return map['converterToLower'] ?? '';
      case EConverterValueStringType.TO_UPPER_CASE:
        return map['converterToUpper'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveNumberValueOpLabel = (value: EConverterValueNumberType | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EConverterValueNumberType.MULTIPLY:
        return map['converterMultiply'] ?? '';
      case EConverterValueNumberType.DIVIDE:
        return map['converterDivide'] ?? '';
      case EConverterValueNumberType.PLUS:
        return map['converterPlus'] ?? '';
      case EConverterValueNumberType.MINUS:
        return map['converterMinus'] ?? '';
      case EConverterValueNumberType.ROOT_DEGREE:
        return map['converterRoot'] ?? '';
      case EConverterValueNumberType.LOG:
        return map['converterLog'] ?? '';
      case EConverterValueNumberType.LN:
        return map['converterLn'] ?? '';
      case EConverterValueNumberType.SIN:
        return map['converterSin'] ?? '';
      case EConverterValueNumberType.COS:
        return map['converterCos'] ?? '';
      case EConverterValueNumberType.TAN:
        return map['converterTan'] ?? '';
      case EConverterValueNumberType.CAT:
        return map['converterCot'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveRegexPresetLabel = (value: string | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case 'email':
        return map['converterRegexEmail'] ?? '';
      case 'phone':
        return map['converterRegexPhone'] ?? '';
      case 'custom':
        return map['converterRegexCustom'] ?? '';
      default:
        return '';
    }
  };

  constructor() {
    super();

    this.form.controls.inputDataType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((input) => {
        if (this.skipTypeSideEffects) {
          return;
        }
        const outputs = OUTPUT_BY_INPUT[input] ?? [EDataTypes.STRING];
        if (!outputs.includes(this.form.controls.outputDataType.value)) {
          this.form.controls.outputDataType.setValue(outputs[0]);
        }
        if (input !== EDataTypes.JSON) {
          this.form.controls.jsonExtractField.setValue(false, { emitEvent: false });
        }
      });

    this.form.controls.outputDataType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((output) => {
        if (this.skipTypeSideEffects) {
          return;
        }
        if (!JSON_OPTIONAL_PATH_OUTPUTS.has(output)) {
          this.form.controls.jsonExtractField.setValue(false, { emitEvent: false });
        }
      });

    this.form.controls.regexPreset.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((preset) => {
        if (preset === 'email') {
          this.form.controls.regularExpression.setValue(EMAIL_REGEX);
        } else if (preset === 'phone') {
          this.form.controls.regularExpression.setValue(PHONE_REGEX);
        }
      });

    this.applyInitialState();

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    // Drop value steps that no longer match the effective output type.
    effect(() => {
      if (this.skipTypeSideEffects) {
        return;
      }
      const type = this.effectiveOutputType();
      if (type !== EDataTypes.STRING && this.stringValueSteps.length > 0) {
        this.replaceStringValueSteps([]);
      }
      if (type !== EDataTypes.NUMBER && this.numberValueSteps.length > 0) {
        this.replaceNumberValueSteps([]);
      }
      if (type !== EDataTypes.JSON && this.jsonFilterFields.length > 0) {
        this.jsonFilterFields.clear();
      }
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  private skipTypeSideEffects = false;

  protected onFormDomEvent(): void {
    this.formRx.onFormDomEvent();
  }

  get stringValueSteps(): FormArray {
    return this.form.controls.stringValueSteps as FormArray;
  }

  get numberValueSteps(): FormArray {
    return this.form.controls.numberValueSteps as FormArray;
  }

  get jsonFilterFields(): FormArray {
    return this.form.controls.jsonFilterFields as FormArray;
  }

  protected onInputBlocksChange(ids: number[]): void {
    this.inputBlocks.set(ids);
    this.connectionsDirty.set(true);
  }

  protected onOutputBlocksChange(ids: number[]): void {
    this.outputBlocks.set(ids);
    this.connectionsDirty.set(true);
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

    this.skipTypeSideEffects = true;
    const { outputDataType, jsonExtractField, jsonFieldPath, arrayNumberOp, arrayNumberIndex } =
      this.readTypeConfig(block);

    this.form.patchValue({
        blockName: block.blockName,
        inputDataType: block.inputDataType,
        outputDataType,
        jsonExtractField,
        jsonFieldPath,
        arrayNumberOp,
        arrayNumberIndex,
      });

    this.applyValueConfig(block.convertValueConfig);
    this.applyFilterConfig(block.filterConfig);
    this.formRx.bump();
    queueMicrotask(() => {
      this.skipTypeSideEffects = false;
    });
  }

  private readTypeConfig(block: IConverterBlock): {
    outputDataType: EDataTypes;
    jsonExtractField: boolean;
    jsonFieldPath: string;
    arrayNumberOp: EConverterInputArrayNumbersOutputNumberType;
    arrayNumberIndex: number;
  } {
    const cfg = block.convertTypeConfig;
    const defaults = {
      outputDataType: EDataTypes.STRING as EDataTypes,
      jsonExtractField: false,
      jsonFieldPath: '',
      arrayNumberOp: EConverterInputArrayNumbersOutputNumberType.INDEX,
      arrayNumberIndex: 0,
    };
    switch (block.inputDataType) {
      case EDataTypes.STRING:
        return { ...defaults, outputDataType: cfg.inputTypeString?.outputType ?? EDataTypes.STRING };
      case EDataTypes.NUMBER:
        return { ...defaults, outputDataType: cfg.inputTypeNumber?.outputType ?? EDataTypes.NUMBER };
      case EDataTypes.BYTES:
        return { ...defaults, outputDataType: cfg.inputTypeBytes?.outputType ?? EDataTypes.BYTES };
      case EDataTypes.IMAGE:
        return { ...defaults, outputDataType: cfg.inputTypeImage?.outputType ?? EDataTypes.IMAGE };
      case EDataTypes.VIDEO:
        return { ...defaults, outputDataType: cfg.inputTypeVideo?.outputType ?? EDataTypes.VIDEO };
      case EDataTypes.AUDIO:
        return { ...defaults, outputDataType: cfg.inputTypeAudio?.outputType ?? EDataTypes.AUDIO };
      case EDataTypes.ANY_FILE:
        return { ...defaults, outputDataType: cfg.inputTypeAnyFile?.outputType ?? EDataTypes.ANY_FILE };
      case EDataTypes.JSON: {
        const json = cfg.inputTypeJson;
        const path = json?.jsonFieldConfig?.path?.trim() ?? '';
        const fieldType = json?.jsonFieldConfig?.outputType;
        const topType = json?.outputType;
        // Prefer field type when a path was stored (edit restores extract settings).
        const outputDataType =
          (path ? fieldType : null) ?? topType ?? fieldType ?? EDataTypes.JSON;
        const optional = JSON_OPTIONAL_PATH_OUTPUTS.has(outputDataType);
        return {
          ...defaults,
          outputDataType,
          jsonExtractField: optional ? !!path : false,
          jsonFieldPath: path,
        };
      }
      case EDataTypes.ARRAY_NUMBERS: {
        const arr = cfg.inputTypeArrayNumbers;
        return {
          ...defaults,
          outputDataType: arr?.outputType ?? EDataTypes.ARRAY_NUMBERS,
          arrayNumberOp:
            arr?.numberConfig?.outputType ?? EConverterInputArrayNumbersOutputNumberType.INDEX,
          arrayNumberIndex: arr?.numberConfig?.index ?? 0,
        };
      }
      default:
        return defaults;
    }
  }

  private applyValueConfig(config: IConverterValueConfig): void {
    const stringRows = (config.stringTypeConfig ?? []).map((step) => ({
      convertType: step.convertType,
      addedString:
        step.addStringLeftConfig?.addedString ??
        step.addStringRightConfig?.addedString ??
        '',
      startIndex: step.cutStringConfig?.startIndex ?? 0,
      endIndex: step.cutStringConfig?.endIndex ?? 0,
    }));
    const numberRows = (config.numberTypeConfig ?? []).map((step) => ({
      convertType: step.convertType,
      argument: step.argument ?? '',
      inputInBase: step.logConfig?.inputInBase ?? false,
    }));
    this.replaceStringValueSteps(stringRows);
    this.replaceNumberValueSteps(numberRows);
  }

  private applyFilterConfig(config: ICoverterFilterConfig): void {
    const stringCfg = config.stringTypeConfig;
    const numberCfg = config.numberTypeConfig;
    const jsonCfg = config.jsonTypeConfig;
    const hasFilter = !!(stringCfg || numberCfg || jsonCfg);
    this.form.patchValue(
      {
        enableFilter: hasFilter,
        useMinLength: stringCfg?.minLength != null,
        minLength: stringCfg?.minLength ?? 0,
        useMaxLength: stringCfg?.maxLength != null,
        maxLength: stringCfg?.maxLength ?? 0,
        useExactLength: stringCfg?.length != null,
        exactLength: stringCfg?.length ?? 0,
        useIsNumber: stringCfg?.isNumber === true,
        useRegex: !!stringCfg?.regularExpression,
        regexPreset: 'custom' as (typeof REGEX_PRESETS)[number],
        regularExpression: stringCfg?.regularExpression ?? '',
        useMoreThan: numberCfg?.moreThan != null,
        moreThan: numberCfg?.moreThan ?? null,
        useLessThan: numberCfg?.lessThan != null,
        lessThan: numberCfg?.lessThan ?? null,
        useMoreOrEqual: numberCfg?.moreOrEqualThan != null,
        moreOrEqualThan: numberCfg?.moreOrEqualThan ?? null,
        useLessOrEqual: numberCfg?.lessOrEqualThan != null,
        lessOrEqualThan: numberCfg?.lessOrEqualThan ?? null,
        useEqual: numberCfg?.equal != null,
        equal: numberCfg?.equal ?? null,
        useNotEqual: numberCfg?.notEqual != null,
        notEqual: numberCfg?.notEqual ?? null,
      },
      { emitEvent: false },
    );

    this.jsonFilterFields.clear();
    for (const field of jsonCfg?.fields ?? []) {
      this.jsonFilterFields.push(
        this.fb.nonNullable.group({
          fieldName: [field.fieldName, Validators.required],
          isRequired: [field.isRequired],
          type: [field.type as TJsonFilterFieldType, Validators.required],
          minLength: [
            field.stringTypeConfig?.minLength ??
              field.arrayAnyTypeConfig?.filters?.minLength ??
              null,
          ],
          maxLength: [
            field.stringTypeConfig?.maxLength ??
              field.arrayAnyTypeConfig?.filters?.maxLength ??
              null,
          ],
          regularExpression: [field.stringTypeConfig?.regularExpression ?? ''],
          moreOrEqualThan: [field.numberTypeConfig?.moreOrEqualThan ?? null],
          lessOrEqualThan: [field.numberTypeConfig?.lessOrEqualThan ?? null],
        }),
      );
    }
  }

  protected addStringValueStep(): void {
    const rows = this.stringValueSteps.getRawValue() as Array<{
      convertType: EConverterValueStringType;
      addedString: string;
      startIndex: number;
      endIndex: number;
    }>;
    rows.push({
      convertType: EConverterValueStringType.CLEAR_PADS,
      addedString: '',
      startIndex: 0,
      endIndex: 0,
    });
    this.replaceStringValueSteps(rows);
    this.form.markAsDirty();
  }

  protected removeStringValueStep(index: number): void {
    const rows = this.stringValueSteps.getRawValue() as Array<{
      convertType: EConverterValueStringType;
      addedString: string;
      startIndex: number;
      endIndex: number;
    }>;
    rows.splice(index, 1);
    this.replaceStringValueSteps(rows);
    this.form.markAsDirty();
  }

  protected moveStringValueStep(index: number, delta: number): void {
    const rows = this.stringValueSteps.getRawValue() as Array<{
      convertType: EConverterValueStringType;
      addedString: string;
      startIndex: number;
      endIndex: number;
    }>;
    const target = index + delta;
    if (target < 0 || target >= rows.length) {
      return;
    }
    const [item] = rows.splice(index, 1);
    rows.splice(target, 0, item);
    this.replaceStringValueSteps(rows);
    this.form.markAsDirty();
  }

  protected addNumberValueStep(): void {
    const rows = this.numberValueSteps.getRawValue() as Array<{
      convertType: EConverterValueNumberType;
      argument: string;
      inputInBase: boolean;
    }>;
    rows.push({
      convertType: EConverterValueNumberType.MULTIPLY,
      argument: '1',
      inputInBase: false,
    });
    this.replaceNumberValueSteps(rows);
    this.form.markAsDirty();
  }

  protected removeNumberValueStep(index: number): void {
    const rows = this.numberValueSteps.getRawValue() as Array<{
      convertType: EConverterValueNumberType;
      argument: string;
      inputInBase: boolean;
    }>;
    rows.splice(index, 1);
    this.replaceNumberValueSteps(rows);
    this.form.markAsDirty();
  }

  protected moveNumberValueStep(index: number, delta: number): void {
    const rows = this.numberValueSteps.getRawValue() as Array<{
      convertType: EConverterValueNumberType;
      argument: string;
      inputInBase: boolean;
    }>;
    const target = index + delta;
    if (target < 0 || target >= rows.length) {
      return;
    }
    const [item] = rows.splice(index, 1);
    rows.splice(target, 0, item);
    this.replaceNumberValueSteps(rows);
    this.form.markAsDirty();
  }

  protected addJsonFilterField(): void {
    this.jsonFilterFields.push(this.createJsonFilterField());
    this.form.markAsDirty();
  }

  protected removeJsonFilterField(index: number): void {
    this.jsonFilterFields.removeAt(index);
    this.form.markAsDirty();
  }

  protected stringStepNeedsText(convertType: EConverterValueStringType): boolean {
    return (
      convertType === EConverterValueStringType.ADD_STRING_LEFT ||
      convertType === EConverterValueStringType.ADD_STRING_RIGHT
    );
  }

  protected stringStepNeedsRange(convertType: EConverterValueStringType): boolean {
    return convertType === EConverterValueStringType.CUT_STRING;
  }

  protected numberStepNeedsArgument(convertType: EConverterValueNumberType): boolean {
    return (
      convertType === EConverterValueNumberType.MULTIPLY ||
      convertType === EConverterValueNumberType.DIVIDE ||
      convertType === EConverterValueNumberType.PLUS ||
      convertType === EConverterValueNumberType.MINUS ||
      convertType === EConverterValueNumberType.ROOT_DEGREE ||
      convertType === EConverterValueNumberType.LOG
    );
  }

  protected numberStepIsLog(convertType: EConverterValueNumberType): boolean {
    return convertType === EConverterValueNumberType.LOG;
  }

  protected jsonFilterFieldType(group: FormGroup): TJsonFilterFieldType {
    return group.controls['type'].value as TJsonFilterFieldType;
  }

  private createJsonFilterField() {
    return this.fb.nonNullable.group({
      fieldName: ['', Validators.required],
      isRequired: [true],
      type: [EDataTypes.STRING as TJsonFilterFieldType, Validators.required],
      minLength: [null as number | null],
      maxLength: [null as number | null],
      regularExpression: [''],
      moreOrEqualThan: [null as number | null],
      lessOrEqualThan: [null as number | null],
    });
  }

  private replaceStringValueSteps(
    rows: Array<{
      convertType: EConverterValueStringType;
      addedString: string;
      startIndex: number;
      endIndex: number;
    }>,
  ): void {
    const array = this.stringValueSteps;
    array.clear();
    for (const row of rows) {
      array.push(this.createStringValueStep(row));
    }
    this.valueStepsRenderKey.update((key) => key + 1);
  }

  private replaceNumberValueSteps(
    rows: Array<{
      convertType: EConverterValueNumberType;
      argument: string;
      inputInBase: boolean;
    }>,
  ): void {
    const array = this.numberValueSteps;
    array.clear();
    for (const row of rows) {
      array.push(this.createNumberValueStep(row));
    }
    this.valueStepsRenderKey.update((key) => key + 1);
  }

  private createStringValueStep(initial?: {
    convertType?: EConverterValueStringType;
    addedString?: string;
    startIndex?: number;
    endIndex?: number;
  }) {
    return this.fb.nonNullable.group({
      convertType: [
        (initial?.convertType ??
          EConverterValueStringType.CLEAR_PADS) as EConverterValueStringType,
        Validators.required,
      ],
      addedString: [initial?.addedString ?? ''],
      startIndex: [initial?.startIndex ?? 0],
      endIndex: [initial?.endIndex ?? 0],
    });
  }

  private createNumberValueStep(initial?: {
    convertType?: EConverterValueNumberType;
    argument?: string;
    inputInBase?: boolean;
  }) {
    return this.fb.nonNullable.group({
      convertType: [
        (initial?.convertType ??
          EConverterValueNumberType.MULTIPLY) as EConverterValueNumberType,
        Validators.required,
      ],
      argument: [initial?.argument ?? '1'],
      inputInBase: [initial?.inputInBase ?? false],
    });
  }

  private emptyTypeConfig(): IConverterTypeConfig {
    return {
      inputTypeString: null,
      inputTypeNumber: null,
      inputTypeBytes: null,
      inputTypeImage: null,
      inputTypeVideo: null,
      inputTypeAudio: null,
      inputTypeAnyFile: null,
      inputTypeJson: null,
      inputTypeArrayNumbers: null,
    };
  }

  private buildTypeConfig(raw: ReturnType<typeof this.form.getRawValue>): IConverterTypeConfig {
    const empty = this.emptyTypeConfig();
    const input = raw.inputDataType;
    const output = raw.outputDataType;

    switch (input) {
      case EDataTypes.STRING:
        return { ...empty, inputTypeString: { outputType: output as never } };
      case EDataTypes.NUMBER:
        return { ...empty, inputTypeNumber: { outputType: output as never } };
      case EDataTypes.BYTES:
        return { ...empty, inputTypeBytes: { outputType: output as never } };
      case EDataTypes.IMAGE:
        return { ...empty, inputTypeImage: { outputType: output as never } };
      case EDataTypes.VIDEO:
        return { ...empty, inputTypeVideo: { outputType: output as never } };
      case EDataTypes.AUDIO:
        return { ...empty, inputTypeAudio: { outputType: output as never } };
      case EDataTypes.ANY_FILE:
        return { ...empty, inputTypeAnyFile: { outputType: output as never } };
      case EDataTypes.JSON: {
        const output = raw.outputDataType;
        const usePath =
          !JSON_OPTIONAL_PATH_OUTPUTS.has(output) || raw.jsonExtractField;
        const path = usePath ? raw.jsonFieldPath.trim() : '';
        return {
          ...empty,
          inputTypeJson: {
            outputType: output as never,
            jsonFieldConfig: {
              path,
              outputType: output as never,
            },
          },
        };
      }
      case EDataTypes.ARRAY_NUMBERS:
        return {
          ...empty,
          inputTypeArrayNumbers: {
            outputType: output as never,
            numberConfig:
              output === EDataTypes.NUMBER
                ? {
                    outputType: raw.arrayNumberOp,
                    index:
                      raw.arrayNumberOp ===
                      EConverterInputArrayNumbersOutputNumberType.INDEX
                        ? Number(raw.arrayNumberIndex)
                        : null,
                  }
                : null,
          },
        };
      default:
        return empty;
    }
  }

  private buildValueConfig(raw: ReturnType<typeof this.form.getRawValue>): IConverterValueConfig {
    const effective = this.effectiveOutputType();
    const stringSteps = raw.stringValueSteps as Array<{
      convertType: EConverterValueStringType;
      addedString: string;
      startIndex: number;
      endIndex: number;
    }>;
    const numberSteps = raw.numberValueSteps as Array<{
      convertType: EConverterValueNumberType;
      argument: string;
      inputInBase: boolean;
    }>;

    const stringTypeConfig: IConverterValueStringConfig[] =
      effective === EDataTypes.STRING
        ? stringSteps.map((step) => {
            const convertType = step.convertType;
            return {
              convertType,
              addStringLeftConfig:
                convertType === EConverterValueStringType.ADD_STRING_LEFT
                  ? { addedString: step.addedString }
                  : null,
              addStringRightConfig:
                convertType === EConverterValueStringType.ADD_STRING_RIGHT
                  ? { addedString: step.addedString }
                  : null,
              cutStringConfig:
                convertType === EConverterValueStringType.CUT_STRING
                  ? {
                      startIndex: Number(step.startIndex),
                      endIndex: Number(step.endIndex),
                    }
                  : null,
            };
          })
        : [];

    const numberTypeConfig: IConverterValueNumberConfig[] =
      effective === EDataTypes.NUMBER
        ? numberSteps.map((step) => {
            const convertType = step.convertType;
            const needsArg = this.numberStepNeedsArgument(convertType);
            return {
              convertType,
              argument: needsArg ? step.argument.trim() || null : null,
              logConfig:
                convertType === EConverterValueNumberType.LOG
                  ? { inputInBase: step.inputInBase }
                  : null,
            };
          })
        : [];

    return { stringTypeConfig, numberTypeConfig };
  }

  private buildStringFilter(
    raw: ReturnType<typeof this.form.getRawValue>,
  ): IConverterFilterStringConfig | null {
    if (!raw.enableFilter || this.effectiveOutputType() !== EDataTypes.STRING) {
      return null;
    }
    const config: IConverterFilterStringConfig = {
      minLength: raw.useMinLength ? Number(raw.minLength) : null,
      maxLength: raw.useMaxLength ? Number(raw.maxLength) : null,
      length: raw.useExactLength ? Number(raw.exactLength) : null,
      isNumber: raw.useIsNumber ? true : null,
      regularExpression: raw.useRegex ? raw.regularExpression.trim() || null : null,
    };
    if (
      config.minLength == null &&
      config.maxLength == null &&
      config.length == null &&
      config.isNumber == null &&
      config.regularExpression == null
    ) {
      return null;
    }
    return config;
  }

  private buildNumberFilter(
    raw: ReturnType<typeof this.form.getRawValue>,
  ): IConverterFilterNumberConfig | null {
    if (!raw.enableFilter || this.effectiveOutputType() !== EDataTypes.NUMBER) {
      return null;
    }
    const config: IConverterFilterNumberConfig = {
      moreThan: raw.useMoreThan ? Number(raw.moreThan) : null,
      lessThan: raw.useLessThan ? Number(raw.lessThan) : null,
      moreOrEqualThan: raw.useMoreOrEqual ? Number(raw.moreOrEqualThan) : null,
      lessOrEqualThan: raw.useLessOrEqual ? Number(raw.lessOrEqualThan) : null,
      equal: raw.useEqual ? Number(raw.equal) : null,
      notEqual: raw.useNotEqual ? Number(raw.notEqual) : null,
    };
    if (
      config.moreThan == null &&
      config.lessThan == null &&
      config.moreOrEqualThan == null &&
      config.lessOrEqualThan == null &&
      config.equal == null &&
      config.notEqual == null
    ) {
      return null;
    }
    return config;
  }

  private buildJsonFilter(
    raw: ReturnType<typeof this.form.getRawValue>,
  ): ICoverterFilterConfig['jsonTypeConfig'] {
    if (!raw.enableFilter || this.effectiveOutputType() !== EDataTypes.JSON) {
      return null;
    }
    const fieldsRaw = raw.jsonFilterFields as Array<{
      fieldName: string;
      isRequired: boolean;
      type: TJsonFilterFieldType;
      minLength: number | null;
      maxLength: number | null;
      regularExpression: string;
      moreOrEqualThan: number | null;
      lessOrEqualThan: number | null;
    }>;
    const fields: IConverterFilterJsonField[] = fieldsRaw
      .filter((field) => field.fieldName.trim())
      .map((field) => {
        const type = field.type;
        return {
          fieldName: field.fieldName.trim(),
          isRequired: field.isRequired,
          type,
          stringTypeConfig:
            type === EDataTypes.STRING
              ? {
                  minLength: field.minLength != null ? Number(field.minLength) : null,
                  maxLength: field.maxLength != null ? Number(field.maxLength) : null,
                  length: null,
                  isNumber: null,
                  regularExpression: field.regularExpression.trim() || null,
                }
              : null,
          numberTypeConfig:
            type === EDataTypes.NUMBER
              ? {
                  moreThan: null,
                  lessThan: null,
                  moreOrEqualThan:
                    field.moreOrEqualThan != null ? Number(field.moreOrEqualThan) : null,
                  lessOrEqualThan:
                    field.lessOrEqualThan != null ? Number(field.lessOrEqualThan) : null,
                  equal: null,
                  notEqual: null,
                }
              : null,
          jsonTypeConfig: type === EDataTypes.JSON ? { fields: [] } : null,
          arrayAnyTypeConfig:
            type === EDataTypes.ARRAY_ANY
              ? {
                  filters: {
                    minLength: field.minLength != null ? Number(field.minLength) : null,
                    maxLength: field.maxLength != null ? Number(field.maxLength) : null,
                    length: null,
                  },
                  type: EDataTypes.STRING,
                  stringTypeConfig: null,
                  numberTypeConfig: null,
                  jsonTypeConfig: null,
                  arrayAnyTypeConfig: null,
                }
              : null,
        };
      });
    return fields.length ? { fields } : null;
  }

  private buildFilterConfig(
    raw: ReturnType<typeof this.form.getRawValue>,
  ): ICoverterFilterConfig {
    return {
      stringTypeConfig: this.buildStringFilter(raw),
      numberTypeConfig: this.buildNumberFilter(raw),
      jsonTypeConfig: this.buildJsonFilter(raw),
    };
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.context.completeWith({
      block: {
        blockId: raw.blockId,
        blockName: raw.blockName.trim(),
        inputDataType: raw.inputDataType,
        convertTypeConfig: this.buildTypeConfig(raw),
        convertValueConfig: this.buildValueConfig(raw),
        filterConfig: this.buildFilterConfig(raw),
      },
      inputBlocks: this.inputBlocks(),
      outputBlocks: this.outputBlocks(),
    });
  }
}

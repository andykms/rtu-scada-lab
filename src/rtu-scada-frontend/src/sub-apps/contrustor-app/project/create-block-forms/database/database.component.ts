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
import { IDatabaseBlock } from '../../../../../../../electron/types/blocks/network-blocks/database/database.type';
import { EDatabaseQueryType } from '../../../../../../../electron/types/blocks/network-blocks/database/database-query-type';
import { EDatabaseVariants } from '../../../../../../../electron/types/blocks/network-blocks/database/database.variants';
import { EDatabaseFilterTypes } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/database.filter-types';
import { EDatabaseOperatorTypes } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/database.operator-types';
import { TDatabaseInsertQueryDataTypes } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/database.insert-query-data.type';
import { TDatabaseRawDataTypes } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/database.raw-types';
import { TDatabaseUpdateDataTypes } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/database.update-types';
import { IDatabaseQueryValue } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/database.value.type';
import { IDatabaseUpdateQueryFilter } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/query-configs/database.update-query-config.type';
import {
  ENonRealtimeSettingOption,
  ITimeRequestSettings,
} from '../../../../../../../electron/types/blocks/network-blocks/non-realtime-network-block.type';
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
import {
  DEFAULT_BLOCK_OPTIONS,
  DEFAULT_TIME_REQUEST_SETTINGS,
} from '../shared/network-block.defaults';
import { createFormRevisionTracker } from '../shared/form-revision';

const RAW_TYPES: TDatabaseRawDataTypes[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.JSON,
];

const INSERT_TYPES: TDatabaseInsertQueryDataTypes[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.JSON,
  EDataTypes.ARRAY_NUMBERS,
  EDataTypes.ANY_FILE,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.BYTES,
];

const UPDATE_TYPES: TDatabaseUpdateDataTypes[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.JSON,
];

const RAW_TIME_OPTIONS = [
  ENonRealtimeSettingOption.BY_SIGNAL,
  ENonRealtimeSettingOption.INTERVAL,
] as const;

const FILTER_TYPES = [
  EDatabaseFilterTypes.EQUAL,
  EDatabaseFilterTypes.MORE,
  EDatabaseFilterTypes.LESS,
  EDatabaseFilterTypes.MORE_OR_EQUAL,
  EDatabaseFilterTypes.LESS_OR_EQUAL,
  EDatabaseFilterTypes.NOT_EQUAL,
] as const;

const OPERATOR_TYPES = [EDatabaseOperatorTypes.AND, EDatabaseOperatorTypes.OR] as const;

const JSON_PREFIX = 'JSON';

const FILE_TYPES = new Set<EDataTypes>([
  EDataTypes.ANY_FILE,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
]);

const PATH_TYPES = new Set<EDataTypes>([EDataTypes.JSON, EDataTypes.ARRAY_NUMBERS]);

type TValueSource = 'inline' | 'fromBlock';

@Component({
  selector: 'constructor-database',
  templateUrl: './database.component.html',
  styleUrls: ['../shared/create-block-form.css', './database.component.css'],
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
    PaperCheckbox,
    PaperText,
    PaperCard,
    PaperDivingLine,
    BlockConnectionsRibbonComponent,
  ],
})
export class DatabaseComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IDatabaseBlock>,
    ICreateBlockDialogData<IDatabaseBlock>
  >();
  private readonly fb = new FormBuilder();

  readonly dataTypes = EDataTypes;
  readonly queryTypes = EDatabaseQueryType;
  readonly dbVariants = EDatabaseVariants;
  readonly timeOptions = ENonRealtimeSettingOption;

  readonly databaseVariants = [
    EDatabaseVariants.POSTGRESQL,
    EDatabaseVariants.MYSQL,
    EDatabaseVariants.SQLITE,
  ];
  readonly queryTypeVariants = [
    EDatabaseQueryType.RAW,
    EDatabaseQueryType.INSERT,
    EDatabaseQueryType.UPDATE,
  ];
  readonly rawTimeVariants = [...RAW_TIME_OPTIONS];
  readonly rawTypeVariants = dataTypeValues(RAW_TYPES);
  readonly insertTypeVariants = dataTypeValues(INSERT_TYPES);
  readonly updateTypeVariants = dataTypeValues(UPDATE_TYPES);
  readonly filterTypeVariants = [...FILTER_TYPES];
  readonly operatorVariants = [...OPERATOR_TYPES];
  readonly valueSourceVariants: TValueSource[] = ['inline', 'fromBlock'];

  readonly blockId = this.context.data.blockId;
  readonly inputBlocks = signal<number[]>([]);
  readonly connectionsDirty = signal(false);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    isDemoMode: [false],
    databaseVariant: [EDatabaseVariants.POSTGRESQL as EDatabaseVariants, Validators.required],
    host: ['localhost', Validators.required],
    port: [5432, [Validators.required, Validators.min(1), Validators.max(65535)]],
    username: ['', Validators.required],
    password: [''],
    databaseName: ['', Validators.required],
    queryType: [EDatabaseQueryType.RAW as EDatabaseQueryType, Validators.required],
    // RAW
    rawQuery: [''],
    rawTimeOption: [
      ENonRealtimeSettingOption.BY_SIGNAL as ENonRealtimeSettingOption,
      Validators.required,
    ],
    rawPeriod: [1000, [Validators.min(1)]],
    rawTypeRequestData: [EDataTypes.STRING as TDatabaseRawDataTypes, Validators.required],
    // INSERT
    insertTable: [''],
    insertSchema: [''],
    insertDatabase: [''],
    insertTypeRequestData: [
      EDataTypes.STRING as TDatabaseInsertQueryDataTypes,
      Validators.required,
    ],
    insertValues: this.fb.nonNullable.array([this.createValueRow()]),
    // UPDATE
    updateTable: [''],
    updateSchema: [''],
    updateDatabase: [''],
    updateTypeRequestData: [EDataTypes.STRING as TDatabaseUpdateDataTypes, Validators.required],
    updateValues: this.fb.nonNullable.array([this.createValueRow()]),
    updateFilters: this.fb.nonNullable.array([] as FormGroup[]),
  });

  private readonly formRx = createFormRevisionTracker(this.form);

  private readonly formSnapshot = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(startWith(null)),
    { initialValue: null },
  );

  readonly isDemoMode = toSignal(
    this.form.controls.isDemoMode.valueChanges.pipe(
      startWith(this.form.controls.isDemoMode.value),
    ),
    { initialValue: false },
  );

  readonly databaseVariant = toSignal(
    this.form.controls.databaseVariant.valueChanges.pipe(
      startWith(this.form.controls.databaseVariant.value),
    ),
    { initialValue: EDatabaseVariants.POSTGRESQL },
  );

  readonly queryType = toSignal(
    this.form.controls.queryType.valueChanges.pipe(
      startWith(this.form.controls.queryType.value),
    ),
    { initialValue: EDatabaseQueryType.RAW },
  );

  readonly rawTimeOption = toSignal(
    this.form.controls.rawTimeOption.valueChanges.pipe(
      startWith(this.form.controls.rawTimeOption.value),
    ),
    { initialValue: ENonRealtimeSettingOption.BY_SIGNAL },
  );

  readonly rawTypeRequestData = toSignal(
    this.form.controls.rawTypeRequestData.valueChanges.pipe(
      startWith(this.form.controls.rawTypeRequestData.value),
    ),
    { initialValue: EDataTypes.STRING as TDatabaseRawDataTypes },
  );

  readonly insertTypeRequestData = toSignal(
    this.form.controls.insertTypeRequestData.valueChanges.pipe(
      startWith(this.form.controls.insertTypeRequestData.value),
    ),
    { initialValue: EDataTypes.STRING as TDatabaseInsertQueryDataTypes },
  );

  readonly updateTypeRequestData = toSignal(
    this.form.controls.updateTypeRequestData.valueChanges.pipe(
      startWith(this.form.controls.updateTypeRequestData.value),
    ),
    { initialValue: EDataTypes.STRING as TDatabaseUpdateDataTypes },
  );

  readonly matchRequestType = computed((): EDataTypes | null => {
    this.formSnapshot();
    if (this.isDemoMode()) {
      return null;
    }
    const qt = this.queryType();
    if (qt === EDatabaseQueryType.RAW) {
      if (this.rawTimeOption() !== ENonRealtimeSettingOption.BY_SIGNAL) {
        return null;
      }
      return this.rawTypeRequestData();
    }
    if (qt === EDatabaseQueryType.INSERT) {
      return this.insertTypeRequestData();
    }
    if (qt === EDatabaseQueryType.UPDATE) {
      return this.updateTypeRequestData();
    }
    return null;
  });

  readonly showSqlInjectionWarning = computed(() => {
    if (this.queryType() !== EDatabaseQueryType.RAW) {
      return false;
    }
    if (this.rawTimeOption() !== ENonRealtimeSettingOption.BY_SIGNAL) {
      return false;
    }
    const type = this.rawTypeRequestData();
    return type === EDataTypes.STRING || type === EDataTypes.NUMBER;
  });

  readonly insertUsesPath = computed(() => PATH_TYPES.has(this.insertTypeRequestData()));
  readonly insertUsesFile = computed(() => FILE_TYPES.has(this.insertTypeRequestData()));
  readonly insertUsesBytes = computed(() => this.insertTypeRequestData() === EDataTypes.BYTES);
  readonly updateUsesPath = computed(() => this.updateTypeRequestData() === EDataTypes.JSON);

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.formRx.formRev();
    this.connectionsDirty();
    if (!String(this.form.controls.blockName.value ?? '').trim()) {
      return false;
    }
    if (this.isDemoMode()) {
      return true;
    }
    if (!this.isConnectionValid()) {
      return false;
    }
    const qt = this.queryType();
    if (qt === EDatabaseQueryType.RAW) {
      if (!String(this.form.controls.rawQuery.value ?? '').trim()) {
        return false;
      }
      if (this.rawTimeOption() === ENonRealtimeSettingOption.INTERVAL) {
        return Number(this.form.controls.rawPeriod.value) > 0;
      }
      return true;
    }
    if (qt === EDatabaseQueryType.INSERT) {
      if (!String(this.form.controls.insertTable.value ?? '').trim()) {
        return false;
      }
      const dataType = this.insertTypeRequestData();
      const rows = this.insertValues.controls.filter(
        (row) => !this.isValueRowEmpty(row as FormGroup),
      );
      if (rows.length === 0) {
        return false;
      }
      return rows.every((row) => this.isValueRowValid(row as FormGroup, dataType));
    }
    if (qt === EDatabaseQueryType.UPDATE) {
      if (!String(this.form.controls.updateTable.value ?? '').trim()) {
        return false;
      }
      const dataType = this.updateTypeRequestData();
      const valueRows = this.updateValues.controls.filter(
        (row) => !this.isValueRowEmpty(row as FormGroup),
      );
      if (valueRows.length === 0) {
        return false;
      }
      if (!valueRows.every((row) => this.isValueRowValid(row as FormGroup, dataType))) {
        return false;
      }
      const filterRows = this.updateFilters.controls.filter(
        (row) => !this.isFilterRowEmpty(row as FormGroup),
      );
      return filterRows.every((row) => this.isFilterRowValid(row as FormGroup));
    }
    return false;
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  readonly resolveDatabaseVariantLabel = (value: EDatabaseVariants | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EDatabaseVariants.POSTGRESQL:
        return map['databasePostgresql'] ?? '';
      case EDatabaseVariants.MYSQL:
        return map['databaseMysql'] ?? '';
      case EDatabaseVariants.SQLITE:
        return map['databaseSqlite'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveQueryTypeLabel = (value: EDatabaseQueryType | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EDatabaseQueryType.RAW:
        return map['dbQueryRaw'] ?? '';
      case EDatabaseQueryType.INSERT:
        return map['dbQueryInsert'] ?? '';
      case EDatabaseQueryType.UPDATE:
        return map['dbQueryUpdate'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveRawTimeLabel = (value: ENonRealtimeSettingOption | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case ENonRealtimeSettingOption.BY_SIGNAL:
        return map['dbTimeBySignal'] ?? '';
      case ENonRealtimeSettingOption.INTERVAL:
        return map['dbTimeInterval'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveFilterTypeLabel = (value: EDatabaseFilterTypes | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EDatabaseFilterTypes.EQUAL:
        return map['dbFilterEqual'] ?? '';
      case EDatabaseFilterTypes.MORE:
        return map['dbFilterMore'] ?? '';
      case EDatabaseFilterTypes.LESS:
        return map['dbFilterLess'] ?? '';
      case EDatabaseFilterTypes.MORE_OR_EQUAL:
        return map['dbFilterMoreOrEqual'] ?? '';
      case EDatabaseFilterTypes.LESS_OR_EQUAL:
        return map['dbFilterLessOrEqual'] ?? '';
      case EDatabaseFilterTypes.NOT_EQUAL:
        return map['dbFilterNotEqual'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveOperatorLabel = (value: EDatabaseOperatorTypes | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case EDatabaseOperatorTypes.AND:
        return map['dbOperatorAnd'] ?? '';
      case EDatabaseOperatorTypes.OR:
        return map['dbOperatorOr'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveValueSourceLabel = (value: TValueSource | null): string => {
    const map = this.labels() as Record<string, string>;
    if (value === 'fromBlock') {
      return map['dbValueFromBlock'] ?? '';
    }
    return map['dbValueInline'] ?? '';
  };

  constructor() {
    super();

    this.form.controls.databaseVariant.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((variant) => this.applyVariantDefaults(variant));

    this.form.controls.queryType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.skipQueryTypeSideEffects) {
          return;
        }
        this.inputBlocks.set([]);
        this.connectionsDirty.set(true);
        this.formRx.bump();
      });

    this.applyInitialState();

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  private skipQueryTypeSideEffects = false;

  protected onFormDomEvent(): void {
    this.formRx.onFormDomEvent();
  }

  get insertValues(): FormArray {
    return this.form.controls.insertValues;
  }

  get updateValues(): FormArray {
    return this.form.controls.updateValues;
  }

  get updateFilters(): FormArray {
    return this.form.controls.updateFilters;
  }

  protected onInputBlocksChange(ids: number[]): void {
    this.inputBlocks.set(ids);
    this.connectionsDirty.set(true);
  }

  private applyInitialState(): void {
    const data = this.context.data;
    const block = data.initialBlock;
    if (!block) {
      return;
    }

    this.skipQueryTypeSideEffects = true;
    this.form.patchValue({
        blockName: block.blockName,
        isDemoMode: block.blockOptions.isDemoMode,
        databaseVariant: block.databaseVariant,
        host: block.connectionConfig.host ?? 'localhost',
        port: block.connectionConfig.port ?? 5432,
        username: block.connectionConfig.username ?? '',
        password: block.connectionConfig.password ?? '',
        databaseName: block.connectionConfig.databaseName ?? '',
        queryType: block.queryType,
      });

    if (block.queryType === EDatabaseQueryType.RAW && block.rawQueryConfig) {
      const time = block.timeRequestSettings;
      this.form.patchValue({
          rawQuery: block.rawQueryConfig.query,
          rawTypeRequestData: block.rawQueryConfig.typeRequestData,
          rawTimeOption: time.timeRequestOption,
          rawPeriod: time.period ?? 1000,
        });
    } else if (block.queryType === EDatabaseQueryType.INSERT && block.insertQueryConfig) {
      const cfg = block.insertQueryConfig;
      this.form.patchValue({
          insertTable: cfg.table,
          insertSchema: cfg.schema ?? '',
          insertDatabase: cfg.database ?? '',
          insertTypeRequestData: cfg.typeRequestData,
        });
      this.insertValues.clear();
      for (const value of cfg.values) {
        this.insertValues.push(this.createValueRowFromQueryValue(value, cfg.typeRequestData));
      }
      if (!this.insertValues.length) {
        this.insertValues.push(this.createValueRow());
      }
    } else if (block.queryType === EDatabaseQueryType.UPDATE && block.updateQueryConfig) {
      const cfg = block.updateQueryConfig;
      this.form.patchValue({
          updateTable: cfg.table,
          updateSchema: cfg.schema ?? '',
          updateDatabase: cfg.database ?? '',
          updateTypeRequestData: cfg.typeRequestData,
        });
      this.updateValues.clear();
      for (const value of cfg.updatedValues) {
        this.updateValues.push(this.createValueRowFromQueryValue(value, cfg.typeRequestData));
      }
      if (!this.updateValues.length) {
        this.updateValues.push(this.createValueRow());
      }
      this.updateFilters.clear();
      cfg.filters.forEach((filter, index) => {
        this.updateFilters.push(
          this.createFilterRowFromFilter(filter, index < cfg.filters.length - 1),
        );
      });
    }

    if (data.inputBlocks?.length) {
      this.inputBlocks.set([...data.inputBlocks]);
    }
    this.formRx.bump();
    queueMicrotask(() => {
      this.skipQueryTypeSideEffects = false;
    });
  }

  private createValueRowFromQueryValue(
    value: IDatabaseQueryValue,
    dataType: EDataTypes,
  ): FormGroup {
    const fromBlock = value.isInsertedFromBlock;
    let jsonPath = '';
    let inlineValue = '';
    if (fromBlock) {
      const raw = String(value.value ?? '');
      jsonPath = raw.startsWith(JSON_PREFIX) ? raw.slice(JSON_PREFIX.length) : raw;
      if (jsonPath.startsWith('.')) {
        jsonPath = jsonPath.slice(1);
      }
    } else {
      inlineValue = String(value.value ?? '');
    }
    void dataType;
    return this.fb.nonNullable.group({
      fieldName: [value.fieldName],
      valueSource: [(fromBlock ? 'fromBlock' : 'inline') as TValueSource],
      inlineValue: [inlineValue],
      jsonPath: [jsonPath],
    });
  }

  private createFilterRowFromFilter(
    filter: IDatabaseUpdateQueryFilter,
    withOperator: boolean,
  ): FormGroup {
    const fromBlock = filter.isInsertedFromBlock;
    let jsonPath = '';
    let inlineValue = '';
    if (fromBlock) {
      const raw = String(filter.filterValue ?? '');
      jsonPath = raw.startsWith(JSON_PREFIX) ? raw.slice(JSON_PREFIX.length) : raw;
      if (jsonPath.startsWith('.')) {
        jsonPath = jsonPath.slice(1);
      }
    } else {
      inlineValue = String(filter.filterValue ?? '');
    }
    return this.fb.nonNullable.group({
      fieldName: [filter.fieldName],
      filterType: [filter.filterType as EDatabaseFilterTypes, Validators.required],
      valueSource: [(fromBlock ? 'fromBlock' : 'inline') as TValueSource],
      inlineValue: [inlineValue],
      jsonPath: [jsonPath],
      operatorNextFilter: [
        withOperator
          ? (filter.operatorNextFilter ?? (EDatabaseOperatorTypes.AND as EDatabaseOperatorTypes | null))
          : null,
      ],
    });
  }

  protected addInsertValue(): void {
    this.insertValues.push(this.createValueRow());
    this.form.markAsDirty();
  }

  protected removeInsertValue(index: number): void {
    this.insertValues.removeAt(index);
    this.form.markAsDirty();
  }

  protected addUpdateValue(): void {
    this.updateValues.push(this.createValueRow());
    this.form.markAsDirty();
  }

  protected removeUpdateValue(index: number): void {
    this.updateValues.removeAt(index);
    this.form.markAsDirty();
  }

  protected addUpdateFilter(): void {
    const filters = this.updateFilters;
    if (filters.length > 0) {
      const prev = filters.at(filters.length - 1) as FormGroup;
      if (!prev.controls['operatorNextFilter'].value) {
        prev.controls['operatorNextFilter'].setValue(EDatabaseOperatorTypes.AND);
      }
    }
    filters.push(this.createFilterRow(false));
    this.form.markAsDirty();
  }

  protected removeUpdateFilter(index: number): void {
    this.updateFilters.removeAt(index);
    if (this.updateFilters.length > 0) {
      const last = this.updateFilters.at(this.updateFilters.length - 1) as FormGroup;
      last.controls['operatorNextFilter'].setValue(null);
    }
    this.form.markAsDirty();
  }

  protected isFromBlock(group: FormGroup): boolean {
    return group.controls['valueSource'].value === 'fromBlock';
  }

  private applyVariantDefaults(variant: EDatabaseVariants): void {
    if (variant === EDatabaseVariants.POSTGRESQL) {
      this.form.controls.port.setValue(5432, { emitEvent: true });
    } else if (variant === EDatabaseVariants.MYSQL) {
      this.form.controls.port.setValue(3306, { emitEvent: true });
    }
    this.formRx.bump();
  }

  private createValueRow(): FormGroup {
    return this.fb.nonNullable.group({
      fieldName: [''],
      valueSource: ['inline' as TValueSource],
      inlineValue: [''],
      jsonPath: [''],
    });
  }

  private createFilterRow(withOperator: boolean): FormGroup {
    return this.fb.nonNullable.group({
      fieldName: [''],
      filterType: [EDatabaseFilterTypes.EQUAL as EDatabaseFilterTypes, Validators.required],
      valueSource: ['inline' as TValueSource],
      inlineValue: [''],
      jsonPath: [''],
      operatorNextFilter: [
        withOperator ? (EDatabaseOperatorTypes.AND as EDatabaseOperatorTypes | null) : null,
      ],
    });
  }

  private isConnectionValid(): boolean {
    const variant = this.databaseVariant();
    if (variant === EDatabaseVariants.SQLITE) {
      return !!this.form.controls.databaseName.value.trim();
    }
    return (
      !!this.form.controls.host.value.trim() &&
      Number(this.form.controls.port.value) > 0 &&
      !!this.form.controls.username.value.trim() &&
      !!this.form.controls.databaseName.value.trim()
    );
  }

  private isValueRowEmpty(group: FormGroup): boolean {
    return (
      !String(group.controls['fieldName'].value ?? '').trim() &&
      !String(group.controls['inlineValue'].value ?? '').trim() &&
      !String(group.controls['jsonPath'].value ?? '').trim()
    );
  }

  private isFilterRowEmpty(group: FormGroup): boolean {
    return this.isValueRowEmpty(group);
  }

  private isValueRowValid(group: FormGroup, _dataType: EDataTypes): boolean {
    if (!String(group.controls['fieldName'].value ?? '').trim()) {
      return false;
    }
    if (group.controls['valueSource'].value === 'inline') {
      return String(group.controls['inlineValue'].value ?? '').trim().length > 0;
    }
    // from block — json path optional (whole payload); file/bytes/string/number OK empty
    return true;
  }

  private isFilterRowValid(group: FormGroup): boolean {
    if (!String(group.controls['fieldName'].value ?? '').trim()) {
      return false;
    }
    if (group.controls['valueSource'].value === 'inline') {
      return String(group.controls['inlineValue'].value ?? '').trim().length > 0;
    }
    return true;
  }

  private buildQueryValue(raw: {
    fieldName: string;
    valueSource: TValueSource;
    inlineValue: string;
    jsonPath: string;
  }, dataType: EDataTypes): IDatabaseQueryValue {
    const fieldName = raw.fieldName.trim();
    if (raw.valueSource === 'inline') {
      return {
        fieldName,
        value: raw.inlineValue,
        isInsertedFromBlock: false,
      };
    }
    if (PATH_TYPES.has(dataType) || dataType === EDataTypes.JSON) {
      const path = raw.jsonPath.trim();
      const value = path
        ? path.startsWith(JSON_PREFIX)
          ? path
          : `${JSON_PREFIX}${path.startsWith('.') ? path : `.${path}`}`
        : JSON_PREFIX;
      return { fieldName, value, isInsertedFromBlock: true };
    }
    return { fieldName, value: '', isInsertedFromBlock: true };
  }

  private buildFilter(raw: {
    fieldName: string;
    filterType: EDatabaseFilterTypes;
    valueSource: TValueSource;
    inlineValue: string;
    jsonPath: string;
    operatorNextFilter: EDatabaseOperatorTypes | null;
  }, isLast: boolean, dataType: EDataTypes): IDatabaseUpdateQueryFilter {
    let filterValue = '';
    const isInsertedFromBlock = raw.valueSource === 'fromBlock';
    if (!isInsertedFromBlock) {
      filterValue = raw.inlineValue;
    } else if (dataType === EDataTypes.JSON) {
      const path = raw.jsonPath.trim();
      filterValue = path
        ? path.startsWith(JSON_PREFIX)
          ? path
          : `${JSON_PREFIX}${path.startsWith('.') ? path : `.${path}`}`
        : JSON_PREFIX;
    }
    return {
      fieldName: raw.fieldName.trim(),
      filterType: raw.filterType,
      filterValue,
      isInsertedFromBlock,
      operatorNextFilter: isLast ? null : raw.operatorNextFilter,
    };
  }

  private buildTimeSettings(): ITimeRequestSettings {
    const qt = this.queryType();
    if (qt === EDatabaseQueryType.RAW) {
      if (this.rawTimeOption() === ENonRealtimeSettingOption.INTERVAL) {
        return {
          timeRequestOption: ENonRealtimeSettingOption.INTERVAL,
          countRequest: null,
          period: Number(this.form.controls.rawPeriod.value),
        };
      }
      return {
        timeRequestOption: ENonRealtimeSettingOption.BY_SIGNAL,
        countRequest: null,
        period: null,
      };
    }
    return {
      timeRequestOption: ENonRealtimeSettingOption.BY_INPUT_DATA,
      countRequest: null,
      period: null,
    };
  }

  private buildConnectionConfig() {
    const variant = this.databaseVariant();
    const databaseName = this.form.controls.databaseName.value.trim() || null;
    if (variant === EDatabaseVariants.SQLITE) {
      return {
        host: null,
        port: null,
        username: null,
        password: null,
        databaseName,
      };
    }
    return {
      host: this.form.controls.host.value.trim() || null,
      port: Number(this.form.controls.port.value),
      username: this.form.controls.username.value.trim() || null,
      password: this.form.controls.password.value || null,
      databaseName,
    };
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const blockName = raw.blockName.trim();
    const demo = raw.isDemoMode;

    const base: IDatabaseBlock = {
      blockId: raw.blockId,
      blockName,
      databaseVariant: raw.databaseVariant,
      connectionConfig: demo
        ? {
            host: null,
            port: null,
            username: null,
            password: null,
            databaseName: null,
          }
        : this.buildConnectionConfig(),
      queryType: raw.queryType,
      rawQueryConfig: null,
      insertQueryConfig: null,
      updateQueryConfig: null,
      blockOptions: {
        ...DEFAULT_BLOCK_OPTIONS,
        isDemoMode: demo,
      },
      timeRequestSettings: demo
        ? { ...DEFAULT_TIME_REQUEST_SETTINGS }
        : this.buildTimeSettings(),
    };

    if (demo) {
      this.context.completeWith({
        block: base,
        inputBlocks: [],
        outputBlocks: [],
      });
      return;
    }

    let block = base;
    let inputs = [...this.inputBlocks()];

    if (raw.queryType === EDatabaseQueryType.RAW) {
      block = {
        ...base,
        rawQueryConfig: {
          query: raw.rawQuery.trim(),
          typeRequestData: raw.rawTypeRequestData,
        },
      };
      if (raw.rawTimeOption === ENonRealtimeSettingOption.INTERVAL) {
        inputs = [];
      }
    } else if (raw.queryType === EDatabaseQueryType.INSERT) {
      const values = (raw.insertValues as Array<{
        fieldName: string;
        valueSource: TValueSource;
        inlineValue: string;
        jsonPath: string;
      }>)
        .filter(
          (row) =>
            row.fieldName.trim() ||
            row.inlineValue.trim() ||
            row.jsonPath.trim(),
        )
        .map((row) => this.buildQueryValue(row, raw.insertTypeRequestData));
      block = {
        ...base,
        insertQueryConfig: {
          typeRequestData: raw.insertTypeRequestData,
          table: raw.insertTable.trim(),
          schema: raw.insertSchema.trim() || null,
          database: raw.insertDatabase.trim() || null,
          values,
        },
      };
    } else if (raw.queryType === EDatabaseQueryType.UPDATE) {
      const updatedValues = (raw.updateValues as Array<{
        fieldName: string;
        valueSource: TValueSource;
        inlineValue: string;
        jsonPath: string;
      }>)
        .filter(
          (row) =>
            row.fieldName.trim() ||
            row.inlineValue.trim() ||
            row.jsonPath.trim(),
        )
        .map((row) => this.buildQueryValue(row, raw.updateTypeRequestData));
      const filterRows = (
        raw.updateFilters as Array<{
          fieldName: string;
          filterType: EDatabaseFilterTypes;
          valueSource: TValueSource;
          inlineValue: string;
          jsonPath: string;
          operatorNextFilter: EDatabaseOperatorTypes | null;
        }>
      ).filter(
        (row) =>
          row.fieldName.trim() ||
          row.inlineValue.trim() ||
          row.jsonPath.trim(),
      );
      const filters = filterRows.map((row, index) =>
        this.buildFilter(row, index === filterRows.length - 1, raw.updateTypeRequestData),
      );
      block = {
        ...base,
        updateQueryConfig: {
          typeRequestData: raw.updateTypeRequestData,
          table: raw.updateTable.trim(),
          schema: raw.updateSchema.trim() || null,
          database: raw.updateDatabase.trim() || null,
          updatedValues,
          filters,
        },
      };
    }

    this.context.completeWith({
      block,
      inputBlocks: inputs,
      outputBlocks: [],
    });
  }
}

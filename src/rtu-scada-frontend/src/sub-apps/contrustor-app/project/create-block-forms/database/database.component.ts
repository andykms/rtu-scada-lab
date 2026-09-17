import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IDatabaseBlock } from '../../../../../../../electron/types/blocks/network-blocks/database/database.type';
import { EDatabaseQueryType } from '../../../../../../../electron/types/blocks/network-blocks/database/database-query-type';
import { EDatabaseVariants } from '../../../../../../../electron/types/blocks/network-blocks/database/database.variants';
import { TDatabaseRawDataTypes } from '../../../../../../../electron/types/blocks/network-blocks/database/data-types/database.raw-types';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import { PaperInput, PaperLabel, PaperSelectList, PaperTextfield } from '../../../../../paper-ui/base';
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

const RAW_TYPES: TDatabaseRawDataTypes[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.JSON,
];

@Component({
  selector: 'constructor-database',
  templateUrl: './database.component.html',
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
export class DatabaseComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IDatabaseBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();

  readonly databaseVariants = [
    EDatabaseVariants.POSTGRESQL,
    EDatabaseVariants.MYSQL,
    EDatabaseVariants.SQLITE,
  ];
  readonly dataTypeVariants = dataTypeValues(RAW_TYPES);
  readonly inputBlocks = signal<number[]>([]);
  readonly blockId = this.context.data.blockId;
  readonly matchRequestType = signal<EDataTypes>(EDataTypes.STRING);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    databaseVariant: [EDatabaseVariants.POSTGRESQL, Validators.required],
    query: ['', Validators.required],
    typeRequestData: [EDataTypes.STRING as TDatabaseRawDataTypes, Validators.required],
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  readonly resolveDatabaseVariantLabel = (value: EDatabaseVariants | null): string => {
    switch (value) {
      case EDatabaseVariants.POSTGRESQL:
        return this.labels().databasePostgresql;
      case EDatabaseVariants.MYSQL:
        return this.labels().databaseMysql;
      case EDatabaseVariants.SQLITE:
        return this.labels().databaseSqlite;
      default:
        return '';
    }
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
    this.context.completeWith({
      block: {
        blockId: raw.blockId,
        blockName: raw.blockName.trim(),
        databaseVariant: raw.databaseVariant,
        queryType: EDatabaseQueryType.RAW,
        rawQueryConfig: {
          query: raw.query.trim(),
          typeRequestData: raw.typeRequestData,
        },
        insertQueryConfig: null,
        updateQueryConfig: null,
        blockOptions: { ...DEFAULT_BLOCK_OPTIONS },
        timeRequestSettings: { ...DEFAULT_TIME_REQUEST_SETTINGS },
      },
      inputBlocks: this.inputBlocks(),
      outputBlocks: [],
    });
  }
}

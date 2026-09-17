import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IIndicatorsBlock } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/indicators.type';
import { TIndicatorsBlockRequestData } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/data-types/indicators.request-data.type';
import { TIndicatorsBlockResponseData } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/data-types/indicators.response-data.type';
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

const REQUEST_TYPES: TIndicatorsBlockRequestData[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.ARRAY_NUMBERS,
];

const RESPONSE_TYPES: TIndicatorsBlockResponseData[] = [
  EDataTypes.NUMBER,
  EDataTypes.NOTHING,
];

@Component({
  selector: 'constructor-indicators',
  templateUrl: './indicators.component.html',
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
export class IndicatorsComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IIndicatorsBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();

  readonly requestTypeVariants = dataTypeValues(REQUEST_TYPES);
  readonly responseTypeVariants = dataTypeValues(RESPONSE_TYPES);
  readonly inputBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly blockId = this.context.data.blockId;
  readonly matchRequestType = signal<EDataTypes>(EDataTypes.NUMBER);
  readonly matchResponseType = signal<EDataTypes | null>(null);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    typeRequestData: [EDataTypes.NUMBER as TIndicatorsBlockRequestData, Validators.required],
    typeResponseData: [EDataTypes.NOTHING as TIndicatorsBlockResponseData, Validators.required],
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
    this.form.controls.typeResponseData.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) =>
        this.matchResponseType.set(value === EDataTypes.NOTHING ? null : value),
      );
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
        typeRequestData: raw.typeRequestData,
        typeResponseData: raw.typeResponseData,
        numberConfig: null,
        stringConfig: null,
        arrayNumbersConfig: null,
      },
      inputBlocks: this.inputBlocks(),
      outputBlocks: this.outputBlocks(),
    });
  }
}

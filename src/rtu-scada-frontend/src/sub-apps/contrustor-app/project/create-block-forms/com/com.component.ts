import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IComBlock } from '../../../../../../../electron/types/blocks/network-blocks/com/com.type';
import { TComBlockRequestData } from '../../../../../../../electron/types/blocks/network-blocks/com/data-types/com.request-data.type';
import { TComBlockResponseData } from '../../../../../../../electron/types/blocks/network-blocks/com/data-types/com.response-data.type';
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
import { DEFAULT_BLOCK_OPTIONS, DEFAULT_ON_DISCONNECT } from '../shared/network-block.defaults';

const COM_TYPES: TComBlockRequestData[] = [
  EDataTypes.BYTES,
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.IMAGE,
  EDataTypes.AUDIO,
  EDataTypes.VIDEO,
];

@Component({
  selector: 'constructor-com',
  templateUrl: './com.component.html',
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
export class ComComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IComBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();

  readonly dataTypeVariants = dataTypeValues(COM_TYPES);
  readonly inputBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly blockId = this.context.data.blockId;
  readonly matchRequestType = signal<EDataTypes>(EDataTypes.STRING);
  readonly matchResponseType = signal<EDataTypes>(EDataTypes.STRING);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    comPort: ['COM1', Validators.required],
    baudRate: [9600, [Validators.required, Validators.min(1)]],
    isParity: [false],
    dataBits: [8, Validators.required],
    stopBits: [1, Validators.required],
    typeRequestData: [EDataTypes.STRING as TComBlockRequestData, Validators.required],
    typeResponseData: [EDataTypes.STRING as TComBlockResponseData, Validators.required],
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
      .subscribe((value) => this.matchResponseType.set(value));
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
        comPort: raw.comPort.trim(),
        baudRate: Number(raw.baudRate),
        isParity: raw.isParity,
        dataBits: Number(raw.dataBits),
        stopBits: Number(raw.stopBits),
        typeRequestData: raw.typeRequestData,
        typeResponseData: raw.typeResponseData,
        blockOptions: { ...DEFAULT_BLOCK_OPTIONS },
        onDisconnect: { ...DEFAULT_ON_DISCONNECT },
      },
      inputBlocks: this.inputBlocks(),
      outputBlocks: this.outputBlocks(),
    });
  }
}

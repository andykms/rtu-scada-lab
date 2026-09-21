import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge, startWith } from 'rxjs';
import { ITcpServerBlock } from '../../../../../../../electron/types/blocks/network-blocks/tcp-server/tcp-server.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { TTcpServerBlockRequestData } from '../../../../../../../electron/types/blocks/network-blocks/tcp-server/data-types/tcp-server.request-data.type';
import { TTcpServerBlockResponseData } from '../../../../../../../electron/types/blocks/network-blocks/tcp-server/data-types/tcp-server.response-data.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import {
  PaperCheckbox,
  PaperInput,
  PaperLabel,
  PaperSelectList,
  PaperTextfield,
} from '../../../../../paper-ui/base';
import { PaperText } from '../../../../../paper-ui/base/text/text.directive';
import {
  ICreateBlockDialogData,
  ICreateBlockFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey, dataTypeValues } from '../shared/data-type-options';
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';
import { PaperDivingLine } from '../../../../../paper-ui/layout/diving-line/diving-line.component';
import { createFormRevisionTracker } from '../shared/form-revision';

/** Receiving from clients — TZ. */
const REQUEST_TYPES: TTcpServerBlockRequestData[] = [
  EDataTypes.BYTES,
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
];

/** Sending to clients — TZ (bytes / string / number only). */
const RESPONSE_TYPES: TTcpServerBlockResponseData[] = [
  EDataTypes.BYTES,
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
];

@Component({
  selector: 'constructor-tcp-server',
  templateUrl: './tcp-server.component.html',
  styleUrls: ['../shared/create-block-form.css', './tcp-server.component.css'],
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
    PaperText,
    BlockConnectionsRibbonComponent,
    PaperDivingLine
  ],
})
export class TcpServerComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<ITcpServerBlock>,
    ICreateBlockDialogData<ITcpServerBlock>
  >();
  private readonly fb = new FormBuilder();

  readonly requestTypeVariants = dataTypeValues(REQUEST_TYPES);
  readonly responseTypeVariants = dataTypeValues(RESPONSE_TYPES);
  readonly inputBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly connectionsDirty = signal(false);
  readonly blockId = this.context.data.blockId;

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    tcpServerPort: [8080, [Validators.required, Validators.min(1), Validators.max(65535)]],
    typeRequestData: [EDataTypes.BYTES as TTcpServerBlockRequestData, Validators.required],
    typeResponseData: [EDataTypes.BYTES as TTcpServerBlockResponseData, Validators.required],
    isCanUserSendData: [true],
    isDemoMode: [false],
  });

  private readonly formSnapshot = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(startWith(null)),
    { initialValue: null },
  );
  private readonly formRx = createFormRevisionTracker(this.form);

  readonly isDemoMode = toSignal(
    this.form.controls.isDemoMode.valueChanges.pipe(
      startWith(this.form.controls.isDemoMode.value),
    ),
    { initialValue: false },
  );

  readonly matchRequestType = toSignal(
    this.form.controls.typeRequestData.valueChanges.pipe(
      startWith(this.form.controls.typeRequestData.value),
    ),
    { initialValue: EDataTypes.BYTES as TTcpServerBlockRequestData },
  );

  readonly matchResponseType = toSignal(
    this.form.controls.typeResponseData.valueChanges.pipe(
      startWith(this.form.controls.typeResponseData.value),
    ),
    { initialValue: EDataTypes.BYTES as TTcpServerBlockResponseData },
  );

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.formRx.formRev();
    this.connectionsDirty();
    const demo = this.form.controls.isDemoMode.value;
    if (demo) {
      return !!this.form.controls.blockName.value.trim();
    }
    return this.form.valid;
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  constructor() {
    super();
    this.applyInitialState();

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  protected onFormDomEvent(): void {
    this.formRx.onFormDomEvent();
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
    this.form.patchValue({
      blockName: block.blockName,
      tcpServerPort: block.tcpServerPort,
      typeRequestData: block.typeRequestData,
      typeResponseData: block.typeResponseData,
      isCanUserSendData: block.blockOptions.isCanUserSendData,
      isDemoMode: block.blockOptions.isDemoMode,
    });
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const isDemoMode = raw.isDemoMode;

    this.context.completeWith({
      block: {
        blockId: raw.blockId,
        blockName: raw.blockName.trim(),
        tcpServerPort: Number(raw.tcpServerPort),
        typeRequestData: raw.typeRequestData,
        typeResponseData: raw.typeResponseData,
        blockOptions: {
          isCanUserSendData: isDemoMode ? false : raw.isCanUserSendData,
          isDemoMode,
        },
      },
      inputBlocks: isDemoMode ? [] : this.inputBlocks(),
      outputBlocks: isDemoMode ? [] : this.outputBlocks(),
    });
  }
}

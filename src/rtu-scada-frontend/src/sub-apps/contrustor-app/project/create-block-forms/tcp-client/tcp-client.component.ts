import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge, startWith } from 'rxjs';
import { ITcpClientBlock } from '../../../../../../../electron/types/blocks/network-blocks/tcp-client/tcp-client.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { TTcpClientBlockRequestData } from '../../../../../../../electron/types/blocks/network-blocks/tcp-client/data-types/tcp-client.request-data.type';
import { TTcpClientBlockResponseData } from '../../../../../../../electron/types/blocks/network-blocks/tcp-client/data-types/tcp-client.response-data.type';
import {
  EOnDisconnectActions,
  IOnDisconnectSettings,
} from '../../../../../../../electron/types/project/state/errors/on-disconnect.type';
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
import { PaperDivingLine } from '../../../../../paper-ui/layout/diving-line/diving-line.component';
import {
  ICreateBlockDialogData,
  ICreateBlockFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey, dataTypeValues } from '../shared/data-type-options';
import { createFormRevisionTracker } from '../shared/form-revision';
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';
import { DEFAULT_ON_DISCONNECT } from '../shared/network-block.defaults';

/** Receiving from server — TZ. */
const REQUEST_TYPES: TTcpClientBlockRequestData[] = [
  EDataTypes.BYTES,
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
];

/** Sending to server — TZ. */
const RESPONSE_TYPES: TTcpClientBlockResponseData[] = [
  EDataTypes.BYTES,
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
];

const ON_DISCONNECT_ACTIONS = [
  EOnDisconnectActions.IGNORE,
  EOnDisconnectActions.STOP_APP,
] as const;

@Component({
  selector: 'constructor-tcp-client',
  templateUrl: './tcp-client.component.html',
  styleUrls: ['../shared/create-block-form.css', './tcp-client.component.css'],
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
    PaperDivingLine,
  ],
})
export class TcpClientComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<ITcpClientBlock>,
    ICreateBlockDialogData<ITcpClientBlock>
  >();
  private readonly fb = new FormBuilder();

  readonly requestTypeVariants = dataTypeValues(REQUEST_TYPES);
  readonly responseTypeVariants = dataTypeValues(RESPONSE_TYPES);
  readonly onDisconnectActionVariants = [...ON_DISCONNECT_ACTIONS];
  readonly inputBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly connectionsDirty = signal(false);
  readonly blockId = this.context.data.blockId;

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    tcpClientHost: ['127.0.0.1', Validators.required],
    tcpClientPort: [8080, [Validators.required, Validators.min(1), Validators.max(65535)]],
    typeRequestData: [EDataTypes.BYTES as TTcpClientBlockRequestData, Validators.required],
    typeResponseData: [EDataTypes.BYTES as TTcpClientBlockResponseData, Validators.required],
    isCanUserSendData: [true],
    isDemoMode: [false],
    onDisconnectAction: [DEFAULT_ON_DISCONNECT.action as EOnDisconnectActions, Validators.required],
    isCanUserReconnect: [DEFAULT_ON_DISCONNECT.isCanUserReconnect],
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
    { initialValue: EDataTypes.BYTES as TTcpClientBlockRequestData },
  );

  readonly matchResponseType = toSignal(
    this.form.controls.typeResponseData.valueChanges.pipe(
      startWith(this.form.controls.typeResponseData.value),
    ),
    { initialValue: EDataTypes.BYTES as TTcpClientBlockResponseData },
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

  readonly resolveOnDisconnectActionLabel = (value: EOnDisconnectActions | null): string => {
    const map = this.labels() as Record<string, string>;
    if (value === EOnDisconnectActions.IGNORE) {
      return map['onDisconnectIgnore'] ?? '';
    }
    if (value === EOnDisconnectActions.STOP_APP) {
      return map['onDisconnectStopApp'] ?? '';
    }
    return '';
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
      tcpClientHost: block.tcpClientHost,
      tcpClientPort: block.tcpClientPort,
      typeRequestData: block.typeRequestData,
      typeResponseData: block.typeResponseData,
      isCanUserSendData: block.blockOptions.isCanUserSendData,
      isDemoMode: block.blockOptions.isDemoMode,
      onDisconnectAction: block.onDisconnect.action,
      isCanUserReconnect: block.onDisconnect.isCanUserReconnect,
    });
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const isDemoMode = raw.isDemoMode;

    const onDisconnect: IOnDisconnectSettings = {
      action: raw.onDisconnectAction,
      isCanUserReconnect: isDemoMode ? DEFAULT_ON_DISCONNECT.isCanUserReconnect : raw.isCanUserReconnect,
      retryCount: DEFAULT_ON_DISCONNECT.retryCount,
    };

    this.context.completeWith({
      block: {
        blockId: raw.blockId,
        blockName: raw.blockName.trim(),
        tcpClientHost: raw.tcpClientHost.trim(),
        tcpClientPort: Number(raw.tcpClientPort),
        typeRequestData: raw.typeRequestData,
        typeResponseData: raw.typeResponseData,
        blockOptions: {
          isCanUserSendData: isDemoMode ? false : raw.isCanUserSendData,
          isDemoMode,
        },
        onDisconnect,
      },
      inputBlocks: isDemoMode ? [] : this.inputBlocks(),
      outputBlocks: isDemoMode ? [] : this.outputBlocks(),
    });
  }
}

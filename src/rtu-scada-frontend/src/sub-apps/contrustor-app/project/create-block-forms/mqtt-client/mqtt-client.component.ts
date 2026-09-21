import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge, startWith } from 'rxjs';
import { IMqttClientBlock } from '../../../../../../../electron/types/blocks/network-blocks/mqtt-client/mqtt-client.type';
import { TMqttBlockRequestData } from '../../../../../../../electron/types/blocks/network-blocks/mqtt-client/data-types/mqtt.request-data.type';
import { TMqttBlockResponseData } from '../../../../../../../electron/types/blocks/network-blocks/mqtt-client/data-types/mqtt.response-data.type';
import {
  EOnDisconnectActions,
  IOnDisconnectSettings,
} from '../../../../../../../electron/types/project/state/errors/on-disconnect.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
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

/** Receiving from broker — TZ. */
const REQUEST_TYPES: TMqttBlockRequestData[] = [
  EDataTypes.STRING,
  EDataTypes.JSON,
  EDataTypes.NUMBER,
  EDataTypes.BYTES,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.PDF,
];

/** Publishing to broker — TZ. */
const RESPONSE_TYPES: TMqttBlockResponseData[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.BYTES,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.PDF,
];

const ON_DISCONNECT_ACTIONS = [
  EOnDisconnectActions.IGNORE,
  EOnDisconnectActions.STOP_APP,
] as const;

@Component({
  selector: 'constructor-mqtt-client',
  templateUrl: './mqtt-client.component.html',
  styleUrls: ['../shared/create-block-form.css', './mqtt-client.component.css'],
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
export class MqttClientComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IMqttClientBlock>,
    ICreateBlockDialogData<IMqttClientBlock>
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
    mqttHost: ['127.0.0.1', Validators.required],
    mqttPort: [1883, [Validators.required, Validators.min(1), Validators.max(65535)]],
    clientId: ['', Validators.required],
    topic: ['', Validators.required],
    username: [''],
    password: [''],
    typeRequestData: [EDataTypes.STRING as TMqttBlockRequestData, Validators.required],
    typeResponseData: [EDataTypes.STRING as TMqttBlockResponseData, Validators.required],
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
    { initialValue: EDataTypes.STRING as TMqttBlockRequestData },
  );

  readonly matchResponseType = toSignal(
    this.form.controls.typeResponseData.valueChanges.pipe(
      startWith(this.form.controls.typeResponseData.value),
    ),
    { initialValue: EDataTypes.STRING as TMqttBlockResponseData },
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
      mqttHost: block.mqttHost,
      mqttPort: block.mqttPort,
      clientId: block.clientId ?? '',
      topic: block.topic,
      username: block.username ?? '',
      password: block.password ?? '',
      typeRequestData: block.typeRequestData,
      typeResponseData: block.typeResponseData,
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
      isCanUserReconnect: isDemoMode
        ? DEFAULT_ON_DISCONNECT.isCanUserReconnect
        : raw.isCanUserReconnect,
      retryCount: DEFAULT_ON_DISCONNECT.retryCount,
    };

    this.context.completeWith({
      block: {
        blockId: raw.blockId,
        blockName: raw.blockName.trim(),
        mqttHost: raw.mqttHost.trim(),
        mqttPort: Number(raw.mqttPort),
        topic: raw.topic.trim(),
        username: raw.username.trim() || undefined,
        password: raw.password || undefined,
        clientId: raw.clientId.trim() || undefined,
        typeRequestData: raw.typeRequestData,
        typeResponseData: raw.typeResponseData,
        blockOptions: {
          isCanUserSendData: false,
          isDemoMode,
        },
        onDisconnect,
      },
      inputBlocks: isDemoMode ? [] : this.inputBlocks(),
      outputBlocks: isDemoMode ? [] : this.outputBlocks(),
    });
  }
}

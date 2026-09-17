import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge, startWith } from 'rxjs';
import { IModbusRtuBlock } from '../../../../../../../electron/types/blocks/network-blocks/modbus/modbus-rtu.type';
import { IModbusCommand } from '../../../../../../../electron/types/blocks/network-blocks/modbus/modbus-command.type';
import {
  ENonRealtimeSettingOption,
  ITimeRequestSettings,
} from '../../../../../../../electron/types/blocks/network-blocks/non-realtime-network-block.type';
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
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';

const TIME_OPTIONS = [
  ENonRealtimeSettingOption.INTERVAL,
  ENonRealtimeSettingOption.BY_SIGNAL,
] as const;

@Component({
  selector: 'constructor-modbus-rtu',
  templateUrl: './modbus-rtu.component.html',
  styleUrls: ['../shared/create-block-form.css', './modbus-rtu.component.css'],
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
export class ModbusRtuComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IModbusRtuBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();

  readonly timeOptionVariants = [...TIME_OPTIONS];
  readonly signalBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly connectionsDirty = signal(false);
  readonly blockId = this.context.data.blockId;
  readonly matchResponseType = EDataTypes.ARRAY_NUMBERS;

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    isDemoMode: [false],
    comPort: ['COM1', Validators.required],
    baudRate: [115200, [Validators.required, Validators.min(1)]],
    isParity: [false],
    dataBits: [8, [Validators.required, Validators.min(5), Validators.max(8)]],
    stopBits: [1, [Validators.required, Validators.min(1), Validators.max(2)]],
    isFullInput: [false],
    fullCommand: [''],
    slaveId: [1, Validators.required],
    codeFunction: [3, Validators.required],
    address: [0, Validators.required],
    length: [1, [Validators.required, Validators.min(1)]],
    value: [null as number | null],
    typeData: [null as number | null],
    timeRequestOption: [
      ENonRealtimeSettingOption.INTERVAL as ENonRealtimeSettingOption,
      Validators.required,
    ],
    period: [1000, [Validators.min(1)]],
    countRequest: [null as number | null],
  });

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

  readonly isFullInput = toSignal(
    this.form.controls.isFullInput.valueChanges.pipe(
      startWith(this.form.controls.isFullInput.value),
    ),
    { initialValue: false },
  );

  readonly timeRequestOption = toSignal(
    this.form.controls.timeRequestOption.valueChanges.pipe(
      startWith(this.form.controls.timeRequestOption.value),
    ),
    { initialValue: ENonRealtimeSettingOption.INTERVAL },
  );

  readonly showPeriod = computed(
    () => this.timeRequestOption() === ENonRealtimeSettingOption.INTERVAL,
  );

  readonly showSignalBlocks = computed(
    () => this.timeRequestOption() === ENonRealtimeSettingOption.BY_SIGNAL,
  );

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.connectionsDirty();
    const demo = this.form.controls.isDemoMode.value;
    const dirty = this.form.dirty || this.connectionsDirty();
    if (!dirty) {
      return false;
    }
    if (demo) {
      return !!this.form.controls.blockName.value.trim();
    }
    if (!this.form.valid) {
      return false;
    }
    if (this.form.controls.isFullInput.value) {
      return this.parseFullCommand(this.form.controls.fullCommand.value) != null;
    }
    return true;
  });

  readonly resolveTimeOptionLabel = (value: ENonRealtimeSettingOption | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case ENonRealtimeSettingOption.INTERVAL:
        return map['httpWhenInterval'] ?? '';
      case ENonRealtimeSettingOption.BY_SIGNAL:
        return map['httpWhenBySignal'] ?? '';
      default:
        return '';
    }
  };

  constructor() {
    super();

    this.form.controls.isFullInput.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((full) => this.syncCommandValidators(full));

    this.form.controls.timeRequestOption.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((option) => {
        if (option === ENonRealtimeSettingOption.INTERVAL) {
          this.form.controls.period.setValidators([Validators.required, Validators.min(1)]);
        } else {
          this.form.controls.period.clearValidators();
        }
        this.form.controls.period.updateValueAndValidity({ emitEvent: false });
      });

    this.syncCommandValidators(false);
    this.form.controls.period.setValidators([Validators.required, Validators.min(1)]);
    this.form.controls.period.updateValueAndValidity({ emitEvent: false });

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  protected onSignalBlocksChange(ids: number[]): void {
    this.signalBlocks.set(ids);
    this.connectionsDirty.set(true);
  }

  protected onOutputBlocksChange(ids: number[]): void {
    this.outputBlocks.set(ids);
    this.connectionsDirty.set(true);
  }

  private syncCommandValidators(isFullInput: boolean): void {
    const parts = [
      this.form.controls.slaveId,
      this.form.controls.codeFunction,
      this.form.controls.address,
      this.form.controls.length,
    ] as const;

    if (isFullInput) {
      for (const control of parts) {
        control.clearValidators();
        control.updateValueAndValidity({ emitEvent: false });
      }
      this.form.controls.fullCommand.setValidators([Validators.required]);
    } else {
      this.form.controls.fullCommand.clearValidators();
      this.form.controls.slaveId.setValidators([Validators.required]);
      this.form.controls.codeFunction.setValidators([Validators.required]);
      this.form.controls.address.setValidators([Validators.required]);
      this.form.controls.length.setValidators([Validators.required, Validators.min(1)]);
    }
    this.form.controls.fullCommand.updateValueAndValidity({ emitEvent: false });
    for (const control of parts) {
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private parseFullCommand(raw: string): IModbusCommand | null {
    const parts = raw
      .trim()
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((part) => Number(part));
    if (parts.length < 4 || parts.some((value) => Number.isNaN(value))) {
      return null;
    }
    const command: IModbusCommand = {
      slaveId: parts[0],
      codeFunction: parts[1],
      address: parts[2],
      length: parts[3],
    };
    if (parts.length >= 5) {
      command.value = parts[4];
    }
    if (parts.length >= 6) {
      command.typeData = parts[5];
    }
    return command;
  }

  private buildCommand(
    raw: ReturnType<typeof this.form.getRawValue>,
  ): IModbusCommand | null {
    if (raw.isFullInput) {
      return this.parseFullCommand(raw.fullCommand);
    }
    const command: IModbusCommand = {
      slaveId: Number(raw.slaveId),
      codeFunction: Number(raw.codeFunction),
      address: Number(raw.address),
      length: Number(raw.length),
    };
    if (raw.value != null && raw.value !== ('' as unknown as number)) {
      const value = Number(raw.value);
      if (!Number.isNaN(value)) {
        command.value = value;
      }
    }
    if (raw.typeData != null && raw.typeData !== ('' as unknown as number)) {
      const typeData = Number(raw.typeData);
      if (!Number.isNaN(typeData)) {
        command.typeData = typeData;
      }
    }
    return command;
  }

  private buildTimeSettings(
    raw: ReturnType<typeof this.form.getRawValue>,
  ): ITimeRequestSettings {
    const option = raw.timeRequestOption;
    const countRaw = raw.countRequest;
    const countRequest =
      countRaw == null || countRaw === ('' as unknown as number)
        ? null
        : Number(countRaw);
    const safeCount =
      countRequest == null || Number.isNaN(countRequest) ? null : countRequest;

    if (option === ENonRealtimeSettingOption.INTERVAL) {
      return {
        timeRequestOption: ENonRealtimeSettingOption.INTERVAL,
        countRequest: safeCount,
        period: Number(raw.period),
      };
    }

    return {
      timeRequestOption: ENonRealtimeSettingOption.BY_SIGNAL,
      countRequest: safeCount,
      period: null,
    };
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const isDemoMode = raw.isDemoMode;
    const command = isDemoMode
      ? {
          slaveId: 1,
          codeFunction: 3,
          address: 0,
          length: 1,
        }
      : this.buildCommand(raw);

    if (!command) {
      this.form.controls.fullCommand.markAsTouched();
      return;
    }

    const bySignal =
      !isDemoMode &&
      raw.timeRequestOption === ENonRealtimeSettingOption.BY_SIGNAL;

    this.context.completeWith({
      block: {
        blockId: raw.blockId,
        blockName: raw.blockName.trim(),
        comPort: isDemoMode ? 'COM1' : raw.comPort.trim(),
        baudRate: isDemoMode ? 115200 : Number(raw.baudRate),
        isParity: isDemoMode ? false : raw.isParity,
        dataBits: isDemoMode ? 8 : Number(raw.dataBits),
        stopBits: isDemoMode ? 1 : Number(raw.stopBits),
        command,
        typeResponseData: EDataTypes.ARRAY_NUMBERS,
        blockOptions: {
          isCanUserSendData: false,
          isDemoMode,
        },
        timeRequestSettings: isDemoMode
          ? {
              timeRequestOption: ENonRealtimeSettingOption.INTERVAL,
              countRequest: null,
              period: 1000,
            }
          : this.buildTimeSettings(raw),
      },
      inputBlocks: isDemoMode || !bySignal ? [] : this.signalBlocks(),
      outputBlocks: isDemoMode ? [] : this.outputBlocks(),
    });
  }
}

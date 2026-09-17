import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IModbusTcpBlock } from '../../../../../../../electron/types/blocks/network-blocks/modbus/modbus-tcp.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import { PaperInput, PaperLabel, PaperTextfield } from '../../../../../paper-ui/base';
import {
  ICreateBlockDialogData,
  ICreateBlockFormResult,
} from '../shared/create-block-dialog.model';
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';
import {
  DEFAULT_BLOCK_OPTIONS,
  DEFAULT_TIME_REQUEST_SETTINGS,
} from '../shared/network-block.defaults';

@Component({
  selector: 'constructor-modbus-tcp',
  templateUrl: './modbus-tcp.component.html',
  styleUrls: ['../shared/create-block-form.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PaperTextfield,
    PaperInput,
    PaperLabel,
    BlockConnectionsRibbonComponent,
  ],
})
export class ModbusTcpComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IModbusTcpBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();

  readonly outputBlocks = signal<number[]>([]);
  readonly blockId = this.context.data.blockId;
  readonly matchResponseType = EDataTypes.ARRAY_NUMBERS;

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    tcpHost: ['127.0.0.1', Validators.required],
    tcpPort: [502, [Validators.required, Validators.min(1)]],
    slaveId: [1, Validators.required],
    codeFunction: [3, Validators.required],
    address: [0, Validators.required],
    length: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    super();
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
        tcpHost: raw.tcpHost.trim(),
        tcpPort: Number(raw.tcpPort),
        command: {
          slaveId: Number(raw.slaveId),
          codeFunction: Number(raw.codeFunction),
          address: Number(raw.address),
          length: Number(raw.length),
        },
        typeResponseData: EDataTypes.ARRAY_NUMBERS,
        blockOptions: { ...DEFAULT_BLOCK_OPTIONS },
        timeRequestSettings: { ...DEFAULT_TIME_REQUEST_SETTINGS },
      },
      inputBlocks: [],
      outputBlocks: this.outputBlocks(),
    });
  }
}

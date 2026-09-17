import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IConverterBlock,
} from '../../../../../../../electron/types/blocks/internal-blocks/converter/converter.type';
import { IConverterTypeConfig } from '../../../../../../../electron/types/blocks/internal-blocks/converter/converter.type-config.type';
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

const INPUT_TYPES = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.BYTES,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.ANY_FILE,
  EDataTypes.JSON,
] as const;

const OUTPUT_BY_INPUT: Record<number, EDataTypes[]> = {
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
  [EDataTypes.ANY_FILE]: [EDataTypes.ANY_FILE, EDataTypes.BYTES],
  [EDataTypes.JSON]: [
    EDataTypes.JSON,
    EDataTypes.STRING,
    EDataTypes.BYTES,
    EDataTypes.ARRAY_NUMBERS,
  ],
};

@Component({
  selector: 'constructor-converter',
  templateUrl: './converter.component.html',
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
export class ConverterComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IConverterBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();

  readonly inputTypeVariants = dataTypeValues(INPUT_TYPES);
  readonly outputTypeVariants = signal(dataTypeValues(OUTPUT_BY_INPUT[EDataTypes.STRING]));
  readonly inputBlocks = signal<number[]>([]);
  readonly outputBlocks = signal<number[]>([]);
  readonly blockId = this.context.data.blockId;
  readonly matchRequestType = signal<EDataTypes>(EDataTypes.STRING);
  readonly matchResponseType = signal<EDataTypes>(EDataTypes.STRING);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    inputDataType: [EDataTypes.STRING as EDataTypes, Validators.required],
    outputDataType: [EDataTypes.STRING as EDataTypes, Validators.required],
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  constructor() {
    super();
    this.form.controls.inputDataType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        this.matchRequestType.set(value);
        const outputs = OUTPUT_BY_INPUT[value] ?? [EDataTypes.STRING];
        this.outputTypeVariants.set(dataTypeValues(outputs));
        if (!outputs.includes(this.form.controls.outputDataType.value)) {
          this.form.controls.outputDataType.setValue(outputs[0]);
        }
      });
    this.form.controls.outputDataType.valueChanges
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
        inputDataType: raw.inputDataType,
        convertTypeConfig: this.buildTypeConfig(raw.inputDataType, raw.outputDataType),
        convertValueConfig: {
          stringTypeConfig: [],
          numberTypeConfig: [],
        },
        filterConfig: {
          stringTypeConfig: null,
          numberTypeConfig: null,
          jsonTypeConfig: null,
        },
      },
      inputBlocks: this.inputBlocks(),
      outputBlocks: this.outputBlocks(),
    });
  }

  private buildTypeConfig(input: EDataTypes, output: EDataTypes): IConverterTypeConfig {
    const empty: IConverterTypeConfig = {
      inputTypeString: null,
      inputTypeNumber: null,
      inputTypeBytes: null,
      inputTypeImage: null,
      inputTypeVideo: null,
      inputTypeAnyFile: null,
      inputTypeJson: null,
    };

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
      case EDataTypes.ANY_FILE:
        return { ...empty, inputTypeAnyFile: { outputType: output as never } };
      case EDataTypes.JSON:
        return {
          ...empty,
          inputTypeJson: {
            outputType: output as never,
            jsonFieldConfig: {
              path: '',
              outputType: output as never,
            },
          },
        };
      default:
        return empty;
    }
  }
}

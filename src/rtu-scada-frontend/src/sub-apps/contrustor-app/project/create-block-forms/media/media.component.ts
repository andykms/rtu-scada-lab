import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IMediaBlock } from '../../../../../../../electron/types/blocks/internal-blocks/media/media.type';
import { TMediaBlockRequestData } from '../../../../../../../electron/types/blocks/internal-blocks/media/data-types/media.request-data.type';
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

const MEDIA_TYPES: TMediaBlockRequestData[] = [
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.PDF,
  EDataTypes.ANY_FILE,
  EDataTypes.BYTES,
];

@Component({
  selector: 'constructor-media',
  templateUrl: './media.component.html',
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
export class MediaComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateBlockFormResult<IMediaBlock>,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();

  readonly dataTypeVariants = dataTypeValues(MEDIA_TYPES);
  readonly inputBlocks = signal<number[]>([]);
  readonly blockId = this.context.data.blockId;
  readonly matchRequestType = signal<EDataTypes>(EDataTypes.IMAGE);

  readonly form = this.fb.nonNullable.group({
    blockId: [{ value: this.blockId, disabled: true }],
    blockName: ['', Validators.required],
    typeRequestData: [EDataTypes.IMAGE as TMediaBlockRequestData, Validators.required],
    maxStoredItems: [null as number | null],
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
        maxStoredItems: raw.maxStoredItems == null ? null : Number(raw.maxStoredItems),
        downloadConfig: null,
      },
      inputBlocks: this.inputBlocks(),
      outputBlocks: [],
    });
  }
}

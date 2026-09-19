import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { merge, startWith } from 'rxjs';
import { IMediaBlock } from '../../../../../../../electron/types/blocks/internal-blocks/media/media.type';
import { IMediaDownloadConfig } from '../../../../../../../electron/types/blocks/internal-blocks/media/data-types/media.download-config.type';
import { TMediaBlockRequestData } from '../../../../../../../electron/types/blocks/internal-blocks/media/data-types/media.request-data.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import { ProjectService } from '../../../../../libraries/project/project.service';
import {
  PaperButton,
  PaperInput,
  PaperLabel,
  PaperSelectList,
  PaperTextfield,
} from '../../../../../paper-ui/base';
import { PaperText } from '../../../../../paper-ui/base/text/text.directive';
import { PaperCard } from '../../../../../paper-ui/layout/card/card.directive';
import { PaperDivingLine } from '../../../../../paper-ui/layout/diving-line/diving-line.component';
import {
  ICreateBlockDialogData,
  ICreateMediaBlockEntry,
  ICreateMediaFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey } from '../shared/data-type-options';

const SOURCE_TYPES = new Set<EDataTypes>([
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.PDF,
  EDataTypes.ANY_FILE,
  EDataTypes.BYTES,
]);

const DOWNLOAD_TYPES = new Set<EDataTypes>([EDataTypes.ANY_FILE, EDataTypes.BYTES]);

@Component({
  selector: 'constructor-media',
  templateUrl: './media.component.html',
  styleUrls: ['../shared/create-block-form.css', './media.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PaperTextfield,
    PaperInput,
    PaperLabel,
    PaperSelectList,
    PaperButton,
    PaperText,
    PaperCard,
    PaperDivingLine,
  ],
})
export class MediaComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateMediaFormResult,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();
  private readonly projectService = inject(ProjectService);
  private nextAllocatedId = this.context.data.blockId;

  readonly dataTypes = EDataTypes;
  readonly startBlockId = this.context.data.blockId;
  readonly formDirtyExtra = signal(false);

  readonly form = this.fb.nonNullable.group({
    blockName: ['', Validators.required],
    items: this.fb.nonNullable.array([this.createItemGroup()]),
  });

  private readonly formSnapshot = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(startWith(null)),
    { initialValue: null },
  );

  readonly sourceBlockVariants = computed(() => {
    this.formSnapshot();
    const ids = this.projectService
      .listBlocks()
      .filter(
        (block) =>
          block.typeResponseData != null &&
          SOURCE_TYPES.has(block.typeResponseData) &&
          block.blockId !== this.startBlockId,
      )
      .map((block) => block.blockId);
    return [0, ...ids];
  });

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.formDirtyExtra();
    if (!this.form.dirty && !this.formDirtyExtra()) {
      return false;
    }
    if (!this.form.controls.blockName.value.trim()) {
      return false;
    }
    if (this.items.length === 0) {
      return false;
    }
    for (const group of this.items.controls) {
      if (!(Number(group.value.sourceBlockId) > 0)) {
        return false;
      }
      const sourceType = this.sourceTypeOf(group as FormGroup);
      if (sourceType == null || !SOURCE_TYPES.has(sourceType)) {
        return false;
      }
      const maxStored = group.value.maxStoredItems;
      if (
        maxStored != null &&
        maxStored !== '' &&
        (!Number.isFinite(Number(maxStored)) || Number(maxStored) < 1)
      ) {
        return false;
      }
    }
    return true;
  });

  readonly resolveSourceBlockLabel = (value: number | null): string => {
    if (value == null || value <= 0) {
      return (this.labels() as Record<string, string>)['mediaNoBlock'] ?? '';
    }
    const block = this.projectService.listBlocks().find((item) => item.blockId === value);
    if (!block) {
      return `#${value}`;
    }
    const typeKey = dataTypeLabelKey(block.typeResponseData);
    const typeLabel = typeKey
      ? (this.labels() as Record<string, string>)[typeKey] ?? ''
      : '';
    return `${block.blockName} (#${block.blockId})${typeLabel ? ` · ${typeLabel}` : ''}`;
  };

  constructor() {
    super();

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  get items(): FormArray {
    return this.form.controls.items;
  }

  protected sourceTypeOf(group: FormGroup): EDataTypes | null {
    const blockId = Number(group.controls['sourceBlockId'].value);
    if (!(blockId > 0)) {
      return null;
    }
    return (
      this.projectService.listBlocks().find((block) => block.blockId === blockId)
        ?.typeResponseData ?? null
    );
  }

  protected isDownloadType(group: FormGroup): boolean {
    const type = this.sourceTypeOf(group);
    return type != null && DOWNLOAD_TYPES.has(type);
  }

  protected behaviorHintKey(group: FormGroup): string | null {
    switch (this.sourceTypeOf(group)) {
      case EDataTypes.IMAGE:
        return 'mediaHintImage';
      case EDataTypes.VIDEO:
        return 'mediaHintVideo';
      case EDataTypes.AUDIO:
        return 'mediaHintAudio';
      case EDataTypes.PDF:
        return 'mediaHintPdf';
      case EDataTypes.ANY_FILE:
      case EDataTypes.BYTES:
        return 'mediaHintDownload';
      default:
        return null;
    }
  }

  protected addItem(): void {
    this.items.push(this.createItemGroup());
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  protected removeItem(index: number): void {
    this.items.removeAt(index);
    this.form.markAsDirty();
    this.formDirtyExtra.set(true);
  }

  private allocateId(): number {
    return this.nextAllocatedId++;
  }

  private createItemGroup(): FormGroup {
    return this.fb.nonNullable.group({
      blockId: [this.allocateId()],
      sourceBlockId: [0 as number],
      maxStoredItems: [null as number | null],
      defaultDownloadDirectoryPath: [''],
      fileName: [''],
      fileExtension: [''],
    });
  }

  private buildDownloadConfig(raw: {
    defaultDownloadDirectoryPath: string;
    fileName: string;
    fileExtension: string;
  }): IMediaDownloadConfig | null {
    const defaultDownloadDirectoryPath = raw.defaultDownloadDirectoryPath.trim() || null;
    const fileName = raw.fileName.trim() || null;
    const fileExtension = raw.fileExtension.trim() || null;
    if (!defaultDownloadDirectoryPath && !fileName && !fileExtension) {
      return null;
    }
    return { defaultDownloadDirectoryPath, fileName, fileExtension };
  }

  private buildEntry(
    raw: {
      blockId: number;
      sourceBlockId: number;
      maxStoredItems: number | null;
      defaultDownloadDirectoryPath: string;
      fileName: string;
      fileExtension: string;
    },
    blockName: string,
  ): ICreateMediaBlockEntry | null {
    const sourceBlockId = Number(raw.sourceBlockId);
    if (!(sourceBlockId > 0)) {
      return null;
    }
    const source = this.projectService
      .listBlocks()
      .find((block) => block.blockId === sourceBlockId);
    const sourceType = source?.typeResponseData;
    if (sourceType == null || !SOURCE_TYPES.has(sourceType)) {
      return null;
    }

    const maxRaw = raw.maxStoredItems;
    const maxStoredItems =
      maxRaw == null || String(maxRaw).trim() === '' ? null : Number(maxRaw);

    const block: IMediaBlock = {
      blockId: Number(raw.blockId),
      blockName,
      typeRequestData: sourceType as TMediaBlockRequestData,
      maxStoredItems:
        maxStoredItems != null && Number.isFinite(maxStoredItems) ? maxStoredItems : null,
      downloadConfig: DOWNLOAD_TYPES.has(sourceType)
        ? this.buildDownloadConfig(raw)
        : null,
    };

    return {
      block,
      inputBlocks: [sourceBlockId],
      outputBlocks: [],
    };
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const blockName = raw.blockName.trim();
    const entries: ICreateMediaBlockEntry[] = [];

    for (const item of raw.items as Array<{
      blockId: number;
      sourceBlockId: number;
      maxStoredItems: number | null;
      defaultDownloadDirectoryPath: string;
      fileName: string;
      fileExtension: string;
    }>) {
      const entry = this.buildEntry(item, blockName);
      if (entry) {
        entries.push(entry);
      }
    }

    if (!entries.length) {
      return;
    }

    this.context.completeWith({ blocks: entries });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { merge, startWith } from 'rxjs';
import {
  IHttpClientBlock,
  IHttpClientBlockRequestData,
} from '../../../../../../../electron/types/blocks/network-blocks/http-client/http-client.type';
import { IHttpClientRequestBodyDataTypes } from '../../../../../../../electron/types/blocks/network-blocks/http-client/data-types/request/http-client.request-data-body.type';
import { IHttpClientRequestDataBodyTypes } from '../../../../../../../electron/types/blocks/network-blocks/http-client/data-types/request/body/http-client.request-data-body-type';
import { THttpClientReponseBodyFormData } from '../../../../../../../electron/types/blocks/network-blocks/http-client/data-types/response/body/http-client.response-data-body-form-data.type';
import { THttpClientReponseBodyNonFormData } from '../../../../../../../electron/types/blocks/network-blocks/http-client/data-types/response/body/http-client.response-data-body-non-form-data.type';
import { EHttpClientResponseDataBodyType } from '../../../../../../../electron/types/blocks/network-blocks/http-client/data-types/response/body/http-client.response-data-body-type';
import { EHttpClientResponseDataType } from '../../../../../../../electron/types/blocks/network-blocks/http-client/data-types/response/http-client.response-data-type.type';
import {
  ENonRealtimeSettingOption,
  ITimeRequestSettings,
} from '../../../../../../../electron/types/blocks/network-blocks/non-realtime-network-block.type';
import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';
import { injectDialogContext } from '../../../../../libraries/dialog';
import { LanguageProvider } from '../../../../../libraries/language/language.directive';
import {
  PaperButton,
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
  ICreateHttpClientBlockEntry,
  ICreateHttpClientFormResult,
} from '../shared/create-block-dialog.model';
import { dataTypeLabelKey, dataTypeValues } from '../shared/data-type-options';
import { BlockConnectionsRibbonComponent } from '../shared/block-connections-ribbon/block-connections-ribbon.component';
import { PaperCard } from '../../../../../paper-ui/layout/card/card.directive';

/** UI-only body kind for response extraction. */
type TResponseBodyKind = 'json' | 'string' | 'formData' | 'file' | 'bytes';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

const REQUEST_TYPES: IHttpClientRequestBodyDataTypes[] = [
  EDataTypes.NOTHING,
  EDataTypes.BYTES,
  EDataTypes.STRING,
  EDataTypes.JSON,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.ANY_FILE,
  EDataTypes.PDF,
  EDataTypes.NUMBER,
];

const RESPONSE_FORM_DATA_TYPES: THttpClientReponseBodyFormData[] = [
  EDataTypes.STRING,
  EDataTypes.NUMBER,
  EDataTypes.ARRAY_NUMBERS,
  EDataTypes.JSON,
  EDataTypes.BYTES,
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.PDF,
  EDataTypes.ANY_FILE,
];

const RESPONSE_FILE_TYPES: THttpClientReponseBodyNonFormData[] = [
  EDataTypes.IMAGE,
  EDataTypes.VIDEO,
  EDataTypes.AUDIO,
  EDataTypes.PDF,
];

const RESPONSE_BYTES_TYPES: THttpClientReponseBodyNonFormData[] = [
  EDataTypes.BYTES,
  EDataTypes.ANY_FILE,
];

const BODY_KINDS: TResponseBodyKind[] = ['json', 'string', 'formData', 'file', 'bytes'];

const REQUEST_BODY_TYPES = [
  IHttpClientRequestDataBodyTypes.JSON,
  IHttpClientRequestDataBodyTypes.FORM_DATA,
  IHttpClientRequestDataBodyTypes.OTHERS,
] as const;

const TIME_OPTIONS = [
  ENonRealtimeSettingOption.BY_INPUT_DATA,
  ENonRealtimeSettingOption.BY_SIGNAL,
  ENonRealtimeSettingOption.INTERVAL,
  ENonRealtimeSettingOption.INTERVAL_AFTER_INPUT_DATA,
  ENonRealtimeSettingOption.INTERVAL_BEFORE_INPUT_DATA,
] as const;

const COUNT_MODES = ['always', 'once', 'count'] as const;

@Component({
  selector: 'constructor-http-client',
  templateUrl: './http-client.component.html',
  styleUrls: ['../shared/create-block-form.css', './http-client.component.css'],
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
    PaperButton,
    PaperText,
    PaperCard,
    PaperDivingLine,
    BlockConnectionsRibbonComponent,
  ],
})
export class HttpClientComponent extends LanguageProvider {
  private readonly context = injectDialogContext<
    ICreateHttpClientFormResult,
    ICreateBlockDialogData
  >();
  private readonly fb = new FormBuilder();
  private nextAllocatedId = this.context.data.blockId;

  readonly requestBodyTypes = IHttpClientRequestDataBodyTypes;
  readonly httpMethods = [...HTTP_METHODS];
  readonly requestTypeVariants = dataTypeValues(REQUEST_TYPES);
  readonly responseFormDataTypeVariants = dataTypeValues(RESPONSE_FORM_DATA_TYPES);
  readonly responseFileTypeVariants = dataTypeValues(RESPONSE_FILE_TYPES);
  readonly responseBytesTypeVariants = dataTypeValues(RESPONSE_BYTES_TYPES);
  readonly bodyKindVariants = [...BODY_KINDS];
  readonly requestBodyTypeVariants = [...REQUEST_BODY_TYPES];
  readonly timeOptionVariants = [...TIME_OPTIONS];
  readonly countModeVariants = [...COUNT_MODES];

  readonly inputBlocks = signal<number[]>([]);
  readonly connectionsDirty = signal(false);
  readonly startBlockId = this.context.data.blockId;
  readonly activeResponseTab = signal<'headers' | 'body' | 'cookies'>('body');
  readonly activeRequestTab = signal<'body' | 'headers' | 'query'>('body');

  readonly form = this.fb.nonNullable.group({
    blockName: ['', Validators.required],
    httpMethod: ['GET' as (typeof HTTP_METHODS)[number], Validators.required],
    httpUrlWithoutQueryParams: ['https://', Validators.required],
    typeRequestData: [EDataTypes.NOTHING as IHttpClientRequestBodyDataTypes, Validators.required],
    isDemoMode: [false],
    isCanUserSendData: [true],
    isShowOutgoingRequests: [false],
    isShowIncomingResponses: [false],
    isSaveLogs: [false],
    maxLogsCount: [1000, [Validators.min(1)]],
    timeRequestOption: [
      ENonRealtimeSettingOption.BY_INPUT_DATA as ENonRealtimeSettingOption,
      Validators.required,
    ],
    countMode: ['always' as (typeof COUNT_MODES)[number]],
    countRequest: [1, [Validators.min(1)]],
    period: [1000, [Validators.min(1)]],
    extractHeaders: [false],
    extractBody: [true],
    extractCookies: [false],
    bodyKind: ['json' as TResponseBodyKind, Validators.required],
    nonFormBodyType: [EDataTypes.JSON as THttpClientReponseBodyNonFormData, Validators.required],
    requestBodyType: [
      IHttpClientRequestDataBodyTypes.JSON as IHttpClientRequestDataBodyTypes,
      Validators.required,
    ],
    jsonMessage: ['{\n  \n}'],
    responseHeaders: this.fb.nonNullable.array([this.createHeaderRow()]),
    responseCookies: this.fb.nonNullable.array([this.createCookieRow()]),
    responseFormData: this.fb.nonNullable.array([this.createFormDataRow()]),
    requestHeaders: this.fb.nonNullable.array([this.createRequestHeaderRow()]),
    requestFormData: this.fb.nonNullable.array([this.createRequestFormDataRow()]),
    queryParams: this.fb.nonNullable.array([this.createQueryParamRow()]),
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

  readonly extractHeaders = toSignal(
    this.form.controls.extractHeaders.valueChanges.pipe(
      startWith(this.form.controls.extractHeaders.value),
    ),
    { initialValue: false },
  );

  readonly extractBody = toSignal(
    this.form.controls.extractBody.valueChanges.pipe(
      startWith(this.form.controls.extractBody.value),
    ),
    { initialValue: true },
  );

  readonly extractCookies = toSignal(
    this.form.controls.extractCookies.valueChanges.pipe(
      startWith(this.form.controls.extractCookies.value),
    ),
    { initialValue: false },
  );

  readonly bodyKind = toSignal(
    this.form.controls.bodyKind.valueChanges.pipe(
      startWith(this.form.controls.bodyKind.value),
    ),
    { initialValue: 'json' as TResponseBodyKind },
  );

  readonly requestBodyType = toSignal(
    this.form.controls.requestBodyType.valueChanges.pipe(
      startWith(this.form.controls.requestBodyType.value),
    ),
    { initialValue: IHttpClientRequestDataBodyTypes.JSON },
  );

  readonly typeRequestData = toSignal(
    this.form.controls.typeRequestData.valueChanges.pipe(
      startWith(this.form.controls.typeRequestData.value),
    ),
    { initialValue: EDataTypes.NOTHING as IHttpClientRequestBodyDataTypes },
  );

  readonly timeRequestOption = toSignal(
    this.form.controls.timeRequestOption.valueChanges.pipe(
      startWith(this.form.controls.timeRequestOption.value),
    ),
    { initialValue: ENonRealtimeSettingOption.BY_INPUT_DATA },
  );

  readonly countMode = toSignal(
    this.form.controls.countMode.valueChanges.pipe(
      startWith(this.form.controls.countMode.value),
    ),
    { initialValue: 'always' as (typeof COUNT_MODES)[number] },
  );

  readonly isSaveLogs = toSignal(
    this.form.controls.isSaveLogs.valueChanges.pipe(
      startWith(this.form.controls.isSaveLogs.value),
    ),
    { initialValue: false },
  );

  readonly contentTypeLocked = computed(
    () => this.typeRequestData() !== EDataTypes.NOTHING,
  );

  readonly canInsertValueFromBlock = computed(() => {
    const type = this.typeRequestData();
    return (
      type === EDataTypes.STRING ||
      type === EDataTypes.NUMBER ||
      type === EDataTypes.JSON
    );
  });

  readonly isJsonRequestType = computed(() => this.typeRequestData() === EDataTypes.JSON);

  readonly autoContentType = computed(() =>
    this.resolveContentType(this.requestBodyType(), this.typeRequestData()),
  );

  readonly matchRequestType = computed(() => {
    const type = this.typeRequestData();
    return type === EDataTypes.NOTHING ? null : type;
  });

  readonly showCountMode = computed(() => {
    const option = this.timeRequestOption();
    return (
      option === ENonRealtimeSettingOption.BY_INPUT_DATA ||
      option === ENonRealtimeSettingOption.BY_SIGNAL
    );
  });

  readonly showPeriod = computed(() => {
    const option = this.timeRequestOption();
    return (
      option === ENonRealtimeSettingOption.INTERVAL ||
      option === ENonRealtimeSettingOption.INTERVAL_AFTER_INPUT_DATA ||
      option === ENonRealtimeSettingOption.INTERVAL_BEFORE_INPUT_DATA
    );
  });

  readonly canSave = computed(() => {
    this.formSnapshot();
    this.connectionsDirty();
    const dirty = this.form.dirty || this.connectionsDirty();
    if (!dirty) {
      return false;
    }
    if (this.form.controls.isDemoMode.value) {
      return !!this.form.controls.blockName.value.trim();
    }
    if (!this.form.controls.blockName.value.trim()) {
      return false;
    }
    if (!this.form.controls.httpUrlWithoutQueryParams.value.trim()) {
      return false;
    }
    return (
      this.form.controls.extractHeaders.value ||
      this.form.controls.extractBody.value ||
      this.form.controls.extractCookies.value
    );
  });

  readonly resolveDataTypeLabel = (value: EDataTypes | null): string => {
    const key = dataTypeLabelKey(value);
    return key ? (this.labels() as Record<string, string>)[key] ?? '' : '';
  };

  readonly resolveHttpMethodLabel = (value: string | null): string => value ?? '';

  readonly resolveBodyKindLabel = (value: TResponseBodyKind | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case 'json':
        return map['dataTypeJson'] ?? 'JSON';
      case 'string':
        return map['dataTypeString'] ?? 'String';
      case 'formData':
        return map['httpBodyFormData'] ?? 'FormData';
      case 'file':
        return map['httpBodyFile'] ?? 'File';
      case 'bytes':
        return map['dataTypeBytes'] ?? 'Bytes';
      default:
        return '';
    }
  };

  readonly resolveRequestBodyTypeLabel = (
    value: IHttpClientRequestDataBodyTypes | null,
  ): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case IHttpClientRequestDataBodyTypes.JSON:
        return map['dataTypeJson'] ?? 'JSON';
      case IHttpClientRequestDataBodyTypes.FORM_DATA:
        return map['httpBodyFormData'] ?? 'FormData';
      case IHttpClientRequestDataBodyTypes.OTHERS:
        return map['httpBodyOther'] ?? 'Other';
      default:
        return '';
    }
  };

  readonly resolveTimeOptionLabel = (value: ENonRealtimeSettingOption | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case ENonRealtimeSettingOption.BY_INPUT_DATA:
        return map['httpWhenByInputData'] ?? '';
      case ENonRealtimeSettingOption.BY_SIGNAL:
        return map['httpWhenBySignal'] ?? '';
      case ENonRealtimeSettingOption.INTERVAL:
        return map['httpWhenInterval'] ?? '';
      case ENonRealtimeSettingOption.INTERVAL_AFTER_INPUT_DATA:
        return map['httpWhenIntervalAfter'] ?? '';
      case ENonRealtimeSettingOption.INTERVAL_BEFORE_INPUT_DATA:
        return map['httpWhenIntervalBefore'] ?? '';
      default:
        return '';
    }
  };

  readonly resolveCountModeLabel = (value: string | null): string => {
    const map = this.labels() as Record<string, string>;
    switch (value) {
      case 'always':
        return map['httpCountAlways'] ?? '';
      case 'once':
        return map['httpCountOnce'] ?? '';
      case 'count':
        return map['httpCountN'] ?? '';
      default:
        return '';
    }
  };

  constructor() {
    super();

    effect(() => {
      this.context.setMainActionEnabled(this.canSave());
    });

    effect(() => {
      const kind = this.bodyKind();
      if (kind === 'json') {
        this.form.controls.nonFormBodyType.setValue(EDataTypes.JSON, { emitEvent: false });
      } else if (kind === 'string') {
        this.form.controls.nonFormBodyType.setValue(EDataTypes.STRING, { emitEvent: false });
      } else if (kind === 'file') {
        if (!RESPONSE_FILE_TYPES.includes(this.form.controls.nonFormBodyType.value)) {
          this.form.controls.nonFormBodyType.setValue(EDataTypes.IMAGE, { emitEvent: false });
        }
      } else if (kind === 'bytes') {
        if (!RESPONSE_BYTES_TYPES.includes(this.form.controls.nonFormBodyType.value)) {
          this.form.controls.nonFormBodyType.setValue(EDataTypes.BYTES, { emitEvent: false });
        }
      }
    });

    effect(() => {
      if (this.canInsertValueFromBlock()) {
        return;
      }
      this.clearInsertedFromBlockFlags();
    });

    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => this.submit());
  }

  get responseHeaders(): FormArray {
    return this.form.controls.responseHeaders;
  }

  get responseCookies(): FormArray {
    return this.form.controls.responseCookies;
  }

  get responseFormData(): FormArray {
    return this.form.controls.responseFormData;
  }

  get requestHeaders(): FormArray {
    return this.form.controls.requestHeaders;
  }

  get requestFormData(): FormArray {
    return this.form.controls.requestFormData;
  }

  get queryParams(): FormArray {
    return this.form.controls.queryParams;
  }

  protected onInputBlocksChange(ids: number[]): void {
    this.inputBlocks.set(ids);
    this.connectionsDirty.set(true);
  }

  protected setActiveResponseTab(tab: 'headers' | 'body' | 'cookies'): void {
    this.activeResponseTab.set(tab);
  }

  protected setActiveRequestTab(tab: 'body' | 'headers' | 'query'): void {
    this.activeRequestTab.set(tab);
  }

  protected addResponseHeader(): void {
    this.responseHeaders.push(this.createHeaderRow());
    this.form.markAsDirty();
  }

  protected removeResponseHeader(index: number): void {
    this.responseHeaders.removeAt(index);
    this.form.markAsDirty();
  }

  protected addResponseCookie(): void {
    this.responseCookies.push(this.createCookieRow());
    this.form.markAsDirty();
  }

  protected removeResponseCookie(index: number): void {
    this.responseCookies.removeAt(index);
    this.form.markAsDirty();
  }

  protected addResponseFormData(): void {
    this.responseFormData.push(this.createFormDataRow());
    this.form.markAsDirty();
  }

  protected removeResponseFormData(index: number): void {
    this.responseFormData.removeAt(index);
    this.form.markAsDirty();
  }

  protected addQueryParam(): void {
    this.queryParams.push(this.createQueryParamRow());
    this.form.markAsDirty();
  }

  protected removeQueryParam(index: number): void {
    this.queryParams.removeAt(index);
    this.form.markAsDirty();
  }

  protected addRequestHeader(): void {
    this.requestHeaders.push(this.createRequestHeaderRow());
    this.form.markAsDirty();
  }

  protected removeRequestHeader(index: number): void {
    this.requestHeaders.removeAt(index);
    this.form.markAsDirty();
  }

  protected addRequestFormData(): void {
    this.requestFormData.push(this.createRequestFormDataRow());
    this.form.markAsDirty();
  }

  protected removeRequestFormData(index: number): void {
    this.requestFormData.removeAt(index);
    this.form.markAsDirty();
  }

  protected showValueField(isInsertedFromBlock: boolean): boolean {
    return !isInsertedFromBlock || this.isJsonRequestType();
  }

  private clearInsertedFromBlockFlags(): void {
    for (const control of this.requestHeaders.controls) {
      control.patchValue({ isInsertedFromBlock: false }, { emitEvent: false });
    }
    for (const control of this.queryParams.controls) {
      control.patchValue({ isInsertedFromBlock: false }, { emitEvent: false });
    }
  }

  private createHeaderRow() {
    return this.fb.nonNullable.group({
      blockId: [this.allocateId()],
      headerName: [''],
    });
  }

  private createCookieRow() {
    return this.fb.nonNullable.group({
      blockId: [this.allocateId()],
      cookieFieldName: [''],
    });
  }

  private createFormDataRow() {
    return this.fb.nonNullable.group({
      blockId: [this.allocateId()],
      formDataKey: [''],
      typeRequestData: [EDataTypes.STRING as THttpClientReponseBodyFormData],
    });
  }

  private createQueryParamRow() {
    return this.fb.nonNullable.group({
      key: [''],
      value: [''],
      isInsertedFromBlock: [false],
    });
  }

  private createRequestHeaderRow() {
    return this.fb.nonNullable.group({
      headerName: [''],
      headerValue: [''],
      isInsertedFromBlock: [false],
    });
  }

  private createRequestFormDataRow() {
    return this.fb.nonNullable.group({
      formDataKey: [''],
      inlineValue: [''],
      isInsertedFromBlock: [false],
    });
  }

  private allocateId(): number {
    return this.nextAllocatedId++;
  }

  private resolveContentType(
    bodyType: IHttpClientRequestDataBodyTypes,
    typeRequestData: IHttpClientRequestBodyDataTypes,
  ): string | null {
    switch (bodyType) {
      case IHttpClientRequestDataBodyTypes.JSON:
        return 'application/json';
      case IHttpClientRequestDataBodyTypes.FORM_DATA:
        return 'multipart/form-data';
      case IHttpClientRequestDataBodyTypes.OTHERS: {
        switch (typeRequestData) {
          case EDataTypes.STRING:
            return 'text/plain';
          case EDataTypes.IMAGE:
            return 'image/*';
          case EDataTypes.VIDEO:
            return 'video/*';
          case EDataTypes.AUDIO:
            return 'audio/*';
          case EDataTypes.PDF:
            return 'application/pdf';
          default:
            return 'application/octet-stream';
        }
      }
      default:
        return null;
    }
  }

  private buildTimeSettings(): ITimeRequestSettings {
    const option = this.form.controls.timeRequestOption.value;
    const countMode = this.form.controls.countMode.value;
    const period = Number(this.form.controls.period.value);
    const countRequest = Number(this.form.controls.countRequest.value);

    if (
      option === ENonRealtimeSettingOption.INTERVAL ||
      option === ENonRealtimeSettingOption.INTERVAL_AFTER_INPUT_DATA ||
      option === ENonRealtimeSettingOption.INTERVAL_BEFORE_INPUT_DATA
    ) {
      return { timeRequestOption: option, countRequest: null, period };
    }

    if (countMode === 'once') {
      return {
        timeRequestOption:
          option === ENonRealtimeSettingOption.BY_SIGNAL
            ? ENonRealtimeSettingOption.BY_SIGNAL
            : ENonRealtimeSettingOption.ONCE,
        countRequest: 1,
        period: null,
      };
    }

    if (countMode === 'count') {
      return { timeRequestOption: option, countRequest, period: null };
    }

    return { timeRequestOption: option, countRequest: null, period: null };
  }

  private buildSharedRequestData(raw: ReturnType<typeof this.form.getRawValue>): IHttpClientBlockRequestData {
    const autoContentType =
      raw.typeRequestData === EDataTypes.NOTHING
        ? null
        : this.resolveContentType(raw.requestBodyType, raw.typeRequestData);

    const userHeaders = raw.requestHeaders
      .filter((header) => header.headerName.trim())
      .filter((header) =>
        autoContentType ? header.headerName.trim().toLowerCase() !== 'content-type' : true,
      )
      .map((header) => ({
        headerName: header.headerName.trim(),
        headerValue: header.isInsertedFromBlock
          ? raw.typeRequestData === EDataTypes.JSON
            ? header.headerValue.trim() || null
            : null
          : header.headerValue,
        isInsertedFromBlock: header.isInsertedFromBlock,
      }));

    const requestHeaders = autoContentType
      ? [
          {
            headerName: 'content-type',
            headerValue: autoContentType,
            isInsertedFromBlock: false,
          },
          ...userHeaders,
        ]
      : userHeaders;

    const isOtherTypes = raw.requestBodyType === IHttpClientRequestDataBodyTypes.OTHERS;

    return {
      typeRequestData: raw.typeRequestData,
      requestHeaders,
      requestBody: {
        type: raw.requestBodyType,
        jsonConfiguration:
          raw.requestBodyType === IHttpClientRequestDataBodyTypes.JSON
            ? { message: raw.jsonMessage }
            : null,
        formDataConfiguration:
          raw.requestBodyType === IHttpClientRequestDataBodyTypes.FORM_DATA
            ? raw.requestFormData
                .filter((row) => row.formDataKey.trim())
                .map((row) => ({
                  formDataKey: row.formDataKey.trim(),
                  value: null,
                  isInsertedFromBlock: row.isInsertedFromBlock,
                }))
            : null,
        isOtherTypes,
      },
    };
  }

  private makeBlock(
    blockId: number,
    raw: ReturnType<typeof this.form.getRawValue>,
    requestData: IHttpClientBlockRequestData,
    responseData: IHttpClientBlock['responseData'],
  ): IHttpClientBlock {
    return {
      blockId,
      blockName: raw.blockName.trim(),
      httpMethod: raw.httpMethod,
      httpUrlWithoutQueryParams: raw.httpUrlWithoutQueryParams.trim(),
      blockOptions: {
        isCanUserSendData: raw.isDemoMode ? false : raw.isCanUserSendData,
        isDemoMode: raw.isDemoMode,
      },
      timeRequestSettings: this.buildTimeSettings(),
      requestData,
      responseData,
    };
  }

  private submit(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const entries: ICreateHttpClientBlockEntry[] = [];

    if (raw.isDemoMode) {
      entries.push({
        block: this.makeBlock(
          this.startBlockId,
          raw,
          {
            typeRequestData: EDataTypes.NOTHING,
            requestHeaders: [],
            requestBody: {
              type: IHttpClientRequestDataBodyTypes.OTHERS,
              jsonConfiguration: null,
              formDataConfiguration: null,
              isOtherTypes: true,
            },
          },
          {
            type: EHttpClientResponseDataType.FROM_BODY,
            fromHeaders: null,
            fromBody: {
              type: EHttpClientResponseDataBodyType.NON_FORM_DATA,
              formData: null,
              nonFormData: { typeRequestData: EDataTypes.STRING },
            },
            fromCookies: null,
          },
        ),
        inputBlocks: [],
        outputBlocks: [],
      });
      this.context.completeWith({ blocks: entries });
      return;
    }

    const requestData = this.buildSharedRequestData(raw);
    const sharedInputs = [...this.inputBlocks()];
    let nextId = this.startBlockId;
    const takeId = () => nextId++;

    if (raw.extractHeaders) {
      for (const row of raw.responseHeaders) {
        if (!row.headerName.trim()) {
          continue;
        }
        entries.push({
          block: this.makeBlock(takeId(), raw, requestData, {
            type: EHttpClientResponseDataType.FROM_HEADERS,
            fromHeaders: {
              headerName: row.headerName.trim(),
              typeRequestData: EDataTypes.STRING,
            },
            fromBody: null,
            fromCookies: null,
          }),
          inputBlocks: sharedInputs,
          outputBlocks: [],
        });
      }
    }

    if (raw.extractBody) {
      if (raw.bodyKind === 'formData') {
        for (const row of raw.responseFormData) {
          if (!row.formDataKey.trim()) {
            continue;
          }
          entries.push({
            block: this.makeBlock(takeId(), raw, requestData, {
              type: EHttpClientResponseDataType.FROM_BODY,
              fromHeaders: null,
              fromBody: {
                type: EHttpClientResponseDataBodyType.FORM_DATA,
                formData: {
                  formDataKey: row.formDataKey.trim(),
                  typeRequestData: row.typeRequestData,
                },
                nonFormData: null,
              },
              fromCookies: null,
            }),
            inputBlocks: sharedInputs,
            outputBlocks: [],
          });
        }
      } else {
        entries.push({
          block: this.makeBlock(takeId(), raw, requestData, {
            type: EHttpClientResponseDataType.FROM_BODY,
            fromHeaders: null,
            fromBody: {
              type: EHttpClientResponseDataBodyType.NON_FORM_DATA,
              formData: null,
              nonFormData: { typeRequestData: raw.nonFormBodyType },
            },
            fromCookies: null,
          }),
          inputBlocks: sharedInputs,
          outputBlocks: [],
        });
      }
    }

    if (raw.extractCookies) {
      for (const row of raw.responseCookies) {
        if (!row.cookieFieldName.trim()) {
          continue;
        }
        entries.push({
          block: this.makeBlock(takeId(), raw, requestData, {
            type: EHttpClientResponseDataType.FROM_COOKIE,
            fromHeaders: null,
            fromBody: null,
            fromCookies: {
              cookieFieldName: row.cookieFieldName.trim(),
              typeRequestData: EDataTypes.STRING,
            },
          }),
          inputBlocks: sharedInputs,
          outputBlocks: [],
        });
      }
    }

    if (!entries.length) {
      return;
    }

    this.context.completeWith({ blocks: entries });
  }
}

import { EDataTypes } from '../../../../../../../electron/types/data-types/base-data-type.type';

export interface IDataTypeOption {
  value: EDataTypes;
  labelKey: keyof typeof DATA_TYPE_LABEL_KEYS;
}

const DATA_TYPE_LABEL_KEYS = {
  dataTypeString: true,
  dataTypeNumber: true,
  dataTypeJson: true,
  dataTypeArrayNumbers: true,
  dataTypeAnyFile: true,
  dataTypeVideo: true,
  dataTypeAudio: true,
  dataTypeImage: true,
  dataTypePdf: true,
  dataTypeBytes: true,
  dataTypeNothing: true,
  dataTypeArrayAny: true,
} as const;

export const DATA_TYPE_OPTIONS: IDataTypeOption[] = [
  { value: EDataTypes.STRING, labelKey: 'dataTypeString' },
  { value: EDataTypes.NUMBER, labelKey: 'dataTypeNumber' },
  { value: EDataTypes.JSON, labelKey: 'dataTypeJson' },
  { value: EDataTypes.ARRAY_NUMBERS, labelKey: 'dataTypeArrayNumbers' },
  { value: EDataTypes.ANY_FILE, labelKey: 'dataTypeAnyFile' },
  { value: EDataTypes.VIDEO, labelKey: 'dataTypeVideo' },
  { value: EDataTypes.AUDIO, labelKey: 'dataTypeAudio' },
  { value: EDataTypes.IMAGE, labelKey: 'dataTypeImage' },
  { value: EDataTypes.PDF, labelKey: 'dataTypePdf' },
  { value: EDataTypes.BYTES, labelKey: 'dataTypeBytes' },
  { value: EDataTypes.NOTHING, labelKey: 'dataTypeNothing' },
  { value: EDataTypes.ARRAY_ANY, labelKey: 'dataTypeArrayAny' },
];

export function dataTypeOptions(allowed?: readonly EDataTypes[]): IDataTypeOption[] {
  if (!allowed?.length) {
    return DATA_TYPE_OPTIONS;
  }
  const allowedSet = new Set(allowed);
  return DATA_TYPE_OPTIONS.filter((option) => allowedSet.has(option.value));
}

export function dataTypeLabelKey(type: EDataTypes | null | undefined): IDataTypeOption['labelKey'] | null {
  if (type == null) {
    return null;
  }
  return DATA_TYPE_OPTIONS.find((option) => option.value === type)?.labelKey ?? null;
}

export function dataTypeValues(allowed?: readonly EDataTypes[]): EDataTypes[] {
  return dataTypeOptions(allowed).map((option) => option.value);
}

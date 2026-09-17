import { EDataTypes } from '../../../../electron/types/data-types/base-data-type.type';

export interface IProjectBlockInfo {
  blockId: number;
  blockName: string;
  typeRequestData: EDataTypes | null;
  typeResponseData: EDataTypes | null;
  kindLabelKey: string;
}

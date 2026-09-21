import { EDataTypes } from '../../../../../../electron/types/data-types/base-data-type.type';

export type TSceneMode = 'idle' | 'link' | 'delete' | 'edit';

export interface IScenePort {
  portId: string;
  blockId: number;
  side: 'left' | 'right';
  dataType: EDataTypes;
  label: string;
  /** Signal trigger port — accepts any producer output. */
  role?: 'data' | 'signal';
}

export interface ISceneNode {
  nodeId: string;
  kind: string;
  kindLabel: string;
  blockName: string;
  /** Displayed in header; for HTTP groups shows first member id range or primary id. */
  primaryBlockId: number;
  traits: string[];
  ports: IScenePort[];
  memberBlockIds: number[];
  x: number;
  y: number;
}

export interface ISceneEdge {
  edgeId: string;
  fromBlockId: number;
  toBlockId: number;
  fromPortId: string;
  toPortId: string;
}

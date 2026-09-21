import { EDataTypes } from '../../../../../../electron/types/data-types/base-data-type.type';
import { EDatabaseQueryType } from '../../../../../../electron/types/blocks/network-blocks/database/database-query-type';
import { EDatabaseVariants } from '../../../../../../electron/types/blocks/network-blocks/database/database.variants';
import { EHttpClientResponseDataBodyType } from '../../../../../../electron/types/blocks/network-blocks/http-client/data-types/response/body/http-client.response-data-body-type';
import { EHttpClientResponseDataType } from '../../../../../../electron/types/blocks/network-blocks/http-client/data-types/response/http-client.response-data-type.type';
import type { IHttpClientBlock } from '../../../../../../electron/types/blocks/network-blocks/http-client/http-client.type';
import {
  ENonRealtimeSettingOption,
  type ITimeRequestSettings,
} from '../../../../../../electron/types/blocks/network-blocks/non-realtime-network-block.type';
import type { IProjectFile } from '../../../../../../electron/types/project/project-file/project-file.type';
import { dataTypeLabelKey } from '../create-block-forms/shared/data-type-options';
import { ISceneEdge, ISceneNode, IScenePort } from './scene.models';

const NODE_WIDTH = 220;
const NODE_GAP_X = 280;
const NODE_GAP_Y = 200;
const GRID_COLS = 3;

function typeLabel(
  type: EDataTypes | null | undefined,
  labels: Record<string, string>,
): string {
  if (type == null) {
    return '—';
  }
  const key = dataTypeLabelKey(type);
  return key ? labels[key] ?? String(type) : String(type);
}

function dbVariantLabel(
  variant: EDatabaseVariants,
  labels: Record<string, string>,
): string {
  switch (variant) {
    case EDatabaseVariants.POSTGRESQL:
      return labels['databasePostgresql'] ?? 'PostgreSQL';
    case EDatabaseVariants.MYSQL:
      return labels['databaseMysql'] ?? 'MySQL';
    case EDatabaseVariants.SQLITE:
      return labels['databaseSqlite'] ?? 'SQLite';
    default:
      return '';
  }
}

function httpOutputType(block: IHttpClientBlock): EDataTypes | null {
  switch (block.responseData.type) {
    case EHttpClientResponseDataType.FROM_HEADERS:
      return block.responseData.fromHeaders?.typeRequestData ?? null;
    case EHttpClientResponseDataType.FROM_BODY:
      if (
        block.responseData.fromBody?.type === EHttpClientResponseDataBodyType.FORM_DATA
      ) {
        return block.responseData.fromBody.formData?.typeRequestData ?? null;
      }
      return block.responseData.fromBody?.nonFormData?.typeRequestData ?? null;
    case EHttpClientResponseDataType.FROM_COOKIE:
      return block.responseData.fromCookies?.typeRequestData ?? null;
    default:
      return null;
  }
}

function httpOutPortLabel(block: IHttpClientBlock, labels: Record<string, string>): string {
  const outType = httpOutputType(block);
  const typeText = typeLabel(outType, labels);
  switch (block.responseData.type) {
    case EHttpClientResponseDataType.FROM_HEADERS:
      return `${block.responseData.fromHeaders?.headerName ?? 'header'} · ${typeText}`;
    case EHttpClientResponseDataType.FROM_COOKIE:
      return `${block.responseData.fromCookies?.cookieFieldName ?? 'cookie'} · ${typeText}`;
    case EHttpClientResponseDataType.FROM_BODY:
      if (
        block.responseData.fromBody?.type === EHttpClientResponseDataBodyType.FORM_DATA
      ) {
        return `${block.responseData.fromBody.formData?.formDataKey ?? 'form'} · ${typeText}`;
      }
      return `body · ${typeText}`;
    default:
      return typeText;
  }
}

function modbusCommand(command: {
  slaveId: number;
  codeFunction: number;
  address: number;
  length: number;
  value?: number;
  typeData?: number;
}): string {
  return [
    command.slaveId,
    command.codeFunction,
    command.address,
    command.length,
    command.value ?? '',
    command.typeData ?? '',
  ]
    .filter((v) => v !== '' && v != null)
    .join(' ');
}

function positionFor(
  nodeId: string,
  index: number,
  file: IProjectFile,
): { x: number; y: number } {
  const saved = file.projectData.scene?.nodePositions?.[nodeId];
  if (saved) {
    return { ...saved };
  }
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  return { x: 40 + col * NODE_GAP_X, y: 40 + row * NODE_GAP_Y };
}

function portsSimple(
  blockId: number,
  request: EDataTypes | null,
  response: EDataTypes | null,
  labels: Record<string, string>,
): IScenePort[] {
  const ports: IScenePort[] = [];
  if (request != null && request !== EDataTypes.NOTHING) {
    ports.push({
      portId: `${blockId}:in`,
      blockId,
      side: 'left',
      dataType: request,
      label: typeLabel(request, labels),
      role: 'data',
    });
  }
  if (response != null && response !== EDataTypes.NOTHING) {
    ports.push({
      portId: `${blockId}:out`,
      blockId,
      side: 'right',
      dataType: response,
      label: typeLabel(response, labels),
      role: 'data',
    });
  }
  return ports;
}

function isBySignal(settings: ITimeRequestSettings | null | undefined): boolean {
  return settings?.timeRequestOption === ENonRealtimeSettingOption.BY_SIGNAL;
}

function signalInPort(blockId: number, labels: Record<string, string>): IScenePort {
  return {
    portId: `${blockId}:signal`,
    blockId,
    side: 'left',
    dataType: EDataTypes.NOTHING,
    label: labels['signal'] ?? 'Signal',
    role: 'signal',
  };
}

export function buildSceneNodes(
  file: IProjectFile,
  labels: Record<string, string>,
): ISceneNode[] {
  const nodes: ISceneNode[] = [];
  const { networkBlocks, internalBlocks } = file.projectData.blocks;
  let index = 0;

  const push = (node: Omit<ISceneNode, 'x' | 'y' | 'kindLabel'>) => {
    const pos = positionFor(node.nodeId, index++, file);
    nodes.push({
      ...node,
      kindLabel: labels[node.kind] ?? node.kind,
      ...pos,
    });
  };

  for (const block of networkBlocks.tcpServers) {
    push({
      nodeId: String(block.blockId),
      kind: 'tcpServer',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: block.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [String(block.tcpServerPort)],
      ports: portsSimple(
        block.blockId,
        block.typeRequestData,
        block.typeResponseData,
        labels,
      ),
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of networkBlocks.tcpClients) {
    push({
      nodeId: String(block.blockId),
      kind: 'tcpClient',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: block.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [String(block.tcpClientPort), block.tcpClientHost],
      ports: portsSimple(
        block.blockId,
        block.typeRequestData,
        block.typeResponseData,
        labels,
      ),
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of networkBlocks.mqttClients) {
    push({
      nodeId: String(block.blockId),
      kind: 'mqttClient',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: block.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [block.mqttHost, String(block.mqttPort), block.topic],
      ports: portsSimple(
        block.blockId,
        block.typeRequestData,
        block.typeResponseData,
        labels,
      ),
      memberBlockIds: [block.blockId],
    });
  }

  // HTTP: group by name+method+url
  const httpGroups = new Map<string, IHttpClientBlock[]>();
  for (const block of networkBlocks.httpClients) {
    const key = `${block.blockName}::${block.httpMethod}::${block.httpUrlWithoutQueryParams}`;
    const list = httpGroups.get(key) ?? [];
    list.push(block);
    httpGroups.set(key, list);
  }
  for (const group of httpGroups.values()) {
    const primary = group.reduce((a, b) => (a.blockId < b.blockId ? a : b));
    const nodeId = `http:${primary.blockId}`;
    const request =
      primary.requestData.typeRequestData === EDataTypes.NOTHING
        ? null
        : primary.requestData.typeRequestData;
    const ports: IScenePort[] = [];
    if (isBySignal(primary.timeRequestSettings)) {
      ports.push(signalInPort(primary.blockId, labels));
    } else if (request != null) {
      ports.push({
        portId: `${primary.blockId}:in`,
        blockId: primary.blockId,
        side: 'left',
        dataType: request,
        label: typeLabel(request, labels),
        role: 'data',
      });
    }
    for (const block of group) {
      const out = httpOutputType(block);
      if (out == null) {
        continue;
      }
      ports.push({
        portId: `${block.blockId}:out`,
        blockId: block.blockId,
        side: 'right',
        dataType: out,
        label: httpOutPortLabel(block, labels),
        role: 'data',
      });
    }
    push({
      nodeId,
      kind: 'httpClient',
      blockName: primary.blockName,
      primaryBlockId: primary.blockId,
      traits: primary.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [primary.httpMethod, primary.httpUrlWithoutQueryParams],
      ports,
      memberBlockIds: group.map((b) => b.blockId),
    });
  }

  for (const block of networkBlocks.modbusRtu) {
    const ports: IScenePort[] = [];
    if (isBySignal(block.timeRequestSettings)) {
      ports.push(signalInPort(block.blockId, labels));
    }
    ports.push(...portsSimple(block.blockId, null, block.typeResponseData, labels));
    push({
      nodeId: String(block.blockId),
      kind: 'modbusRtu',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: block.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [block.comPort, modbusCommand(block.command)],
      ports,
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of networkBlocks.modbusTcp) {
    const ports: IScenePort[] = [];
    if (isBySignal(block.timeRequestSettings)) {
      ports.push(signalInPort(block.blockId, labels));
    }
    ports.push(...portsSimple(block.blockId, null, block.typeResponseData, labels));
    push({
      nodeId: String(block.blockId),
      kind: 'modbusTcp',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: block.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [block.tcpHost, String(block.tcpPort), modbusCommand(block.command)],
      ports,
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of networkBlocks.com) {
    push({
      nodeId: String(block.blockId),
      kind: 'comPort',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: block.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [block.comPort],
      ports: portsSimple(
        block.blockId,
        block.typeRequestData,
        block.typeResponseData,
        labels,
      ),
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of networkBlocks.database) {
    const bySignal = isBySignal(block.timeRequestSettings);
    const request =
      block.queryType === EDatabaseQueryType.RAW
        ? block.rawQueryConfig?.typeRequestData
        : block.queryType === EDatabaseQueryType.INSERT
          ? block.insertQueryConfig?.typeRequestData
          : block.updateQueryConfig?.typeRequestData;
    let ports: IScenePort[];
    if (bySignal) {
      ports = [
        {
          ...signalInPort(block.blockId, labels),
          // RAW-by-signal still matches a concrete payload type in the form.
          dataType: request ?? EDataTypes.NOTHING,
        },
      ];
    } else {
      ports = portsSimple(block.blockId, request ?? null, null, labels);
    }
    push({
      nodeId: String(block.blockId),
      kind: 'database',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: block.blockOptions.isDemoMode
        ? [labels['isDemoMode'] ?? 'demo']
        : [
            dbVariantLabel(block.databaseVariant, labels),
            block.connectionConfig?.username ??
              (block.databaseVariant === EDatabaseVariants.SQLITE
                ? block.connectionConfig?.databaseName ?? ''
                : ''),
          ].filter(Boolean),
      ports,
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of internalBlocks.converters) {
    // output resolved similarly to project service — simplified via input configs
    let output: EDataTypes | null = null;
    const cfg = block.convertTypeConfig;
    switch (block.inputDataType) {
      case EDataTypes.STRING:
        output = cfg.inputTypeString?.outputType ?? null;
        break;
      case EDataTypes.NUMBER:
        output = cfg.inputTypeNumber?.outputType ?? null;
        break;
      case EDataTypes.BYTES:
        output = cfg.inputTypeBytes?.outputType ?? null;
        break;
      case EDataTypes.IMAGE:
        output = cfg.inputTypeImage?.outputType ?? null;
        break;
      case EDataTypes.VIDEO:
        output = cfg.inputTypeVideo?.outputType ?? null;
        break;
      case EDataTypes.AUDIO:
        output = cfg.inputTypeAudio?.outputType ?? null;
        break;
      case EDataTypes.ANY_FILE:
        output = cfg.inputTypeAnyFile?.outputType ?? null;
        break;
      case EDataTypes.JSON: {
        const json = cfg.inputTypeJson;
        output = json?.jsonFieldConfig.path
          ? json.jsonFieldConfig.outputType
          : (json?.outputType ?? null);
        break;
      }
      case EDataTypes.ARRAY_NUMBERS:
        output = cfg.inputTypeArrayNumbers?.outputType ?? null;
        break;
    }
    push({
      nodeId: String(block.blockId),
      kind: 'converter',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: [
        typeLabel(block.inputDataType, labels),
        typeLabel(output, labels),
      ],
      ports: portsSimple(block.blockId, block.inputDataType, output, labels),
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of internalBlocks.graphs) {
    const ports: IScenePort[] = [
      {
        portId: `${block.blockId}:in`,
        blockId: block.blockId,
        side: 'left',
        dataType: EDataTypes.NUMBER,
        label: `${labels['dataTypeNumber'] ?? 'Number'} / ${labels['dataTypeString'] ?? 'String'}`,
      },
    ];
    push({
      nodeId: String(block.blockId),
      kind: 'graphs',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: [],
      ports,
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of internalBlocks.indicators) {
    const response =
      block.typeResponseData === EDataTypes.NOTHING ? null : block.typeResponseData;
    push({
      nodeId: String(block.blockId),
      kind: 'indicators',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: [],
      ports: portsSimple(
        block.blockId,
        block.typeRequestData,
        response,
        labels,
      ),
      memberBlockIds: [block.blockId],
    });
  }

  for (const block of internalBlocks.media) {
    push({
      nodeId: String(block.blockId),
      kind: 'media',
      blockName: block.blockName,
      primaryBlockId: block.blockId,
      traits: [typeLabel(block.typeRequestData, labels)],
      ports: portsSimple(block.blockId, block.typeRequestData, null, labels),
      memberBlockIds: [block.blockId],
    });
  }

  return nodes;
}

export function buildSceneEdges(
  file: IProjectFile,
  nodes: ISceneNode[],
): ISceneEdge[] {
  const outPortByBlock = new Map<number, string>();
  const inPortByBlock = new Map<number, string>();
  for (const node of nodes) {
    const leftPorts = node.ports.filter((port) => port.side === 'left');
    const signalIn = leftPorts.find((port) => port.role === 'signal');
    const dataIn = leftPorts.find((port) => port.role !== 'signal');
    const preferredIn = signalIn ?? dataIn ?? leftPorts[0];
    for (const memberId of node.memberBlockIds) {
      if (preferredIn) {
        inPortByBlock.set(memberId, preferredIn.portId);
      }
    }
    for (const port of node.ports) {
      if (port.side === 'right') {
        outPortByBlock.set(port.blockId, port.portId);
      }
    }
  }

  const edges: ISceneEdge[] = [];
  const seen = new Set<string>();
  const map = file.projectData.edges ?? {};
  for (const [fromKey, targets] of Object.entries(map)) {
    const fromBlockId = Number(fromKey);
    const fromPortId = outPortByBlock.get(fromBlockId);
    if (!fromPortId) {
      continue;
    }
    for (const toBlockId of targets) {
      const toPortId = inPortByBlock.get(toBlockId);
      if (!toPortId) {
        continue;
      }
      const edgeKey = `${fromPortId}->${toPortId}`;
      if (seen.has(edgeKey)) {
        continue;
      }
      seen.add(edgeKey);
      edges.push({
        edgeId: `${fromBlockId}->${toBlockId}`,
        fromBlockId,
        toBlockId,
        fromPortId,
        toPortId,
      });
    }
  }
  return edges;
}

export const SCENE_NODE_WIDTH = NODE_WIDTH;

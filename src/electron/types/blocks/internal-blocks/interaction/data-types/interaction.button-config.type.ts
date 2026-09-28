import { EDataTypes } from "../../../../data-types/base-data-type.type";

export type TInteractionButtonPayloadType =
  | EDataTypes.NUMBER
  | EDataTypes.STRING
  | EDataTypes.JSON
  | EDataTypes.BOOLEAN;

/**
 * Button interaction.
 * Exactly one of numberValue / stringValue / jsonValue / booleanValue is used,
 * matching `payloadType`.
 */
export interface IInteractionButtonConfig {
  buttonLabel: string;
  payloadType: TInteractionButtonPayloadType;
  /** Used when payloadType is NUMBER. */
  numberValue: number | null;
  /** Used when payloadType is STRING. */
  stringValue: string | null;
  /**
   * Used when payloadType is JSON.
   * Stored as text; must be valid JSON at validation time.
   */
  jsonValue: string | null;
  /** Used when payloadType is BOOLEAN. */
  booleanValue: boolean | null;
}

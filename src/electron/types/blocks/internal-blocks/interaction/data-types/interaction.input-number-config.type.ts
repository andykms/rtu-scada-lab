import { IInteractionNumberValidation } from "./interaction.number-validation.type";

/**
 * Number input field.
 * Outgoing data type is always NUMBER (receivers must accept NUMBER).
 */
export interface IInteractionInputNumberConfig {
  fieldLabel: string;
  unit: string | null;
  validation: IInteractionNumberValidation | null;
}

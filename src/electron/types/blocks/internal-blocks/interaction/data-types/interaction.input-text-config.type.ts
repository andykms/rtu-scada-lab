import { IInteractionStringValidation } from "./interaction.string-validation.type";

/**
 * String input field.
 * Outgoing data type is always STRING (receivers must accept STRING).
 */
export interface IInteractionInputTextConfig {
  fieldLabel: string;
  validation: IInteractionStringValidation | null;
}

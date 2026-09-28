import { IBaseBlock } from "../../base-block.type";
import { IInteractionButtonConfig } from "./data-types/interaction.button-config.type";
import { IInteractionCoordinatePlaneConfig } from "./data-types/interaction.coordinate-plane-config.type";
import { IInteractionGroupSwitchConfig } from "./data-types/interaction.group-switch-config.type";
import { IInteractionInputNumberConfig } from "./data-types/interaction.input-number-config.type";
import { IInteractionInputTextConfig } from "./data-types/interaction.input-text-config.type";
import { IInteractionSliderConfig } from "./data-types/interaction.slider-config.type";
import { IInteractionToggleConfig } from "./data-types/interaction.toggle-config.type";
import { EInteractionTypes } from "./interaction-types.type";

/**
 * Interaction block — at most one interaction type is active.
 * When `interactionType` is set, the matching config is non-null and the rest are null.
 * Incoming/outgoing connections (including feedback) are stored in project edges.
 */
export interface IInteractionBlock extends IBaseBlock {
  interactionType: EInteractionTypes | null;
  buttonConfig: IInteractionButtonConfig | null;
  inputTextConfig: IInteractionInputTextConfig | null;
  inputNumberConfig: IInteractionInputNumberConfig | null;
  toggleConfig: IInteractionToggleConfig | null;
  groupSwitchConfig: IInteractionGroupSwitchConfig | null;
  coordinatePlaneConfig: IInteractionCoordinatePlaneConfig | null;
  sliderConfig: IInteractionSliderConfig | null;
}

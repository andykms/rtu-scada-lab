/**
 * Slider control.
 * Outgoing data type is NUMBER.
 * Optional feedback comes from project edges: source blocks must produce NUMBER;
 * in compiled mode the thumb follows that value.
 */
export interface IInteractionSliderConfig {
  sliderLabel: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string | null;
}

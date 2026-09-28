/**
 * Grouped switch (radio-like positions).
 * Outgoing data type is STRING (selected position label).
 * `positions` must contain at least 2 items.
 * Optional feedback comes from project edges: source blocks must produce STRING;
 * in compiled mode the switch selects a matching position if present.
 */
export interface IInteractionGroupSwitchConfig {
  switchLabel: string;
  /** Position labels; minimum length is 2. */
  positions: string[];
}

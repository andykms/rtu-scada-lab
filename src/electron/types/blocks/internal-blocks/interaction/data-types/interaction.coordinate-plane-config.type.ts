/**
 * 2D coordinate plane control.
 * Outgoing data type is ARRAY_NUMBERS — typically `[x, y]`.
 * Domain defaults are [-100, 100] for both axes when creating a new block.
 * Optional feedback comes from project edges: source blocks must produce ARRAY_NUMBERS;
 * in compiled mode the point follows that value.
 */
export interface IInteractionCoordinatePlaneConfig {
  planeName: string;
  xAxisName: string;
  yAxisName: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Default axis domains from the product spec. */
export const INTERACTION_COORDINATE_PLANE_DEFAULT_MIN = -100;
export const INTERACTION_COORDINATE_PLANE_DEFAULT_MAX = 100;

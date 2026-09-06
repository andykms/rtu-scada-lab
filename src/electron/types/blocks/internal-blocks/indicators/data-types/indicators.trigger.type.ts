export enum EIndicatorTriggerType {
  MAX,
  MIN,
  RANGE,
  EXACT_VALUE
}

export interface IIndicatorTrigger {
  triggerType: EIndicatorTriggerType;
  outputBlockId: number;
  maxConfig: {
    maxValue: number;
  } | null;
  minConfig: {
    minValue: number;
  } | null;
  rangeConfig: {
    minValue: number;
    maxValue: number;
  } | null;
  exactValueConfig: {
    value: number;
  } | null;
}

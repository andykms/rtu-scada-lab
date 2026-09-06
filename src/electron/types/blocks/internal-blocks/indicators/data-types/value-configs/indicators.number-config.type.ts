import { IIndicatorTrigger } from "../indicators.trigger.type";

export interface IIndicatorNumberConfig {
  unit: string | null;
  triggers: IIndicatorTrigger[];
}

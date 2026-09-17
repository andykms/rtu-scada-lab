import { PaperSizes } from '../../paper-ui/base/features';

export interface DialogOptions<TData = void> {
  readonly label?: string;
  readonly size?: PaperSizes;
  readonly data?: TData;
  readonly mainActionLabel?: string;
  readonly secondaryActionLabel?: string;
  readonly otherActionLabels?: string[];
  /** When false, footer actions are hidden (content can render its own). Default: true. */
  readonly showActions?: boolean;
}

import { InjectionToken, Type, WritableSignal } from '@angular/core';
import { DialogOptions } from './dialog-options';

export interface DialogConfig<TData = void> {
  readonly component: Type<unknown>;
  readonly options: DialogOptions<TData>;
  readonly onMainAction: () => void;
  readonly onOtherAction: (label: string) => void;
  readonly onDismiss: () => void;
  /** When true, the shell primary action is disabled. */
  readonly mainActionDisabled: WritableSignal<boolean>;
}

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('DIALOG_CONFIG');

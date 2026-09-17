import { InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface DialogContext<TResult = void, TData = void> {
  readonly data: TData;
  /** Emits when the shell main action button is clicked. */
  readonly mainAction$: Observable<void>;
  /** Emits when an extra shell action button is clicked. */
  readonly otherAction$: Observable<string>;
  /** Emit a result and close the dialog. */
  completeWith(result: TResult): void;
  /** Enable/disable the shell primary action (e.g. Save). */
  setMainActionEnabled(enabled: boolean): void;
  /** Cancel API (same as Taiga `$implicit.complete()`). */
  readonly $implicit: {
    complete(): void;
  };
}

export const DIALOG_CONTEXT = new InjectionToken<DialogContext<unknown, unknown>>(
  'DIALOG_CONTEXT',
);

export function injectDialogContext<TResult = void, TData = void>(): DialogContext<
  TResult,
  TData
> {
  return inject(DIALOG_CONTEXT) as DialogContext<TResult, TData>;
}

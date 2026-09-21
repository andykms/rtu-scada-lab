import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { merge } from 'rxjs';

/**
 * Keeps a monotonic revision so canSave/effects re-run on any control update.
 * Needed because toSignal(valueChanges+statusChanges) can miss nested select updates
 * when consecutive status emissions are Object.is-equal ('VALID' === 'VALID').
 */
export function createFormRevisionTracker(control: AbstractControl): {
  readonly formRev: Signal<number>;
  onFormDomEvent: () => void;
  bump: () => void;
} {
  const formRev = signal(0);
  const bump = (): void => {
    formRev.update((value) => value + 1);
  };

  merge(control.valueChanges, control.statusChanges, control.events)
    .pipe(takeUntilDestroyed(inject(DestroyRef)))
    .subscribe(() => bump());

  return {
    formRev,
    bump,
    onFormDomEvent: () => {
      queueMicrotask(() => bump());
    },
  };
}

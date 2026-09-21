import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaperText } from '../../paper-ui/base/text/text.directive';
import { injectDialogContext } from './dialog-context';

export type TUnsavedChangesResult = 'save' | 'discard';

export interface IUnsavedChangesDialogData {
  message: string;
}

@Component({
  selector: 'app-unsaved-changes-dialog',
  template: `<p class="confirm-message" paperText size="m">{{ message }}</p>`,
  styles: [
    `
      .confirm-message {
        margin: 0;
        padding: 8px 4px 16px;
        color: var(--text-color);
      }
    `,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaperText],
})
export class UnsavedChangesDialogComponent {
  private readonly context = injectDialogContext<
    TUnsavedChangesResult,
    IUnsavedChangesDialogData
  >();
  readonly message = this.context.data.message;

  constructor() {
    this.context.setMainActionEnabled(true);
    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.context.completeWith('save');
    });
    this.context.otherAction$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.context.completeWith('discard');
    });
  }
}

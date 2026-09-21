import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaperInput } from '../../paper-ui/base/input/input.directive';
import { PaperLabel } from '../../paper-ui/base/label/label.directive';
import { PaperTextfield } from '../../paper-ui/base/textfield/textfield.component';
import { injectDialogContext } from './dialog-context';

export interface ICreateProjectDialogData {
  projectNameLabel: string;
}

@Component({
  selector: 'app-create-project-dialog',
  template: `
    <paper-textfield size="m">
      <label paperLabel for="new-project-name">{{ projectNameLabel }}</label>
      <input
        paperInput
        id="new-project-name"
        type="text"
        autocomplete="off"
        [formControl]="nameControl"
      />
    </paper-textfield>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 8px 4px 16px;
      }
    `,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PaperTextfield, PaperInput, PaperLabel],
})
export class CreateProjectDialogComponent {
  private readonly context = injectDialogContext<string, ICreateProjectDialogData>();
  readonly projectNameLabel = this.context.data.projectNameLabel;
  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  constructor() {
    this.syncMainAction();
    this.nameControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.syncMainAction();
    });
    this.context.mainAction$.pipe(takeUntilDestroyed()).subscribe(() => {
      const name = this.nameControl.value.trim();
      if (!name || this.nameControl.invalid) {
        this.nameControl.markAsTouched();
        this.syncMainAction();
        return;
      }
      this.context.completeWith(name);
    });
  }

  private syncMainAction(): void {
    const name = this.nameControl.value.trim();
    this.context.setMainActionEnabled(!!name && this.nameControl.valid);
  }
}

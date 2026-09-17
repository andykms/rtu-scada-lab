import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { PaperModalComponent } from '../../paper-ui/layout/modal/modal.component';
import { DIALOG_CONFIG } from './dialog-config';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  template: `
    <paper-modal
      [opened]="true"
      [title]="config.options.label ?? ''"
      [size]="config.options.size ?? 'm'"
      [mainActionLabel]="config.options.mainActionLabel ?? 'Ок'"
      [secondaryActionLabel]="config.options.secondaryActionLabel ?? 'Отмена'"
      [otherActionLabels]="config.options.otherActionLabels ?? []"
      [showActions]="config.options.showActions ?? true"
      [mainActionDisabled]="config.mainActionDisabled()"
      (close)="config.onDismiss()"
      (onSecondaryAction)="config.onDismiss()"
      (onMainAction)="config.onMainAction()"
      (onOtherActions)="config.onOtherAction($event)"
    >
      <ng-container #componentHost />
    </paper-modal>
  `,
  imports: [PaperModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHostComponent implements AfterViewInit {
  readonly config = inject(DIALOG_CONFIG);
  private readonly injector = inject(Injector);

  @ViewChild('componentHost', { read: ViewContainerRef })
  private readonly componentHost!: ViewContainerRef;

  ngAfterViewInit(): void {
    this.componentHost.createComponent(this.config.component, {
      injector: this.injector,
    });
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild,
  ViewContainerRef,
  effect,
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
      [mainActionDisabled]="mainActionDisabled()"
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
  private readonly cdr = inject(ChangeDetectorRef);

  /** Stable signal ref so the modal button tracks enable/disable reliably. */
  readonly mainActionDisabled = this.config.mainActionDisabled;

  @ViewChild('componentHost', { read: ViewContainerRef })
  private readonly componentHost!: ViewContainerRef;

  constructor() {
    effect(() => {
      this.mainActionDisabled();
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.componentHost.createComponent(this.config.component, {
      injector: this.injector,
    });
  }
}

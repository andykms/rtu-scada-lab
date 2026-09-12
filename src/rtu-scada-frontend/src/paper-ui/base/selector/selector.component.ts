import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, OnInit, output } from '@angular/core';
import { BaseComponent } from '../../base.directive';
import { PaperText } from '../text/text.directive';
import { LanguageService } from '../../../libraries/language/language.service';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'paper-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css'],
  imports: [PaperText],
  standalone: true,
})
export class PaperSelector extends BaseComponent implements OnInit {
  private readonly _languageService = inject(LanguageService);
  readonly labels = this._languageService.labels();
  private clickSubscription = Subscription.EMPTY;

  ngOnInit(): void {
    this.clickSubscription = fromEvent(document, 'click').subscribe((event: Event) => {
    if (!(event.target as Node).contains(this.elementRef.nativeElement)) {
      this.close.emit();
    }
  });
  }

  readonly variants = input.required<string[]>();
  readonly close = output<void>();
  readonly selected = output<string>();
  readonly open = input<boolean>(false);

  protected selectVariant(variant: string): void {
    this.selected.emit(variant);
  }
}
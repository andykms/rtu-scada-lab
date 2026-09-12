import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LanguageProvider } from '../../../libraries/language/language.directive';
import { PaperText } from '../../../paper-ui/base/text/text.directive';
import { PaperIcon } from '../../../paper-ui/icons/icon.component';
import { PaperCard } from '../../../paper-ui/layout/card/card.directive';

@Component({
  selector: 'constructor-app-root',
  templateUrl: './constructor-app-root.component.html',
  styleUrls: ['./constructor-app-root.component.css'],
  imports: [RouterOutlet, RouterLink, PaperText, PaperCard, PaperIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstructorAppRootComponent extends LanguageProvider {
  private readonly router = inject(Router);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isActive(url: string): boolean {
    return this.currentUrl() === url;
  }
}

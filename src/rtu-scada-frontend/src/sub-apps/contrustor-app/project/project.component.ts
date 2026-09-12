import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PaperCard } from '../../../paper-ui/layout/card/card.directive';
import { PaperText } from '../../../paper-ui/base/text/text.directive';
import { ConstructorAppProjectBarComponent } from './bar/bar.component';
import { LanguageProvider } from '../../../libraries/language/language.directive';

@Component({
  selector: 'constructor-app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  imports: [PaperCard, PaperText, ConstructorAppProjectBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent extends LanguageProvider {
}

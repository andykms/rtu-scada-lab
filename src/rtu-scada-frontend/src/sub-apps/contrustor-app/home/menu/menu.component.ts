import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { PaperCard } from '../../../../paper-ui/layout/card/card.directive';
import { LanguageService } from '../../../../libraries/language/language.service';
import { PaperText } from '../../../../paper-ui/base/text/text.directive';
import { PaperIcon } from '../../../../paper-ui/icons/icon.component';
import { LanguageProvider } from '../../../../libraries/language/language.directive';

@Component({
    selector: 'constructor-app-home-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PaperCard,
        PaperText,
        PaperIcon
    ],
})
export class MenuComponent extends LanguageProvider {
    readonly onCreateProject = output<void>();
    readonly onOpenProject = output<void>();
}
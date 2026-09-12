import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'compiled-app-root',
    templateUrl: './compiled-app-root.component.html',
    styleUrls: ['./compiled-app-root.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompiledAppRootComponent {
}
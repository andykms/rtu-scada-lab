import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PaperIcon } from '../../../../../paper-ui/icons/icon.component';
import { TSceneMode } from '../scene.models';

@Component({
  selector: 'constructor-scene-actions-bar',
  templateUrl: './actions-bar.component.html',
  styleUrls: ['./actions-bar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaperIcon],
})
export class SceneActionsBarComponent {
  readonly mode = input.required<TSceneMode>();
  readonly modeChange = output<TSceneMode>();

  protected enterLink(): void {
    this.modeChange.emit(this.mode() === 'link' ? 'idle' : 'link');
  }

  protected enterDelete(): void {
    this.modeChange.emit(this.mode() === 'delete' ? 'idle' : 'delete');
  }

  protected enterEdit(): void {
    this.modeChange.emit(this.mode() === 'edit' ? 'idle' : 'edit');
  }

  protected exitMode(): void {
    this.modeChange.emit('idle');
  }
}

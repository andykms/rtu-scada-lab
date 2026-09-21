import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SceneBlockComponent } from '../scene-block/scene-block.component';
import { ISceneNode, IScenePort } from '../../scene.models';

@Component({
  selector: 'constructor-scene-com-block',
  templateUrl: './com-block.component.html',
  styleUrls: ['./com-block.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SceneBlockComponent],
})
export class ComBlockComponent {
  readonly node = input.required<ISceneNode>();
  readonly dimmed = input(false);
  readonly highlightPortId = input<string | null>(null);
  readonly linkMode = input(false);
  readonly portClick = output<IScenePort>();
  readonly dragStart = output<PointerEvent>();
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SceneBlockComponent } from '../scene-block/scene-block.component';
import { ISceneNode, IScenePort } from '../../scene.models';

@Component({
  selector: 'constructor-scene-graphs-block',
  templateUrl: './graphs-block.component.html',
  styleUrls: ['./graphs-block.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SceneBlockComponent],
})
export class GraphsBlockComponent {
  readonly node = input.required<ISceneNode>();
  readonly dimmed = input(false);
  readonly highlightPortId = input<string | null>(null);
  readonly linkMode = input(false);
  readonly portClick = output<IScenePort>();
  readonly dragStart = output<PointerEvent>();
}

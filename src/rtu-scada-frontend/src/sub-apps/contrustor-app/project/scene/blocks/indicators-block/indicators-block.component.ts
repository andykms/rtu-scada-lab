import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SceneBlockComponent } from '../scene-block/scene-block.component';
import { ISceneNode, IScenePort } from '../../scene.models';

@Component({
  selector: 'constructor-scene-indicators-block',
  templateUrl: './indicators-block.component.html',
  styleUrls: ['./indicators-block.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SceneBlockComponent],
})
export class IndicatorsBlockComponent {
  readonly node = input.required<ISceneNode>();
  readonly dimmed = input(false);
  readonly highlightPortId = input<string | null>(null);
  readonly linkMode = input(false);
  readonly portClick = output<IScenePort>();
  readonly dragStart = output<PointerEvent>();
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SceneBlockComponent } from '../scene-block/scene-block.component';
import { ISceneNode, IScenePort } from '../../scene.models';

@Component({
  selector: 'constructor-scene-converter-block',
  templateUrl: './converter-block.component.html',
  styleUrls: ['./converter-block.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SceneBlockComponent],
})
export class ConverterBlockComponent {
  readonly node = input.required<ISceneNode>();
  readonly dimmed = input(false);
  readonly highlightPortId = input<string | null>(null);
  readonly linkMode = input(false);
  readonly portClick = output<IScenePort>();
  readonly dragStart = output<PointerEvent>();
}

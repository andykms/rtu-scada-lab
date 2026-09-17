import {ChangeDetectionStrategy, Component, effect, input, output} from "@angular/core";
import { BaseComponent } from "../../base.directive";

@Component({
  standalone:true,
  selector: "paper-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperModalComponent extends BaseComponent {
    readonly opened = input<boolean>(false);
    readonly close = output<void>();
    readonly mainActionLabel = input<string>("Ок");
    readonly secondaryActionLabel = input<string>("Отмена");
    readonly otherActionLabels = input<string[]>([]);
    readonly showActions = input<boolean>(true);
    readonly mainActionDisabled = input<boolean>(false);
    readonly onMainAction = output<void>();
    readonly onSecondaryAction = output<void>();
    readonly onOtherActions = output<string>();
    readonly title = input<string>("");
}
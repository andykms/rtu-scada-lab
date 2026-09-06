import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "paper-selector",
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./selector.component.html",
    styleUrls: ["./selector.component.css"]
})
export class PaperSelector {
    
}
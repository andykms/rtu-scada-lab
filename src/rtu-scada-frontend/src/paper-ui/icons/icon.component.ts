import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { PAPER_ICONS } from "./icons";
import { BaseComponent } from "../base.directive";

@Component({
    selector: "paper-icon",
    templateUrl: "icon.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaperIcon extends BaseComponent { 
    readonly icon = input<string>("");

    readonly paperIcons = PAPER_ICONS;

    readonly primary = input<boolean>(true);

    readonly iconColor = computed(()=>{
        return this.primary() ? "var(--primary-color)" : "var(--text-color)" 
    })

    readonly iconSize = computed(()=>{
        switch(this.size()) {
            case "xs": 
                return "10px"
            case "s": 
                return "16px"
            case "m":
                return "22px"
            case "l":
                return "28px"
            case "xl":
                return "34px"
        }
    })
}
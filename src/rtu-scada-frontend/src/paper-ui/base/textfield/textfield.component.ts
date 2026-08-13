import { Component, ChangeDetectionStrategy } from "@angular/core";
import {BaseComponent} from "../base.directive";


@Component({
    selector: "paper-textfield",
    templateUrl: "./textfield.component.html",
    styleUrls: ["./textfield.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperTextfield extends BaseComponent {}
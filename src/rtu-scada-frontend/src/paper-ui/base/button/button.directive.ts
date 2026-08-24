import { Directive, input, OnChanges, OnInit } from "@angular/core"
import {BaseComponent} from "../../base.directive"

@Directive({
    selector: "[paperButton]",
})
export class PaperButton extends BaseComponent implements OnInit, OnChanges {

  readonly disabled = input(false);

  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-button');
    this.renderer.addClass(this.elementRef.nativeElement, `paper-button_${this.size()}`);
  }

  ngOnChanges() {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', this.disabled());
  }
}
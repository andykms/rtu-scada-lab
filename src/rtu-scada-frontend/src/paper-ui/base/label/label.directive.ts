import { Directive, ElementRef, Renderer2 } from "@angular/core";

@Directive({
  selector: '[paperLabel]'
})
export class PaperLabel {
    constructor(private readonly elementRef: ElementRef, private readonly renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-label');
  }
}
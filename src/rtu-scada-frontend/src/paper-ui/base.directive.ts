import { Directive, ElementRef, Host, input, Renderer2 } from '@angular/core';
import { PaperSizes } from './base/features';

@Directive({
  standalone: true,
})
export class BaseComponent {
  readonly size = input<PaperSizes>('m');

  constructor(
    protected readonly elementRef: ElementRef,
    protected readonly renderer: Renderer2,
  ) {
    this.renderer.addClass(this.elementRef.nativeElement, 'substrate');
  }
}

import { Directive } from '@angular/core';
import { BaseComponent } from '../../base.directive';

@Directive({
  selector: '[paperText]',
})
export class PaperText extends BaseComponent {
  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-text');
    this.renderer.addClass(this.elementRef.nativeElement, `paper-text_${this.size()}`);
  }
}

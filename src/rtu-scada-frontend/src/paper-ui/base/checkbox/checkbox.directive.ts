import { Directive } from '@angular/core';
import { BaseComponent } from '../../base.directive';

@Directive({
  selector: '[paperCheckbox]',
})
export class PaperCheckbox extends BaseComponent {
  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-checkbox');
    this.renderer.addClass(this.elementRef.nativeElement, `paper-checkbox_${this.size()}`);
  }
}

import { Directive } from '@angular/core';
import { BaseComponent } from '../../base.directive';

@Directive({
  selector: '[paperRadio]',
})
export class PaperRadio extends BaseComponent {
  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-radio');
    this.renderer.addClass(this.elementRef.nativeElement, `paper-radio_${this.size()}`);
  }
}

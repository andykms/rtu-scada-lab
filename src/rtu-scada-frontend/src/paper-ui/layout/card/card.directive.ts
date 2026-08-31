import { Directive, input } from '@angular/core';
import { BaseComponent } from '../../base.directive';

@Directive({
  selector: '[paperCard]',
})
export class PaperCard extends BaseComponent {

  readonly pointer = input<boolean>(false);

  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-card');
    this.renderer.addClass(this.elementRef.nativeElement, `paper-card_${this.size()}`);
    this.pointer() && this.renderer.addClass(this.elementRef.nativeElement, 'paper-card-pointer')
  }
}

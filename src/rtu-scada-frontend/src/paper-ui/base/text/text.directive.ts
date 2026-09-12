import { Directive, effect, input } from '@angular/core';
import { BaseComponent } from '../../base.directive';

@Directive({
  selector: '[paperText]',
})
export class PaperText extends BaseComponent {
  readonly activeLink = input<boolean>(false);
  readonly link = input<boolean>(false);
  readonly subtext = input<boolean>(false);
  readonly ellipsis = input<boolean>(false);

  private readonly syncActiveLink = effect(() => {
    this.toggleClass('paper-text_active', this.activeLink());
  });

  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-text');
    this.renderer.addClass(
      this.elementRef.nativeElement,
      `paper-text_${this.size()}`,
    );
    this.toggleClass('paper-text_link', this.link());
    this.toggleClass('paper-text_subtext', this.subtext());
    this.toggleClass('paper-text_ellipsis', this.ellipsis());
  }

  private toggleClass(className: string, enabled: boolean): void {
    if (enabled) {
      this.renderer.addClass(this.elementRef.nativeElement, className);
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, className);
    }
  }
}

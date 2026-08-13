import {computed, Directive, ElementRef, HostBinding, Renderer2, signal} from "@angular/core";

@Directive({
    selector: '[paperInput]',
    host: {
      '(focus)': 'onFocus()',
      '(change)': 'onChange()',
      '(blur)': 'onBlur()'
    }
})
export class PaperInput {
  protected readonly focused = signal(false);
  protected readonly value = signal("");

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(this.elementRef.nativeElement, 'paper-input');
  }

  onFocus() {
    this.focused.set(true);
  }

  onBlur() {
    this.focused.set(false);
  }

  onChange() {
    this.value.set(this.elementRef.nativeElement.value);
  }

  protected miniPlaceholderClass = computed(() => this.focused() ? "mini-placeholder" : this.value() ? "mini-placeholder" : "");

  @HostBinding('class.mini-placeholder') 
  get miniPlaceholder() {
    return this.miniPlaceholderClass();
  }
}
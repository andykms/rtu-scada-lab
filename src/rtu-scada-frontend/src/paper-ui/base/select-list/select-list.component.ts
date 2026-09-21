import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { filter, fromEvent, merge, Subscription } from 'rxjs';

@Component({
  selector: 'paper-select-list',
  templateUrl: './select-list.component.html',
  styleUrls: ['../data-list/data-list.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaperSelectList),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperSelectList<T> implements OnInit, AfterContentInit, OnDestroy, ControlValueAccessor {
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);

  private clickSubs?: Subscription;
  private openSubs?: Subscription;

  readonly variants = input.required<Array<T>>();
  readonly labelResolver = input<(value: T) => string>((value: T) => String(value));

  readonly opened = signal(false);

  @ContentChild('inputList', { read: ElementRef }) inputRef!: ElementRef<HTMLInputElement>;

  private _value: T | null = null;

  private _onChange: (value: T | null) => void = () => {};
  private _onTouched: () => void = () => {};

  ngOnInit() {
    this.clickSubs = fromEvent(document, 'click')
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        filter((event) => !this.elementRef.nativeElement.contains(event.target as Node)),
      )
      .subscribe(() => this.opened.set(false));
  }

  ngAfterContentInit() {
    if (!this.inputRef) {
      return;
    }

    this.inputRef.nativeElement.readOnly = true;
    this.syncInputLabel();

    this.openSubs = merge(
      fromEvent(this.inputRef.nativeElement, 'focus'),
      fromEvent(this.inputRef.nativeElement, 'click'),
    )
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        if (this.variants().length > 0) {
          this.opened.set(true);
        }
      });
  }

  ngOnDestroy() {
    this.clickSubs?.unsubscribe();
    this.openSubs?.unsubscribe();
  }

  protected selectVariant(variant: T) {
    this._value = variant;
    this._onChange(variant);
    this._onTouched();
    this.opened.set(false);
    this.syncInputLabel();
    // Bubble to parent <form (input)/(change)> so create-block canSave refreshes
    this.elementRef.nativeElement.dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    this.elementRef.nativeElement.dispatchEvent(
      new Event('change', { bubbles: true }),
    );
  }

  writeValue(value: T | null): void {
    this._value = value;
    this.syncInputLabel();
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  private syncInputLabel(): void {
    if (!this.inputRef) {
      return;
    }
    const label = this.labelResolver()(this._value as T);
    this.inputRef.nativeElement.value = label;
    this.inputRef.nativeElement.dispatchEvent(new Event('change'));
  }
}

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
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { filter, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'paper-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaperDataList),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaperDataList<T> implements OnInit, AfterContentInit, OnDestroy, ControlValueAccessor {
  private readonly destroyRef$ = inject(DestroyRef);

  control!: AbstractControl | null;

  clickSubs?: Subscription;
  changeInputSubs?: Subscription;

  constructor(
    private readonly controlContainer: ControlContainer,
    private readonly elementRef: ElementRef,
  ) {}

  readonly formControlName = input.required<string>();

  readonly variants = input.required<Array<T>>();
  readonly labelResolver = input<(value: T | null) => string>((value: T | null) => String(value));

  readonly recommended = signal<Array<T>>([]);
  readonly opened = signal(false);

  @ContentChild('inputList', { read: ElementRef }) inputRef!: ElementRef<HTMLInputElement>;

  private _value: T | null = null;

  private _onChange: (value: T | null) => void = () => {};
  private _onTouched: () => void = () => {};

  ngOnInit() {
    this.control = this.controlContainer.control?.get(this.formControlName()) ?? null;

    this.clickSubs = fromEvent(document, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .pipe(filter((event) => !this.elementRef.nativeElement.contains(event.target as Node)))
      .subscribe(() => this.opened.set(false));
  }

  ngAfterContentInit() {
    if (this.inputRef) {
      this.changeInputSubs = fromEvent<InputEvent>(this.inputRef.nativeElement, 'input')
        .pipe(takeUntilDestroyed(this.destroyRef$))
        .subscribe((event) => {
          const inputValue = (event.target as HTMLInputElement).value;
          this.changeRecommended(inputValue);
        });
    }
  }

  ngOnDestroy() {
    this.clickSubs?.unsubscribe();
    this.changeInputSubs?.unsubscribe();
  }

  protected changeRecommended(value: string) {
    if (value.length > 0 && value !== this.labelResolver()(this._value)) {
      this.opened.set(true);
    }
    this.recommended.set(
      this.variants().filter((variant) =>
        this.labelResolver()(variant).trim().startsWith(value.trim()),
      ),
    );
  }

  protected selectVariant(variant: T) {
    this._value = variant;
    this._onChange(variant);
    this.opened.set(false);
    this.control?.setValue(variant);

    if (this.inputRef) {
      this.inputRef.nativeElement.value = this.labelResolver()(variant);
    }
  }

  writeValue(value: T | null): void {
    this._value = value;
    this.changeRecommended(this.labelResolver()(this._value));
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}

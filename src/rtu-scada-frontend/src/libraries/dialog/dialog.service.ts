import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  Type,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DIALOG_CONFIG, DialogConfig } from './dialog-config';
import { DIALOG_CONTEXT, DialogContext } from './dialog-context';
import { DialogHostComponent } from './dialog-host.component';
import { DialogOptions } from './dialog-options';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);

  open<TResult, TData = void>(
    component: Type<unknown>,
    options: DialogOptions<TData> = {},
  ): Observable<TResult> {
    return new Observable<TResult>((subscriber) => {
      let closed = false;
      let hostRef: ComponentRef<DialogHostComponent> | null = null;
      const mainAction$ = new Subject<void>();
      const otherAction$ = new Subject<string>();
      const mainActionDisabled = signal(true);

      const destroy = (): void => {
        mainAction$.complete();
        otherAction$.complete();
        if (!hostRef) {
          return;
        }
        this.appRef.detachView(hostRef.hostView);
        hostRef.destroy();
        hostRef.location.nativeElement.remove();
        hostRef = null;
      };

      const close = (hasValue: boolean, value?: TResult): void => {
        if (closed) {
          return;
        }
        closed = true;
        if (hasValue) {
          subscriber.next(value as TResult);
        }
        subscriber.complete();
        destroy();
      };

      const context: DialogContext<TResult, TData> = {
        data: options.data as TData,
        mainAction$: mainAction$.asObservable(),
        otherAction$: otherAction$.asObservable(),
        completeWith: (result: TResult) => close(true, result),
        setMainActionEnabled: (enabled: boolean) => mainActionDisabled.set(!enabled),
        $implicit: {
          complete: () => close(false),
        },
      };

      const config: DialogConfig<TData> = {
        component,
        options,
        onMainAction: () => {
          if (!mainActionDisabled()) {
            mainAction$.next();
          }
        },
        onOtherAction: (label) => otherAction$.next(label),
        onDismiss: () => context.$implicit.complete(),
        mainActionDisabled,
      };

      const dialogInjector = Injector.create({
        providers: [
          { provide: DIALOG_CONTEXT, useValue: context },
          { provide: DIALOG_CONFIG, useValue: config },
        ],
        parent: this.injector,
      });

      hostRef = createComponent(DialogHostComponent, {
        environmentInjector: this.environmentInjector,
        elementInjector: dialogInjector,
      });

      document.body.appendChild(hostRef.location.nativeElement);
      this.appRef.attachView(hostRef.hostView);
      hostRef.changeDetectorRef.detectChanges();

      return () => {
        if (!closed) {
          closed = true;
          destroy();
        }
      };
    });
  }
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaperRadio } from '../../../paper-ui/base/radio/radio.directive';
import { PaperText } from '../../../paper-ui/base/text/text.directive';
import { LanguageProvider } from '../../../libraries/language/language.directive';
import { SettingsService } from '../../../libraries/settings/settings.service';
import { ESettingsTheme } from '../../../libraries/settings/features/settings.theme';
import { ESettingsLanguages } from '../../../libraries/settings/features/settings.languages';
import { PaperCheckbox } from '../../../paper-ui/base';
import { tap } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaperRadio, PaperText, ReactiveFormsModule, PaperCheckbox],
})
export class SettingsComponent extends LanguageProvider implements OnInit {
  readonly ESettingsTheme = ESettingsTheme;
  readonly ESettingsLanguages = ESettingsLanguages;

  private readonly _settingsService = inject(SettingsService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly settingsForm = new FormGroup({
    theme: new FormControl<ESettingsTheme>(ESettingsTheme.LIGHT, { nonNullable: true }),
    language: new FormControl<ESettingsLanguages>(ESettingsLanguages.RU, { nonNullable: true }),
    isOffGlassDesign: new FormControl<boolean>(false, { nonNullable: true }),
  });

  ngOnInit(): void {
    this._settingsService.theme$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((theme) => {
      this.settingsForm.controls.theme.setValue(theme, { emitEvent: false });
    });

    this._settingsService.language$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((language) => {
        this.settingsForm.controls.language.setValue(language, { emitEvent: false });
      });

    this._settingsService.isOffGlassDesign$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((flag) => {
        this.settingsForm.controls.isOffGlassDesign.setValue(flag, { emitEvent: false });
      });

    this.settingsForm.controls.theme.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((theme) => {
        this._settingsService.theme = theme;
      });

    this.settingsForm.controls.language.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((language) => {
        this._settingsService.language = language;
      });

    this.settingsForm.controls.isOffGlassDesign.valueChanges
      .pipe(tap(console.log))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((flag) => {
        this._settingsService.isOffGlassDesign = flag;
      });
  }
}

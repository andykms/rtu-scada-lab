import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { ESettingsLanguages } from './features/settings.languages';
import { ESettingsTheme } from './features/settings.theme';

const LANGUAGE_KEY = 'language';
const THEME_KEY = 'theme';
const NIGHT_THEME_CLASS = 'night-theme';
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
const IS_OFF_GLASS_DESIGN = 'off_glass_design';
const OFF_GLASS_DESIGN_CLASS = 'non-transparent';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly _localStorage = inject(LocalStorageService);
  private readonly _systemThemeMedia = window.matchMedia(SYSTEM_DARK_QUERY);

  private readonly _language$ = new BehaviorSubject<ESettingsLanguages>(this.readLanguage());
  private readonly _theme$ = new BehaviorSubject<ESettingsTheme>(this.readTheme());
  private readonly _isOffGlassDesign$ = new BehaviorSubject<boolean>(this.readIsOffGlassDesign());

  constructor() {
    this.applyTheme(this._theme$.value);
    this.applyIsOffDesignGlass(this._isOffGlassDesign$.value);
    this._systemThemeMedia.addEventListener('change', this.onSystemThemeChange);
  }

  get language$(): Observable<ESettingsLanguages> {
    return this._language$.asObservable();
  }

  set language(language: ESettingsLanguages) {
    this._localStorage.setItem(LANGUAGE_KEY, language);
    this._language$.next(language);
  }

  get theme$(): Observable<ESettingsTheme> {
    return this._theme$.asObservable();
  }

  set theme(theme: ESettingsTheme) {
    this._localStorage.setItem(THEME_KEY, theme);
    this._theme$.next(theme);
    this.applyTheme(theme);
  }

  get isOffGlassDesign$(): Observable<boolean> {
    return this._isOffGlassDesign$.asObservable();
  }

  set isOffGlassDesign(flag: boolean) {
    this._localStorage.setItem(IS_OFF_GLASS_DESIGN, flag ? 'true' : 'false');
    this._isOffGlassDesign$.next(flag);
    this.applyIsOffDesignGlass(flag);
  }

  private readLanguage(): ESettingsLanguages {
    const language = this._localStorage.getItem(LANGUAGE_KEY) || '';
    if (!Object.values(ESettingsLanguages).includes(language as ESettingsLanguages)) {
      this._localStorage.setItem(LANGUAGE_KEY, ESettingsLanguages.RU);
      return ESettingsLanguages.RU;
    }
    return language as ESettingsLanguages;
  }

  private readTheme(): ESettingsTheme {
    const theme = this._localStorage.getItem(THEME_KEY) || '';
    if (!Object.values(ESettingsTheme).includes(theme as ESettingsTheme)) {
      this._localStorage.setItem(THEME_KEY, ESettingsTheme.LIGHT);
      return ESettingsTheme.LIGHT;
    }
    return theme as ESettingsTheme;
  }

  private readIsOffGlassDesign(): boolean {
    const isOffGlassDesignString = this._localStorage.getItem(IS_OFF_GLASS_DESIGN);
    const isOffGlassDesign = isOffGlassDesignString == "true" ? true : false;
    return isOffGlassDesign
  }

  private applyTheme(theme: ESettingsTheme): void {
    const isDark =
      theme === ESettingsTheme.DARK ||
      (theme === ESettingsTheme.SYSTEM && this._systemThemeMedia.matches);

    document.body.classList.toggle(NIGHT_THEME_CLASS, isDark);
  }

  private applyIsOffDesignGlass(flag: boolean): void {
    document.body.classList.toggle(OFF_GLASS_DESIGN_CLASS, flag);
  }

  private readonly onSystemThemeChange = (): void => {
    if (this._theme$.value === ESettingsTheme.SYSTEM) {
      this.applyTheme(ESettingsTheme.SYSTEM);
    }
  };
}

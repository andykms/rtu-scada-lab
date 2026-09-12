import { Injectable } from "@angular/core";
import { ESettingsLanguages } from "./features/settings.languages";
import { ESettingsTheme } from "./features/settings.theme";
import { Observable } from "rxjs";
import { of } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    

    get language$(): Observable<ESettingsLanguages> {
        const language = window.localStorage.getItem('language') || '';
        if(!Object.values(ESettingsLanguages).includes(language as ESettingsLanguages)) {
            this.language = ESettingsLanguages.RU;
            return of(ESettingsLanguages.RU);
        }
        return of(language as ESettingsLanguages) as Observable<ESettingsLanguages>;
    }

    set language(language: ESettingsLanguages) {
        window.localStorage.setItem('language', language);
    }

    get theme$(): Observable<ESettingsTheme> {
        const theme = window.localStorage.getItem('theme') || '';
        if(!Object.values(ESettingsTheme).includes(theme as ESettingsTheme)) {
            this.theme = ESettingsTheme.LIGHT;
            return of(ESettingsTheme.LIGHT);
        }
        return of(theme as ESettingsTheme) as Observable<ESettingsTheme>;
    }

    set theme(theme: ESettingsTheme) {
        window.localStorage.setItem('theme', theme);
    }
}
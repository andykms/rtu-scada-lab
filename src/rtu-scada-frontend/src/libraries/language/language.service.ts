import { computed, inject, Injectable } from "@angular/core";
import { SettingsService } from "../settings/settings.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { LANGUAGE_LABELS } from "./language.labels";
import { ESettingsLanguages } from "../settings/features/settings.languages";

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    readonly _settingsService = inject(SettingsService);

    readonly language = toSignal(this._settingsService.language$);

    readonly labels = computed(() => LANGUAGE_LABELS[this.language() as ESettingsLanguages]);
}
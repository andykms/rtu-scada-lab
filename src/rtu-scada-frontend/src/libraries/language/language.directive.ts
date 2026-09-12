import { Directive, inject } from "@angular/core";
import { LanguageService } from "./language.service";

@Directive()
export class LanguageProvider {
    readonly _languageService = inject(LanguageService);
    readonly labels = this._languageService.labels();
    readonly language = this._languageService.language();
}
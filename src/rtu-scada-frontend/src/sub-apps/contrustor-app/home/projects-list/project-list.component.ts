import { Component, ChangeDetectionStrategy, input } from "@angular/core";
import { IProjectFileInfo } from "../../../../../../electron/types/project/project-file/project-file-info.type";
import { PaperText } from "../../../../paper-ui/base/text/text.directive";
import { PaperCard } from "../../../../paper-ui/layout/card/card.directive";
import { DatePipe } from "@angular/common";
import { LanguageProvider } from "../../../../libraries/language/language.directive";
import { PaperIcon } from "../../../../paper-ui/icons/icon.component";

@Component({
  selector: "contructor-project-list",
  templateUrl: "./project-list.component.html",
  styleUrls: ["./project-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaperText, PaperCard, PaperIcon, DatePipe]
})
export class ProjectListComponent extends LanguageProvider {
    readonly projects = input<IProjectFileInfo[]>([]);
    readonly loadingProjects = input<boolean>(false);
}

import { ActiveElement } from "../../Models/ActiveElement";
import { Grid } from "../../Models/Grids";

export interface ProjectState {
    projectName: string;
    projectInstanceGuid: string;
    activeGridInstanceGuid: string | undefined;
    activeElement: ActiveElement | undefined;
    grids: Grid[];
}
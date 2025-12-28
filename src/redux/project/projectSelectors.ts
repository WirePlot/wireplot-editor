import { Grid } from "../../Models/Grids";
import { RootState } from "../../store";
import { ActiveElement } from "../../Models/ActiveElement";

export const selectActiveGridState = (state: RootState): Grid | undefined => returnActiveGrid(state);
export const selectActiveElement = (state: RootState): ActiveElement | undefined => state.projectSlice.activeElement;
export const selectProjectNameState = (state: RootState): string => state.projectSlice.projectName;


function returnActiveGrid(state: RootState): Grid | undefined {
    return state.projectSlice.grids.find(grid => grid.instanceGuid === state.projectSlice.activeGridInstanceGuid);
}

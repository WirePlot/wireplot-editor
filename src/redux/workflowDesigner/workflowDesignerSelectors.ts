import { RootState } from "../../store";

export const selectWorkflowDesignerPanelWidths = (state: RootState): number[] => state.workflowDesignerSlice.workflowDesignerPanelWidths;
export const selectDisplayNodeComments = (state: RootState): boolean => state.workflowDesignerSlice.displayNodeComments;
export const selectDisplayMiniMap = (state: RootState): boolean => state.workflowDesignerSlice.displayMiniMap;

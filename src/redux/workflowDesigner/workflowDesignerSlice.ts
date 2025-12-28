import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkflowDesignerState } from "./workflowDesignerTypes";



const initialState: WorkflowDesignerState = {
    workflowDesignerPanelWidths: [15, 60, 25],
    displayNodeComments: true,
    displayMiniMap: true
}


export const workflowDesignerSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        setWorkflowDesignerPanelWidths: (state, action: PayloadAction<number[]>) => {
            state.workflowDesignerPanelWidths = action.payload;
        },
        flipDisplayNodeCommentsStatus: (state) => {
            state.displayNodeComments = !state.displayNodeComments;
        },
        flipDisplayMiniMapStatus: (state) => {
            state.displayMiniMap = !state.displayMiniMap;
        }
    },
});






export default workflowDesignerSlice.reducer;

export const {
    setWorkflowDesignerPanelWidths,
    flipDisplayNodeCommentsStatus,
    flipDisplayMiniMapStatus
} = workflowDesignerSlice.actions;
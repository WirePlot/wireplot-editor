import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Grid } from "../../Models/Grids";
import { ActiveElement } from "../../Models/ActiveElement";
import { ProjectState } from "./projectTypes";
import { ReactFlowJsonObject } from "@xyflow/react";
import { Guid } from "../../Helpers/Guid";


const initialState: ProjectState = {
    projectName: "",
    projectInstanceGuid: Guid.generateGUID(),
    activeGridInstanceGuid: undefined,
    activeElement: undefined,
    grids: []
};


export const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        addGrid: (state, action: PayloadAction<Grid>) => {
            state.grids.push(action.payload);
        },
        setActiveGridInstanceGuid: (state, action: PayloadAction<string | undefined>) => {
            const foundGrid = state.grids.find((g) => g.methodRef === action.payload);
            if (foundGrid) {
                state.activeGridInstanceGuid = foundGrid?.instanceGuid;
            }
        },
        createNewGrid: (state, action: PayloadAction<Grid>) => {
            state.grids.push(action.payload);
        },
        updateGridMethodRef: (state, action: PayloadAction<{ oldMethodRef: string; newMethodRef: string }>) => {
            const { oldMethodRef, newMethodRef } = action.payload;
            state.grids = state.grids.map(grid => {
                // If this grid uses the old methodRef → update it
                if (grid.methodRef === oldMethodRef) {
                    return {
                        ...grid,
                        methodRef: newMethodRef,
                    };
                }
                // Otherwise unchanged
                return grid;
            });
        },
        removeGridByInstanceGuid: (state, action: PayloadAction<string>) => {
            state.grids = state.grids.filter(grid => grid.instanceGuid !== action.payload);
        },
        saveCurrentGridAndActivateNewGridByInstanceGuid: (state, action: PayloadAction<{ newGridMethodRef: string, reactFlowJsonObject: ReactFlowJsonObject }>) => {
            state.grids = state.grids.map((grid) => {
                console.log("grid", grid.methodRef);

                if (grid.instanceGuid === state.activeGridInstanceGuid) {
                    return { ...grid, reactFlowJsonObject: action.payload.reactFlowJsonObject };
                } else {
                    return grid;
                }
            })

            console.log("newGridMethodRef", action.payload.newGridMethodRef);

            const foundGrid = state.grids.find((g) => g.methodRef === action.payload.newGridMethodRef);
            if (foundGrid) {
                console.log("saveCurrentGridAndActivateNewGridByInstanceGuid");
                state.activeGridInstanceGuid = foundGrid?.instanceGuid;
            }
            else {
                console.log("DID NOT saveCurrentGridAndActivateNewGridByInstanceGuid");

            }
        },
        saveCurrentGrid: (state, action: PayloadAction<{ reactFlowJsonObject: ReactFlowJsonObject }>) => {
            state.grids = state.grids.map((grid) => {
                if (grid.instanceGuid === state.activeGridInstanceGuid) {
                    return { ...grid, reactFlowJsonObject: action.payload.reactFlowJsonObject };
                } else {
                    return grid;
                }
            })
        },
        /**
        * @deprecated
        * HOT FIX HOTFIX TO DO TODO
        */
        setActiveElement: (state, action: PayloadAction<ActiveElement | undefined>) => {
            state.activeElement = action.payload;
        },
        setProjectName: (state, action: PayloadAction<string>) => {
            state.projectName = action.payload;
        }
    },
});

export const {
    addGrid,
    setActiveGridInstanceGuid,
    createNewGrid,
    updateGridMethodRef,
    removeGridByInstanceGuid,
    saveCurrentGridAndActivateNewGridByInstanceGuid,
    saveCurrentGrid,
    setActiveElement,
    setProjectName
} = projectSlice.actions;

export default projectSlice.reducer;
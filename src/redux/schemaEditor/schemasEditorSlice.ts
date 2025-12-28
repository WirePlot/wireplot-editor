import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SchemaEditorState } from "./schemaEditorTypes";


const initialState: SchemaEditorState = {
    panelWidths: [15, 15, 70],
    activeElementInstanceGuid: undefined,
    selectedSchemaNamespace: undefined,
    selectedSchema: undefined,
    isSchemaImporterOpen: false
}

export const schemaEditorSlice = createSlice({
    name: "schemaEditor",
    initialState,
    reducers: {
        setPanelWidths: (state, action: PayloadAction<number[]>) => {
            state.panelWidths = action.payload;
        },
        setActiveElement: (state, action: PayloadAction<string | undefined>) => {
            state.activeElementInstanceGuid = action.payload;
        },
        setSelectedSchemaNamespace: (state, action: PayloadAction<string | undefined>) => {
            state.selectedSchemaNamespace = action.payload;
        },
        setSelectedSchema: (state, action: PayloadAction<string | undefined>) => {
            state.selectedSchema = action.payload;
        },
        setSchemaImporterOpen: (state, action: PayloadAction<boolean >) => {
            state.isSchemaImporterOpen = action.payload;
        }
    },
});



export default schemaEditorSlice.reducer;

export const {
    setActiveElement,
    setPanelWidths,
    setSelectedSchemaNamespace,
    setSelectedSchema,
    setSchemaImporterOpen
} = schemaEditorSlice.actions;

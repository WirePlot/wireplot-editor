import { RootState } from "../../store";

export const selectActiveElement = (state: RootState) : string | undefined => state.schemaEditorSlice.activeElementInstanceGuid;
export const selectSelectedSchema = (state: RootState) : string | undefined => state.schemaEditorSlice.selectedSchema;
export const selectSelectedSchemaNamespace = (state: RootState) : string | undefined => state.schemaEditorSlice.selectedSchemaNamespace;
export const selectPanelWidths = (state: RootState) : number[] => state.schemaEditorSlice.panelWidths;
export const selectSchemaImporterOpen = (state: RootState) : boolean => state.schemaEditorSlice.isSchemaImporterOpen;

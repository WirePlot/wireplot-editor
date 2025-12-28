export interface SchemaEditorState {
    panelWidths: number[];
    activeElementInstanceGuid: string | undefined;
    selectedSchemaNamespace: string | undefined;
    selectedSchema: string | undefined;
    isSchemaImporterOpen: boolean;
}


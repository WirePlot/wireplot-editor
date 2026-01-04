import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SchemasSliceState, WirePlotDocument, WirePlotMethodOverload, WirePlotPropertyObject, WirePlotSchemaObject } from "./schemasTypes";
import { fetchSchemaFromFile, fetchSchemaFromString } from "./schemasThunks";
import { SchemaUtils } from "./schemasUtils";


const initialState: SchemasSliceState = {
    schemas: {},
}

export const schemasSlice = createSlice({
    name: "schemas",
    initialState,
    reducers: {
        addSchemaProperty: (state, action: PayloadAction<{ namespace: string; schemaName: string, propertyName: string }>) => {
            const { namespace, schemaName, propertyName } = action.payload;
            const parsed = state.schemas[namespace]?.parsed;

            if (parsed) {
                SchemaUtils.addSchemaProperty(parsed, schemaName, propertyName, SchemaUtils.createStringProperty(propertyName));
            }
        },
        createSchema: (state, action: PayloadAction<{ namespace: string; schemaName: string }>) => {
            const { namespace, schemaName } = action.payload;
            const parsed = state.schemas[namespace]?.parsed;

            if (parsed) {
                SchemaUtils.createSchema(parsed, schemaName);
            }
        },
        createNamespace: (state, action: PayloadAction<{ namespace: string }>) => {
            const { namespace } = action.payload;

            // Prevent overwriting existing namespace (optional)
            if (state.schemas[namespace]) {
                return;
            }

            state.schemas[namespace] = {
                name: namespace,
                flowCapable: false,
                editable: true,
                parsed: {
                    openapi: '3.0.0',
                    info: {
                        title: `${namespace} API`,
                        version: '1.0.0',
                    },
                    paths: {},
                    components: {
                        schemas: {}
                    }
                }
            }
        },
        updateSchema: (state, action: PayloadAction<{ namespace: string; schemaName: string; newSchema: WirePlotSchemaObject; }>) => {
            const { namespace, schemaName, newSchema } = action.payload;

            const parsed = state.schemas[namespace].parsed;
            if (!parsed) {
                return;
            }
            const schemas = parsed.components?.schemas;
            if (!schemas) {
                return;
            }
            if (!schemas[schemaName]) {
                return;
            }

            // Assign new schema
            schemas[schemaName] = newSchema;
        },
        updateSchemaMethodOverload: (state, action: PayloadAction<{ ref: string; newOverload: WirePlotMethodOverload; }>) => {
            const { ref, newOverload } = action.payload;

            const parsed = SchemaUtils.parseRef(ref);
            if (parsed.kind !== "methodOverload") {
                return;
            }

            const { namespace, schemaName, methodName, overloadId } = parsed;

            const container = state.schemas[namespace];
            if (!container?.parsed) {
                return;
            }

            const schema = container.parsed.components?.schemas?.[schemaName];
            if (!schema) {
                return;
            }

            const method = schema.methods[methodName];
            if (!method || !method.overloads) return;

            const overload = method.overloads?.[overloadId];
            if (!overload) {
                return;
            }

            method.overloads[overloadId] = newOverload;
        },
        createSchemaMethod: (state, action: PayloadAction<{ namespace: string; schemaName: string; methodName: string; }>) => {
            const { namespace, schemaName, methodName } = action.payload;
            console.log(state);
            console.log(namespace);
            console.log(schemaName);
            console.log(methodName);
            // TODO HOT FIX TO DO
            // const container = state.schemas[namespace];
            // if (!container?.parsed) {
            //     return;
            // }

            // const schema = container.parsed.components?.schemas?.[schemaName];
            // if (!schema) {
            //     return;
            // }

            // // Ensure methods exists
            // if (!schema["methods"]) {
            //     schema["methods"] = [];
            // }

            // const methods = schema["methods"];

            // // Prevent duplicates
            // if (methods.some(m => m.name === methodName)) {
            //     console.warn(`Method "${methodName}" already exists in schema "${schemaName}".`);
            //     return;
            // }

            // // Build default WirePlotMethod
            // const newMethod: WirePlotMethod = {
            //     name: methodName,
            //     methodKind: "instance",
            //     description: "",
            //     owner: { $ref: `Project#/components/schemas/${schemaName}` },
            //     parameters: [],
            //     return: undefined
            // };

            // methods.push(newMethod);
        },
        updateSchemaProperty: (state, action: PayloadAction<{ namespace: string; schemaName: string; propertyName: string; updatedProperty: WirePlotPropertyObject; }>) => {
            const { namespace, schemaName, propertyName, updatedProperty } = action.payload;

            const parsed = state.schemas[namespace]?.parsed;
            if (!parsed?.components?.schemas?.[schemaName]) {
                return;
            }

            const schema = parsed.components.schemas[schemaName];

            if (!schema.properties) {
                return;
            }
            if (!schema.properties[propertyName]) {
                return;
            }

            // FULL IMMUTABLE UPDATE
            parsed.components = {
                ...parsed.components,
                schemas: {
                    ...parsed.components.schemas,
                    [schemaName]: {
                        ...schema,
                        properties: {
                            ...schema.properties,
                            [propertyName]: updatedProperty
                        }
                    }
                }
            };
        },
        deleteSchema: (state, action: PayloadAction<{ namespace: string; schemaName: string }>) => {
            const { namespace, schemaName } = action.payload;
            const parsed = state.schemas[namespace]?.parsed;

            if (parsed) {
                SchemaUtils.deleteSchema(parsed, schemaName);
            }
        },
        deleteNamespace: (state, action: PayloadAction<{ namespace: string; }>) => {
            const { namespace } = action.payload;
            delete state.schemas[namespace];
        },
        deleteSchemaProperty: (state, action: PayloadAction<{ namespace: string; schemaName: string; propertyName: string }>) => {
            const { namespace, schemaName, propertyName } = action.payload;
            const parsed = state.schemas[namespace]?.parsed;

            if (parsed) {
                SchemaUtils.deleteSchemaProperty(parsed, schemaName, propertyName);
            }
        },
        renameNamespace: (state, action: PayloadAction<{ oldName: string, newName: string }>) => {
            const { oldName, newName } = action.payload;

            if (!state.schemas[oldName] || state.schemas[newName]) {
                return;
            }

            const updatedSchemas: typeof state.schemas = {};

            for (const key of Object.keys(state.schemas)) {
                if (key === oldName) {
                    updatedSchemas[newName] = {
                        ...state.schemas[oldName],
                        name: newName,
                    };
                } else {
                    updatedSchemas[key] = state.schemas[key];
                }
            }

            state.schemas = updatedSchemas;
        },
        renameSchema: (state, action: PayloadAction<{ namespace: string; oldName: string, newName: string }>) => {
            const { namespace, oldName, newName } = action.payload;
            const parsed = state.schemas[namespace]?.parsed;

            if (parsed) {
                SchemaUtils.renameSchema(parsed, oldName, newName);
            }
        },
        renameSchemaProperty: (state, action: PayloadAction<{ namespace: string; schemaName: string; oldName: string, newName: string }>) => {
            const { namespace, schemaName, oldName, newName } = action.payload;
            const parsed = state.schemas[namespace]?.parsed;
            if (parsed) {
                SchemaUtils.renameSchemaProperty(parsed, schemaName, oldName, newName);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(
                fetchSchemaFromFile.fulfilled, (state, action: PayloadAction<{ source: string; isFlowCapable: boolean; isEditable: boolean, schema: WirePlotDocument }>) => {
                    state.schemas[action.payload.source] = {
                        name: action.payload.source,
                        editable: action.payload.isEditable,
                        flowCapable: action.payload.isFlowCapable,
                        parsed: action.payload.schema,
                    };
                }
            )
            .addCase(
                fetchSchemaFromString.fulfilled, (state, action: PayloadAction<{ source: string; isFlowCapable: boolean; isEditable: boolean; schema: WirePlotDocument }>) => {
                    state.schemas[action.payload.source] = {
                        name: action.payload.source,
                        editable: action.payload.isEditable,
                        flowCapable: action.payload.isFlowCapable,
                        parsed: action.payload.schema,
                    };
                }
            );

    },
});

export default schemasSlice.reducer;
export const {
    createNamespace,
    createSchema,
    createSchemaMethod,
    addSchemaProperty,
    updateSchema,
    updateSchemaMethodOverload,
    updateSchemaProperty,
    deleteNamespace,
    deleteSchema,
    deleteSchemaProperty,
    renameNamespace,
    renameSchema,
    renameSchemaProperty,
} = schemasSlice.actions;
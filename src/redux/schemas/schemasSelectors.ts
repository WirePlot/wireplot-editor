import { createSelector } from "reselect";
import { RootState } from "../../store";
import { HttpMethod, NamespaceMetadata, OpenApiPathItemObject, SchemaContainer, WirePlotDocument, WirePlotPropertyObject, WirePlotSchemaObject } from "./schemasTypes";
import { EntityApiMethodMetadata, EntityPair } from "../../Components/EntityPanel/types";
import { TreeEntity } from "../../Components/EntityTreePanel/types";
import { SelectWithCategoriesOption, SelectWithCategoriesOptionGroup } from "../../FisUI/SelectWithCategories";
import { IconHelper } from "../../Helpers/IconHelper";
import { ENodeOperationType } from "../../Nodes/types";
import { SchemaUtils } from "./schemasUtils";

export const selectSchemas = (state: RootState): Record<string, SchemaContainer> => state.schemasSlice.schemas;

const getNamespace = (_: RootState, namespace: string | undefined): string | undefined => namespace;

// Selector to get all namespaces
export const selectNamespaceEntityPairs = createSelector(
    [selectSchemas],
    (schemas): EntityPair[] => {

        return Object
            .keys(schemas)
            .sort((a, b) => a.localeCompare(b))
            .map((name) => ({
                name,
                description: undefined,
                $ref: name,
                type: name,
                operationType: ENodeOperationType.NONE
            }));
    }
);

export const selectNamespaceMetadata = (state: RootState, namespace: string | undefined): NamespaceMetadata | undefined => {
    if (!namespace) {
        return undefined;
    }

    const container = state.schemasSlice.schemas[namespace];
    if (!container) {
        return undefined;
    }

    const { name, editable, flowCapable } = container;

    return {
        name,
        editable,
        flowCapable,
    };
};


// Selector to get all schema names for a specific namespace
export const selectSchemaEntityPairsForNamespace = createSelector(
    [selectSchemas, getNamespace],
    (schemas, namespace): EntityPair[] => {
        if (!namespace) {
            return [];
        }

        const parsed = schemas[namespace]?.parsed;
        const schemaNames = Object.keys(parsed?.components?.schemas || {}).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

        return schemaNames.map((name) => {
            const schema = parsed?.components?.schemas?.[name] as WirePlotSchemaObject | undefined;

            return {
                name,
                $ref: `${namespace}#/components/schemas/${name}`,
                type: name,
                description: schema?.description,
                operationType: ENodeOperationType.NONE
            };
        });

    }
);


/**
 * Returns a BaseSchemaObject for a given property.
 * Never returns undefined — returns an empty object if not found.
 */
export const selectSchemaPropertyObject = createSelector(
    [
        (state: RootState) => state.schemasSlice.schemas,
        (_state: RootState, namespace: string) => namespace,
        (_state: RootState, _namespace: string, schemaName: string) => schemaName,
        (_state: RootState, _namespace: string, _schemaName: string, propertyName: string) => propertyName
    ],
    (schemas, namespace, schemaName, propertyName): WirePlotPropertyObject | null => {
        const ns = schemas[namespace];
        if (!ns?.parsed?.components?.schemas) {
            console.warn(`Namespace not found: ${namespace}`);
            return null;
        }

        const schema = ns.parsed.components.schemas[schemaName];
        if (!schema || "type" in schema === false || !schema.properties) {
            console.warn(`Schema not found or has no properties: ${namespace} → ${schemaName}`);
            return null;
        }

        const prop = schema.properties[propertyName];
        if (!prop) {
            console.warn(`Property not found: ${propertyName}`);
            return null;
        }

        // Inline schema → directly return the SchemaObject
        return prop;
    }
);

export const selectSchemaPropertiesAsEntityPairs = createSelector(
    [
        (state: RootState) => state.schemasSlice.schemas,
        (_state: RootState, namespace: string) => namespace,
        (_state: RootState, _namespace: string, schemaName: string) => schemaName
    ],
    (schemas, namespace, schemaName): EntityPair[] => {
        const ns = schemas[namespace];
        if (!ns || !ns.parsed?.components?.schemas) {
            console.warn(`Namespace not found: ${namespace}`);
            return [];
        }

        const schema = ns.parsed.components.schemas[schemaName] as WirePlotSchemaObject | undefined;
        if (!schema) {
            console.warn(`Schema not found: ${namespace} → ${schemaName}`);
            return [];
        }

        if (!schema.properties) {
            return [];
        }

        return Object.entries(schema.properties).map(([propName, prop]) => {
            let typeStr: string = "unknown";

            if (prop.$ref) {
                const typeFromRef: string | undefined = SchemaUtils.getSchemaNameFromRef(prop.$ref as string);
                if (typeFromRef) {
                    typeStr = typeFromRef;
                }
            } else if (prop.type) {
                typeStr = prop.type;
            }

            return {
                name: propName,
                $ref: `${namespace}#/components/schemas/${schemaName}/properties/${propName}`,
                type: typeStr,
                description: undefined,
                operationType: ENodeOperationType.VARIABLE
            };
        });
    }
);

export function selectMethodRef(state: RootState, namespace: string, schemaName: string, methodName: string): string | undefined {
    const container = state.schemasSlice.schemas[namespace];
    if (!container?.parsed) {
        return undefined;
    }

    const schema = container.parsed.components?.schemas?.[schemaName];
    if (!schema) {
        return undefined;
    }

    // TODO TO DO HOT FIX
    // const methods = schema["methods"] ?? [];
    const exists = undefined;// methods.some(m => m.name === methodName);
    if (!exists) {
        return undefined;
    }

    return `${namespace}#/components/schemas/${schemaName}/methods/${methodName}`;
}


export const makeSelectSchemaMethodsAsEntityPairs = (namespace: string, schemaKey: string) =>
    createSelector(
        [selectSchemas],
        (schemas): EntityPair[] => {
            const container = schemas[namespace];
            if (!container?.flowCapable || !container.parsed) {
                return [];
            }

            const wSchema = container.parsed.components.schemas[schemaKey];
            if (!wSchema) {
                return [];
            }


            const result: EntityPair[] = [];

            Object.entries(wSchema.methods).forEach(([methodName, method]) => {
                if (!method.overloads) {
                    return;
                }

                Object.entries(method.overloads).forEach(([overloadId, overload]) => {
                    result.push({
                        name: methodName,
                        $ref: `${namespace}#/components/schemas/${schemaKey}/methods/${methodName}/overloads/${overloadId}`,
                        type: overload.methodKind ?? "instance",
                        description: overload.description,
                        operationType: ENodeOperationType.GRID
                    });
                });
            });

            return result;
        }
    );




export const makeSelectMethodNamesByRef = (methodRef: string) =>
    createSelector(
        [selectSchemas],
        (schemas): string[] => {
            const parsed = SchemaUtils.parseRef(methodRef);
            if (parsed.kind !== "method") {
                return [];
            }

            const { namespace, schemaName } = parsed;

            const container = schemas[namespace];
            if (!container?.parsed) {
                return [];
            }

            const methods = container.parsed.components?.schemas?.[schemaName]?.methods;

            if (!methods) {
                return [];
            }

            return Object.keys(methods);
        }
    );

export const makeSelectMethodByRef = (ref: string) =>
    createSelector(
        [(state: RootState) => state.schemasSlice.schemas],
        (schemas) => {
            const parsed = SchemaUtils.parseRef(ref);
            if (parsed.kind !== "methodOverload") {
                return undefined;
            }

            const ns = schemas[parsed.namespace];
            const schemaObj = ns?.parsed?.components?.schemas?.[parsed.schemaName];
            if (!schemaObj) {
                return undefined;
            }

            const method = schemaObj.methods[parsed.methodName];
            if (!method) {
                return undefined;
            }

            // We now require overloadId always
            const overload = method.overloads?.[parsed.overloadId];
            if (!overload) {
                return undefined;
            }

            return overload;
        }
    );



export const selectNamespacesTree = createSelector(
    [selectSchemas],
    (allNamespaces): TreeEntity[] => {
        const result: TreeEntity[] = [];

        for (const namespaceKey in allNamespaces) {
            const namespace = allNamespaces[namespaceKey];
            if (!namespace?.parsed?.components?.schemas) {
                continue;
            }

            const schemaObjects = namespace.parsed.components.schemas as Record<string, WirePlotSchemaObject>;

            const namespaceNode: TreeEntity = {
                instanceGuid: `namespace_${namespaceKey}`,
                name: namespaceKey,
                type: "namespace",
                isDraggable: false,
                children: [],
            };

            for (const schemaName in schemaObjects) {
                const schemaNode: TreeEntity = {
                    instanceGuid: `schema_${namespaceKey}_${schemaName}`,
                    name: schemaName,
                    type: "schema",
                    isDraggable: true,
                    metadata: {
                        namespace: namespaceKey,
                        flowCapable: namespace.flowCapable,
                    },
                };

                namespaceNode.children!.push(schemaNode);
            }

            if (namespaceNode.children!.length > 0) {
                result.push(namespaceNode);
            }
        }

        return result;
    }
);

export const selectSchemasTree = createSelector(
    [selectSchemas],
    (allNamespaces): TreeEntity[] => {
        const result: TreeEntity[] = [];
        console.log(allNamespaces);

        for (const namespaceKey in allNamespaces) {
            const document = allNamespaces[namespaceKey]?.parsed as WirePlotDocument | undefined;
            if (!document?.paths) {
                continue;
            }

            const namespaceNode: TreeEntity = {
                instanceGuid: `namespace_${namespaceKey}`,
                name: namespaceKey,
                isDraggable: false,
                type: "namespace",
                children: [],
            };

            const tagMap: Record<string, TreeEntity> = {}; // tag -> tagNode
            const methods: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

            for (const pathKey in document.paths) {
                const pathItem: OpenApiPathItemObject | undefined = document.paths[pathKey];
                if (!pathItem) {
                    continue;
                }

                for (const method of methods) {
                    const operation = pathItem[method];
                    if (!operation) {
                        continue;
                    }

                    const tags = operation.tags ?? ['(untagged)'];
                    for (const tag of tags) {
                        if (!tagMap[tag]) {
                            tagMap[tag] = {
                                instanceGuid: `tag_${namespaceKey}_${tag}`,
                                name: tag,
                                isDraggable: false,
                                type: 'tag',
                                children: [],
                            };
                        }

                        const methodUpperCase = method.toUpperCase();
                        const methodNode: TreeEntity = {
                            instanceGuid: `${namespaceKey}_${pathKey}_${method}`,
                            name: operation.summary ?? operation.operationId ?? methodUpperCase,
                            isDraggable: true,
                            type: 'method',
                            metadata: {
                                method: methodUpperCase,
                                namespace: namespaceKey,
                                path: pathKey
                            } as EntityApiMethodMetadata,
                        };

                        tagMap[tag].children!.push(methodNode);
                    }
                }
            }

            const tagNodes = Object.values(tagMap).filter((tag) => tag.children && tag.children.length > 0);
            namespaceNode.children!.push(...tagNodes);

            if (namespaceNode.children!.length > 0) {
                result.push(namespaceNode);
            }
        }

        return result;
    }
);

export const selectIsNamespaceEditable = (state: RootState, namespace?: string): boolean | undefined => {
    if (!namespace) {
        return undefined;
    }
    return state.schemasSlice.schemas[namespace].editable;
};


export const selectSchemasByNamespace = (state: RootState, namespace: string | undefined): Record<string, WirePlotSchemaObject> | undefined => {
    if (!namespace) {
        return undefined;
    }
    return state.schemasSlice.schemas[namespace].parsed?.components?.schemas;
};

export const selectSchema = (state: RootState, namespace: string | undefined, schemaName: string | undefined): WirePlotSchemaObject | undefined => {
    if (!namespace || !schemaName) {
        return undefined;
    }

    const schemas = state.schemasSlice.schemas[namespace]?.parsed?.components?.schemas;
    if (!schemas || typeof schemas !== "object") {
        return undefined;
    }

    const schema = schemas[schemaName];

    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
        return undefined;
    }

    return schema;
};

export const selectSchemaNamesGroupedByNamespace = createSelector([selectSchemas], (schemas): Record<string, string[]> => {
    const result: Record<string, string[]> = {};

    for (const namespace in schemas) {
        if (Object.prototype.hasOwnProperty.call(schemas, namespace)) {
            result[namespace] = Object.keys(schemas[namespace]);
        }
    }

    return result;
});


export const selectSchemaDataTypeGroups = createSelector([(state: RootState): Record<string, SchemaContainer> => state.schemasSlice.schemas], (schemasByNamespace): SelectWithCategoriesOptionGroup[] => {
    const groups: SelectWithCategoriesOptionGroup[] = [];

    for (const namespace in schemasByNamespace) {
        if (!Object.prototype.hasOwnProperty.call(schemasByNamespace, namespace)) {
            continue;
        }

        const schemas = schemasByNamespace[namespace];
        const schemaEntries = schemas.parsed?.components?.schemas;
        if (!schemaEntries) {
            continue;
        }

        const options: SelectWithCategoriesOption[] = [];

        for (const schemaName in schemaEntries) {
            if (!Object.prototype.hasOwnProperty.call(schemaEntries, schemaName)) {
                continue;
            }

            // Skip if it's the currently selected schema in the same namespace
            // if (namespace === selectedNamespace && schemaName === selectedSchema) continue;

            options.push({
                key: `${namespace}.${schemaName}`,
                value: schemaName,
                label: schemaName,
                category: namespace,
                icon: IconHelper.getSchemaIcon(schemaName),
                onClick: undefined,
            });
        }

        if (options.length > 0) {
            groups.push({ label: namespace, options });
        }
    }

    return groups;
}
);
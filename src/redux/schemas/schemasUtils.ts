import { OpenApiOperationObject, OpenApiPathItemObject, OpenApiResponseObject, ParsedRef, SchemaContainer, WirePlotDocument, WirePlotMethodOverload, WirePlotPropertyObject, WirePlotSchemaObject } from "./schemasTypes";
import { IntelliSenseNode } from "../../FisUI/IntelliSensePicker";
import { EntityPair } from "../../Components/EntityPanel/types";
import { ENodeOperationType } from "../../Nodes/types";
import { NameHelper } from "../../Helpers/NameHelper";

export class SchemaUtils {
    static createEmptySchema(type: string): WirePlotSchemaObject {
        // TODO Add correct assembly and namespace
        // HOT FIX Add correct assembly and namespace
        // TO DO Add correct assembly and namespace
        return {
            title: NameHelper.toHumanTitle(type),
            assembly: "",
            namespace: "",
            description: "",
            type: type,
            kind: "class",
            properties: {},
            methods: {}
        };
    }

    static createStringProperty(title: string): WirePlotPropertyObject {
        return {
            $ref: "System#/components/schemas/String",
            type: "String",
            kind: 'primitive',
            containerType: "None",
            title: NameHelper.toHumanTitle(title),
            description: "",
            nullable: false,
            readOnly: false
        };
    }

    /**
     * Renames the methodName part inside a methodRef string.
     * If the reference is invalid, the original methodRef is returned unchanged.
     */
    static renameMethodInRef(methodRef: string, newName: string): string {
        const parsed = SchemaUtils.parseRef(methodRef);

        if (parsed.kind !== "method") {
            return methodRef;
        }
        return `${parsed.namespace}#/components/schemas/${parsed.schemaName}/methods/${newName}`;
    }

    /**
     * Central reference parser for WirePlot entities.
     *
     * Parses a ref string and resolves what kind of entity it represents
     * (namespace, schema, schema property, method, method overload, path, etc.).
     *
     * This function is the single source of truth for ref decoding.
     * No other part of the codebase should manually parse ref strings
     * (e.g. via split(), regex, or helper-specific parsers).
     *
     * The returned ParsedRef explicitly describes the entity type and
     * provides all identifiers needed by inspectors, editors, and CRUD logic.
     *
     * When adding a new ref type, extend this function and the ParsedRef union
     * instead of introducing a new parser.
     */
    static parseRef(ref: string): ParsedRef {
        if (!ref || typeof ref !== "string") {
            return { kind: "unknown" };
        }

        // ─────────────────────────────────────────────
        // Method overload
        // ns#/components/schemas/S/methods/M/overloads/O
        // ─────────────────────────────────────────────
        const overloadMatch = ref.match(
            /^([^#]+)#\/components\/schemas\/([^/]+)\/methods\/([^/]+)\/overloads\/([^/]+)$/
        );
        if (overloadMatch) {
            const [, namespace, schemaName, methodName, overloadId] = overloadMatch;
            return { kind: "methodOverload", namespace, schemaName, methodName, overloadId };
        }

        // ─────────────────────────────────────────────
        // method
        // ns#/components/schemas/S/methods/M
        // ─────────────────────────────────────────────
        const methodMatch = ref.match(
            /^([^#]+)#\/components\/schemas\/([^/]+)\/methods\/([^/]+)$/
        );
        if (methodMatch) {
            const [, namespace, schemaName, methodName] = methodMatch;
            return { kind: "method", namespace, schemaName, methodName };
        }

        // ─────────────────────────────────────────────
        // Schema property
        // ns#/components/schemas/S/properties/P
        // ─────────────────────────────────────────────
        const propMatch = ref.match(
            /^([^#]+)#\/components\/schemas\/([^/]+)\/properties\/([^/]+)$/
        );
        if (propMatch) {
            const [, namespace, schemaName, propertyName] = propMatch;
            return { kind: "schemaProperty", namespace, schemaName, propertyName };
        }

        // ─────────────────────────────────────────────
        // Schema
        // ns#/components/schemas/S
        // ─────────────────────────────────────────────
        const schemaMatch = ref.match(
            /^([^#]+)#\/components\/schemas\/([^/]+)$/
        );
        if (schemaMatch) {
            const [, namespace, schemaName] = schemaMatch;
            return { kind: "schema", namespace, schemaName };
        }

        // ─────────────────────────────────────────────
        // Path
        // ns#/paths/...
        // ─────────────────────────────────────────────
        const pathMatch = ref.match(
            /^([^#]+)#\/paths\/(.+)$/
        );
        if (pathMatch) {
            const [, namespace, rest] = pathMatch;

            const parts = rest.split("/");
            const last = parts[parts.length - 1];
            const httpMethods = ["get", "post", "put", "delete", "patch", "options", "head"];

            if (httpMethods.includes(last.toLowerCase())) {
                return {
                    kind: "path",
                    namespace,
                    path: parts.slice(0, -1).join("/"),
                    method: last.toLowerCase(),
                };
            }

            return { kind: "path", namespace, path: rest };
        }

        // ─────────────────────────────────────────────
        // Namespace (UI-level)
        // ─────────────────────────────────────────────
        if (!ref.includes("#")) {
            return { kind: "namespace", namespace: ref };
        }

        return { kind: "unknown" };
    }


    /**
     * Builds IntelliSense nodes for a dropped variable.
     * Used when user drags a project variable into the canvas.
     * Returns a tree-like structure compatible with IntelliSenseTree.
     */
    static buildVariableIntelliSense(entity: EntityPair): IntelliSenseNode[] {
        if (!entity || !entity.name) {
            return [];
        }

        // Define reusable variable parameter type
        // TO DO HOT FIX
        // const valueParam: WirePlotMethodParameter = {
        //     name: "value",
        //     $ref: entity.type,
        //     required: false,
        // };

        // Build the IntelliSense tree
        const nodes: IntelliSenseNode[] = [
            {
                id: `variable-actions-${entity.name}`,
                label: "Variable Actions",
                type: "folder",
                children: [
                    {
                        id: `get-${entity.name}`,
                        label: `Get ${entity.name}`,
                        type: "item",
                        tooltip: `Reads the value of ${entity.name}`,
                        metadata: {
                            returnType: entity.type ?? "unknown",
                            // TO DO HOT FIX
                            methodKind: "instance",
                            nodeOperationType: ENodeOperationType.GET_VARIABLE,
                        },
                    },
                    {
                        id: `set-${entity.name}`,
                        label: `Set ${entity.name}`,
                        type: "item",
                        tooltip: `Writes a new value to ${entity.name}`,
                        metadata: {
                            returnType: "void",
                            // TO DO HOT FIX
                            // parameters: [valueParam],
                            methodKind: "instance",
                            nodeOperationType: ENodeOperationType.SET_VARIABLE,
                        },
                    },
                ],
            },
        ];

        return nodes;
    }

    static buildSchemaIntelliSenseTree(schemaDef: WirePlotSchemaObject): IntelliSenseNode[] {
        const properties = this.buildPropertyTreeFromSchema(schemaDef);
        const methods = this.buildXMethodTreeFromSchema(schemaDef);
        return [...properties, ...methods];
    }


    /**
     * Builds IntelliSense tree nodes from schema properties.
     * Each property generates a "get" and "set" entry.
     */
    static buildPropertyTreeFromSchema(schemaDef: WirePlotSchemaObject | undefined): IntelliSenseNode[] {
        if (!schemaDef || !schemaDef.properties) {
            return [];
        }

        const propertyNodes: IntelliSenseNode[] = [];

        for (const [propName, propValue] of Object.entries(schemaDef.properties)) {
            const prop = propValue as WirePlotPropertyObject;
            console.log(JSON.stringify(prop));
            const refType = (prop as any).$ref?.split("/").pop() ?? (prop.type ? prop.type.toString() : "unknown");

            const getNode: IntelliSenseNode = {
                id: `get-${propName}`,
                label: `Get ${propName}`,
                type: "item",
                tooltip: `Reads the value of ${propName}`,
                metadata: {
                    // TO DO HOT FIX
                    // parameters: [],
                    returnType: refType,
                    methodKind: "instance",
                    nodeOperationType: ENodeOperationType.GET_PROPERTY,
                },
            };


            const setNode: IntelliSenseNode = {
                id: `set-${propName}`,
                label: `Set ${propName}`,
                type: "item",
                tooltip: `Writes a new value to ${propName}`,
                metadata: {
                    returnType: "void",
                    // TO DO HOT FIX
                    // inputParameters: overload.signature.parameters,
                    // outputParameters: overload.signature.return,
                    // parameters: [
                    //     {
                    //         name: "value",
                    //         $ref: refType,
                    //         required: false,
                    //     },
                    // ],
                    methodKind: "instance",
                    nodeOperationType: ENodeOperationType.PROPERTY_FUNCTION,
                },
            };

            propertyNodes.push(getNode, setNode);
        }

        if (propertyNodes.length === 0) {
            return [];
        }

        return [
            {
                id: "properties-root",
                label: "Properties",
                type: "folder",
                children: propertyNodes,
            },
        ];
    }



    /**
     * Builds IntelliSense tree from schema extensions ("methods").
     * Each return type becomes a folder, containing method items.
     */
    static buildXMethodTreeFromSchema(schemaDef: WirePlotSchemaObject, options: { allowStatic?: boolean } = {}): IntelliSenseNode[] {

        const { allowStatic = false } = options;

        if (!schemaDef.methods) {
            return [];
        }

        const simplifyType = (ref: string): string => {
            return ref.split("/").pop() ?? "?";
        };

        const groupsMap: Record<string, IntelliSenseNode[]> = {};

        for (const [methodName, method] of Object.entries(schemaDef.methods)) {

            const overloads: WirePlotMethodOverload[] = Object.values(method.overloads);

            if (!allowStatic) {
                const isStaticOnly = overloads.every(o => o.methodKind === "static");
                if (isStaticOnly) {
                    continue;
                }
            }

            for (const overload of overloads) {

                if (!allowStatic && overload.methodKind === "static") {
                    continue;
                }

                const returnParams = overload.signature.return;

                // TODO
                // TO DO
                // HOT FIX
                // When function return just string, it should be string.
                // But if it is returning complex object, it should be object 
                // BUT HERE IS array of objects, we need to find to what schema those objects belong
                const returnType = returnParams.length > 0 ? simplifyType(returnParams[0].$ref) : "void";

                if (!groupsMap[returnType]) {
                    groupsMap[returnType] = [];
                }

                const node: IntelliSenseNode = {
                    id: `${methodName}:${overload.overloadId}`,
                    label: overload.name,
                    type: "item",
                    tooltip: overload.description,
                    metadata: {
                        returnType: returnType,
                        methodKind: overload.methodKind,
                        inputParameters: overload.signature.parameters,
                        outputParameters: overload.signature.return,
                        nodeOperationType: ENodeOperationType.PROPERTY_FUNCTION,
                    },
                };


                groupsMap[returnType].push(node);
            }
        }

        const returnFolders: IntelliSenseNode[] =
            Object.entries(groupsMap).map(([returnType, items]) => ({
                id: `return:${returnType}`,
                label: returnType,
                type: "folder",
                children: items,
            }));

        return [{
            id: "functions-root",
            label: "Functions",
            type: "folder",
            children: returnFolders,
        }];
    }


    static normalizeOpenApiSchemaWithRefs(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map((item) => this.normalizeOpenApiSchemaWithRefs(item));
        }

        if (obj && typeof obj === "object") {

            // If contain ref, get out
            if (obj.$ref) {
                return obj;
            }

            // Swap only primitives
            if (obj.type && typeof obj.type === "string") {
                const fakeKey = "UnknownKey";
                const typeName = SchemaUtils.getSchemaTypeFromProperty(fakeKey, obj);

                const primitiveRefs = [
                    "String", "Boolean",
                    "Int8", "Int16", "Int32", "Int64", "Int128",
                    "UInt8", "UInt16", "UInt32", "UInt64", "UInt128",
                    "Float", "Double", "Decimal"
                ];

                if (primitiveRefs.includes(typeName) && !obj.properties && !obj.items) {
                    return { $ref: `System#/components/schemas/${typeName}` };
                }
            }

            const normalized: any = {};
            for (const key in obj) {
                normalized[key] = this.normalizeOpenApiSchemaWithRefs(obj[key]);
            }
            return normalized;
        }

        return obj;
    }

    // TO DO REFACTOR NEEDED TODO HOT FIX
    // Are the types correct? Should all of them be a ref? 
    // System#/components/schemas/String
    // System#/components/schemas/Object
    // System#/components/schemas/Int32
    // kind: WirePlotSchemaKind;
    // containerType: WirePlotContainerType;
    // title: string;
    // description: string;
    // default?: unknown;
    // nullable: boolean;
    // readOnly: boolean;
    static createSchemaPropertyForType(type: string, title: string): WirePlotPropertyObject {
        return {
            $ref: `System#/components/schemas/${type}`,
            type: type,
            kind: 'primitive',
            containerType: "None",
            title: NameHelper.toHumanTitle(title),
            description: "",
            nullable: false,
            readOnly: false
        };
    };

    static getSchemaNameFromRef(ref: string): string | undefined {
        const marker = "#/components/schemas/";
        const index = ref.indexOf(marker);

        if (index === -1) {
            return undefined;
        }

        const schemaName = ref.substring(index + marker.length).split("/").pop();
        return schemaName && schemaName.length > 0 ? schemaName : undefined;
    }


    static getNamespaceFromRef(ref: string): string | undefined {
        const match = ref.match(/^([^#]+)#\/components\/schemas\//);
        return match ? match[1] : undefined;
    }


    static isSchemaObject(obj: WirePlotSchemaObject): obj is WirePlotSchemaObject {
        return (
            (obj as WirePlotSchemaObject).type !== undefined ||
            (obj as WirePlotSchemaObject).properties !== undefined
        );
    }

    public static getUniqueNameForProperty(name: string, properties: Record<string, WirePlotPropertyObject> | undefined): string {
        if (!properties) {
            return name;
        }

        let hasFoundNewName = false;
        let namePrefix = name;
        let nameSuffix = "";
        let loopCounter = 0;

        while (!hasFoundNewName) {
            const nameToBeAssigned = `${namePrefix}${nameSuffix}`;
            const keys = Object.keys(properties);

            if (keys.includes(nameToBeAssigned)) {
                nameSuffix = (++loopCounter).toString();
            } else {
                hasFoundNewName = true;
            }
        }

        return `${namePrefix}${nameSuffix}`;
    }

    static isValidPropertyName(name: string): boolean {
        if (typeof name !== "string") {
            return false;
        }
        if (name.trim() !== name) {
            return false;  // no leading/trailing spaces
        }
        if (name.length === 0) {
            return false;
        }
        // Must start with letter or underscore, then letters/digits/underscore
        // Regex explanation:
        // ^[a-zA-Z_]      -> starts with a letter (a-z or A-Z) or underscore
        // [a-zA-Z0-9_]*$  -> followed by zero or more letters/digits/underscores
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            return false;
        }
        return true;
    }


    static deleteSchemaProperty(parsed: WirePlotDocument, schemaName: string, propertyName: string): void {
        if (!parsed?.components?.schemas?.[schemaName]) {
            return;
        }

        const schema = parsed.components.schemas[schemaName] as WirePlotSchemaObject;
        if (!schema.properties?.[propertyName]) {
            return;
        }

        const updatedSchema: WirePlotSchemaObject = {
            ...schema,
            properties: { ...schema.properties },
        };
        delete updatedSchema?.properties?.[propertyName];

        parsed.components.schemas[schemaName] = updatedSchema;
    }

    // TODO DEPRECATED TO DO REMOVE IT DELETE IT
    static getSchemaTypeFromProperty(key: string, prop: WirePlotPropertyObject): string {
        // Default fallback
        let schemaType = "Unknown";

        if (prop.$ref) {
            schemaType = prop.$ref.split("/").pop() ?? "Unknown";
            return schemaType;
        }

        const type = prop.type?.toLowerCase();
        const format = (prop as any).format?.toLowerCase();
        const schemaName = key;

        switch (type) {
            case "integer":
                switch (format) {
                    case "int8":
                        schemaType = "Int8";
                        break;
                    case "int16":
                        schemaType = "Int16";
                        break;
                    case "int32":
                        schemaType = "Int32";
                        break;
                    case "int64":
                        schemaType = "Int64";
                        break;
                    case "int128":
                        schemaType = "Int128";
                        break;
                    case "uint8":
                        schemaType = "UInt8";
                        break;
                    case "uint16":
                        schemaType = "UInt16";
                        break;
                    case "uint32":
                        schemaType = "UInt32";
                        break;
                    case "uint64":
                        schemaType = "UInt64";
                        break;
                    case "uint128":
                        schemaType = "UInt128";
                        break;
                    default:
                        schemaType = "Int32";
                        break; // default OpenAPI behavior
                }
                break;

            case "number":
                switch (format) {
                    case "float":
                        schemaType = "Float";
                        break;
                    case "double":
                        schemaType = "Double";
                        break;
                    case "decimal":
                        schemaType = "Decimal";
                        break;
                    default:
                        schemaType = "Double";
                        break;
                }
                break;

            case "boolean":
                schemaType = "Boolean";
                break;

            case "string":
                schemaType = "String";
                break;

            case "array":
                schemaType = "Array";
                break;

            case "object":
                schemaType = schemaName;
                break;

            default:
                schemaType = schemaName;
                break;
        }

        return schemaType;
    }

    static createSchema(parsed: WirePlotDocument, schemaName: string): void {
        if (!parsed?.components) {
            parsed.components = { schemas: {} };
        } else if (!parsed.components.schemas) {
            parsed.components.schemas = {};
        }

        const schemas = parsed.components.schemas;

        if (schemas) {
            if (schemas[schemaName]) {
                console.warn(`Schema '${schemaName}' already exists. Creation aborted.`);
                return;
            }

            // Add new schema
            schemas[schemaName] = this.createEmptySchema(schemaName);
        }
    }


    static renameSchema(parsed: WirePlotDocument, oldName: string, newName: string): void {
        if (!parsed?.components?.schemas?.[oldName]) {
            return;
        }

        const schemas = parsed.components.schemas;

        if (schemas[newName]) {
            console.warn(`Schema '${newName}' already exists. Rename aborted.`);
            return;
        }

        const newSchemas: typeof schemas = {};

        for (const key of Object.keys(schemas)) {
            if (key === oldName) {
                newSchemas[newName] = schemas[oldName];
            } else {
                newSchemas[key] = schemas[key];
            }
        }

        parsed.components.schemas = newSchemas;
    }

    static normalizePath(path: string): string {
        return path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    }

    static pathsMatch(schemaPath: string, lookupPath: string): boolean {
        const normalize = (p: string): string[] => this.normalizePath(p).split('/').filter(Boolean);
        const schemaSegments = normalize(schemaPath);
        const lookupSegments = normalize(lookupPath);

        if (schemaSegments.length !== lookupSegments.length) {
            return false;
        }

        for (let i = 0; i < schemaSegments.length; i++) {
            const s = schemaSegments[i];
            const l = lookupSegments[i];
            if (s.startsWith('{') && s.endsWith('}')) { continue; } // param in schema matches anything param in lookup
            if (l.startsWith('{') && l.endsWith('}')) { continue; } // param in lookup matches anything param in schema
            if (s !== l) { return false; }
        }
        return true;
    }

    static getOperationFromSchemas(schemas: Record<string, SchemaContainer>, pathKey: string, namespace: string): OpenApiOperationObject | undefined {
        const [rawPath, method] = pathKey.split('_').slice(1);

        if (!rawPath || !method) {
            return undefined;
        }

        const schemaContainer = schemas[namespace];
        if (!schemaContainer?.parsed) {
            return undefined;
        }

        const openApiDoc = schemaContainer.parsed;

        if (!openApiDoc.paths) {
            return undefined;
        }

        const foundPath = Object.keys(openApiDoc.paths || {}).find(p => this.pathsMatch(p, rawPath));
        if (!foundPath) {
            return undefined;
        }

        const pathItem = openApiDoc.paths[foundPath];
        if (!pathItem) {
            return undefined;
        }

        const operation = pathItem[method.toLowerCase() as keyof OpenApiPathItemObject];
        return operation as OpenApiOperationObject;
    }

    static getResponsesFromSchemas(schemas: Record<string, SchemaContainer>, rawPath: string, method: string, namespace: string): OpenApiResponseObject | undefined {
        const schemaContainer = schemas[namespace];
        if (!schemaContainer?.parsed) {
            return undefined;
        }

        const openApiDoc = schemaContainer.parsed;

        if (!openApiDoc.paths) {
            return undefined;
        }

        const pathItem = openApiDoc.paths[rawPath];
        if (!pathItem) {
            return undefined;
        }

        const operation = pathItem[method.toLowerCase() as keyof OpenApiPathItemObject];
        if (!operation || typeof operation !== 'object') {
            return undefined;
        }

        return (operation as OpenApiOperationObject).responses;
    }

    static deleteSchema(parsed: WirePlotDocument, schemaName: string): void {
        if (!parsed?.components?.schemas?.[schemaName]) {
            return;
        }

        // Create a shallow copy of the schemas object
        const updatedSchemas = { ...parsed.components.schemas };

        // Delete the whole schema by name
        delete updatedSchemas[schemaName];

        // Update the parsed document with the new schemas object
        parsed.components.schemas = updatedSchemas;
    }

    static addSchemaProperty(parsed: WirePlotDocument, schemaName: string, newPropertyName: string, newProperty: WirePlotPropertyObject): void {
        if (!parsed?.components?.schemas?.[schemaName]) {
            return;
        }
        const schema = parsed.components.schemas[schemaName] as WirePlotSchemaObject;

        if (!schema.properties) {
            schema.properties = {};
        }

        if (schema.properties[newPropertyName]) {
            console.warn(`Property '${newPropertyName}' already exists in schema '${schemaName}'.`);
            return;
        }

        schema.properties[newPropertyName] = newProperty;

        parsed.components.schemas[schemaName] = schema;
    }


    static renameSchemaProperty(parsed: WirePlotDocument, schemaName: string, oldName: string, newName: string): void {
        if (!parsed?.components?.schemas?.[schemaName]) {
            return;
        }

        const schema = parsed.components.schemas[schemaName] as WirePlotSchemaObject;
        if (!schema.properties?.[oldName]) {
            return;
        }

        // Prevent renaming to an existing property name
        if (schema.properties[newName]) {
            console.warn(`Cannot rename property '${oldName}' to '${newName}' because '${newName}' already exists.`);
            return;
        }

        const oldProperties = schema.properties;
        const newProperties: typeof oldProperties = {};

        for (const key of Object.keys(oldProperties)) {
            if (key === oldName) {
                newProperties[newName] = oldProperties[oldName];
                newProperties[newName].title = newName;
            } else {
                newProperties[key] = oldProperties[key];
            }
        }


        const updatedSchema: WirePlotSchemaObject = {
            ...schema,
            properties: newProperties,
        };

        parsed.components.schemas[schemaName] = updatedSchema;
    }
}

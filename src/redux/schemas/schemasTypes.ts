
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'trace';

export type SupportedSchemaFormat = 'openapi-v3' | 'unsupported';

export interface SchemaContainer {
    name: string;
    editable: boolean;
    flowCapable: boolean;
    format: SupportedSchemaFormat;
    parsed?: WirePlotDocument;
}

export interface SchemasSliceState {
    schemas: Record<string, SchemaContainer>;
}





export type WirePlotSchemaKind =
    | "class"
    | "struct"
    | "record"
    | "enum"
    | "interface"
    | "primitive";

export type WirePlotContainerType =
    | "Array"
    | "Dictionary"
    | "List"
    | "None";


// ------------------------------
// WirePlot Property
// ------------------------------

export interface WirePlotPropertyObject {
    $ref?: string;
    type: string;
    kind: WirePlotSchemaKind;
    containerType: WirePlotContainerType;
    format?: string;
    title?: string;
    description?: string;
    default?: unknown;
    nullable?: boolean;
    readOnly?: boolean;
}



// ------------------------------
// WirePlot Schema
// ------------------------------

export interface WirePlotSchemaObject {
    assembly?: string; 
    description?: string;
    kind: WirePlotSchemaKind;
    methods: Record<string, WirePlotMethod>;
    namespace?: string;
    properties?: Record<string, WirePlotPropertyObject>;
    type: string;
    title: string;
}

// ------------------------------
// WirePlot Method
// ------------------------------

export interface WirePlotMethod {
    owner: { $ref: string };
    overloads: Record<string, WirePlotMethodOverload>;
}

export interface WirePlotMethodOverload {
    overloadId: string;
    name: string;
    methodKind: "instance" | "static";
    description?: string;
    signature: {
        parameters: WirePlotMethodParameter[];
        return: WirePlotMethodParameter[];
    };
}

export interface WirePlotMethodParameter {
    instanceGuid: string;
    name: string;
    description?: string;
    required?: boolean;
    $ref: string;
}

export interface OpenApiMediaTypeObject {
    schema?: { $ref: string };
    example?: string;
}



export interface OpenApiResponseObject {
    description?: string;
    content?: Record<string, OpenApiMediaTypeObject>;
}


export interface OpenApiResponsesObject {
    [statusCode: string]: OpenApiResponseObject;
}


export interface OpenApiParameterObject {
    name: string;
    in: "query" | "path" | "header" | "cookie";
    required?: boolean;
    description?: string;
    example?: string;
    schema?: { $ref: string };
}

export interface OpenApiRequestBodyObject {
    description?: string;
    required?: boolean;
    content?: Record<string, OpenApiMediaTypeObject>;
}


export interface OpenApiOperationObject {
    operationId?: string;
    summary?: string;
    description?: string;

    parameters?: OpenApiParameterObject[];
    requestBody?: OpenApiRequestBodyObject;

    responses?: OpenApiResponsesObject;
}



// Minimal OpenAPI path item
export interface OpenApiPathItemObject {
    get?: OpenApiOperationObject;
    post?: OpenApiOperationObject;
    put?: OpenApiOperationObject;
    delete?: OpenApiOperationObject;
    patch?: OpenApiOperationObject;
    options?: OpenApiOperationObject;
    head?: OpenApiOperationObject;
    [method: string]: any;
}

export type ParsedRef =
    | { kind: "namespace"; namespace: string }
    | { kind: "schema"; namespace: string; schemaName: string }
    | { kind: "schemaProperty"; namespace: string; schemaName: string; propertyName: string }
    | { kind: "method"; namespace: string; schemaName: string; methodName: string }
    | { kind: "methodOverload"; namespace: string; schemaName: string; methodName: string; overloadId: string }
    | { kind: "path"; namespace: string; path: string; method?: string }
    | { kind: "unknown" };


export interface WirePlotDocument {
    // metadata
    openapi: string;
    info: Record<string, any>;

    // OpenAPI path operations (minimal type for API import)
    paths?: Record<string, OpenApiPathItemObject>;

    // WirePlot schema definitions
    components: {
        schemas: Record<string, WirePlotSchemaObject>;
    };
}



import { ReactFlowInstance, Node, Edge, XYPosition, Connection } from "@xyflow/react";
import { Guid } from "../Helpers/Guid";
import { EParameterDirection, Parameter } from '../Models/Grids';

import { HandleInfo } from "../Models/HandleInfo";
import { store } from "../store";
import { setActiveGridInstanceGuid, removeGridByInstanceGuid, saveCurrentGridAndActivateNewGridByInstanceGuid, setActiveElement, createNewGrid, updateGridMethodRef } from "../redux/project/projectSlice";
import { Grid } from "../Models/Grids";
import { ColorHelper } from "../Helpers/ColorHelper";
import { EntityApiMethodMetadata, EntityPair } from "../Components/EntityPanel/types";
import { createSchemaMethod, makeSelectMethodByRef, OpenApiOperationObject, OpenApiParameterObject, OpenApiResponseObject, SchemaUtils, selectMethodRef, WirePlotMethodOverload, WirePlotMethodParameter } from "../redux/schemas";
import { HandleGroup } from "../Models/HandleGroups";
import { NodeFactory } from "../Helpers/NodeFactory";
import { ENodeOperationType, ExecutableNodeProps } from "../Nodes/types";
import { NodeMetadata } from "../FisUI/IntelliSensePicker";
import { CSSProperties } from "react";

type HandleType = "inputs" | "outputs";


export class GridManager {

    private static generateNewGrid(methodRef: string): Grid {
        const inputGridNodeId = Guid.generateGUID();
        const outputGridNodeId = Guid.generateGUID();

        const parsedMethod = SchemaUtils.parseRef(methodRef);


        const inputParam: Parameter[] = [
            {
                name: '',
                direction: EParameterDirection.INPUT,
                instanceGuid: Guid.generateGUID(),
                schema: 'flowOutput',
                namespace: "Flow",
                required: false
            }
        ];

        const outputParam: Parameter[] = [
            {
                name: '',
                direction: EParameterDirection.OUTPUT,
                instanceGuid: Guid.generateGUID(),
                schema: 'flowInput',
                namespace: "Flow",
                required: false
            }
        ];

        const newGrid: Grid = {
            instanceGuid: Guid.generateGUID(),
            inputNodeInstanceGuid: inputGridNodeId,
            outputNodeInstanceGuid: outputGridNodeId,
            methodRef: methodRef,
            reactFlowJsonObject: {
                nodes: [
                    {
                        id: inputGridNodeId,
                        type: "Executable",
                        deletable: false,
                        position: { x: 0, y: 0 },
                        selected: false,
                        style: {
                            backgroundColor: "#030014DA",
                            border: '1px solid black',
                            minWidth: 120,
                            minHeight: 70,
                            borderRadius: 5,
                        },
                        data: {
                            operationType: ENodeOperationType.GRID_INPUT,
                            icon: undefined,
                            schemaRef: "",
                            title: parsedMethod.kind === "method" ? parsedMethod.methodName : "Couldn't parse methodRef. MethodRef is undefined.",
                            toolbox: {
                                enabled: true,
                                visible: store.getState().workflowDesignerSlice.displayNodeComments
                            },
                            comment: 'Represents the grid input node.\nInput parameters can be modified\nin the properties panel.',
                            inputs: [],
                            outputs: [{
                                instanceGuid: "b7a3e9c8-9f4d-4f5a-8a3e-cd2f7a1b6d22",
                                handles: inputParam.map((p) => ({
                                    name: p.name,
                                    instanceGuid: p.instanceGuid,
                                    description: undefined,
                                    required: p.required,
                                    example: undefined,
                                    namespace: "Flow",
                                    schema: p.schema,
                                    isArray: false
                                })),
                                name: "",
                                applyVisuals: false,
                                color: "#ffffff"
                            }],
                        }
                    } as ExecutableNodeProps,
                    {
                        id: outputGridNodeId,
                        type: "Executable",
                        deletable: false,
                        position: { x: 840, y: 0 },
                        selected: false,
                        style: {
                            backgroundColor: "#030014DA",
                            border: '1px solid black',
                            minWidth: 120,
                            minHeight: 70,
                            borderRadius: 5,
                        },
                        data: {
                            operationType: ENodeOperationType.GRID_OUTPUT,
                            icon: undefined,
                            schemaRef: "",
                            title: 'Return',
                            toolbox: {
                                enabled: true,
                                visible: store.getState().workflowDesignerSlice.displayNodeComments
                            },
                            comment: 'Represents the grid output node.\nOutput parameters can be modified\nin the properties panel.',
                            type: 'gridOutputNode',
                            inputs: [{
                                instanceGuid: "b7a3e9c8-9f4d-4f5a-8a3e-cd2f7a1b6d22",
                                handles: outputParam.map((p) => ({
                                    name: p.name,
                                    instanceGuid: p.instanceGuid,
                                    description: undefined,
                                    required: p.required,
                                    example: undefined,
                                    namespace: "Flow",
                                    schema: p.schema,
                                    isArray: false
                                })),
                                name: "",
                                applyVisuals: false,
                                color: "#ffffff"
                            }],
                            outputs: []
                        }
                    } as ExecutableNodeProps],
                edges: [],
                viewport: {
                    x: 50,
                    y: 291,
                    zoom: 1.5
                }
            }
        }

        return newGrid;
    }

    static initializeGrid(reactFlowInstance: ReactFlowInstance<Node, Edge>): void {
        try {
            const projectSlice = store.getState().projectSlice;
            const grid = projectSlice.grids.find((g) => g.instanceGuid === projectSlice.activeGridInstanceGuid);
            if (grid) {
                this.activateGrid(reactFlowInstance, grid.methodRef);
                store.dispatch(setActiveElement({ instanceGuid: grid.methodRef, elementType: "gridButton" }));
            }
        } catch (error) {
            console.error(error);
        }
    }

    static createNewGrid(reactFlowInstance: ReactFlowInstance<Node, Edge>, name: string): void {
        try {
            const projectSlice = store.getState().projectSlice;
            const grid = projectSlice.grids.find((g) => g.instanceGuid === projectSlice.activeGridInstanceGuid);
            if (grid) {
                this.saveActiveGrid(reactFlowInstance, grid.methodRef);
                store.dispatch(createSchemaMethod({ namespace: "Project", schemaName: "Program", methodName: name }));
                const methodRef: string | undefined = selectMethodRef(store.getState(), "Project", "Program", name);
                if (methodRef) {
                    const newGrid: Grid = this.generateNewGrid(methodRef);
                    store.dispatch(createNewGrid(newGrid));
                    this.activateGrid(reactFlowInstance, newGrid.instanceGuid);
                    store.dispatch(setActiveElement({ instanceGuid: newGrid.instanceGuid, elementType: "gridButton" }));
                }
            }

        } catch (error) {
            console.error(`Couldn't create new grid:`, error);
        }
    }


    static getHandleDataType(reactFlowInstance: ReactFlowInstance<Node, Edge>, handleId: string, nodeId: string, type: HandleType): string | undefined {

        try {
            const node: Node | undefined = reactFlowInstance.getNode(nodeId);

            if (!node) {
                console.warn('Source node not found');
                return undefined;
            }

            const outputGroups: HandleGroup[] | undefined = node.data?.[type] as HandleGroup[] | undefined;
            if (!outputGroups?.length) {
                console.warn('No outputs on source node');
                return undefined;
            }


            const outputHandleInfo: HandleInfo | undefined = outputGroups.flatMap(group => group.handles).find(handle => handle.instanceGuid === handleId);
            if (!outputHandleInfo) {
                console.warn('Output handle info not found');
                return undefined;
            }


            return outputHandleInfo.schema;

        } catch (error) {
            console.error(`Couldn't get type for the handle:`, error);
            return undefined;
        }
    }

    static createConnection(reactFlowInstance: ReactFlowInstance<Node, Edge>, params: Connection): void {

        try {
            const sourceNode: Node | undefined = reactFlowInstance.getNode(params.source);
            const targetNode: Node | undefined = reactFlowInstance.getNode(params.target);

            if (!sourceNode || !targetNode) {
                console.warn('Source or target node not found');
                return;
            }

            const outputGroups = sourceNode.data?.['outputs'] as HandleGroup[] | undefined;

            if (!outputGroups?.length) {
                console.warn('No outputs on source node');
                return;
            }

            const inputGroups = targetNode.data?.['inputs'] as HandleGroup[] | undefined;

            if (!inputGroups?.length) {
                console.warn('No inputs on target node');
                return;
            }

            const outputHandleInfo: HandleInfo | undefined = outputGroups.flatMap(group => group.handles).find(handle => handle.instanceGuid === params.sourceHandle);
            if (!outputHandleInfo) {
                console.warn('Output handle info not found');
                return;
            }

            const inputHandleInfo: HandleInfo | undefined = inputGroups.flatMap(group => group.handles).find(handle => handle.instanceGuid === params.targetHandle);

            if (!inputHandleInfo) {
                console.warn('Input handle info not found');
                return;
            }

            const canCreateDirectConnection: boolean = outputHandleInfo.schema === inputHandleInfo.schema ?
                true :
                outputHandleInfo.schema === "flowOutput" && inputHandleInfo.schema === "flowInput" ?
                    true :
                    false;


            if (canCreateDirectConnection) {
                const color = ColorHelper.getColorForSchema(outputHandleInfo.schema);
                const hoverColor = ColorHelper.mixWithWhite(color, 0.3);

                const newEdge: Edge = {
                    id: Guid.generateGUID(),
                    source: params.source,
                    sourceHandle: params.sourceHandle,
                    target: params.target,
                    targetHandle: params.targetHandle,
                    type: "default",
                    className: 'typed-edge',
                    style: {
                        '--edge-color': color,
                        '--edge-color-hover': hoverColor,
                        filter: 'url(#edge-glow)'
                    } as CSSProperties,
                };

                reactFlowInstance.addEdges(newEdge);
                return;
            } else {
                console.warn(`Couldn't create direct connection.`);
            }
        } catch (error) {
            console.error(`Couldn't create new connection edge:`, error);
        }
    }

    static updateGridNodeHandles(reactFlowInstance: ReactFlowInstance<Node, Edge>, methodOverload: WirePlotMethodOverload, direction: EParameterDirection): void {
        try {
            const projectSlice = store.getState().projectSlice;
            const grid: Grid | undefined = store.getState().projectSlice.grids.find((_grid) => _grid.instanceGuid === projectSlice.activeGridInstanceGuid);

            if (grid === undefined) {
                return;
            }

            const nodeId = direction === EParameterDirection.INPUT ? grid.inputNodeInstanceGuid : grid.outputNodeInstanceGuid;
            // TO DO TODO DEPRECATED HOT FIX
            const parameters: WirePlotMethodParameter[] = direction === EParameterDirection.INPUT ? methodOverload.signature.parameters : methodOverload.signature.return;
            reactFlowInstance.setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id !== nodeId) {
                        return structuredClone(node);
                    }
                    console.log(node);
                    const updatedNode = structuredClone(node);
                    const handleGroups: HandleGroup[] = [
                        {
                            instanceGuid: "b7a3e9c8-9f4d-4f5a-8a3e-cd2f7a1b6d22",
                            name: "",
                            color: "#cccccc",
                            applyVisuals: false,
                            handles: [
                                // --- FLOW OUTPUT HANDLE ---
                                {
                                    name: "",
                                    instanceGuid: direction == EParameterDirection.OUTPUT ? "e1c7b6a4-9d2f-4a83-b5c1-0f8e6d3a2b94" : "4a9f2c1d-6e8b-4f73-9c5a-7d0e3b1a8f62",
                                    description: undefined,
                                    required: false,
                                    example: undefined,
                                    namespace: "Flow",
                                    schema: "flowOutput",
                                    isArray: false,
                                },
                                // --- PARAMETER HANDLES ---
                                ...parameters.map(p => ({
                                    name: p.name,
                                    instanceGuid: p.instanceGuid,
                                    description: p.description,
                                    required: p.required ?? false,
                                    example: undefined,
                                    namespace: SchemaUtils.getNamespaceFromRef(p.$ref) ?? "ERROR: Namespace is undefined.",
                                    schema: SchemaUtils.getSchemaNameFromRef(p.$ref) ?? "ERROR: Schema is undefined.",
                                    isArray: false
                                }))
                            ]
                        }
                    ];



                    if (direction === EParameterDirection.INPUT) {
                        updatedNode.data.outputs = handleGroups;
                    } else if (direction === EParameterDirection.OUTPUT) {
                        updatedNode.data.inputs = handleGroups;
                    }
                    console.log("updatedNode", updatedNode);

                    return updatedNode;
                })
            );


        } catch (error) {
            console.error(`Couldn't create new grid:`, error);
        }
    }

    static updateGridName(reactFlowInstance: ReactFlowInstance<Node, Edge>, newName: string, methodRef: string): void {
        try {
            const projectSlice = store.getState().projectSlice;

            const grid: Grid | undefined = projectSlice.grids.find((g) => g.methodRef === methodRef);
            if (!grid) {
                console.error(`Couldn't update grid name. Couldn't find grid with '${methodRef}' methodRef.`);
                return;
            }

            if (projectSlice.activeGridInstanceGuid === grid.instanceGuid) {
                const newMethodRef = SchemaUtils.renameMethodInRef(methodRef, newName);
                store.dispatch(updateGridMethodRef({ oldMethodRef: methodRef, newMethodRef: newMethodRef }));
                reactFlowInstance.setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === grid.inputNodeInstanceGuid) {
                            return structuredClone({
                                ...node,
                                data: {
                                    ...node.data,
                                    title: newName,
                                },
                            });
                        }
                        return structuredClone(node);
                    }),
                );
            }
        } catch (error) {
            console.error(`Couldn't update grid name:`, error);
        }
    }

    static activateGrid(reactFlowInstance: ReactFlowInstance<Node, Edge>, gridMethodRef: string): void {
        try {

            const grid: Grid | undefined = store.getState().projectSlice.grids.find((_grid) => _grid.methodRef === gridMethodRef);
            console.log("grid");
            console.log(grid);
            console.log(gridMethodRef);

            if (grid) {
                store.dispatch(setActiveGridInstanceGuid(grid.methodRef));

                // Deselect nodes if is any selected
                reactFlowInstance.setNodes(grid.reactFlowJsonObject.nodes.map((node) => ({ ...node, selected: false })));
                reactFlowInstance.setEdges(grid.reactFlowJsonObject.edges);
                reactFlowInstance.setViewport(grid.reactFlowJsonObject.viewport);
            } else {
                console.error(`Failed to get grid by ref '${gridMethodRef}'. Couldn't find the grid in state.`);

            }
        } catch (error) {
            console.error(`Failed to active grid by ref '${gridMethodRef}'.`, error);
        }
    }

    static deleteGrid(reactFlowInstance: ReactFlowInstance<Node, Edge>, instanceGuid: string): void {
        try {
            const state = store.getState().projectSlice;
            const deletingActive = state.activeGridInstanceGuid === instanceGuid;
            const propertiesBelongToDeleted = state.activeElement?.instanceGuid === instanceGuid;

            store.dispatch(removeGridByInstanceGuid(instanceGuid));

            if (deletingActive) {
                const newState = store.getState().projectSlice;

                // pick first remaining grid
                const fallbackGrid = newState.grids[0];

                if (propertiesBelongToDeleted) {
                    store.dispatch(setActiveElement(undefined));
                }

                if (fallbackGrid) {
                    this.activateGrid(reactFlowInstance, fallbackGrid.instanceGuid);
                } else {
                    // no grids left
                    store.dispatch(setActiveGridInstanceGuid(undefined));
                }
            }
        } catch (error) {
            console.error(error);
        }
    }


    static saveActiveGrid(reactFlowInstance: ReactFlowInstance<Node, Edge>, gridMethodRef: string): void {
        try {
            store.dispatch(saveCurrentGridAndActivateNewGridByInstanceGuid({ newGridMethodRef: gridMethodRef, reactFlowJsonObject: reactFlowInstance.toObject() }));
        } catch (error) {
            console.error(`Failed to active grid with method ref ${gridMethodRef}:`, error);
        }
    }

    static createHandleGroupsFromResponses(responses: OpenApiResponseObject): HandleGroup[] {
        const groups: HandleGroup[] = [];

        for (const [statusCodeRaw, responseOrRef] of Object.entries(responses)) {
            const groupId = Guid.generateGUID();

            // Parsing statusCode string na number (ak to ide)
            const statusCode = parseInt(statusCodeRaw, 10);
            if (isNaN(statusCode)) {
                continue;
            }

            const bgColor = ColorHelper.getStatusCodeBackgroundColor(statusCode);

            const label = `On ${statusCode}`;

            let schemaName: string | undefined = undefined;

            if (!('$ref' in responseOrRef)) {
                const response = responseOrRef as OpenApiResponseObject;
                const jsonMediaType = response.content?.['application/json'];

                if (jsonMediaType?.schema && '$ref' in jsonMediaType.schema) {
                    schemaName = SchemaUtils.getSchemaNameFromRef(jsonMediaType.schema.$ref);
                }
            }

            const flowHandle: HandleInfo = {
                name: label,
                instanceGuid: Guid.generateGUID(),
                schema: 'flowOutput',
                namespace: '',
                required: false,
                description: `Switch for HTTP status ${statusCode}`,
                example: undefined,
                isArray: false,
            };

            const handles: HandleInfo[] = [flowHandle];

            if (schemaName) {
                const dataHandle: HandleInfo = {
                    name: schemaName,
                    instanceGuid: Guid.generateGUID(),
                    schema: schemaName,
                    namespace: '',
                    required: false,
                    description: `Response object schema for HTTP ${statusCode}`,
                    example: undefined,
                    isArray: false,
                };
                handles.push(dataHandle);
            }

            groups.push({
                instanceGuid: groupId,
                name: label,
                color: bgColor,
                handles,
                applyVisuals: true
            });
        }

        return groups;
    }

    private static spawnRestOperationNode(reactFlowInstance: ReactFlowInstance<Node, Edge>, entity: EntityPair, position: XYPosition): void {
        console.log(reactFlowInstance);
        console.log(entity);
        console.log(position);
        try {
            const metadata = entity.metadata as EntityApiMethodMetadata;
            if (!metadata) {
                return;
            }
            const operation: OpenApiOperationObject | undefined = SchemaUtils.getOperationFromSchemas(store.getState().schemasSlice.schemas, entity.$ref, metadata.namespace);
            if (!operation) {
                return;
            }

            const sourceBodyInstanceGuid: string = Guid.generateGUID();
            const sourceStatusCodeInstanceGuid: string = Guid.generateGUID();
            const sourceFlowInputInstanceGuid: string = Guid.generateGUID();

            const inputHandleInfos: HandleInfo[] = [{ name: "", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "Flow", schema: "flowInput", isArray: false }];
            const outputHandleInfos: HandleInfo[] = [{ name: "Default", instanceGuid: sourceFlowInputInstanceGuid, description: undefined, required: false, example: undefined, namespace: "Flow", schema: "flowOutput", isArray: false }];
            console.log("operation", operation);



            if (operation.parameters !== undefined) {
                operation.parameters.forEach((parameter: OpenApiParameterObject) => {
                    if (parameter.schema !== undefined) {
                        const schemaObj = parameter.schema;

                        if (schemaObj.$ref !== undefined) {
                            console.log("schema.type", schemaObj.$ref);

                            const handleParNamespace = SchemaUtils.getNamespaceFromRef(schemaObj.$ref);
                            const handleParSchema = SchemaUtils.getSchemaNameFromRef(schemaObj.$ref);
                            console.log(handleParNamespace, ".", handleParSchema);

                            if (handleParNamespace && handleParSchema) {
                                inputHandleInfos.push({
                                    name: parameter.name,
                                    instanceGuid: Guid.generateGUID(),
                                    description: parameter.description,
                                    required: parameter.required ?? false,
                                    example: parameter.example,
                                    namespace: handleParNamespace,
                                    schema: handleParSchema,
                                    isArray: false
                                });
                            }
                        }
                    }
                })
            }


            let numberOfParameters = 0;

            if (numberOfParameters < inputHandleInfos.length) {
                numberOfParameters = inputHandleInfos.length;
            }

            if (numberOfParameters < outputHandleInfos.length) {
                numberOfParameters = outputHandleInfos.length;
            }

            const responses = SchemaUtils.getResponsesFromSchemas(
                store.getState().schemasSlice.schemas,
                metadata.path,
                metadata.method,
                metadata.namespace
            );

            inputHandleInfos.push({ name: "Request Headers", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "System.Net.Http", schema: "HttpRequestHeaders", isArray: false });
            inputHandleInfos.push({ name: "Body", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "System", schema: "Object", isArray: false });
            outputHandleInfos.push({ name: "Response Headers", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "System.Net.Http", schema: "HttpResponseHeaders", isArray: false });
            outputHandleInfos.push({ name: "Status Code", instanceGuid: sourceStatusCodeInstanceGuid, description: undefined, required: false, example: undefined, namespace: "System.Net", schema: "HttpStatusCode", isArray: false });
            outputHandleInfos.push({ name: "Body", instanceGuid: sourceBodyInstanceGuid, description: undefined, required: false, example: undefined, namespace: "System", schema: "Object", isArray: false });


            const newNode = NodeFactory.createExecutableNode({
                title: metadata.path,
                position: position,
                operationType: entity.operationType,
                comment: operation.summary,
                schemaRef: "",
                inputs: [
                    {
                        instanceGuid: Guid.generateGUID(),
                        handles: inputHandleInfos,
                        name: "",
                        applyVisuals: false,
                        color: "#ffffff",
                    }
                ],
                outputs: [
                    {
                        instanceGuid: Guid.generateGUID(),
                        handles: outputHandleInfos,
                        name: "",
                        applyVisuals: false,
                        color: "#ad0000ff",
                    }
                ],
            });

            const targetFlowOutputInstanceGuid: string = Guid.generateGUID();
            const targetStatusCodeInstanceGuid: string = Guid.generateGUID();
            const targetBodyInstanceGuid: string = Guid.generateGUID();

            const newSwitchNode = NodeFactory.createExecutableNode({
                title: "Response Status Switch",
                position: { x: position.x + 340, y: position.y },
                operationType: ENodeOperationType.REST_RESPONSE_STATUS_SWITCH,
                comment: "Route execution flow by HTTP response status\n Each branch has a strongly-typed output contract.",
                schemaRef: "",
                inputs: [{
                    instanceGuid: Guid.generateGUID(),
                    handles: [
                        { name: "", instanceGuid: targetFlowOutputInstanceGuid, description: undefined, required: false, example: undefined, namespace: "Flow", schema: "flowInput", isArray: false },
                        { name: "HttpStatusCode", instanceGuid: targetStatusCodeInstanceGuid, description: undefined, required: false, example: undefined, namespace: "System.Net", schema: "HttpStatusCode", isArray: false },
                        { name: "Body", instanceGuid: targetBodyInstanceGuid, description: undefined, required: false, example: undefined, namespace: "System", schema: "Object", isArray: false }
                    ],
                    name: "",
                    applyVisuals: false,
                    color: "#ffffff"
                }],
                outputs: [
                    ...(responses ? this.createHandleGroupsFromResponses(responses) : []),
                    {
                        instanceGuid: Guid.generateGUID(),
                        handles: [
                            { name: "Default", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "Flow", schema: "flowOutput", isArray: false },
                            { name: "Body", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "System", schema: "Object", isArray: false }
                        ],
                        name: "Default",
                        applyVisuals: true,
                        color: "rgba(107, 114, 128, 0.3)"
                    }
                ]
            });

            // Deselect all nodes
            reactFlowInstance.setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
            // Add new node
            reactFlowInstance.addNodes([newNode, newSwitchNode]);

            reactFlowInstance.addEdges([{
                id: Guid.generateGUID(),
                source: newNode.id,
                target: newSwitchNode.id,
                sourceHandle: sourceBodyInstanceGuid,
                targetHandle: targetBodyInstanceGuid,
                type: 'default',
                className: 'typed-edge',
                style: {
                    '--edge-color': ColorHelper.getColorForSchema(outputHandleInfos[3].schema),
                    '--edge-color-hover': ColorHelper.mixWithWhite(ColorHelper.getColorForSchema(outputHandleInfos[3].schema), 0.3),
                    filter: 'url(#edge-glow)'
                } as CSSProperties,
            }, {
                id: Guid.generateGUID(),
                source: newNode.id,
                target: newSwitchNode.id,
                sourceHandle: sourceStatusCodeInstanceGuid,
                targetHandle: targetStatusCodeInstanceGuid,
                type: 'default',
                className: 'typed-edge',
                style: {
                    '--edge-color': ColorHelper.getColorForSchema(outputHandleInfos[2].schema),
                    '--edge-color-hover': ColorHelper.mixWithWhite(ColorHelper.getColorForSchema(outputHandleInfos[2].schema), 0.3),
                    filter: 'url(#edge-glow)'
                } as CSSProperties,
            }, {
                id: Guid.generateGUID(),
                source: newNode.id,
                target: newSwitchNode.id,
                sourceHandle: sourceFlowInputInstanceGuid,
                targetHandle: targetFlowOutputInstanceGuid,
                type: 'default',
                className: 'typed-edge',
                style: {
                    '--edge-color': ColorHelper.getColorForSchema(outputHandleInfos[0].schema),
                    '--edge-color-hover': ColorHelper.mixWithWhite(ColorHelper.getColorForSchema(outputHandleInfos[0].schema), 0.3),
                    filter: 'url(#edge-glow)'
                } as CSSProperties,
            }]);

        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }

    private static spawnGridNode(reactFlowInstance: ReactFlowInstance<Node, Edge>, entity: EntityPair, position: XYPosition): void {
        try {
            const grid = store.getState().projectSlice.grids.find((grid) => grid.methodRef === entity.$ref);

            if (grid === undefined) {
                throw new Error(`Grid with instance guid '${entity.$ref}' is undefined`);
            }

            const method = makeSelectMethodByRef(grid.methodRef)(store.getState());

            if (!method) {
                console.warn("Method not found for ref:", grid.methodRef);
                return;
            }
            // Deselect all nodes
            reactFlowInstance.setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
            // Add new node
            reactFlowInstance.addNodes([
                NodeFactory.createExecutableNode({
                    title: method.name,
                    refInstanceGuid: Guid.generateGUID(),
                    position: position,
                    operationType: entity.operationType,
                    comment: method.description,
                    schemaRef: entity.$ref,
                    inputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            name: "",
                            applyVisuals: false,
                            color: "#ffffff",
                            handles: [
                                // --- FLOW INPUT HANDLE ---
                                {
                                    name: "",
                                    instanceGuid: Guid.generateGUID(),
                                    description: undefined,
                                    required: false,
                                    example: undefined,
                                    namespace: "Flow",
                                    schema: "flowInput",
                                    isArray: false
                                },
                                // --- RETURN HANDLE ---
                                ...method.signature.parameters.map(p => ({
                                    name: p.name,
                                    instanceGuid: p.instanceGuid,
                                    description: p.description,
                                    required: p.required ?? false,
                                    example: undefined,
                                    namespace: SchemaUtils.getNamespaceFromRef(p.$ref) ?? "ERROR: Namespace is undefined.",
                                    schema: SchemaUtils.getSchemaNameFromRef(p.$ref) ?? "ERROR: Schema is undefined.",
                                    isArray: false
                                }))
                            ]
                        }
                    ],
                    outputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            name: "",
                            applyVisuals: false,
                            color: "#ffffff",
                            handles: [
                                // --- FLOW OUTPUT HANDLE ---
                                {
                                    name: "",
                                    instanceGuid: Guid.generateGUID(),
                                    description: undefined,
                                    required: false,
                                    example: undefined,
                                    namespace: "Flow",
                                    schema: "flowOutput",
                                    isArray: false,
                                },
                                // --- PARAMETER HANDLES ---
                                ...method.signature.return.map(p => ({
                                    name: p.name,
                                    instanceGuid: p.instanceGuid,
                                    description: p.description,
                                    required: p.required ?? false,
                                    example: undefined,
                                    namespace: SchemaUtils.getNamespaceFromRef(p.$ref) ?? "ERROR: Namespace is undefined.",
                                    schema: SchemaUtils.getSchemaNameFromRef(p.$ref) ?? "ERROR: Schema is undefined.",
                                    isArray: false
                                }))
                            ]
                        }
                    ]
                })
            ]);
        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }

    private static spawnGetVariable(reactFlowInstance: ReactFlowInstance<Node, Edge>, entity: EntityPair, position: XYPosition): void {
        try {
            if (!entity.$ref) {
                return;
            }
            console.log(entity.$ref);
            console.log(entity.$ref);
            console.log(entity.$ref);
            console.log(entity.$ref);
            console.log(entity.$ref);
            console.log(entity.$ref);
            console.log(entity.$ref);
            console.log(entity.$ref);
            console.log(entity.$ref);
            const parsedPropertyRef = SchemaUtils.parseRef(entity.$ref);

            if (parsedPropertyRef.kind !== "schemaProperty") {
                return;
            }

            const schemas = store.getState().schemasSlice.schemas


            if (!schemas || !schemas[parsedPropertyRef.namespace]) {
                return undefined;
            }

            const parsed = schemas[parsedPropertyRef.namespace].parsed;
            if (!parsed || !parsed.components) {
                return undefined;
            }

            const components = parsed.components;
            if (!components.schemas) {
                return undefined;
            }

            const schema = components.schemas[parsedPropertyRef.schemaName];
            if (!schema) {
                return undefined;
            }

            if (!schema.properties) {
                return undefined;
            }

            const property = schema.properties[parsedPropertyRef.propertyName];

            if (!property) {
                return;
            }

            console.log(property);
            if (!property.$ref) {
                return;
            }

            const refNamespace = SchemaUtils.getNamespaceFromRef(property.$ref);
            const refSchemaName = SchemaUtils.getSchemaNameFromRef(property.$ref);

            if (!refNamespace || !refSchemaName) {
                return;
            }

            const outputHandleInfos: HandleInfo[] = [{
                name: property.title ?? "Title is not defined",
                instanceGuid: entity.$ref,
                description: undefined,
                required: false,
                example: undefined,
                namespace: refNamespace,
                schema: refSchemaName,
                isArray: false
            }];
            console.log("outputHandleInfos", outputHandleInfos);

            // Deselect all nodes
            reactFlowInstance.setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
            // Add new node
            reactFlowInstance.addNodes([
                NodeFactory.createReferenceableNode({
                    title: property.title ?? "Title is not defined",
                    refInstanceGuid: entity.$ref,
                    position: position,
                    operationType: entity.operationType,
                    schema: refSchemaName,
                    schemaRef: entity.$ref,
                    outputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: outputHandleInfos,
                            name: "",
                            applyVisuals: false,
                            color: "#ad0000ff",
                        }
                    ],
                    inputs: [],
                })
            ]);
        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }


    private static spawnGetProperty(reactFlowInstance: ReactFlowInstance<Node, Edge>, entity: EntityPair, position: XYPosition): void {
        try {

            console.log(entity);

            const inputHandleInfos: HandleInfo[] = [];
            const outputHandleInfos: HandleInfo[] = [];
            const metadata = entity.metadata as any;

            inputHandleInfos.push(
                {
                    name: "Owner",
                    instanceGuid: Guid.generateGUID(),
                    description: `Owner must be ${metadata.ownerNamespace}.${metadata.ownerSchema}`,
                    required: true,
                    example: undefined,
                    namespace: metadata.ownerNamespace,
                    schema: metadata.ownerSchema,
                    isArray: false,
                }
            );
            metadata.inputParameters.forEach((p: any) => {
                inputHandleInfos.push({
                    name: p.name,
                    instanceGuid: Guid.generateGUID(),
                    description: undefined,
                    required: false,
                    example: undefined,
                    namespace: "System",
                    schema: metadata.$ref,
                    isArray: false
                });
            });


            console.log(metadata);
            metadata.outputParameters.forEach((p: any) => {
                outputHandleInfos.push({
                    name: p.name,
                    instanceGuid: Guid.generateGUID(),
                    description: undefined,
                    required: false,
                    example: undefined,
                    namespace: "System",
                    schema: p.$ref,
                    isArray: false
                });
            });
            // const outputHandleInfos: HandleInfo[] = [{
            //     name: variable.name,
            //     instanceGuid: variable.instanceGuid,
            //     description: undefined,
            //     required: false,
            //     example: undefined,
            //     namespace: variable.namespace,
            //     schema: variable.schema,
            //     isArray: false
            // }];

            // Deselect all nodes
            reactFlowInstance.setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
            // Add new node
            reactFlowInstance.addNodes([
                NodeFactory.createExecutableNode({
                    title: entity.name,
                    refInstanceGuid: "variable.instanceGuid",
                    position: position,
                    operationType: entity.operationType,
                    schemaRef: "",
                    outputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: outputHandleInfos,
                            name: "",
                            applyVisuals: false,
                            color: "#ad0000ff",
                        }
                    ],
                    inputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: inputHandleInfos,
                            name: "",
                            applyVisuals: false,
                            color: "#ad0000ff",
                        }
                    ],
                })
            ]);
        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }

    private static spawnPropertyFunction(reactFlowInstance: ReactFlowInstance<Node, Edge>, entity: EntityPair, position: XYPosition): void {
        try {
            const metadata = entity.metadata as NodeMetadata;
            if (!metadata) {
                return undefined;
            }
            const inputHandleInfos: HandleInfo[] = [];
            const outputHandleInfos: HandleInfo[] = [
                {
                    name: "",
                    instanceGuid: Guid.generateGUID(),
                    description: undefined,
                    required: false,
                    example: undefined,
                    namespace: "Flow",
                    schema: "flowOutput",
                    isArray: false,
                },
            ];

            metadata.inputParameters.forEach((parameter) => {
                if (parameter.$ref) {
                    const namespace = SchemaUtils.getNamespaceFromRef(parameter.$ref)
                    const schema = SchemaUtils.getSchemaNameFromRef(parameter.$ref)
                    if (namespace && schema) {
                        inputHandleInfos.push({
                            name: parameter.name,
                            instanceGuid: Guid.generateGUID(),
                            description: undefined,
                            required: parameter.required ?? false,
                            example: undefined,
                            namespace,
                            schema,
                            isArray: false,
                        });
                    }
                    else {
                        console.error("Couldn't create input parameter. Schema or Namespace is undefined.");
                    }
                }
                else {
                    console.warn("Couldn't create input parameter. Parameter doesn't contain ref.");
                }
            });

            metadata.outputParameters.forEach((parameter) => {
                if (parameter.$ref) {
                    const namespace = SchemaUtils.getNamespaceFromRef(parameter.$ref)
                    const schema = SchemaUtils.getSchemaNameFromRef(parameter.$ref)
                    if (namespace && schema) {
                        outputHandleInfos.push({
                            name: schema,
                            instanceGuid: Guid.generateGUID(),
                            description: undefined,
                            required: parameter.required ?? false,
                            example: undefined,
                            namespace,
                            schema,
                            isArray: false,
                        });
                    }
                    else {
                        console.error("Couldn't create output parameter. Schema or Namespace is undefined.");
                    }
                }
                else {
                    console.warn("Couldn't create output parameter. Parameter doesn't contain ref.");
                }
            });

            // Deselect all nodes
            reactFlowInstance.setNodes((nodes) =>
                nodes.map((node) => ({ ...node, selected: false }))
            );

            // Add new node
            reactFlowInstance.addNodes([
                NodeFactory.createExecutableNode({
                    title: entity.name,
                    position: position,
                    operationType: entity.operationType,
                    comment: metadata.tooltip,
                    schemaRef: "",
                    inputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: [
                                {
                                    name: "",
                                    instanceGuid: Guid.generateGUID(),
                                    description: undefined,
                                    required: false,
                                    example: undefined,
                                    namespace: "Flow",
                                    schema: "flowInput",
                                    isArray: false,
                                }
                            ],
                            name: "",
                            applyVisuals: false,
                            color: "#ffffff",
                        },
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: [
                                {
                                    name: "Owner",
                                    instanceGuid: Guid.generateGUID(),
                                    description: `Owner must be ${metadata.ownerNamespace}.${metadata.ownerSchema}`,
                                    required: true,
                                    example: `Owner must be ${metadata.ownerNamespace}.${metadata.ownerSchema}`,
                                    namespace: metadata.ownerNamespace,
                                    schema: metadata.ownerSchema,
                                    isArray: false,
                                }
                            ],
                            name: "",
                            applyVisuals: true,
                            color: "rgba(107, 114, 128, 0.3)"
                        },
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: inputHandleInfos,
                            name: "",
                            applyVisuals: false,
                            color: "#ffffff",
                        },
                    ],
                    outputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: outputHandleInfos,
                            name: "",
                            applyVisuals: false,
                            color: "#ad0000ff",
                        },
                    ],
                }),
            ]);
        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }


    private static spawnSetVariable(reactFlowInstance: ReactFlowInstance<Node, Edge>, entity: EntityPair, position: XYPosition): void {
        try {
            if (!entity.$ref) {
                return;
            }
            const parts = entity.$ref.split(".");
            if (!parts) {
                return;
            }

            if (parts.length !== 3) {
                return;
            }

            const [namespace, schemaName, propertyName] = parts;
            const schemas = store.getState().schemasSlice.schemas


            if (!schemas || !schemas[namespace]) {
                return undefined;
            }

            const parsed = schemas[namespace].parsed;
            if (!parsed || !parsed.components) {
                return undefined;
            }

            const components = parsed.components;
            if (!components.schemas) {
                return undefined;
            }

            const schema = components.schemas[schemaName];
            if (!schema) {
                return undefined;
            }

            if (!schema.properties) {
                return undefined;
            }

            const property = schema.properties[propertyName];

            if (!property) {
                return;
            }

            if (!property.$ref) {
                return;
            }

            const refNamespace = SchemaUtils.getNamespaceFromRef(property.$ref);
            const refSchemaName = SchemaUtils.getSchemaNameFromRef(property.$ref);

            if (!refNamespace || !refSchemaName) {
                return;
            }

            const inputHandleInfos: HandleInfo[] = [{ name: "", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "Flow", schema: "flowInput", isArray: false }];
            const outputHandleInfos: HandleInfo[] = [{ name: "", instanceGuid: Guid.generateGUID(), description: undefined, required: false, example: undefined, namespace: "Flow", schema: "flowOutput", isArray: false }];


            inputHandleInfos.push(
                {
                    name: property.title ?? "Title is not defined",
                    instanceGuid: entity.$ref,
                    description: undefined,
                    required: true,
                    example: undefined,
                    namespace: refNamespace,
                    schema: refSchemaName,
                    isArray: false
                });

            reactFlowInstance.setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
            reactFlowInstance.addNodes([
                NodeFactory.createExecutableNode({
                    title: `Set ${property.title ?? "Title is undefined."} `,
                    position: position,
                    operationType: entity.operationType,
                    comment: `Set '${property.title ?? "Title is undefined."}' variable value.`,
                    schemaRef: "",
                    inputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: inputHandleInfos,
                            name: "",
                            applyVisuals: false,
                            color: "#ffffff",
                        }
                    ],
                    outputs: [
                        {
                            instanceGuid: Guid.generateGUID(),
                            handles: outputHandleInfos,
                            name: "",
                            applyVisuals: false,
                            color: "#ad0000ff",
                        }
                    ],
                })
            ]);
        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }

    static spawnNewNode(reactFlowInstance: ReactFlowInstance<Node, Edge>, entity: EntityPair, position: XYPosition): void {
        try {
            switch (entity.operationType) {
                case ENodeOperationType.GRID: this.spawnGridNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.GRID_INPUT: return;
                case ENodeOperationType.GRID_OUTPUT: return;
                case ENodeOperationType.REST_DELETE: this.spawnRestOperationNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.REST_GET: this.spawnRestOperationNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.REST_HEAD: this.spawnRestOperationNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.REST_OPTIONS: this.spawnRestOperationNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.REST_PATCH: this.spawnRestOperationNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.REST_POST: this.spawnRestOperationNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.REST_PUT: this.spawnRestOperationNode(reactFlowInstance, entity, position); return;
                case ENodeOperationType.REST_RESPONSE_STATUS_SWITCH: return;
                case ENodeOperationType.PROPERTY_FUNCTION: this.spawnPropertyFunction(reactFlowInstance, entity, position); return;
                case ENodeOperationType.GET_VARIABLE: this.spawnGetVariable(reactFlowInstance, entity, position); return;
                case ENodeOperationType.SET_VARIABLE: this.spawnSetVariable(reactFlowInstance, entity, position); return;
                case ENodeOperationType.GET_PROPERTY: this.spawnGetProperty(reactFlowInstance, entity, position); return;
                case ENodeOperationType.SET_PROPERTY: this.spawnSetVariable(reactFlowInstance, entity, position); return;
                default: throw new Error(`Operation type '${ENodeOperationType[entity.operationType]}' is not implemented`);
            }
        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }
}
import { createAsyncThunk } from "@reduxjs/toolkit";
import { projectSlice } from "./projectSlice";
import { RootState } from "../../store";
import { makeSelectMethodByRef, SchemaUtils, WirePlotMethodOverload } from "../schemas";
import { NodeFactory } from "../../Helpers/NodeFactory";
import { ENodeOperationType } from "../../Nodes/types";
import { Guid } from "../../Helpers/Guid";


export const loadMockProject = createAsyncThunk(
    "project/loadMockProject",
    async (_, { dispatch, getState }) => {

        const state = getState() as RootState;

        const methodRefs: string[] = [];

        // Loop all namespaces (each corresponds to one loaded schema file)
        for (const namespace of Object.keys(state.schemasSlice.schemas)) {

            const container = state.schemasSlice.schemas[namespace];

            // Only process schemas that are marked as flow-capable
            if (!container.flowCapable || !container.parsed) {
                continue;
            }

            const schemasObj = container.parsed.components?.schemas;
            if (!schemasObj) {
                continue;
            }

            // Iterate through schema definitions inside this namespace
            for (const schemaKey of Object.keys(schemasObj)) {
                const schema = schemasObj[schemaKey];

                const methods = schema["x-methods"];
                if (!methods) {
                    continue;
                }

                // Get all method names inside x-methods
                for (const methodName of Object.keys(methods)) {
                    const method = methods[methodName];

                    // Each method may have multiple overloads
                    for (const overloadId of Object.keys(method.overloads)) {

                        const fullRef =
                            `${namespace}#/components/schemas/${schemaKey}/x-methods/${methodName}/overloads/${overloadId}`;

                        methodRefs.push(fullRef);
                    }
                }
            }
        }

        let firstGridId: string | undefined = undefined;

        for (const ref of methodRefs) {

            const method: WirePlotMethodOverload | undefined = makeSelectMethodByRef(ref)(state);
            if (!method) {
                console.warn("Method not found for ref:", ref);
                continue;
            }

            //
            // -----------------------------------
            // INLINE GRID GENERATION STARTS HERE
            // -----------------------------------
            //

            // 1) INPUT NODE
            const inputNode = NodeFactory.createExecutableNode({
                title: method.name ?? "Input",
                position: { x: 0, y: 0 },
                operationType: ENodeOperationType.GRID_INPUT,
                comment: "Function entry point",
                deletable: false,
                selected: false,
                schemaRef: ref,
                inputs: [],
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
                                instanceGuid: "4a9f2c1d-6e8b-4f73-9c5a-7d0e3b1a8f62",
                                description: undefined,
                                required: false,
                                example: undefined,
                                namespace: "Flow",
                                schema: "flowOutput",
                                isArray: false,
                            },
                            // --- PARAMETER HANDLES ---
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
                ]
            });

            // 2) OUTPUT NODE
            const outputNode = NodeFactory.createExecutableNode({
                title: "Return",
                position: { x: 700, y: 0 },
                operationType: ENodeOperationType.GRID_OUTPUT,
                comment: "Unified function return",
                deletable: false,
                selected: false,
                schemaRef: ref + "/signature/return",
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
                                instanceGuid: "e1c7b6a4-9d2f-4a83-b5c1-0f8e6d3a2b94",
                                description: undefined,
                                required: false,
                                example: undefined,
                                namespace: "Flow",
                                schema: "flowInput",
                                isArray: false
                            },
                            // --- RETURN HANDLE ---
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
                ],
                outputs: []
            });

            // 3) GRID OBJECT
            const grid = {
                instanceGuid: Guid.generateGUID(),
                methodRef: ref,
                inputNodeInstanceGuid: inputNode.id,
                outputNodeInstanceGuid: outputNode.id,
                reactFlowJsonObject: {
                    nodes: [inputNode, outputNode],
                    edges: [],
                    viewport: { x: 50, y: 200, zoom: 1 }
                }
            };

            //
            // -----------------------------------
            // INLINE GRID GENERATION ENDS HERE
            // -----------------------------------
            //

            dispatch(projectSlice.actions.addGrid(grid));
            if (!firstGridId) {
                firstGridId = grid.instanceGuid;
            }
        }

        dispatch(projectSlice.actions.setActiveGridInstanceGuid("Project#/components/schemas/Program/x-methods/Main/overloads/a13f94bd"));

        if (firstGridId) {
            dispatch(projectSlice.actions.setActiveGridInstanceGuid(firstGridId));
        }
    }
);

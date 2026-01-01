import { CSSProperties } from "react";
import { HandleGroup } from "../Models/HandleGroups";
import { ENodeOperationType, ExecutableNodeProps, ReferenceableNodeProps } from "../Nodes/types";
import { ColorHelper } from "./ColorHelper";
import { Guid } from "./Guid";

interface CreateExecutableNodeOptions {
    title: string;
    position: { x: number; y: number };
    operationType: ENodeOperationType;
    comment?: string;
    refInstanceGuid?: string;
    schemaRef: string;
    displayNodeCommentsVisible?: boolean;
    inputs?: HandleGroup[];
    outputs?: HandleGroup[];
    id?: string;
    deletable?: boolean;
    selected?: boolean;
}

interface CreateReferenceableNodePropsOptions {
    title: string;
    position: { x: number; y: number };
    operationType: ENodeOperationType;
    schema: string,
    refInstanceGuid?: string;
    schemaRef: string;
    outputs?: HandleGroup[];
    inputs?: HandleGroup[];
    id?: string;
    deletable?: boolean;
    selected?: boolean;
}

export class NodeFactory {
    private static getStyleForOperationType(operationType: ENodeOperationType): CSSProperties {
        if (operationType === ENodeOperationType.GRID_INPUT || operationType === ENodeOperationType.GRID_OUTPUT) {
            return {
                backgroundColor: "#030014DA",
                border: "1px solid black",
                minWidth: 120,
                minHeight: 70,
                borderRadius: 5,
            };
        } else {
            return {
                backgroundColor: "#030014DA",
                border: "1px solid black",
                minWidth: 240,
                minHeight: 120,
                borderRadius: 5,
            };
        }
    }

    static createExecutableNode(options: CreateExecutableNodeOptions): ExecutableNodeProps {
        const {
            title,
            position,
            refInstanceGuid,
            operationType,
            schemaRef,
            comment = "",
            displayNodeCommentsVisible = true,
            inputs = [],
            outputs = [],
            deletable = true,
            selected = true,
        } = options;

        return {
            id: Guid.generateGUID(),
            type: "Executable",
            deletable,
            selected,
            position,
            style: this.getStyleForOperationType(operationType),
            data: {
                operationType,
                title,
                refInstanceGuid,
                schemaRef,
                toolbox: {
                    enabled: true,
                    visible: displayNodeCommentsVisible,
                },
                comment,
                inputs,
                outputs,
            }
        };
    }

    static createReferenceableNode(options: CreateReferenceableNodePropsOptions): ReferenceableNodeProps {
        const {
            title,
            position,
            schema,
            schemaRef,
            refInstanceGuid,
            operationType,
            outputs = [],
            inputs = [],
            deletable = true,
            selected = true,
        } = options;

        return {
            id: Guid.generateGUID(),
            type: "Referenceable",
            deletable,
            selected,
            position,
            style: {
                backgroundColor: "#030014DA",
                borderRadius: 5,
                minWidth: 100,
                border: `1px solid ${ColorHelper.getColorForSchema(schema)}`,
            },
            data: {
                operationType,
                title,
                schemaRef,
                refInstanceGuid,
                outputs,
                inputs,
            }
        };
    }
}

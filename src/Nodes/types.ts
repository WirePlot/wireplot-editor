import { Node } from '@xyflow/react';
import { HandleGroup } from '../Models/HandleGroups';
import './ExecutableNode.css'

export enum ENodeOperationType {
    REST_GET,
    REST_POST,
    REST_PUT,
    REST_DELETE,
    REST_PATCH,
    REST_OPTIONS,
    REST_HEAD,
    REST_RESPONSE_STATUS_SWITCH,
    GRID,
    GRID_INPUT,
    GRID_OUTPUT,
    VARIABLE,
    PROPERTY_FUNCTION,
    GET_VARIABLE,
    SET_VARIABLE,
    GET_PROPERTY,
    SET_PROPERTY,
    UNKNOWN,
    NONE
}

export type ExecutableNodeProps = Node<
    {
        id?: string,
        operationType: ENodeOperationType;
        refInstanceGuid?: string;
        schemaRef: string;
        comment: string;
        title: string;
        inputs: HandleGroup[];
        outputs: HandleGroup[];
        toolbox: {
            enabled: boolean; // local
            visible: boolean; // global
        };
    },
    'Executable'
>;

export type ReferenceableNodeProps = Node<
    {
        id?: string,
        operationType: ENodeOperationType;
        refInstanceGuid?: string;
        title: string;
        outputs: HandleGroup[];
        inputs: HandleGroup[];
    },
    'Referenceable'
>;
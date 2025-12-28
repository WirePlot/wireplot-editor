import { NodeProps } from "@xyflow/react";
import { ReferenceableNodeProps } from "./types";
import { NodeBuilderHelper } from "../Helpers/NodeBuilderHelper";
import { JSX, useMemo } from "react";
import './ReferenceableNode.css'

export default function ReferenceNode(props: NodeProps<ReferenceableNodeProps>): JSX.Element {
    const { leftSideElements, rightSideElements } = useMemo(() => {
        console.warn("RERENDERING ReferenceNode NODES?");
        return {
            leftSideElements: NodeBuilderHelper.GenerateHandles(props.data.inputs, true),
            rightSideElements: NodeBuilderHelper.GenerateHandles(props.data.outputs, false),
        };
    }, [props.data.inputs, props.data.outputs]);

    return (
        <>
            <div className='node-body'>
                <div key='left-side'>
                    {leftSideElements}
                </div>
                <div key='right-side'>
                    {rightSideElements}
                </div>
            </div>
        </>
    );
};

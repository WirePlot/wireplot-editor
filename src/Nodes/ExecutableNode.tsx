import { NodeProps, NodeToolbar, Position } from '@xyflow/react';
import { JSX, useMemo } from 'react';
import { NodeBuilderHelper } from '../Helpers/NodeBuilderHelper';
import { ExecutableNodeProps } from './types';
import { IconHelper } from '../Helpers/IconHelper';
import './ExecutableNode.css'




export default function ExecutableNode(props: NodeProps<ExecutableNodeProps>): JSX.Element {
    const { leftSideElements, rightSideElements, icon } = useMemo(() => {
        console.log("RERENDERING ExecutableNode NODES?");
        console.log("props.data.inputs", props.data.inputs);
        return {
            leftSideElements: NodeBuilderHelper.GenerateHandles(props.data.inputs, true),
            rightSideElements: NodeBuilderHelper.GenerateHandles(props.data.outputs, false),
            icon: IconHelper.getOperationIcon(props.data.operationType),
        };
    }, [props.data.inputs, props.data.outputs, props.data.operationType]);

    return (
        <>
            <NodeToolbar isVisible={props.data.toolbox.visible && props.data.toolbox.enabled} position={Position.Top} className='node-toolbar'>
                {props.data.comment}
            </NodeToolbar >
            <div className='node-header'>
                {icon &&
                    <div>
                        {icon}
                    </div>
                }
                <div className='node-title'>
                    {props.data.title}
                </div>
            </div>
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
}
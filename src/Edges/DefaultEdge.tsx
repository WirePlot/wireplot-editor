import { getSmoothStepPath } from '@xyflow/react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { JSX } from 'react';

export default function DefaultEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }: EdgeProps): JSX.Element {
    const [edgePath] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });


    console.log(data);

    return (
        <BaseEdge
            className=''
            path={edgePath}
            markerEnd={markerEnd}
        />
    );
}



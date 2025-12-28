// import SvgLabelString from '../Icons/SvgIcons/SvgLabelString';
// import SvgLabelObject from '../Icons/SvgIcons/SvgLabelObject';
// import SvgLabelInteger from '../Icons/SvgIcons/SvgLabelInteger';
// import SvgLabelBoolean from '../Icons/SvgIcons/SvgLabelBoolean';
// import SvgLabelNumber from '../Icons/SvgIcons/SvgLabelNumber';
import SvgHttpMethodNode from '../Icons/SvgIcons/SvgHttpMethodNode';
import { ENodeOperationType } from '../Nodes/types';
import { ColorHelper } from './ColorHelper';
import { NodeUtils } from '../Nodes/nodeUtils';
import { JSX } from 'react';
import SvgLabel from '../Icons/SvgIcons/SvgLabel';

export class IconHelper {
    public static getSchemaIcon(type: string): JSX.Element {
        return <SvgLabel type={type} />
        // switch (type) {
        //     case 'string': return <SvgLabelString />;
        //     case 'number': return <SvgLabelNumber />;
        //     case 'integer': return <SvgLabelInteger />;
        //     case 'boolean': return <SvgLabelBoolean />;
        //     default: return <SvgLabelObject />;
        // }
    }

    public static getOperationIcon(operation: ENodeOperationType): JSX.Element | null {
        const iconLabel = NodeUtils.getNodeOperationLabel(operation);
        return iconLabel ? <SvgHttpMethodNode label={iconLabel} color={ColorHelper.getRestOperationColor(operation)} /> : null;
    }
}
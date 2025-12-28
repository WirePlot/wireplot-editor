import React from 'react';
import { ColorHelper } from '../../Helpers/ColorHelper';

const SvgLabel: React.FC<{ type: string }> = ({type}) => (
    <svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0px 4px 0px 4px', borderRadius: '5px', background: 'transparent', backgroundColor: ColorHelper.getColorForSchema(type) }}>
        <rect width="18" height="28" rx="5" y="-10" />
    </svg>
);

export default SvgLabel;

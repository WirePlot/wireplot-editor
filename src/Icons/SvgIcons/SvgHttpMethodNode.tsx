import React from 'react';

interface Props {
    label: string;
    color: string;
    width?: number;
    height?: number;
}

const SvgHttpMethodNode: React.FC<Props> = ({ label, color, width = 60, height = 20 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ margin: '0px 4px' }}
        >
            <rect width={width} height={height} rx="4" fill={color} />
            <text
                x={width / 2}
                y={height / 2 + 2}
                fontWeight="650"
                fill="rgb(33, 37, 41)"
                textAnchor="middle"
                alignmentBaseline="middle">
                {label}
            </text>
        </svg>
    );
};

export default SvgHttpMethodNode;

import React from 'react';

interface Props {
    method: string;
    width?: number;
    height?: number;
}

const methodColors: Record<string, string> = {
    GET: '#61affe',
    POST: '#49cc90',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#50e3c2',
    OPTIONS: '#0d5aa7',
    HEAD: '#9012fe',
};

const SvgHttpMethod: React.FC<Props> = ({ method, width = 20, height = 20 }) => {
    const color = methodColors[method] || '#999';
    console.log("GETTING SVG");
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
                {method.charAt(0)}
            </text>
        </svg>
    );
};

export default SvgHttpMethod;

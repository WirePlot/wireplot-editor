import React from 'react';

const SvgArray: React.FC<{ width?: string | number; height?: string | number }> = ({ width = '100%', height = '100%' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={width}
        height={height}
        fill="currentColor"
    >
        <circle cx="6" cy="6" r="2" fill="currentColor"/>
        <circle cx="12" cy="6" r="2" fill="currentColor"/>
        <circle cx="18" cy="6" r="2" fill="currentColor" />

        <circle cx="6" cy="12" r="2" fill="currentColor"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <circle cx="18" cy="12" r="2" fill="currentColor"/>

        <circle cx="6" cy="18" r="2" fill="currentColor"/>
        <circle cx="12" cy="18" r="2" fill="currentColor"/>
        <circle cx="18" cy="18" r="2" fill="currentColor"/>
    </svg>
);

export default SvgArray;

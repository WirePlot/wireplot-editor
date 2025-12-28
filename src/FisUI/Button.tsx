import React from 'react';
import './Button.css';

interface ButtonProps {
    label: string;
    tooltip?: string;
    onClick: () => void;
    onMouseOver?: () => void;
    onMouseOut?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ label, tooltip, onClick, onMouseOver, onMouseOut, onFocus, onBlur, style }) => {
    return (
        <button
            title={tooltip}
            data-toggle="tooltip"
            data-placement="top"
            style={style}
            className="button"
            onClick={(event) => {
                event.stopPropagation();
                onClick();

            }}
            onFocus={() => { if (onFocus) { onFocus(); } }}
            onBlur={() => { if (onBlur) { onBlur(); } }}
            onMouseOver={() => { if (onMouseOver) { onMouseOver(); } }}
            onMouseOut={() => { if (onMouseOut) { onMouseOut(); } }}
        >{label}</button>
    );
};


import { DragEvent, MouseEvent, FC, useState } from 'react';

interface DataTypeButtonProps {
    label: string;
    applyBrighterBackgroundColor: boolean;
    isBlurredButSelected: boolean;
    instanceGuid: string;
    iconColor: string;
    isDraggable?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onFocus: () => void;
    onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
}


export const DataTypeButton: FC<DataTypeButtonProps> = ({ label, applyBrighterBackgroundColor, isBlurredButSelected, instanceGuid, iconColor, isDraggable, onClick, onFocus, onDragStart }) => {
    const [isHovered, setHovered] = useState(false);

    const background = isHovered ? 'var(--background-color-hover)' : isBlurredButSelected ? 'var(--background-color-blurred-but-selected)' : applyBrighterBackgroundColor ? 'var(--background-color-brighter)' : 'var(--background-color-darker)';

    return (
        <button
            key={instanceGuid}
            style={{
                width: '100%',
                color: 'var(--font-color)',
                fontSize: 'var(--font-size)',
                padding: '2px 2px',
                textDecoration: 'none',
                display: 'block',
                background: background,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}
            onFocus={() => { onFocus(); }}
            onMouseOver={() => setHovered(true)}
            onMouseOut={() => setHovered(false)}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onClick={(event) => {
                event.stopPropagation();
                if (onClick) {
                    onClick(event);
                }
            }}
        >
            <svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0px 4px 4px 4px', borderRadius: '5px', background: 'transparent', backgroundColor: iconColor }}>
                <rect width="18" height="28" rx="5" y="-10" />
            </svg>
            {label}
        </button>
    );
};
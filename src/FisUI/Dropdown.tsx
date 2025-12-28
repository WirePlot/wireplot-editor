import React, { useState, useRef, useEffect, useMemo, ReactNode } from 'react';
import './Dropdown.css';

export interface DropdownOption {
    label: string;
    tooltip: string;
    enabled: boolean;
    instanceGuid: string;
    onClick: () => void;
    icon?: ReactNode;
}

type DropdownDirection = "LEFT" | "RIGHT";


export interface DropdownProps {
    options: DropdownOption[];
    applyBrighterBackgroundColor: boolean;
    direction: DropdownDirection;
}

export const Dropdown: React.FC<DropdownProps> = ({ options, direction, applyBrighterBackgroundColor }) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [isFocused, setFocused] = useState(false);
    const [isHovered, setHovered] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownMenuRef = useRef<HTMLDivElement>(null);

    const background = useMemo(() => {
        if (isHovered) {
            return 'var(--background-color-hover)';
        }
        if (isFocused) {
            return 'var(--background-color-focused)';
        }
        return applyBrighterBackgroundColor ? 'var(--background-color-brighter)' : 'var(--background-color-darker)';
    }, [isHovered, isFocused, applyBrighterBackgroundColor]);

    const toggleDropdown = (): void => setDropdownVisible(!isDropdownVisible);

    const handleClickOutside = (event: MouseEvent): void => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return (): void => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (dropdownMenuRef.current) {
            if (direction === "RIGHT") {
                dropdownMenuRef.current.style.left = "2px";
                dropdownMenuRef.current.style.right = "auto";
            } else {
                dropdownMenuRef.current.style.right = "2px";
                dropdownMenuRef.current.style.left = "auto";
            }
        }
    }, [isDropdownVisible]);

    return (
        <div ref={dropdownRef} className="dropdown-container">
            <button
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleDropdown();
                }}
                className="dropdown-button"
                style={{ background }}
            >
                <span className="dropdown-arrow"></span>
            </button>
            {isDropdownVisible && (
                <div ref={dropdownMenuRef} className="dropdown-menu">
                    {options.map((option) => (
                        <button
                            className={option.enabled ? 'dropdown-option' : 'dropdown-option-disabled'}
                            title={option.tooltip}
                            key={option.instanceGuid}
                            style={{ cursor: option.enabled ? 'pointer' : 'not-allowed' }}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                if (option.enabled) {
                                    option.onClick();
                                    toggleDropdown();
                                    setHovered(false);
                                    setFocused(false);
                                }
                            }}
                        >
                            {option.icon && <span className="dropdown-icon">{option.icon}</span>}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
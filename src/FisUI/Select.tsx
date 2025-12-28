import './Select.css';
import SvgDownArrow from '../Icons/SvgIcons/SvgDownArrow';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
    key: string;
    value: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

export interface SelectProps {
    options: SelectOption[];
    selected: string;
    onChange?: (value: string) => void;
    style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({ options, selected, onChange, style }) => {
    const [selectedOption, setSelectedOption] = useState(options.find(opt => opt.value === selected));
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedOption(options.find(opt => opt.value === selected));
    }, [selected, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current?.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return (): void => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openDropdown = (): void => {
        if (!buttonRef.current) {
            return;
        }
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
        });
        setDropdownOpen(true);
    };

    // After dropdown render, adjust the position if is overflowing out of the window
    useLayoutEffect(() => {
        if (dropdownOpen && dropdownRef.current && buttonRef.current && dropdownPosition) {
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            const buttonRect = buttonRef.current.getBoundingClientRect();

            let left = dropdownPosition.left;
            let top = dropdownPosition.top;
            const width = dropdownPosition.width;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left + dropdownRect.width > viewportWidth) {
                left = Math.max(0, viewportWidth - dropdownRect.width);
            }

            if (top + dropdownRect.height > viewportHeight) {
                top = buttonRect.top + window.scrollY - dropdownRect.height;
                if (top < 0) {
                    top = 0;
                }
            }

            if (left !== dropdownPosition.left || top !== dropdownPosition.top) {
                setDropdownPosition({ top, left, width });
            }
        }
    }, [dropdownOpen, dropdownPosition]);

    const toggleDropdown = (): void => {
        if (dropdownOpen) {
            setDropdownOpen(false);
        }
        else {
            openDropdown();
        }
    };

    const handleSelect = (option: SelectOption): void => {
        setSelectedOption(option);
        setDropdownOpen(false);
        onChange?.(option.value);
        option.onClick?.();
    };

    return (
        <>
            <div
                ref={buttonRef}
                className="custom-select"
                style={style}
                onClick={toggleDropdown}
            >
                <div className="select-selected" style={{ display: 'flex', justifyContent: 'space-between', maxHeight: 'inherit', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        {selectedOption?.icon}
                        {selectedOption?.label ?? 'Select an option'}
                    </div>
                    <SvgDownArrow />
                </div>
            </div>

            {dropdownOpen && dropdownPosition && createPortal(
                <div
                    ref={dropdownRef}
                    className="select-items"
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        zIndex: 9999,
                        maxHeight: '300px',
                        overflowY: 'auto',
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.key}
                            onClick={() => handleSelect(option)}
                            onMouseDown={e => e.preventDefault()}
                        >
                            {option.icon}
                            {option.label}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};
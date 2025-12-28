import { useEffect, useMemo, useRef, useState, useLayoutEffect, CSSProperties, FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import SvgDownArrow from '../Icons/SvgIcons/SvgDownArrow';
import './SelectWithCategories.css';
import SvgChevronDown from '../Icons/SvgIcons/SvgChevronDown';
import SvgChevronRight from '../Icons/SvgIcons/SvgChevronRight';

export interface SelectWithCategoriesOption {
    key: string;
    value: string;
    label: string;
    category: string;
    icon?: ReactNode;
    onClick?: () => void;
}

export interface SelectWithCategoriesOptionGroup {
    label: string;
    options: SelectWithCategoriesOption[];
}

export interface SelectWithCategoriesProps {
    groups: SelectWithCategoriesOptionGroup[];
    selected: string;
    onChange?: (value: SelectWithCategoriesOption) => void;
    style?: CSSProperties;
}

export const SelectWithCategories: FC<SelectWithCategoriesProps> = ({
    groups,
    selected,
    onChange,
    style,
}) => {
    const [selectedOption, setSelectedOption] = useState<SelectWithCategoriesOption | undefined>(() => {
        for (const group of groups) {
            const found = group.options.find(o => o.value === selected);
            if (found) {
                return found;
            }
        }
        return undefined;
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    const anchorRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const openDropdown = (): void => {
        if (!anchorRef.current) {
            return;
        }
        const rect = anchorRef.current.getBoundingClientRect();
        setDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
        });
        setDropdownOpen(true);
    };

    const toggleDropdown = (): void => {
        dropdownOpen ? setDropdownOpen(false) : openDropdown();
    };

    useLayoutEffect(() => {
        if (dropdownOpen && dropdownRef.current && dropdownPosition && anchorRef.current) {
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            const anchorRect = anchorRef.current.getBoundingClientRect();

            let left = dropdownPosition.left;
            let top = dropdownPosition.top;

            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (left + dropdownRect.width > vw) {
                left = Math.max(0, vw - dropdownRect.width);
            }

            if (top + dropdownRect.height > vh) {
                top = anchorRect.top + window.scrollY - dropdownRect.height;
                if (top < 0) {
                    top = 0;
                }
            }

            if (left !== dropdownPosition.left || top !== dropdownPosition.top) {
                setDropdownPosition({ top, left, width: dropdownPosition.width });
            }
        }
    }, [dropdownOpen, dropdownPosition]);

    const handleClickOutside = (e: MouseEvent): void => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(e.target as Node) &&
            anchorRef.current &&
            !anchorRef.current.contains(e.target as Node)
        ) {
            setDropdownOpen(false);
            setSearchTerm('');
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return (): void => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: SelectWithCategoriesOption): void => {
        setSelectedOption(option);
        setDropdownOpen(false);
        setSearchTerm('');
        onChange?.(option);
        option.onClick?.();
    };

    const toggleGroup = (label: string): void => {
        setCollapsedGroups(prev => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) {
            return groups;
        }
        const lower = searchTerm.toLowerCase();
        return groups
            .map(group => ({
                ...group,
                options: group.options.filter(o => o.label.toLowerCase().includes(lower)),
            }))
            .filter(group => group.options.length > 0);
    }, [groups, searchTerm]);

    const dropdown = dropdownPosition && (
        <div
            ref={dropdownRef}
            className="select-with-categories-dropdown"
            style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
            }}
        >
            <div className="select-with-categories-search-wrapper">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="select-with-categories-search"
                />
            </div>

            <div className="select-with-categories-options" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {filteredGroups.length === 0 && (
                    <div className="select-with-categories-no-options" style={{ padding: 8 }}>
                        No options found
                    </div>
                )}

                {filteredGroups.map(group => (
                    <div key={group.label} className="select-with-categories-group">
                        <div
                            className="select-with-categories-group-label"
                            onClick={() => toggleGroup(group.label)}
                        >
                            <div
                                style={{ width: 16, marginRight: '4px', display: 'flex', justifyContent: 'center' }}
                            >
                                {collapsedGroups[group.label] ? <SvgChevronDown /> : <SvgChevronRight />}
                            </div>
                            {group.label}
                        </div>

                        {!collapsedGroups[group.label] && group.options.map(option => (
                            <div
                                key={option.key}
                                className={`select-with-categories-option${selectedOption?.value === option.value ? ' selected' : ''}`}
                                onClick={() => handleSelect(option)}
                                onMouseDown={e => e.preventDefault()}
                                style={{
                                    backgroundColor: selectedOption?.value === option.value ? 'var(--background-color-hover)' : undefined,
                                }}
                            >
                                {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <div
                ref={anchorRef}
                className="select-with-categories"
                style={style}
                onClick={toggleDropdown}
            >
                <div className="select-with-categories-selected">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        width: 'calc(100% - 24px)'
                    }}>
                        {selectedOption?.icon}
                        <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: 'calc(100% - 20px)'
                        }}>
                            {selectedOption?.label ?? 'Select an option'}
                        </div>
                    </div>
                    <SvgDownArrow />
                </div>
            </div >

            {dropdownOpen && dropdownPosition && createPortal(dropdown, document.body)}
        </>
    );
};

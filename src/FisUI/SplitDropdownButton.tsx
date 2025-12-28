import { FC, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks";
import Dropdown, { DropdownOption } from "./Dropdown";
import { Button } from "./Button";
import { selectActiveElement, setActiveElement } from "../redux/project";

export interface SplitDropdownButtonProps {
    label: string;
    tooltip?: string;
    instanceGuid: string;
    applyBrighterBackgroundColor: boolean;
    dropdownOption: DropdownOption[];
    onClick: () => void;
}


export const SplitDropdownButton: FC<SplitDropdownButtonProps> = ({ label, tooltip, instanceGuid, applyBrighterBackgroundColor, dropdownOption, onClick }) => {
    const dispatch = useDispatch();
    const [isFocused, setFocused] = useState(false);
    const [isHovered, setHovered] = useState(false);


    const isBlurredButSelected: boolean = useAppSelector((state) => {
        const activeElementInstanceGuid = selectActiveElement(state);
        if (activeElementInstanceGuid) {
            if (activeElementInstanceGuid.instanceGuid === instanceGuid) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    );

    // const background = isHovered ? 'var(--background-color-hover)' : isFocused ? 'var(--background-color-focused)' : isBlurredButSelected ? 'var(--background-color-blurred-but-selected)' : applyBrighterBackgroundColor ? 'var(--background-color-brighter)' : 'var(--background-color-darker)';
    const background = useMemo(() => {
        return isHovered ? 'var(--background-color-hover)' : isFocused ? 'var(--background-color-focused)' : isBlurredButSelected ? 'var(--background-color-blurred-but-selected)' : applyBrighterBackgroundColor ? 'var(--background-color-brighter)' : 'var(--background-color-darker)'
    }, [isHovered, isFocused, isBlurredButSelected, applyBrighterBackgroundColor]);


    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
                label={label}
                tooltip={tooltip}
                onClick={() => {
                    onClick(); setFocused(true);


                    dispatch(setActiveElement({ instanceGuid: instanceGuid, elementType: "gridButton" }));

                }}
                onFocus={() => { setFocused(true); /*onFocus();*/ }}
                onBlur={() => setFocused(false)}
                onMouseOut={() => setHovered(false)}
                onMouseOver={() => setHovered(true)}
                style={{
                    width: '100%',
                    color: 'var(--font-color)',
                    fontSize: 'var(--font-size)',
                    padding: '2px 2px',
                    textDecoration: 'none',
                    display: 'block',
                    background: background,
                    border: 'none',
                    borderRadius: 0,
                    outline: 'none',
                    paddingLeft: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}

            />
            <Dropdown options={dropdownOption} direction='LEFT' applyBrighterBackgroundColor={applyBrighterBackgroundColor} />
        </div >
    );
};


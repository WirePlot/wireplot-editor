import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import './Input.css';

interface InputProps {
    instanceGuid: string;
    defaultValue: string;
    disabled?: boolean;
    isFocused?: boolean;

    onBlur?: (value: string) => void;
    style?: CSSProperties;
}


export const Input: FC<InputProps> = ({ instanceGuid, defaultValue, disabled, isFocused, onBlur, style }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <input
            ref={inputRef}
            className="input"
            key={`${instanceGuid}-${defaultValue}`}
            style={{ ...style, width: `calc(100% - 8px)` }}
            value={value}
            disabled={disabled}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    const inputValue = (event.target as HTMLInputElement).value;
                    console.log(inputValue);
                    if (onBlur) {
                        onBlur(inputValue);
                    }
                }
            }}
            onChange={e => setValue(e.target.value)}
            onBlur={(event) => {
                if (onBlur) {
                    onBlur(event.target.value);
                }
            }}
        />
    );
};
import { CSSProperties, FC, ReactNode } from "react";
import './ButtonWithSvgIcon.css';


interface ButtonWithSvgIconProps {
    isFocused?: boolean;
    icon: ReactNode;
    tooltip: string;
    disabled?: boolean;
    style?: CSSProperties;
    onClick?: () => void;
}

export const ButtonWithSvgIcon: FC<ButtonWithSvgIconProps> = ({ icon, tooltip, disabled = false, style, onClick }) => {



    return (
        <button
            className={disabled ? "button-with-svg-icon-disabled" : "button-with-svg-icon"}
            title={tooltip}
            data-toggle="tooltip"
            data-placement="top"
            style={style}
            disabled={disabled}
            onClick={(event) => {
                event.stopPropagation();

                if (onClick) {
                    onClick();
                }
            }}
        >
            {icon}
        </button>
    );
};
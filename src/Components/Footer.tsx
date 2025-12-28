import { JSX, MouseEvent } from "react";
import { useDispatch } from "react-redux";
import { setActiveElement } from "../redux/project/projectSlice";

export const Footer = (): JSX.Element => {
    const dispatch = useDispatch();

    const handlePanelClick = (event: MouseEvent<HTMLDivElement>): void => {
        event.stopPropagation();
        dispatch(setActiveElement(undefined));
    };

    return (
        <div
            className="Footer"
            style={{
                height: "var(--footer-height)",
                padding: 0,
                margin: 0,
                color: 'white',
                borderTop: '1px solid gray',
                display: "grid",
                justifyItems: "stretch",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: '#171b1f',
            }}
            onClick={handlePanelClick}>
        </div>
    );
};
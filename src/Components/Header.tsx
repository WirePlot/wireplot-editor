import { selectProjectNameState, setActiveElement } from '../redux/project'
import { useAppSelector } from '../hooks'
import { useDispatch } from 'react-redux';
import { JSX, MouseEvent } from 'react';

export const Header = (): JSX.Element => {
    const projectName: string = useAppSelector((state) => selectProjectNameState(state));
    const dispatch = useDispatch();

    const handlePanelClick = (event: MouseEvent<HTMLDivElement>): void => {
        event.stopPropagation();
        dispatch(setActiveElement(undefined));
    };
    return (
        <div
            className="Header"
            style={{
                height: "50px",
                backgroundColor: '#171b1f',
                color: 'white',
                margin: 0,
                padding: 0
            }}
            onClick={handlePanelClick}>
            <span style={{
                color: "#171b1f",
                textShadow: '-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white',
                fontSize: "28px",
                fontWeight: 1000,
                paddingLeft: 15
            }}>
                {"Modeler"}
            </span>
            <span style={{
                color: "white",
                fontSize: "20px",
            }}>
                {" ->"}
            </span>
            <span style={{
                color: "white",
                fontSize: "20px",
            }}>
                {projectName}
            </span>
        </div>
    );
};
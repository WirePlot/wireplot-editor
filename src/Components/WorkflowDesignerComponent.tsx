import { GridRendererPanel } from './GridRendererPanel';
import { PropertiesPanel } from "./PropertiesPanel";
import { MouseEvent, CSSProperties, useCallback, useMemo, useState, JSX } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks";
import { selectWorkflowDesignerPanelWidths, setWorkflowDesignerPanelWidths } from "../redux/workflowDesigner";
import { EntityPanel } from "./EntityPanel";
import { SchemaUtils } from "../redux/schemas/schemasUtils";
import { selectActiveElement, setActiveElement } from "../redux/project";
import { GridManager } from "../Managers/GridManager";
import { useReactFlow } from "@xyflow/react";
import { showConfirmationDialog } from "../redux/confirmationDialog";
import { EntityPair } from "./EntityPanel/types";

import SvgGrid from "../Icons/SvgIcons/SvgGrids";
import SvgOpenFolder from "../Icons/SvgIcons/SvgOpenFolder";
import SvgEditPencil from "../Icons/SvgIcons/SvgEditPencil";
import SvgDeleteBin from "../Icons/SvgIcons/SvgDeleteBin";
import SvgDataType from "../Icons/SvgIcons/SvgDataType";
import { TestEntityTreePage } from './TestEntityTreePage';
import { addSchemaProperty, makeSelectSchemaMethodsAsEntityPairs, renameSchemaProperty, selectSchemaPropertiesAsEntityPairs } from '../redux/schemas';

const panelResizingHandleStyle = {
    width: '6px',
    height: 'calc(100vh - var(--header-height) - var(--footer-height))',
    cursor: 'ew-resize',
    transition: 'background-color 0.3s',
    backgroundColor: '#ccc'
} as CSSProperties;


export const WorkflowDesignerComponent = (): JSX.Element => {
    const dispatch = useDispatch();
    const reactFlow = useReactFlow();

    const selectedNamespace: string = "Project";
    const selectedSchema: string = "Program";


    const initialWidths: number[] = useAppSelector((state) => selectWorkflowDesignerPanelWidths(state));
    const [widths, setWidths] = useState(initialWidths); // Initial widths in vw
    const [activeHandle, setActiveHandle] = useState<number | null>(null);
    const [isMouseUp, setIsMouseUp] = useState<boolean>(true);

    const activeElement = useAppSelector((state) => selectActiveElement(state));
    const entityGlobalVariables: EntityPair[] = useAppSelector((state) =>
        selectSchemaPropertiesAsEntityPairs(state, selectedNamespace, selectedSchema)
    );
    const selectorGrids  = useMemo(() => makeSelectSchemaMethodsAsEntityPairs(selectedNamespace, selectedSchema), [selectedNamespace,selectedSchema]);
    const entityParsGrids = useAppSelector(selectorGrids);

    const updateWidths = useCallback((index: number, deltaX: number) => {
        const deltaVw = (deltaX / window.innerWidth) * 100;

        // Convert pixels to vw 
        const newWidths = [...widths]; newWidths[index] += deltaVw; newWidths[index + 1] -= deltaVw;

        // Ensure the widths do not go below 5vw
        if (newWidths[index] < 5) {
            newWidths[index + 1] += newWidths[index] - 5; newWidths[index] = 5;
        }
        else if (newWidths[index + 1] < 5) {
            newWidths[index] += newWidths[index + 1] - 5; newWidths[index + 1] = 5;
        }

        // Ensure the widths do not exceed 95vw   
        if (newWidths[index] > 95) {
            newWidths[index + 1] += newWidths[index] - 95; newWidths[index] = 95;
        } else if (newWidths[index + 1] > 95) {
            newWidths[index] += newWidths[index + 1] - 95; newWidths[index + 1] = 95;
        }

        // Ensure the total width is always 100vw  
        const totalWidth = newWidths.reduce((acc, width) => acc + width, 0);
        const scaleFactor = 100 / totalWidth;
        return newWidths.map(width => width * scaleFactor);
    }, [widths]);


    const handleMouseDown = (index: number) => (event: MouseEvent<HTMLDivElement>): void => {
        setActiveHandle(index);
        setIsMouseUp(false);

        const startX = event.clientX;

        const handleMouseMove = (moveEvent: globalThis.MouseEvent): void => {
            setWidths(updateWidths(index, moveEvent.clientX - startX));
        };

        const handleMouseUp = (moveEvent: globalThis.MouseEvent): void => {
            setActiveHandle(null);
            dispatch(setWorkflowDesignerPanelWidths(updateWidths(index, moveEvent.clientX - startX)));

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            setIsMouseUp(true);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };



    const gridsPanel = useMemo(() => <EntityPanel
        title="Grids"
        canAddEntity={true}
        entities={entityParsGrids}
        selectedEntityInstanceGuid={activeElement?.instanceGuid}
        onSelectEntity={(entity) => {
            dispatch(setActiveElement({ instanceGuid: entity.instanceGuid, elementType: "gridButton" }));
            GridManager.saveActiveGrid(reactFlow, entity.instanceGuid);
            GridManager.activateGrid(reactFlow, entity.instanceGuid);
        }}
        onCreateEntity={(name) => GridManager.createNewGrid(reactFlow, name)}
        onRenameEntity={(instanceGuid, oldName, newName) => {
            if (oldName !== newName) {
                GridManager.updateGridName(reactFlow, newName, instanceGuid);
            }
        }
        }
        iconRenderer={() => <SvgGrid />}
        isDraggable={true}
        onDragStart={(entity, event) => {
            if (event !== null) {
                if (event.dataTransfer !== null) {
                    event.dataTransfer.setData('grid-node', JSON.stringify(entity));
                    event.dataTransfer.effectAllowed = 'move';
                }
            }
        }}
        namePrefix="NewGrid"
        validateName={SchemaUtils.isValidPropertyName}
        getDropdownOptions={(entity, setEditingState) => [
            {
                label: 'Open',
                tooltip: `Open '${entity.name}'`,
                enabled: true,
                instanceGuid: 'open',
                icon: <SvgOpenFolder />,
                onClick: (): void => {
                    dispatch(setActiveElement({ instanceGuid: entity.instanceGuid, elementType: "gridButton" }));
                    GridManager.saveActiveGrid(reactFlow, entity.instanceGuid);
                    GridManager.activateGrid(reactFlow, entity.instanceGuid);
                },
            },
            {
                label: 'Rename',
                tooltip: `Rename '${entity.name}'`,
                enabled: entity.name !== 'Main',
                instanceGuid: 'rename',
                icon: <SvgEditPencil />,
                onClick: (): void => {
                    setEditingState((prev) => {
                        const updated = Object.fromEntries(Object.keys(prev).map((key) => [key, key === entity.name]));
                        return updated;
                    })
                }
            },
            {
                label: 'Delete',
                tooltip: `Delete '${entity.name}'`,
                enabled: entity.name !== 'Main',
                instanceGuid: 'delete',
                icon: <SvgDeleteBin />,
                onClick: (): void => {
                    dispatch(
                        showConfirmationDialog({
                            title: 'Confirm Deletion',
                            message: `Are you sure you want to delete '${entity.name}'?`,
                            onConfirm: () => GridManager.deleteGrid(reactFlow, entity.instanceGuid),
                            onCancel: () => { },
                        })
                    );
                }
            },
        ]}
        panelHeight={"150px"}
    />, [entityParsGrids, activeElement?.instanceGuid, dispatch, reactFlow]);

    const globalVariablesPanel = useMemo(() =>
        <EntityPanel
            title="Global Variables"
            canAddEntity={true}
            entities={entityGlobalVariables}
            selectedEntityInstanceGuid={activeElement?.instanceGuid}
            onSelectEntity={(entity) => {
                console.log(entity);
                dispatch(setActiveElement({ instanceGuid: entity.instanceGuid, elementType: "globalVariable" }));
            }}
            onCreateEntity={(name) => {
                dispatch(addSchemaProperty({
                    namespace: selectedNamespace,
                    schemaName: selectedSchema,
                    propertyName: name
                }));

                dispatch(setActiveElement({
                    instanceGuid: `${selectedNamespace}.${selectedSchema}.${name}`,
                    elementType: "globalVariable"
                }));
            }}
            onRenameEntity={(instanceGuid, _oldName, newName) => {
                const parts = instanceGuid.split(".");
                const [namespace, schemaName,] = parts;

                if (namespace && schemaName) {

                    dispatch(renameSchemaProperty({
                        namespace: namespace,
                        schemaName: schemaName,
                        oldName: _oldName,
                        newName: newName
                    }));
                }
            }}
            iconRenderer={(entity) => (<SvgDataType dataType={entity.type} />)}
            isDraggable={true}
            onDragStart={(entity, event) => {
                if (event !== null) {
                    if (event.dataTransfer !== null) {
                        event.dataTransfer.setData('variable-node', JSON.stringify(entity));
                        event.dataTransfer.effectAllowed = 'move';
                    }
                }
            }}
            namePrefix="NewVariable"
            validateName={SchemaUtils.isValidPropertyName}
            getDropdownOptions={(entity, setEditingState) => [
                {
                    label: 'Open',
                    tooltip: `Open '${entity.name}'`,
                    enabled: true,
                    instanceGuid: 'open',
                    icon: <SvgOpenFolder />,
                    onClick: (): void => {
                        // dispatch(setActiveElement({ instanceGuid: entity.instanceGuid, elementType: "gridButton" }));
                        // GridManager.saveActiveGrid(reactFlow, entity.instanceGuid);
                        // GridManager.activateGrid(reactFlow, entity.instanceGuid);
                    },
                },
                {
                    label: 'Rename',
                    tooltip: `Rename '${entity.name}'`,
                    enabled: true,
                    instanceGuid: 'rename',
                    icon: <SvgEditPencil />,
                    onClick: (): void => {
                        setEditingState((prev) => {
                            const updated = Object.fromEntries(Object.keys(prev).map((key) => [key, key === entity.name]));
                            return updated;
                        })
                    }
                },
                {
                    label: 'Delete',
                    tooltip: `Delete '${entity.name}'`,
                    enabled: true,
                    instanceGuid: 'delete',
                    icon: <SvgDeleteBin />,
                    onClick: (): void => {
                        dispatch(
                            showConfirmationDialog({
                                title: 'Confirm Deletion',
                                message: `Are you sure you want to delete '${entity.name}'?`,
                                onConfirm: () => { /*dispatch(removeGlobalVariableByInstanceGuid(entity.instanceGuid));*/ },
                                onCancel: () => { },
                            })
                        );
                    }
                },
            ]}
            // 452px is properties panel height
            panelHeight={"calc(100vh - var(--footer-height) - 452px)"}
        />, [entityGlobalVariables, activeElement?.instanceGuid, dispatch]);



    return (
        <div style={{ width: '100%', display: 'flex', background: '#212529', border: '#424549 solid 1px' }}>
            <div key="left-panel" draggable={false} style={{ width: `${widths[0]}%` }}>
                {/* Grids Panel - Panel where you can select the flow grid */}
                {gridsPanel}
                <TestEntityTreePage />

                {/* REST API Functions panel - Panel where you can select the flow grid */}
                {/* {restApiFunctionsPanel} */}
            </div>
            <div
                style={{ ...panelResizingHandleStyle, backgroundColor: activeHandle === 0 ? 'var(--background-color-hover)' : '#ccc' }}
                draggable={false}
                onMouseDown={handleMouseDown(0)}
                onMouseEnter={() => { if (isMouseUp) { setActiveHandle(0); } }}
                onMouseLeave={() => { if (isMouseUp) { setActiveHandle(null); } }} />
            <div key="middle-panel" draggable={false} style={{ width: `${widths[1]}%` }}>
                <GridRendererPanel></GridRendererPanel>
            </div>
            <div
                style={{ ...panelResizingHandleStyle, backgroundColor: activeHandle === 1 ? 'var(--background-color-hover)' : '#ccc' }}
                draggable={false}
                onMouseDown={handleMouseDown(1)}
                onMouseEnter={() => { if (isMouseUp) { setActiveHandle(1); } }}
                onMouseLeave={() => { if (isMouseUp) { setActiveHandle(null); } }} />
            <div key="right-panel" draggable={false} style={{ width: `${widths[2]}%` }}>
                <PropertiesPanel />
                {/* Global variables panel - Panel where you can select the flow grid */}
                {globalVariablesPanel}
            </div>
        </div>
    );
};
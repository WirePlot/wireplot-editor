// React
import { MouseEvent, CSSProperties, useCallback, useEffect, useMemo, useState, JSX } from "react";

// Redux
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks";

// Redux slices & selectors
import {
    selectPanelWidths,
    selectSelectedSchema,
    selectSelectedSchemaNamespace,
    setActiveElement,
    setPanelWidths,
    setSchemaImporterOpen,
    setSelectedSchema,
    setSelectedSchemaNamespace,
} from "../redux/schemaEditor";

import {
    createNamespace,
    createSchema,
    deleteNamespace,
    deleteSchema,
    renameNamespace,
    renameSchema,
    selectNamespaceEntityPairs,
    selectSchemaEntityPairsForNamespace,
} from "../redux/schemas";

import { showConfirmationDialog } from "../redux/confirmationDialog";

// Utils
import { SchemaUtils } from "../redux/schemas/schemasUtils";

// Components
import { SchemaEditor } from "./SchemaEditorPanel";
import { EntityPanel } from "./EntityPanel";
import { SchemaImporter } from "./SchemaImporter";

// Icons
import SvgBraces from "../Icons/SvgIcons/SvgBraces";
import SvgDataType from "../Icons/SvgIcons/SvgDataType";
import SvgOpenFolder from "../Icons/SvgIcons/SvgOpenFolder";
import SvgEditPencil from "../Icons/SvgIcons/SvgEditPencil";
import SvgDeleteBin from "../Icons/SvgIcons/SvgDeleteBin";
import SvgImport from "../Icons/SvgIcons/SvgImport";

// UI
import { ButtonWithSvgIcon } from "../FisUI/ButtonWithSvgIcon";
import { InspectorPanel } from "../inspectors/InspectorPanel";




const panelResizingHandleStyle = {
    width: '6px',
    height: 'calc(100vh - var(--header-height) - var(--footer-height))',
    cursor: 'ew-resize',
    transition: 'background-color 0.3s',
    backgroundColor: '#ccc'
} as CSSProperties;


export const SchemaCreatorComponent = (): JSX.Element => {
    const dispatch = useDispatch();
    const [selectedRef, setSelectedRef] = useState<string | null>(null);
    const [widths, setWidths] = useState(useAppSelector((state) => selectPanelWidths(state)));
    const [activeHandle, setActiveHandle] = useState<number | null>(null);
    const [isMouseUp, setIsMouseUp] = useState<boolean>(true);
    const [panelHeight, setPanelHeight] = useState<number>(0);


    const selectedSchemaNamespace = useAppSelector(selectSelectedSchemaNamespace);
    const selectedSchema = useAppSelector(selectSelectedSchema);

    const entityNamespaceNames = useAppSelector((state) => selectNamespaceEntityPairs(state));
    const entitySchemasNames = useAppSelector((state) => selectSchemaEntityPairsForNamespace(state, selectedSchemaNamespace));

    const updateWidths = useCallback((index: number, deltaX: number) => {
        const containerWidth = document.body.clientWidth;
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidths = [...widths];
        newWidths[index] += deltaPercent;
        newWidths[index + 1] -= deltaPercent;

        if (newWidths[index] < 5) {
            newWidths[index + 1] += newWidths[index] - 5;
            newWidths[index] = 5;
        } else if (newWidths[index + 1] < 5) {
            newWidths[index] += newWidths[index + 1] - 5;
            newWidths[index + 1] = 5;
        }

        const totalWidth = newWidths.reduce((acc, width) => acc + width, 0);
        const scaleFactor = 100 / totalWidth;
        return newWidths.map(width => width * scaleFactor);
    }, [widths]);




    const handleMouseDown = (index: number) => (event: MouseEvent<HTMLDivElement>): void => {
        setActiveHandle(index);
        setIsMouseUp(false);

        const handleMouseMove = (moveEvent: globalThis.MouseEvent): void => {
            setWidths(updateWidths(index, moveEvent.clientX - event.clientX));
        };

        const handleMouseUp = (moveEvent: globalThis.MouseEvent): void => {
            setActiveHandle(null);
            dispatch(setPanelWidths(updateWidths(index, moveEvent.clientX - event.clientX)));

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setIsMouseUp(true);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const namespaceSelectorPanel = useMemo(() =>
        <EntityPanel
            title="Namespaces"
            panelHeaderExtraButtons={[
                <ButtonWithSvgIcon
                    style={{ padding: 0, margin: 0 }}
                    icon={<SvgImport />}
                    tooltip="Import schema"
                    onClick={() => { dispatch(setSchemaImporterOpen(true)); }}
                />]
            }
            canAddEntity={true}
            entities={entityNamespaceNames}
            selectedEntityInstanceGuid={selectedSchemaNamespace}
            onSelectEntity={(entity) => {
                setSelectedRef(entity.$ref);
                dispatch(setSelectedSchemaNamespace(entity.name));
            }}
            onCreateEntity={(name) => dispatch(createNamespace({ namespace: name }))}
            onRenameEntity={(_instanceGuid, oldName, newName) => dispatch(renameNamespace({ oldName, newName }))}
            iconRenderer={() => <SvgBraces />}
            namePrefix="NewNamespace"
            validateName={SchemaUtils.isValidPropertyName}
            getDropdownOptions={(entity, setEditingState) => [
                {
                    label: 'Open',
                    tooltip: `Open '${entity.name}'`,
                    enabled: true,
                    instanceGuid: 'open',
                    icon: <SvgOpenFolder />,
                    onClick: (): void => { dispatch(setSelectedSchemaNamespace(entity.name)); },
                },
                {
                    label: 'Rename',
                    tooltip: `Rename '${entity.name}'`,
                    enabled: entity.name !== 'Default',
                    instanceGuid: 'rename',
                    icon: <SvgEditPencil />,
                    onClick: (): void =>
                        setEditingState((prev) => {
                            const updated = Object.fromEntries(Object.keys(prev).map((key) => [key, key === entity.name]));
                            return updated;
                        }),
                },
                {
                    label: 'Delete',
                    tooltip: `Delete '${entity.name}'`,
                    enabled: entity.name !== 'Default',
                    instanceGuid: 'delete',
                    icon: <SvgDeleteBin />,
                    onClick: (): void => {
                        dispatch(showConfirmationDialog({
                            title: 'Confirm Deletion',
                            message: `Are you sure you want to delete '${entity.name}'?`,
                            onConfirm: () => dispatch(deleteNamespace({ namespace: entity.name })),
                            onCancel: () => { },
                        })
                        );
                    }
                },
            ]}
            panelHeight={`${panelHeight}px`}
        />, [entityNamespaceNames, selectedSchemaNamespace, dispatch, panelHeight]);

    const schemaSelectorPanel = useMemo(() =>
        <EntityPanel
            title="Schemas"
            canAddEntity={selectedSchemaNamespace !== 'Default'}
            entities={entitySchemasNames}
            selectedEntityInstanceGuid={selectedSchema}
            onSelectEntity={(entity) => {
                setSelectedRef(entity.$ref);
                dispatch(setSelectedSchema(entity.$ref));
            }}
            onCreateEntity={(name) => {
                if (selectedSchemaNamespace) {
                    console.log(name);
                    dispatch(createSchema({ namespace: selectedSchemaNamespace, schemaName: name }));
                    dispatch(setSelectedSchema(name));
                }
            }}
            onRenameEntity={(_instanceGuid, oldName, newName) => {
                if (selectedSchemaNamespace) {
                    dispatch(renameSchema({ namespace: selectedSchemaNamespace, oldName, newName }));
                    if (selectedSchema === oldName) {
                        dispatch(setSelectedSchema(newName));
                    }
                }
            }
            }
            iconRenderer={(entity) => (<SvgDataType dataType={entity.name} />)}
            namePrefix="NewSchema"
            validateName={SchemaUtils.isValidPropertyName}
            getDropdownOptions={(entity, setEditingState) => [
                {
                    label: 'Open',
                    tooltip: `Open '${entity.name}'`,
                    enabled: true,
                    instanceGuid: 'open',
                    icon: <SvgOpenFolder />,
                    onClick: (): void => { dispatch(setSelectedSchema(entity.name)); },
                },

                {
                    label: 'Rename',
                    tooltip: `Rename '${entity.name}'`,
                    enabled: selectedSchemaNamespace !== 'Default',
                    instanceGuid: 'rename',
                    icon: <SvgEditPencil />,
                    onClick: (): void => {
                        setEditingState((prev) => {
                            const updated = Object.fromEntries(Object.keys(prev).map((key) => [key, key === entity.name]));
                            return updated;
                        });
                    },
                },
                {
                    label: 'Delete',
                    tooltip: `Delete '${entity.name}'`,
                    enabled: selectedSchemaNamespace !== 'Default',
                    instanceGuid: 'delete',
                    icon: <SvgDeleteBin />,
                    onClick: (): void => {
                        dispatch(
                            showConfirmationDialog({
                                title: 'Confirm Deletion',
                                message: `Are you sure you want to delete '${entity.name}'?`,
                                onConfirm: () => selectedSchemaNamespace && dispatch(deleteSchema({ namespace: selectedSchemaNamespace, schemaName: entity.name })),
                                onCancel: () => { },
                            })
                        );
                    }
                },
            ]}
            panelHeight={`${panelHeight}px`}
        />, [entitySchemasNames, selectedSchemaNamespace, selectedSchema, dispatch, panelHeight]);

    useEffect(() => {
        const calculatePanelHeight = (): void => {
            const rootStyles = getComputedStyle(document.documentElement);
            const headerHeight = parseInt(rootStyles.getPropertyValue('--header-height')) || 0;
            const footerHeight = parseInt(rootStyles.getPropertyValue('--footer-height')) || 0;

            console.log("headerHeight", headerHeight);
            console.log("footerHeight", footerHeight);
            const height = window.innerHeight - headerHeight - footerHeight;
            console.log("height", height);

            setPanelHeight(height);
        };

        calculatePanelHeight();

        window.addEventListener('resize', calculatePanelHeight);

        return (): void => {
            dispatch(setActiveElement(undefined));
            window.removeEventListener('resize', calculatePanelHeight);
        }
    }, [dispatch]);

    const parsedRef = selectedRef ? SchemaUtils.parseRef(selectedRef) : { kind: "unknown" } as const;
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'stretch', background: '#212529', border: '#424549 solid 1px' }}>
            {/* Namespace Panel - Panel where you can select namespace with schemas */}
            <div style={{ width: `${widths[0]}%` }}>
                {namespaceSelectorPanel}
            </div>
            <div
                style={{
                    ...panelResizingHandleStyle,
                    backgroundColor: activeHandle === 0 ? 'var(--background-color-hover)' : '#ccc'
                }}
                draggable={false}
                onMouseDown={handleMouseDown(0)}
                onMouseEnter={() => { if (isMouseUp) { setActiveHandle(0); } }}
                onMouseLeave={() => { if (isMouseUp) { setActiveHandle(null); } }}
            />
            {/* Schemas Panel - Panel where you can select the schema */}
            <div style={{ width: `${widths[1]}%` }}>
                {schemaSelectorPanel}
            </div >
            <div
                style={{
                    ...panelResizingHandleStyle,
                    backgroundColor: activeHandle === 1 ? 'var(--background-color-hover)' : '#ccc'
                }}
                draggable={false}
                onMouseDown={handleMouseDown(1)}
                onMouseEnter={() => { if (isMouseUp) { setActiveHandle(1); } }}
                onMouseLeave={() => { if (isMouseUp) { setActiveHandle(null); } }}
            />
            {/* Schema editor panel - Panel where you can edit selected panel */}
            <div style={{ width: `${widths[2]}%` }}>
                {parsedRef.kind === "schema" ? (
                    <SchemaEditor
                        namespace={parsedRef.namespace}
                        schema={parsedRef.schemaName}
                    />
                ) : (
                    <>
                        <div style={{ width: '100%', height: '40px', padding: 6, color: '#6ea8fe', backgroundColor: '#031633', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        </div>
                        <div
                            style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9aa0a6',
                                fontSize: 13
                            }}
                        >
                            Select a schema to edit
                        </div>
                    </>

                )}
            </div>
            <div
                style={{ ...panelResizingHandleStyle, backgroundColor: activeHandle === 2 ? 'var(--background-color-hover)' : '#ccc' }}
                draggable={false}
                onMouseDown={handleMouseDown(2)}
                onMouseEnter={() => { if (isMouseUp) { setActiveHandle(2); } }}
                onMouseLeave={() => { if (isMouseUp) { setActiveHandle(null); } }}
            />
            <div style={{ width: `${widths[3]}%` }}>
                <InspectorPanel $ref={selectedRef} />
            </div>
            <SchemaImporter />
        </div>
    );
};

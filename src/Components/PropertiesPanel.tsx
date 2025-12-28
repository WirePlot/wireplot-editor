import './PropertiesPanel.css';
import { useAppSelector } from "../hooks";
import { selectActiveElement } from "../redux/project";
import { MouseEvent, CSSProperties, JSX, useCallback, useMemo, useRef, useState, ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Input } from "../FisUI/Input";
import { useReactFlow } from "@xyflow/react";
import { makeSelectMethodByRef, makeSelectMethodNamesByRef, ParsedMethodRef, renameSchemaProperty, SchemaUtils, selectSchemaDataTypeGroups, selectSchemaPropertyObject, updateSchemaMethodOverload, /*updateSchemaMethod,*/ updateSchemaProperty, WirePlotMethodOverload, WirePlotMethodParameter, WirePlotPropertyObject } from "../redux/schemas";
import { SelectWithCategories, SelectWithCategoriesOption, SelectWithCategoriesOptionGroup } from '../FisUI/SelectWithCategories';
import { Panels } from '../FisUI/Panel';
import { EParameterDirection } from '../Models/Grids';
import SvgDeleteBin from '../Icons/SvgIcons/SvgDeleteBin';
import { ButtonWithSvgIcon } from '../FisUI/ButtonWithSvgIcon';
import SvgAdd from '../Icons/SvgIcons/SvgAdd';
import { GridManager } from '../Managers/GridManager';
import { NameHelper } from '../Helpers/NameHelper';
import { Guid } from '../Helpers/Guid';


// ==========================================================
// Shared property-row styles (used by both Variable & Grid panels)
// ==========================================================
const usePropertyRowStyles = (): {
    labelStyle: (index: number) => CSSProperties;
    valueContainer: (index: number) => CSSProperties;
    inputStyle: CSSProperties;
    checkboxStyle: CSSProperties;
} => {
    const rowBase: CSSProperties = {
        display: "flex",
        alignItems: "center",
        height: "32px",
        fontSize: "13px",
        borderBottom: "1px solid #1a1a1a",
        userSelect: "none",
    };

    const labelStyle = (index: number): CSSProperties => ({
        ...rowBase,
        padding: "0 10px",
        backgroundColor: index % 2 === 0 ? "var(--background-color-brighter)" : "var(--background-color-middle)",
        color: "#d0d0d0",
    });

    const valueContainer = (index: number): CSSProperties => ({
        ...rowBase,
        padding: "0px",
        margin: "0px",
        backgroundColor: index % 2 === 0 ? "var(--background-color-brighter)" : "var(--background-color-middle)",
    });

    const inputStyle: CSSProperties = {
        width: "100%",
        height: "22px",
        backgroundColor: "#202020",
        border: "1px solid #333",
        color: "#fff",
        fontSize: "13px",
        padding: "0px",
        margin: "0px 5px 0px 5px",
        borderRadius: "3px",
    };

    const checkboxStyle: CSSProperties = {
        width: "16px",
        height: "16px",
        cursor: "pointer",
    };

    return { labelStyle, valueContainer, inputStyle, checkboxStyle };
};


// ==========================================================
// Generic reusable components
// ==========================================================

interface SplitPanelProps {
    left: ReactNode;
    right: ReactNode;
    minPercent?: number;
    maxPercent?: number;
}

const SplitPanel = ({ left, right, minPercent = 14, maxPercent = 86 }: SplitPanelProps): JSX.Element => {
    const [leftWidth, setLeftWidth] = useState(30);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
        const startX = e.clientX;
        const startWidth = leftWidth;

        const handleMouseMove = (e: globalThis.MouseEvent): void => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newLeftWidth = startWidth + ((e.clientX - startX) / containerWidth) * 100;
                setLeftWidth(Math.max(minPercent, Math.min(maxPercent, newLeftWidth)));
            }
        };

        const handleMouseUp = (): void => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const shared: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        whiteSpace: "nowrap",
        userSelect: "none",
    };

    return (
        <div ref={containerRef} style={{ display: "flex", width: "100%" }}>
            <div
                key="split-panel-left"
                style={{ ...shared, width: `${leftWidth}%` }}>
                {left}
            </div>
            <div
                key="split-panel-center"
                style={{ width: "2px", cursor: "col-resize", backgroundColor: "#888" }}
                onMouseDown={handleMouseDown}
            />
            <div
                key="split-panel-right"
                style={{ ...shared, width: `${100 - leftWidth}%` }}>
                {right}
            </div>
        </div>
    );
};


interface ParameterListProps {
    title: string;
    direction: EParameterDirection,
    parameters: WirePlotMethodParameter[];
    schemaGroups: SelectWithCategoriesOptionGroup[];
    onAdd: (direction: EParameterDirection) => void;
    onParameterRename: (parameter: WirePlotMethodParameter, newName: string, direction: EParameterDirection) => void;
    onParameterDataTypeChange: (parameter: WirePlotMethodParameter, newRef: string, direction: EParameterDirection) => void;
    onDelete: (parameter: WirePlotMethodParameter, direction: EParameterDirection) => void;
}

const ParameterList = ({ title, direction, parameters, schemaGroups, onAdd, onParameterRename, onParameterDataTypeChange, onDelete }: ParameterListProps): JSX.Element => (
    <>
        <div style={{
            userSelect: "none",
            height: "32px",
            padding: "0px 6px 0px 6px",
            color: "#6ea8fe",
            backgroundColor: "#031633",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            {title}
            <ButtonWithSvgIcon icon={<SvgAdd />} tooltip={`Add ${title}`} onClick={() => onAdd(direction)} />
        </div>

        <div style={{
            padding: "4px 6px",
            background: "var(--background-color-darker)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            {parameters?.map((param) => (
                <div key={param.name} style={{ display: "flex", alignItems: "center", width: "100%", padding: "2px 8px" }}>
                    <Input
                        defaultValue={param.name}
                        onBlur={(event) => {
                            const rawValue = event;
                            if (!rawValue || rawValue === param.name) {
                                return;
                            }

                            const existingNames = parameters.filter(p => p !== param).map(p => p.name);
                            const uniqueName = NameHelper.getNewUniqueName(rawValue, existingNames);

                            if (uniqueName !== param.name) {
                                onParameterRename(param, uniqueName, direction);
                            }
                        }}
                        style={{ maxHeight: "22px" }}
                        instanceGuid={param.instanceGuid}
                    />
                    <SelectWithCategories
                        groups={schemaGroups}
                        selected={SchemaUtils.getSchemaNameFromRef(param.$ref) ?? ""}
                        onChange={(event: SelectWithCategoriesOption) => {
                            console.log(event);
                            onParameterDataTypeChange(param, `${event.category}#/components/schemas/${event.label}`, direction);
                        }}
                        style={{ width: "100%", maxHeight: "22px" }}
                    />
                    <ButtonWithSvgIcon
                        icon={<SvgDeleteBin />}
                        tooltip={`Delete '${param.name}'`}
                        onClick={() => { onDelete(param, direction); }}
                        style={{ marginLeft: "4px" }}
                    />
                </div>
            ))}
        </div>
    </>
);


// ==========================================================
// Main panels
// ==========================================================

export const PropertiesPanel = (): JSX.Element => {
    const activeElement = useAppSelector(selectActiveElement);

    const panelBody = useMemo(() => {
        if (!activeElement) {
            return <></>;
        }

        switch (activeElement.elementType) {
            case "globalVariable":
                return <VariablePropertyContent instanceGuid={activeElement.instanceGuid} />;
            case "gridButton":
                return <GridPropertyContent instanceGuid={activeElement.instanceGuid} />;
            default:
                return <div>{activeElement.elementType} not defined.</div>;
        }
    }, [activeElement]);

    return (
        <Panels.Panel id="entity-selector" panelHeight={"400px"}>
            <Panels.Header>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Properties</div>
            </Panels.Header>
            <Panels.Body>{panelBody}</Panels.Body>
        </Panels.Panel>
    );
};


// ==========================================================
// GRID PANEL
// ==========================================================
const GridPropertyContent = ({ instanceGuid }: { instanceGuid: string }): JSX.Element => {
    const dispatch = useDispatch();
    const reactFlow = useReactFlow();
    const schemaGroups = useAppSelector(selectSchemaDataTypeGroups);
    const parseMethodRef: ParsedMethodRef | undefined = SchemaUtils.parseMethodRef(instanceGuid);
    const overloadMethod: WirePlotMethodOverload | undefined = useAppSelector(makeSelectMethodByRef(instanceGuid));

    const selectorMethodNames = useMemo(() => makeSelectMethodNamesByRef(instanceGuid), [instanceGuid]);
    const methodNames: string[] = useAppSelector(selectorMethodNames);

    const [localName, setLocalName] = useState<string>(overloadMethod?.name ?? "");

    console.log("Rendering <Input> with key =", `method-${localName}`, "defaultValue=", localName);



    useEffect(() => {
        setLocalName(overloadMethod?.name ?? "");
    }, [overloadMethod]);


    const handleOnNameBlur = useCallback((newName: string) => {
        console.log(newName);

        // if (!parseMethodRef || !method) {
        //     return;
        // }

        // if (newName === method.name) {
        //     return;
        // }

        // if (methodNames.includes(newName)) {
        //     alert(`Method "${newName}" already exists.`);

        //     // Force refresh
        //     setLocalName(method.name + "_");  // Change the name
        //     setTimeout(() => setLocalName(method.name), 0);  // Set it back
        //     return;
        // }


        // setLocalName(newName);
        // const updatedMethod: WirePlotMethod = {
        //     ...method,
        //     name: newName
        // };

        // dispatch(updateSchemaMethod({
        //     namespace: parseMethodRef.namespace,
        //     schemaName: parseMethodRef.schemaKey,
        //     methodName: parseMethodRef.methodName,
        //     newMethod: updatedMethod
        // }));
        // GridManager.updateGridName(reactFlow, newName, instanceGuid);

        // dispatch(setActiveElement({ instanceGuid: SchemaUtils.renameMethodInRef(instanceGuid, newName), elementType: "gridButton" }));

    }, [parseMethodRef, overloadMethod, methodNames, dispatch, reactFlow, instanceGuid]);

    const handleOnDescription = useCallback((newDescription: string) => {
        console.log(newDescription);
        if (!overloadMethod) {
            return;
        }

        if (newDescription === overloadMethod.description) {
            return;
        }

        const updatedMethod: WirePlotMethodOverload = { ...overloadMethod, description: newDescription };
        dispatch(updateSchemaMethodOverload({ ref: instanceGuid, newOverload: updatedMethod }));

    }, [dispatch, overloadMethod]);



    const styles = usePropertyRowStyles();

    const variableSettingsElements: JSX.Element[][] = useMemo(() => {
        if (!overloadMethod) {
            return [[], []];
        }

        const { labelStyle, valueContainer, inputStyle } = styles;
        const left: JSX.Element[] = [];
        const right: JSX.Element[] = [];

        left.push(<div key="left-name" style={labelStyle(0)}>Name</div>);
        right.push(
            <div key="right-name" style={valueContainer(0)}>
                <Input
                    key={`method-${localName}`}
                    defaultValue={localName}
                    onBlur={handleOnNameBlur}
                    style={inputStyle}
                    instanceGuid={instanceGuid}
                />

            </div>
        );
        left.push(<div key="left-description" style={labelStyle(1)}>Description</div>);
        right.push(
            <div key="right-description" style={valueContainer(0)}>
                <Input
                    key={`description-${overloadMethod.description}`}
                    defaultValue={overloadMethod.description ?? ""}
                    onBlur={handleOnDescription}
                    style={inputStyle}
                    instanceGuid={instanceGuid}
                />
            </div>
        );


        return [left, right];
    }, [overloadMethod, styles, localName, handleOnNameBlur, instanceGuid, handleOnDescription]);


    const handleParameterRename = (param: WirePlotMethodParameter, newName: string, parameterDirection: EParameterDirection): void => {
        if (!overloadMethod) {
            return;
        }

        const trimmedName = newName.trim();
        if (!trimmedName || trimmedName === param.name) {
            return;
        }

        const existingNames =
            parameterDirection === EParameterDirection.INPUT
                ? overloadMethod.signature.parameters
                    .filter(p => p.instanceGuid !== param.instanceGuid)
                    .map(p => p.name)
                : overloadMethod.signature.return
                    .filter(p => p.instanceGuid !== param.instanceGuid)
                    .map(p => p.name);

        const uniqueName = NameHelper.getNewUniqueName(trimmedName, existingNames);

        const updatedSignature =
            parameterDirection === EParameterDirection.INPUT
                ? {
                    ...overloadMethod.signature,
                    parameters: overloadMethod.signature.parameters.map(p =>
                        p.instanceGuid === param.instanceGuid
                            ? { ...p, name: uniqueName }
                            : p
                    )
                }
                : {
                    ...overloadMethod.signature,
                    return: overloadMethod.signature.return.map(p =>
                        p.instanceGuid === param.instanceGuid
                            ? { ...p, name: uniqueName }
                            : p
                    )
                };

        const updatedOverload: WirePlotMethodOverload = { ...overloadMethod, signature: updatedSignature };
        dispatch(updateSchemaMethodOverload({ ref: instanceGuid, newOverload: updatedOverload }));
        GridManager.updateGridNodeHandles(reactFlow, updatedOverload, parameterDirection);
    };

    const handleParameterDataTypeChange = (param: WirePlotMethodParameter, newRef: string, parameterDirection: EParameterDirection): void => {
        if (!overloadMethod) {
            return;
        }

        const updatedSignature =
            parameterDirection === EParameterDirection.INPUT
                ? {
                    ...overloadMethod.signature,
                    parameters: overloadMethod.signature.parameters.map(p =>
                        p.instanceGuid === param.instanceGuid
                            ? { ...p, $ref: newRef }
                            : p
                    )
                }
                : {
                    ...overloadMethod.signature,
                    return: overloadMethod.signature.return.map(p =>
                        p.instanceGuid === param.instanceGuid
                            ? { ...p, $ref: newRef }
                            : p
                    )
                };

        const updatedOverload: WirePlotMethodOverload = { ...overloadMethod, signature: updatedSignature };
        dispatch(updateSchemaMethodOverload({ ref: instanceGuid, newOverload: updatedOverload }));
        GridManager.updateGridNodeHandles(reactFlow, updatedOverload, parameterDirection);
    };



    const removeParameter = (param: WirePlotMethodParameter, parameterDirection: EParameterDirection): void => {
        if (!overloadMethod) {
            return;
        }

        const updatedSignature =
            parameterDirection === EParameterDirection.INPUT
                ? {
                    ...overloadMethod.signature,
                    parameters: overloadMethod.signature.parameters.filter(
                        p => p.instanceGuid !== param.instanceGuid
                    )
                }
                : {
                    ...overloadMethod.signature,
                    return: overloadMethod.signature.return.filter(
                        p => p.instanceGuid !== param.instanceGuid
                    )
                };

        const updatedOverload: WirePlotMethodOverload = { ...overloadMethod, signature: updatedSignature };
        dispatch(updateSchemaMethodOverload({ ref: instanceGuid, newOverload: updatedOverload }));
        GridManager.updateGridNodeHandles(reactFlow, updatedOverload, parameterDirection);
    };


    const addParameter = (parameterDirection: EParameterDirection): void => {
        if (!overloadMethod) {
            return;
        }

        const signature = overloadMethod.signature;

        const targetArray = parameterDirection === EParameterDirection.INPUT ? signature.parameters ?? [] : signature.return ?? [];
        const newParameter: WirePlotMethodParameter = {
            name: NameHelper.getNewUniqueName("newParameter", targetArray.map(p => p.name)),
            description: "",
            required: false,
            instanceGuid: Guid.generateGUID(),
            $ref: "System#/components/schemas/String"
        };

        const updatedOverload: WirePlotMethodOverload = {
            ...overloadMethod,
            signature: {
                ...signature,
                parameters: parameterDirection === EParameterDirection.INPUT ? [...targetArray, newParameter] : signature.parameters,
                return: parameterDirection === EParameterDirection.OUTPUT ? [...targetArray, newParameter] : signature.return
            }
        };

        dispatch(updateSchemaMethodOverload({ ref: instanceGuid, newOverload: updatedOverload }));
        GridManager.updateGridNodeHandles(reactFlow, updatedOverload, parameterDirection);
    };


    if (!overloadMethod) {
        return (<></>)
    }

    return (
        <div key={instanceGuid}>
            <SplitPanel key={`grid-property-split-panel-${instanceGuid}`} left={variableSettingsElements[0]} right={variableSettingsElements[1]} />
            <ParameterList
                title="Input Parameters"
                direction={EParameterDirection.INPUT}
                parameters={overloadMethod.signature.parameters}
                schemaGroups={schemaGroups}
                onAdd={addParameter}
                onDelete={removeParameter}
                onParameterDataTypeChange={handleParameterDataTypeChange}
                onParameterRename={handleParameterRename}
            />

            {<ParameterList
                title="Output Parameters"
                direction={EParameterDirection.OUTPUT}
                parameters={overloadMethod.signature.return}
                schemaGroups={schemaGroups}
                onAdd={addParameter}
                onDelete={removeParameter}
                onParameterDataTypeChange={handleParameterDataTypeChange}
                onParameterRename={handleParameterRename}
            />}
        </div>
    );
};


// ==========================================================
// VARIABLE PANEL
// ==========================================================

const VariablePropertyContent = ({ instanceGuid }: { instanceGuid: string }): JSX.Element => {
    const dispatch = useDispatch();
    const parts = instanceGuid.split(".");
    const [namespace, schemaName, propertyName] = parts;

    const selectedProperty: WirePlotPropertyObject = useAppSelector((state) =>
        selectSchemaPropertyObject(state, namespace, schemaName, propertyName)
    );

    const schemaGroups: SelectWithCategoriesOptionGroup[] = useAppSelector(selectSchemaDataTypeGroups);


    const styles = usePropertyRowStyles();

    const settings: JSX.Element[][] = useMemo(() => {
        const left: JSX.Element[] = [];
        const right: JSX.Element[] = [];
        if (!selectedProperty) {
            return [left, right];
        }

        var schemaFromRef: string = "";

        if (selectedProperty.$ref) {
            const schemaFromRefFound = SchemaUtils.getSchemaNameFromRef(selectedProperty.$ref);
            if (schemaFromRefFound) {
                schemaFromRef = schemaFromRefFound;
            }
        }

        const { labelStyle, valueContainer, inputStyle, checkboxStyle } = styles;

        left.push(<div style={labelStyle(0)}>Name</div>);
        right.push(
            <div style={valueContainer(0)}>
                <input
                    defaultValue={selectedProperty.title}
                    style={inputStyle}
                    onBlur={(event) => {
                        dispatch(renameSchemaProperty({
                            namespace: namespace,
                            schemaName: schemaName,
                            oldName: propertyName,
                            newName: event.target.value
                        }));
                    }}
                />
            </div>
        );

        left.push(<div style={labelStyle(1)}>Description</div>);
        right.push(
            <div style={valueContainer(1)}>
                <input
                    defaultValue={selectedProperty.description}
                    style={inputStyle}
                    onBlur={(event) => {
                        const clonedSchema: WirePlotPropertyObject = { ...selectedProperty } as WirePlotPropertyObject;
                        clonedSchema.description = event.target.value;
                        dispatch(updateSchemaProperty({ namespace: namespace, schemaName: schemaName, propertyName: propertyName, updatedProperty: clonedSchema }));
                    }}
                />
            </div>
        );

        left.push(<div style={labelStyle(2)}>Type</div>);
        right.push(
            <div style={valueContainer(2)}>
                <SelectWithCategories
                    groups={schemaGroups}
                    selected={schemaFromRef}
                    onChange={() => {
                        // dispatch(
                        //     updateGlobalVariable({
                        //         ...globalVariable,
                        //         namespace: event.category,
                        //         schema: event.label,
                        //     })
                        // );
                    }}
                    style={{ width: "100%" }}
                />
            </div>
        );

        left.push(<div style={labelStyle(3)}>Is Read Only</div>);
        right.push(
            <div style={valueContainer(3)}>
                <input
                    type="checkbox"
                    defaultChecked={selectedProperty.readOnly}
                    style={checkboxStyle}
                    onBlur={(event) => {
                        const clonedSchema: WirePlotPropertyObject = { ...selectedProperty } as WirePlotPropertyObject;
                        clonedSchema.readOnly = event.target.checked;
                        dispatch(updateSchemaProperty({ namespace: namespace, schemaName: schemaName, propertyName: propertyName, updatedProperty: clonedSchema }));
                    }}
                />
            </div>
        );

        left.push(<div style={labelStyle(4)}>Is Nullable</div>);
        right.push(
            <div style={valueContainer(4)}>
                <input
                    type="checkbox"
                    defaultChecked={selectedProperty.nullable}
                    style={checkboxStyle}
                    onBlur={(event) => {
                        const clonedSchema: WirePlotPropertyObject = { ...selectedProperty } as WirePlotPropertyObject;
                        clonedSchema.nullable = event.target.checked;
                        dispatch(updateSchemaProperty({ namespace: namespace, schemaName: schemaName, propertyName: propertyName, updatedProperty: clonedSchema }));
                    }}
                />
            </div>
        );

        return [left, right];
    }, [selectedProperty, styles, schemaGroups, dispatch, namespace, schemaName, propertyName]);




    if (!selectedProperty) {
        return <></>;
    }

    return (
        <div key={instanceGuid}>
            <SplitPanel key={`variable-property-split-panel-${instanceGuid}`} left={settings[0]} right={settings[1]} />
        </div>
    );
};

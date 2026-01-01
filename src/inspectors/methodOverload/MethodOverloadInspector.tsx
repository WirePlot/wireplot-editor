import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../hooks";
import { useDispatch } from "react-redux";
import { useReactFlow } from "@xyflow/react";
import { makeSelectMethodByRef, makeSelectMethodNamesByRef, SchemaUtils, selectSchemaDataTypeGroups, updateSchemaMethodOverload, WirePlotMethodOverload, WirePlotMethodParameter } from "../../redux/schemas";
import { Input } from "../../FisUI/Input";
import { EParameterDirection } from "../../Models/Grids";
import { NameHelper } from "../../Helpers/NameHelper";
import { GridManager } from "../../Managers/GridManager";
import { Guid } from "../../Helpers/Guid";
import { SelectWithCategories, SelectWithCategoriesOption, SelectWithCategoriesOptionGroup } from "../../FisUI/SelectWithCategories";
import { ButtonWithSvgIcon } from "../../FisUI/ButtonWithSvgIcon";
import SvgAdd from "../../Icons/SvgIcons/SvgAdd";
import SvgDeleteBin from "../../Icons/SvgIcons/SvgDeleteBin";
import { SplitPanel } from "../common/SplitPanel";
import { usePropertyRowStyles } from "../common/usePropertyRowStyles";


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

export const MethodOverloadInspector = ({ $ref }: { $ref: string }): JSX.Element => {
    const dispatch = useDispatch();
    const reactFlow = useReactFlow();
    const schemaGroups = useAppSelector(selectSchemaDataTypeGroups);
    const overloadMethod: WirePlotMethodOverload | undefined = useAppSelector(makeSelectMethodByRef($ref));
    const selectorMethodNames = useMemo(() => makeSelectMethodNamesByRef($ref), [$ref]);
    const methodNames: string[] = useAppSelector(selectorMethodNames);

    const styles = usePropertyRowStyles();
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

    }, [overloadMethod, methodNames, dispatch, reactFlow]);

    const handleOnDescription = useCallback((newDescription: string) => {
        console.log(newDescription);
        if (!overloadMethod) {
            return;
        }

        if (newDescription === overloadMethod.description) {
            return;
        }

        const updatedMethod: WirePlotMethodOverload = { ...overloadMethod, description: newDescription };
        dispatch(updateSchemaMethodOverload({ ref: $ref, newOverload: updatedMethod }));

    }, [dispatch, overloadMethod]);



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
                    instanceGuid={$ref}
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
                    instanceGuid={$ref}
                />
            </div>
        );


        return [left, right];
    }, [overloadMethod, styles, localName, handleOnNameBlur, $ref, handleOnDescription]);


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
        dispatch(updateSchemaMethodOverload({ ref: $ref, newOverload: updatedOverload }));
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
        dispatch(updateSchemaMethodOverload({ ref: $ref, newOverload: updatedOverload }));
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
        dispatch(updateSchemaMethodOverload({ ref: $ref, newOverload: updatedOverload }));
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

        dispatch(updateSchemaMethodOverload({ ref: $ref, newOverload: updatedOverload }));
        GridManager.updateGridNodeHandles(reactFlow, updatedOverload, parameterDirection);
    };

    if (!overloadMethod) {
        return <></>;
    }

    return (
        <div key={$ref}>
            <SplitPanel key={`grid-property-split-panel-${$ref}`} left={variableSettingsElements[0]} right={variableSettingsElements[1]} />
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
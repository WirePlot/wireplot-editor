import { FC, JSX, useMemo } from "react";
import { SelectWithCategories, SelectWithCategoriesOptionGroup } from "../../FisUI/SelectWithCategories";
import { renameSchemaProperty, selectSchemaDataTypeGroups, selectSchemaPropertyObject, updateSchemaProperty, WirePlotPropertyObject } from "../../redux/schemas";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks";
import { SplitPanel } from "../common/SplitPanel";
import { usePropertyRowStyles } from "../common/usePropertyRowStyles";
import { SchemaPropertyInspectorProps } from "./schemaPropertyInspectorTypes";


export const SchemaPropertyInspector: FC<SchemaPropertyInspectorProps> = ({ namespace, schemaName, propertyName }) => {
    const dispatch = useDispatch();
    const styles = usePropertyRowStyles();
    const selectedProperty: WirePlotPropertyObject = useAppSelector((state) => selectSchemaPropertyObject(state, namespace, schemaName, propertyName));
    const schemaGroups: SelectWithCategoriesOptionGroup[] = useAppSelector(selectSchemaDataTypeGroups);

    const settings: JSX.Element[][] = useMemo(() => {
        const left: JSX.Element[] = [];
        const right: JSX.Element[] = [];
        if (!selectedProperty) {
            return [left, right];
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
                    selected={schemaName}
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
        <div key={`${namespace}#/components/schemas/${schemaName}/properties/${propertyName}`}>
            <SplitPanel key={`variable-property-split-panel`} left={settings[0]} right={settings[1]} />
        </div>
    );
};

import { FC, JSX, useMemo } from "react";
import { SelectWithCategoriesOption, SelectWithCategoriesOptionGroup } from "../../FisUI/SelectWithCategories";
import { renameSchemaProperty, selectSchemaDataTypeGroups, selectSchemaPropertyObject, updateSchemaProperty, WirePlotContainerType, WirePlotPropertyObject } from "../../redux/schemas";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks";
import { SplitPanel } from "../common/SplitPanel";
import { SchemaPropertyInspectorProps } from "./schemaPropertyInspectorTypes";
import { createInspectorRowBuilder } from "../common/InspectorRowBuilder";

export const SchemaPropertyInspector: FC<SchemaPropertyInspectorProps> = ({ namespace, schemaName, propertyName }) => {
    const dispatch = useDispatch();
    const selectedProperty: WirePlotPropertyObject | null = useAppSelector((state) => selectSchemaPropertyObject(state, namespace, schemaName, propertyName));
    const schemaGroups: SelectWithCategoriesOptionGroup[] = useAppSelector(selectSchemaDataTypeGroups);

    const settings: JSX.Element[][] = useMemo(() => {
        const left: JSX.Element[] = [];
        const right: JSX.Element[] = [];
        if (!selectedProperty) {
            return [left, right];
        }

        const handleTitleChange = (value: string): void => {
            dispatch(renameSchemaProperty({
                namespace: namespace,
                schemaName: schemaName,
                oldName: propertyName,
                newName: value
            }));
        };

        const handleDescriptionChange = (value: string): void => {
            dispatch(updateSchemaProperty({
                namespace,
                schemaName,
                propertyName,
                updatedProperty: {
                    ...selectedProperty,
                    description: value,
                },
            }));
        };

        const handleTypeChange = (value: SelectWithCategoriesOption): void => {
            console.log(value);
            // dispatch(
            //     updateGlobalVariable({
            //         ...globalVariable,
            //         namespace: event.category,
            //         schema: event.label,
            //     })
            // );
        };

        const handleNullableChange = (checked: boolean): void => {
            dispatch(updateSchemaProperty({
                namespace,
                schemaName,
                propertyName,
                updatedProperty: {
                    ...selectedProperty,
                    nullable: checked,
                },
            }));
        };

        const handleReadOnlyChange = (checked: boolean): void => {
            dispatch(updateSchemaProperty({
                namespace,
                schemaName,
                propertyName,
                updatedProperty: {
                    ...selectedProperty,
                    readOnly: checked,
                },
            }));
        };

        const handleContainerTypeChange = (newContainerType: WirePlotContainerType): void => {
            const clonedSchema: WirePlotPropertyObject = { ...selectedProperty };
            clonedSchema.containerType = newContainerType;
            dispatch(updateSchemaProperty({
                namespace,
                schemaName,
                propertyName,
                updatedProperty: clonedSchema,
            }));
        }

        const rows = createInspectorRowBuilder(left, right,);
        rows.pushInputRow("Name", selectedProperty.title, handleTitleChange);
        rows.pushInputRow("Description", selectedProperty.description, handleDescriptionChange);
        rows.pushSelectWithCategoriesRow("Type", selectedProperty.type, schemaGroups, handleTypeChange);
        rows.pushCheckboxRow("Is Read Only", selectedProperty.readOnly ?? false, handleReadOnlyChange);
        rows.pushCheckboxRow("Is Nullable", selectedProperty.nullable ?? false, handleNullableChange);
        rows.pushReadOnlyRow("Schema Kind", selectedProperty.kind);
        rows.pushSimpleSelectRow<WirePlotContainerType>("Container Type", selectedProperty.containerType, ["None", "Array", "List", "Dictionary"], handleContainerTypeChange);

        return [left, right];
    }, [selectedProperty,  schemaGroups, dispatch, namespace, schemaName, propertyName]);


    if (!selectedProperty) {
        return <></>;
    }

    return (
        <div key={`${namespace}#/components/schemas/${schemaName}/properties/${propertyName}`}>
            <SplitPanel key={`variable-property-split-panel`} left={settings[0]} right={settings[1]} />
        </div>
    );
};
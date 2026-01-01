import { FC, JSX, useCallback, useMemo } from "react";
import { ButtonWithSvgIcon } from "../../FisUI/ButtonWithSvgIcon";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks";
import { SchemaEditorProps } from "./types";
import { addSchemaProperty, deleteSchemaProperty, renameSchemaProperty, selectIsNamespaceEditable, selectSchema, updateSchema, WirePlotPropertyObject, WirePlotSchemaObject } from "../../redux/schemas";
import { SchemaEditorRowItem } from "../SchemaEditorRowItem";
import { SchemaUtils } from "../../redux/schemas/schemasUtils";
import SvgAdd from "../../Icons/SvgIcons/SvgAdd";
import { SelectWithCategoriesOption } from "../../FisUI/SelectWithCategories";


export const SchemaEditor: FC<SchemaEditorProps> = ({ schema, namespace }) => {
    const dispatch = useDispatch();
    const isNamespaceEditable = useAppSelector(state => selectIsNamespaceEditable(state, namespace));
    const wireplotSchemaObject: WirePlotSchemaObject | undefined = useAppSelector(state => selectSchema(state, namespace, schema));

    const handleDataTypeChange = useCallback((propertyName: string, option: SelectWithCategoriesOption) => {
        if (!wireplotSchemaObject || !schema || !namespace) {
            return;
        }
        const clonedSchema: WirePlotSchemaObject = { ...wireplotSchemaObject };
        const clonedProperties = { ...clonedSchema.properties };

        clonedProperties[propertyName] = SchemaUtils.createSchemaForType(option.label);
        clonedSchema.properties = clonedProperties;

        dispatch(updateSchema({
            namespace: namespace,
            schemaName: schema,
            newSchema: clonedSchema
        }));

    }, [schema, schema, namespace, dispatch]);

    const handleRename = useCallback((oldName: string, newName: string) => {
        if (oldName === newName) {
            return;
        }
        if (!namespace || !schema) {
            return;
        }

        if (!SchemaUtils.isValidPropertyName(newName)) {
            return;
        }

        dispatch(renameSchemaProperty({
            namespace: namespace,
            schemaName: schema,
            oldName: oldName,
            newName: newName
        }));

    }, [namespace, schema, dispatch]);

    const handleAddNewProperty = useCallback(() => {
        if (!schema || !namespace || !wireplotSchemaObject) { return; }

        const properties = wireplotSchemaObject.properties;
        if (!properties) { return };

        dispatch(addSchemaProperty({
            namespace: namespace,
            schemaName: schema,
            propertyName: SchemaUtils.getUniqueNameForProperty("newProperty", wireplotSchemaObject.properties)
        }));
    }, [schema, namespace, wireplotSchemaObject, dispatch]);


    const handleDelete = useCallback((propertyKey: string) => {
        if (!namespace || !schema) {
            return;
        }

        dispatch(deleteSchemaProperty({
            namespace: namespace,
            schemaName: schema,
            propertyName: propertyKey
        }));
    }, [dispatch, namespace]);

    function getSchemaEditorRow(colorFlipperCounter: number, padding: number, path: string, _schema: WirePlotSchemaObject): JSX.Element[] {
        let schemaElements: JSX.Element[] = [];

        if (!_schema || isNamespaceEditable === undefined) {
            console.error("Schema is null!");
            return schemaElements;
        }

        const properties = _schema.properties;

        if (properties) {
            for (const key in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, key)) {
                    const prop: WirePlotPropertyObject = properties[key];
                    let schemaType = SchemaUtils.getSchemaTypeFromProperty(key, prop);

                    schemaElements.push(
                        <SchemaEditorRowItem
                            key={`${path}/${key}`}
                            label={key}
                            padding={padding}
                            isEditable={isNamespaceEditable}
                            applyBrighterBackgroundColor={colorFlipperCounter % 2 === 0}
                            schemaType={schemaType}
                            onDataTypeChange={(option: SelectWithCategoriesOption) => handleDataTypeChange(key, option)}
                            onRename={(newName: string) => handleRename(key, newName)}
                            onDelete={() => handleDelete(key)}
                        />
                    );
                    colorFlipperCounter++;
                }
            }
        }

        return schemaElements;
    }

    const elements: JSX.Element[] = useMemo(() => {
        let schemaElements: JSX.Element[] = [];

        if (wireplotSchemaObject) {

            if (schema) {
                schemaElements = getSchemaEditorRow(0, 0, schema, wireplotSchemaObject);
            }
        }

        return schemaElements;
    }, [wireplotSchemaObject, handleDataTypeChange, handleRename, handleDelete]);



    return (
        <>
            <div style={{ width: '100%', height: '40px', padding: 6, color: '#6ea8fe', backgroundColor: '#031633', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {schema && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <span>{schema}</span>

                        {!isNamespaceEditable && (
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 12,
                                    color: '#9aa0a6',
                                    cursor: 'default'
                                }}
                                title="This schema is read-only"
                            >
                                🔒 Read-only
                            </span>
                        )}
                    </div>
                )}

                {isNamespaceEditable && (
                    <div style={{ display: 'flex', overflow: 'clip' }}>
                        <ButtonWithSvgIcon
                            style={{ marginLeft: '3px', marginRight: '3px' }}
                            icon={<SvgAdd />}
                            tooltip="Add New Property"
                            onClick={handleAddNewProperty}
                        />
                    </div>
                )}
            </div>

            {wireplotSchemaObject &&
                <div style={{ color: 'white', display: 'flex', flexDirection: 'column' }}>
                    {/* COLUMN HEADER – doesn't scroll */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 2px 4px 10px',
                            fontSize: 12,
                            color: '#9aa0a6',
                            backgroundColor: '#212529',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <div style={{ width: 210 }}>Type</div>
                        <div style={{ borderLeft: '1px solid gray', height: 16, marginRight: 10 }} />
                        <div>Name</div>
                    </div>


                    {/* BODY – scrolluje */}
                    <div
                        style={{
                            height: 'calc(100vh - var(--header-height) - var(--footer-height) - 40px - 28px)',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                        }}
                    >
                        {elements}
                    </div>
                </div>
            }
        </>
    );
};
import { FC } from "react";
import { SchemaInspectorProps } from "./schemaInspectorTypes";
import { selectSchema, WirePlotSchemaObject } from "../../redux/schemas";
import { useAppSelector } from "../../hooks";


export const SchemaInspector: FC<SchemaInspectorProps> = ({ namespace, schemaName }) => {
    const wireplotSchemaObject: WirePlotSchemaObject | undefined = useAppSelector(state => selectSchema(state, namespace, schemaName));

    return (
        <div key={`${namespace}#/components/schemas/${schemaName}`}>
            <div>Namespace: {namespace}</div>
            <div>Schema: {schemaName}</div>
            <hr />
            <div>Title: {wireplotSchemaObject?.title}</div>
            <div>Assembly: {wireplotSchemaObject?.assembly}</div>
            <div>Description: {wireplotSchemaObject?.description}</div>
            <div>Kind: {wireplotSchemaObject?.kind}</div>
            <div>Namespace: {wireplotSchemaObject?.namespace}</div>
            <div>Type: {wireplotSchemaObject?.type}</div>
        </div>
    );
};

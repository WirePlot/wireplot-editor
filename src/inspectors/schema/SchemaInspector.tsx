import { FC } from "react";
import { SchemaInspectorProps } from "./schemaInspectorTypes";


export const SchemaInspector: FC<SchemaInspectorProps> = ({ namespace, schemaName }) => {
    return (
        <div key={`${namespace}#/components/schemas/${schemaName}`}>
            <div>Schema Inspector - NOT IMPLEMENTED YET</div>
            <div>Namespace: {namespace}</div>
            <div>Schema: {schemaName}</div>
        </div>
    );
};

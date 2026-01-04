import { FC, JSX, useMemo } from "react";
import { SchemaInspectorProps } from "./schemaInspectorTypes";
import { selectSchema, WirePlotSchemaObject } from "../../redux/schemas";
import { useAppSelector } from "../../hooks";
import { createInspectorRowBuilder } from "../common/InspectorRowBuilder";
import { SplitPanel } from "../common/SplitPanel";


export const SchemaInspector: FC<SchemaInspectorProps> = ({ namespace, schemaName }) => {
    const wireplotSchemaObject: WirePlotSchemaObject | undefined = useAppSelector(state => selectSchema(state, namespace, schemaName));

    const settings: JSX.Element[][] = useMemo(() => {
        const left: JSX.Element[] = [];
        const right: JSX.Element[] = [];

        if (!wireplotSchemaObject) {
            return [left, right];
        }

        const rows = createInspectorRowBuilder(left, right,);
        rows.pushReadOnlyRow("Title", wireplotSchemaObject.title);
        rows.pushReadOnlyRow("Description", wireplotSchemaObject.description);
        rows.pushReadOnlyRow("Namespace", wireplotSchemaObject.namespace);
        rows.pushReadOnlyRow("Type", wireplotSchemaObject.type);
        rows.pushReadOnlyRow("Kind", wireplotSchemaObject.kind);
        rows.pushReadOnlyRow("Assembly", wireplotSchemaObject.assembly);

        return [left, right];
    }, [wireplotSchemaObject, namespace, schemaName]);


    return (
        <div key={`${namespace}#/components/schemas/${schemaName}`}>
            <SplitPanel key={`variable-property-split-panel`} left={settings[0]} right={settings[1]} />
        </div>
    );
};

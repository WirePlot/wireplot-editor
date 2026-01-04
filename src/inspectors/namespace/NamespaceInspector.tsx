import { FC, JSX, useMemo } from "react";
import { NamespaceMetadata, selectNamespaceMetadata } from "../../redux/schemas";
import { useAppSelector } from "../../hooks";
import { createInspectorRowBuilder } from "../common/InspectorRowBuilder";
import { SplitPanel } from "../common/SplitPanel";
import { NamespaceInspectorProps } from "./namespaceInspectorTypes";

export const NamespaceInspector: FC<NamespaceInspectorProps> = ({ namespace }) => {
    const wireplotSchemaObject: NamespaceMetadata | undefined = useAppSelector(state => selectNamespaceMetadata(state, namespace));

    const settings: JSX.Element[][] = useMemo(() => {
        const left: JSX.Element[] = [];
        const right: JSX.Element[] = [];

        if (!wireplotSchemaObject) {
            return [left, right];
        }

        const rows = createInspectorRowBuilder(left, right,);
        rows.pushReadOnlyRow("Title", wireplotSchemaObject.name);
        rows.pushReadOnlyRow("Is Editable", String(wireplotSchemaObject.editable));
        rows.pushReadOnlyRow("Is Flow Capable", String(wireplotSchemaObject.flowCapable));

        return [left, right];
    }, [wireplotSchemaObject, namespace]);


    return (
        <div key={`${namespace}`}>
            <SplitPanel key={`variable-property-split-panel`} left={settings[0]} right={settings[1]} />
        </div>
    );
};

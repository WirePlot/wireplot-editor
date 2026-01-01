import { FC } from "react";
import { NamespaceInspectorProps } from "./namespaceInspectorTypes";


export const NamespaceInspector: FC<NamespaceInspectorProps> = ({ namespace }) => {
    return (
        <div key={`${namespace}`}>
            <div>Namespace Inspector - NOT IMPLEMENTED YET</div>
            <div>Namespace: {namespace}</div>
        </div>
    );
};

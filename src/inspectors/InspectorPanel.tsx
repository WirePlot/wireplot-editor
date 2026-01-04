import { useMemo, FC } from "react";
import { ParsedRef, SchemaUtils } from "../redux/schemas";
import { Panels } from '../FisUI/Panel';
import { MethodOverloadInspector, NamespaceInspector, SchemaInspector, SchemaPropertyInspector } from '../inspectors';

export interface InspectorPanelProps {
    $ref: string | null;
}

export const InspectorPanel: FC<InspectorPanelProps> = ({ $ref }) => {
    const panelBody = useMemo(() => {
        if (!$ref) {
            return <></>;
        }
        const parsed: ParsedRef = SchemaUtils.parseRef($ref);
        switch (parsed.kind) {
            case "schema": return <SchemaInspector namespace={parsed.namespace} schemaName={parsed.schemaName} />;
            case "schemaProperty": return <SchemaPropertyInspector namespace={parsed.namespace} schemaName={parsed.schemaName} propertyName={parsed.propertyName} />;
            case "methodOverload": return <MethodOverloadInspector $ref={$ref} />;
            case "namespace": return <NamespaceInspector namespace={parsed.namespace} />;
            default: return <></>;
        }
    }, [$ref]);

    return (
        <Panels.Panel id="entity-selector">
            <Panels.Header>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Properties</div>
            </Panels.Header>
            <Panels.Body>{panelBody}</Panels.Body>
        </Panels.Panel>
    );
};
import { InspectorPropsBase } from "../common/inspectorTypes";

export interface SchemaInspectorProps extends InspectorPropsBase {
  namespace: string;
  schemaName: string;
}
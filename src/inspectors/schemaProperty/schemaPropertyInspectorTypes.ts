import { InspectorPropsBase } from "../common/inspectorTypes";

export interface SchemaPropertyInspectorProps extends InspectorPropsBase {
  namespace: string;
  schemaName: string;
  propertyName: string;
}
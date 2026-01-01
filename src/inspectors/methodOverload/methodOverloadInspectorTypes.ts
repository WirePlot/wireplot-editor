import { InspectorPropsBase } from "../common/inspectorTypes";

export interface MethodOverloadInspectorProps extends InspectorPropsBase {
  namespace: string;
  schemaName: string;
  propertyName: string;
}
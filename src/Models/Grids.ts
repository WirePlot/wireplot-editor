import { ReactFlowJsonObject } from "@xyflow/react";

export interface Grid {
  instanceGuid: string;
  // MAYBE DEPRECATED ???
  inputNodeInstanceGuid: string;
  // MAYBE DEPRECATED ???
  outputNodeInstanceGuid: string;
  methodRef: string;
  reactFlowJsonObject: ReactFlowJsonObject;
}

// DEPRECATED
export interface Parameters {
  inputParameters: Parameter[],
  outputParameters: Parameter[]
}

// DEPRECATED
export interface Parameter {
  name: string,
  schema: string,
  namespace: string,
  instanceGuid: string,
  direction: EParameterDirection,
  required: boolean
}

// MAYBE DEPRECATED ???
export enum EParameterDirection {
  INPUT,
  OUTPUT
}
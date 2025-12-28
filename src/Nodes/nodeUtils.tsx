import { ENodeOperationType } from "./types";

export class NodeUtils {
    static getNodeOperationType(rawType: string): ENodeOperationType {
        switch (rawType) {
            case "REST_DELETE": return ENodeOperationType.REST_DELETE;
            case "REST_GET": return ENodeOperationType.REST_GET;
            case "REST_HEAD": return ENodeOperationType.REST_HEAD;
            case "REST_OPTIONS": return ENodeOperationType.REST_OPTIONS;
            case "REST_PATCH": return ENodeOperationType.REST_PATCH;
            case "REST_POST": return ENodeOperationType.REST_POST;
            case "REST_PUT": return ENodeOperationType.REST_PUT;
            default: return ENodeOperationType.UNKNOWN;
        }
    }

    static getNodeOperationLabel(operation: ENodeOperationType): string | undefined {
        switch (operation) {
            case ENodeOperationType.REST_DELETE: return "DELETE";
            case ENodeOperationType.REST_GET: return "GET";
            case ENodeOperationType.REST_HEAD: return "HEAD";
            case ENodeOperationType.REST_OPTIONS: return "OPTIONS";
            case ENodeOperationType.REST_PATCH: return "PATCH";
            case ENodeOperationType.REST_POST: return "POST";
            case ENodeOperationType.REST_PUT: return "PUT";
            case ENodeOperationType.REST_RESPONSE_STATUS_SWITCH: return "SWITCH";
            case ENodeOperationType.PROPERTY_FUNCTION: return "FUNC";
            default: return undefined;
        }
    }
}

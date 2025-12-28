import { ENodeOperationType } from "../Nodes/types";

export class ColorHelper {
    private static flowInputColor: string = "#ffffff";
    private static flowOutputColor: string = "#ffffff";
    private static integerColor: string = "#007bff";
    private static decimalColor: string = "#029c3f";
    private static floatColor: string = "#02979cff";
    private static booleanColor: string = "#ff3333";
    private static stringColor: string = "#f5cb42";
    private static restHeadersColor: string = "#c97302";
    private static objectColor: string = "#886ac2";
    private static statusCodeColor: string = "#6ac2b6ff";
    //private static undefinedColor: string = "#ff00c8ff";



    public static getColorForSchema(type: string): string {

        switch (type) {
            case "Int8": return this.integerColor;
            case "Int16": return this.integerColor;
            case "Int32": return this.integerColor;
            case "Int64": return this.integerColor;
            case "Int128": return this.integerColor;
            case "Uint8": return this.integerColor;
            case "Uint16": return this.integerColor;
            case "Uint32": return this.integerColor;
            case "Uint64": return this.integerColor;
            case "Uint128": return this.integerColor;
            case "Float": return this.floatColor;
            case "Decimal": return this.decimalColor;
            case "Boolean": return this.booleanColor;
            case "flowInput": return this.flowInputColor;
            case "flowOutput": return this.flowOutputColor;
            case "Object": return this.objectColor;
            case "String": return this.stringColor;
            case "restHeader": return this.restHeadersColor;
            case "HttpStatusCode": return this.statusCodeColor;
            default: return this.objectColor;
        }
    }

    public static getStatusCodeBackgroundColor(code: number): string {
        if (code >= 100 && code < 200) { return 'rgba(0, 112, 243, 0.5)'; }     // Informational
        if (code >= 200 && code < 300) { return 'rgba(16, 185, 129, 0.5)'; }   // Success
        if (code >= 300 && code < 400) { return 'rgba(202, 138, 4, 0.5)'; }    // Redirect
        if (code >= 400 && code < 500) { return 'rgba(239, 68, 68, 0.5)'; }    // Client error
        if (code >= 500 && code < 600) { return 'rgba(190, 24, 93, 0.5)'; }    // Server error
        return 'rgba(107, 114, 128, 0.3)';                                  // Unknown
    }

    public static getRestOperationColor(type: ENodeOperationType): string {
        switch (type) {
            case ENodeOperationType.REST_PATCH: return '#50e3c2';
            case ENodeOperationType.REST_POST: return '#49cc90';
            case ENodeOperationType.REST_DELETE: return '#f93e3e';
            case ENodeOperationType.REST_GET: return '#61affe';
            case ENodeOperationType.REST_PUT: return '#fca130';
            case ENodeOperationType.REST_OPTIONS: return '#0d5aa7';
            case ENodeOperationType.REST_HEAD: return '#9012fe';
            default: return '#cbb4ffff';
        }
    }


    // for example 70% original color and 30% white mixed
    public static mixWithWhite(hexColor: string, whiteRatio: number): string {
        // whiteRatio: 0 = original color, 1 = pure white
        // clamp whiteRatio between 0 and 1
        whiteRatio = Math.min(1, Math.max(0, whiteRatio));

        // parse hex
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);

        // mix each channel with white (255)
        const nr = Math.round(r * (1 - whiteRatio) + 255 * whiteRatio);
        const ng = Math.round(g * (1 - whiteRatio) + 255 * whiteRatio);
        const nb = Math.round(b * (1 - whiteRatio) + 255 * whiteRatio);

        return `rgb(${nr}, ${ng}, ${nb})`;
    }
}
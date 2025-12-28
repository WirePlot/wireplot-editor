import { HandleInfo } from "./HandleInfo";

export interface HandleGroup {
    instanceGuid: string;
    name: string;
    color: string;
    applyVisuals: boolean;
    handles: HandleInfo[];
}
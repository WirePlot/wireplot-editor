import React from "react";
import { DropdownOption } from "../../FisUI/Dropdown";
import { ENodeOperationType } from "../../Nodes/types";

export type EntityApiMethodMetadata = {
    method: string;
    namespace: string;
    path: string;
};

export type EntityPair = {
    name: string;
    description: string | undefined;
    $ref: string;
    type: string;
    metadata?: unknown;
    operationType: ENodeOperationType;
};

export type EntityPanelProps = {
    title: string;
    entities?: EntityPair[];
    isDraggable?: boolean;
    canAddEntity: boolean;
    selectedEntityInstanceGuid: string | undefined;
    namePrefix: string;
    panelHeight: string;
    panelHeaderExtraButtons?: React.ReactNode;
    onSelectEntity: (entity: EntityPair) => void;
    onCreateEntity: (newName: string) => void;
    onRenameEntity: (instanceGuid: string, oldName: string, newName: string) => void;
    iconRenderer?: (entity: EntityPair) => React.ReactNode;
    validateName?: (name: string) => boolean;
    onDragStart?: (entity: EntityPair, event: React.DragEvent<HTMLElement>) => void;
    getDropdownOptions: (entity: EntityPair, setEditingState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) => DropdownOption[];
};

export interface EntityItemProps {
    label: string;
    description: string | undefined;
    instanceGuid: string;
    isSelected: boolean;
    isEditingName: boolean;
    isDraggable: boolean;
    applyBrighterBackgroundColor: boolean;
    dropdownOptions: DropdownOption[];
    onNameEditingFinish: (instanceGuid: string, oldName: string, newName: string) => void;
    onClick: () => void;
    onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
    icon: React.ReactNode;
}

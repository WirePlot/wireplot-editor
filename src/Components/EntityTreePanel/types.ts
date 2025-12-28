import React from "react";
import { DropdownOption } from "../../FisUI/Dropdown";

export type TreeEntity = {
    instanceGuid: string;
    name: string;
    children?: TreeEntity[];
    forceShowExpander?: boolean;
    type: string;
    isDraggable: boolean;
    metadata?: unknown;
    icon?: React.ReactNode;
};

export type EntityPair = {
    name: string;
    instanceGuid: string;
    type: string;
    metadata?: unknown;
};

export type EntityTreePanelProps = {
    title: string;
    entities?: TreeEntity[];
    canAddEntity: boolean;
    namePrefix: string;
    panelHeight: string;
    panelHeaderExtraButtons?: React.ReactNode;
    onSelectEntity: (entity: TreeEntity) => void;
    onCreateEntity: (newName: string) => void;
    onRenameEntity: (instanceGuid: string, oldName: string, newName: string) => void;
    validateName?: (name: string) => boolean;
    onDragStart?: (event: React.DragEvent<HTMLElement>, entity: TreeEntity) => void;
    getDropdownOptions: (entity: TreeEntity, setEditingState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) => DropdownOption[];
};


export type EntityTreeItemProps = {
    entity: TreeEntity;
    level: number;
    isEditingName: boolean;
    dropdownOptions: any[];
    onClick: (entity: TreeEntity) => void;
    onDragStart?: (event: React.DragEvent<HTMLDivElement>, entity: TreeEntity) => void;

    onNameEditingFinish: (instanceGuid: string, oldName: string, newName: string) => void;
    setEditingState: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
};
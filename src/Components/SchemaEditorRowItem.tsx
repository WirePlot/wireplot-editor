import { FC, useState } from "react";
import { ButtonWithSvgIcon } from "../FisUI/ButtonWithSvgIcon";
import { Input } from "../FisUI/Input";

import SvgDeleteBin from "../Icons/SvgIcons/SvgDeleteBin";
import SvgEditPencil from "../Icons/SvgIcons/SvgEditPencil";

import './SchemaEditorRowItem.css';
import { useAppSelector } from "../hooks";
import { selectSchemaDataTypeGroups } from "../redux/schemas";
import { SelectWithCategories, SelectWithCategoriesOption } from "../FisUI/SelectWithCategories";
import { IconHelper } from "../Helpers/IconHelper";

interface SchemaEditorRowItemProps {
    label: string;
    applyBrighterBackgroundColor: boolean;
    schemaType: string;
    padding: number;
    isEditable: boolean;
    onDelete: () => void;
    onRename: (newName: string) => void;
    onDataTypeChange: (option: SelectWithCategoriesOption) => void;
}

export const SchemaEditorRowItem: FC<SchemaEditorRowItemProps> = ({ label, applyBrighterBackgroundColor, isEditable, padding, schemaType, onDelete, onRename, onDataTypeChange }) => {
    const [isRenaming, setIsRenaming] = useState<boolean>(false);
    const schemaGroups = useAppSelector((state) => selectSchemaDataTypeGroups(state));

    return (
        <div className="schema-editor-row-item" style={{ padding: `4px 2px 4px ${padding}px`, background: applyBrighterBackgroundColor ? 'var(--background-color-brighter)' : 'var(--background-color-darker)' }}>
            <div style={{ marginLeft: '10px', display: 'flex', gap: '10px', width: '100%' }}>
                <div style={{ width: '200px' }}>
                    {isEditable ?

                        <SelectWithCategories
                            groups={schemaGroups}
                            selected={schemaType}
                            onChange={onDataTypeChange}
                            style={{ width: 'inherit', maxHeight: '22px' }}
                        />
                        :
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {IconHelper.getSchemaIcon(schemaType)}
                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                                title={schemaType}
                            >
                                {schemaType}
                            </span>
                        </div>
                    }
                </div>
                <div style={{ borderLeft: '1px solid gray', height: '20px' }}></div>
                {isRenaming ? (<Input
                    instanceGuid={label}
                    defaultValue={label}
                    isFocused={true}
                    onBlur={(event) => {
                        setIsRenaming(false);
                        onRename(event);
                    }}
                />) : (<>{label}</>)
                }
            </div>
            {isEditable &&
                <div style={{ marginRight: '10px', display: 'flex', gap: '5px' }}>
                    <ButtonWithSvgIcon
                        icon={<SvgEditPencil />}
                        tooltip="Rename"
                        onClick={() => { setIsRenaming(true); }}
                    />
                    <ButtonWithSvgIcon
                        icon={<SvgDeleteBin />}
                        tooltip="Delete"
                        onClick={() => { onDelete(); }}
                    />
                </div>
            }
        </div>
    );
};
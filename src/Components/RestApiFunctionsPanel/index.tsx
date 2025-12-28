import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { Panels } from '../../FisUI/Panel';
import { ButtonWithSvgIcon } from '../../FisUI/ButtonWithSvgIcon';
import { EntityTreeItemProps, EntityTreePanelProps, TreeEntity } from '../EntityTreePanel/types';

import SvgAdd from '../../Icons/SvgIcons/SvgAdd';
import SvgChevronDown from '../../Icons/SvgIcons/SvgChevronDown';
import SvgChevronRight from '../../Icons/SvgIcons/SvgChevronRight';

import styles from './style.module.css';
import { EntityApiMethodMetadata } from '../EntityPanel/types';

export const RestApiFunctionsPanel: FC<EntityTreePanelProps> = ({
    title,
    entities,
    canAddEntity,
    onSelectEntity,
    onCreateEntity,
    onRenameEntity,
    onDragStart,
    namePrefix,
    validateName = (): boolean => true,
    getDropdownOptions,
    panelHeight,
    panelHeaderExtraButtons
}) => {
    const [editingState, setEditingState] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!entities) {
            return;
        }

        const newState: Record<string, boolean> = {};
        const walk = (items: TreeEntity[]): void => {
            items.forEach((entity) => {
                newState[entity.name] = editingState[entity.name] ?? false;
                if (entity.children) {
                    walk(entity.children);
                }
            });
        };
        walk(entities);

        setEditingState(newState);
    }, [entities]);

    const addNewEntity = useCallback(() => {
        if (!entities) {
            return;
        }

        let nameSuffix = '';
        let loopCounter = 0;
        let nameToBeAssigned = namePrefix;

        const collectNames = (items: TreeEntity[]): string[] =>
            items.flatMap((item) => [item.name, ...(item.children ? collectNames(item.children) : [])]);

        const existingNames = collectNames(entities);

        while (existingNames.includes(nameToBeAssigned)) {
            nameSuffix = (++loopCounter).toString();
            nameToBeAssigned = `${namePrefix}${nameSuffix}`;
        }

        onCreateEntity(nameToBeAssigned);

        setEditingState(() => {
            const updated: Record<string, boolean> = {};
            existingNames.forEach((name) => {
                updated[name] = false;
            });
            updated[nameToBeAssigned] = true;
            return updated;
        });
    }, [entities, namePrefix, onCreateEntity]);

    const onEntityNameEditingFinish = useCallback(
        (instanceGuid: string, oldName: string, newName: string) => {
            if (!entities) {
                return;
            }

            const collectNames = (items: TreeEntity[]): string[] =>
                items.flatMap((item) => [item.name, ...(item.children ? collectNames(item.children) : [])]);

            const allNames = collectNames(entities);

            if (newName === oldName || !validateName(newName) || allNames.includes(newName)) {
                setEditingState((prev) => ({ ...prev, [oldName]: false }));
                return;
            }

            onRenameEntity(instanceGuid, oldName, newName);

            setEditingState((prev) => {
                const updated: Record<string, boolean> = {};
                Object.keys(prev).forEach((key) => {
                    updated[key] = false;
                });
                return updated;
            });
        },
        [entities, onRenameEntity, validateName]
    );

    const renderTree = (items: TreeEntity[], level: number = 0): ReactNode[] => {
        return items.map((entity) => (
            <RestApiTreeItem
                key={entity.instanceGuid}
                entity={entity}
                level={level}
                isEditingName={editingState[entity.name] ?? false}
                dropdownOptions={getDropdownOptions(entity, setEditingState)}
                onClick={onSelectEntity}
                onDragStart={(event, draggedEntity) => onDragStart?.(event, draggedEntity)}
                onNameEditingFinish={onEntityNameEditingFinish}
                setEditingState={setEditingState}
            />
        ));
    };

    return (
        <Panels.Panel id="entity-selector" panelHeight={panelHeight}>
            <Panels.Header>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                <div style={{ display: 'flex' }}>
                    {panelHeaderExtraButtons &&
                        (Array.isArray(panelHeaderExtraButtons) ? (
                            panelHeaderExtraButtons.map((button: ReactNode, idx: number) => (
                                <span key={idx} style={{ marginLeft: 8 }}>{button}</span>
                            ))
                        ) : (
                            <span style={{ marginLeft: 8 }}>{panelHeaderExtraButtons}</span>
                        ))}
                    {canAddEntity && (
                        <ButtonWithSvgIcon
                            icon={<SvgAdd />}
                            tooltip={`Create new ${title.toLowerCase()}`}
                            onClick={addNewEntity}
                        />
                    )}
                </div>
            </Panels.Header>
            <Panels.Body>
                {entities && renderTree(entities)}
            </Panels.Body>
        </Panels.Panel>
    );
};


export const RestApiTreeItem: FC<EntityTreeItemProps> = ({
    entity,
    level,
    dropdownOptions,
    onClick,
    onDragStart,
    onNameEditingFinish,
    setEditingState,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasChildren = entity.children && entity.children.length > 0;
    const hasExpander = hasChildren || entity.forceShowExpander;

    const getClassName = (level: number): string => {
        if (level === 0) { return styles['rest-title']; }
        if (level === 1) { return styles['rest-category']; }
        return styles['rest-item'];
    };


    const metadata = entity.metadata as EntityApiMethodMetadata;

    return (
        <>
            <div
                key={entity.instanceGuid}
                draggable={entity.isDraggable}
                onDragStart={(e) => onDragStart?.(e, entity)}
                className={getClassName(level)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }} onClick={() => onClick(entity)}>
                    {hasExpander && (
                        <div
                            className={styles['expander']}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded((prev) => !prev);
                            }}
                        >
                            {isExpanded ? <SvgChevronDown /> : <SvgChevronRight />}
                        </div>
                    )}
                    {level === 2 && entity.icon && <div style={{ marginRight: 6 }}>{entity.icon}</div>}
                    {hasChildren ?
                        <span
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: 'var(--font-size)',
                                flex: 1,
                                color: 'var(--font-color)',
                            }}
                        >
                            {entity.name}
                        </span> :
                        <div style={{
                            display: 'flex',
                            justifyContent: 'start',
                            overflow: 'hidden',
                            fontSize: 'var(--font-size)',
                            color: 'var(--font-color)',
                        }}>
                            <span style={{
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                fontWeight: 'bold',
                                marginRight: 4,
                                color: 'var(--font-color-brighter)',

                            }}>
                                {metadata.path}
                            </span>
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flexGrow: 1,
                                color: 'var(--font-color)',

                            }}>
                                {entity.name}
                            </span>
                        </div>

                    }
                </div>
            </div>

            {hasChildren && isExpanded &&
                entity.children!.map((child) => (
                    <RestApiTreeItem
                        key={child.instanceGuid}
                        entity={child}
                        level={level + 1}
                        isEditingName={false}
                        dropdownOptions={dropdownOptions}
                        onClick={onClick}
                        onDragStart={onDragStart}
                        onNameEditingFinish={onNameEditingFinish}
                        setEditingState={setEditingState}
                    />
                ))}
        </>
    );
};


import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { Panels } from '../../FisUI/Panel';
import { ButtonWithSvgIcon } from '../../FisUI/ButtonWithSvgIcon';
import { EntityTreeItemProps, EntityTreePanelProps, TreeEntity } from './types';

import SvgAdd from '../../Icons/SvgIcons/SvgAdd';
import SvgChevronDown from '../../Icons/SvgIcons/SvgChevronDown';
import { Input } from '../../FisUI/Input';
import SvgChevronRight from '../../Icons/SvgIcons/SvgChevronRight';



export const EntityTreePanel: FC<EntityTreePanelProps> = ({
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
      <EntityTreeItem
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


export const EntityTreeItem: FC<EntityTreeItemProps> = ({
  entity,
  level,
  isEditingName,
  dropdownOptions,
  onClick,
  onDragStart,
  onNameEditingFinish,
  setEditingState,
}) => {
  const [isHovered, setHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = entity.children && entity.children.length > 0;
  const hasExpander = hasChildren || entity.forceShowExpander;

  const background = isHovered
    ? 'var(--background-color-hover)'
    : `rgba(0, 0, 0, ${Math.max(0.5 - level * 0.25, 0)})`;



  const handleNameEditFinish = (newName: string): void => {
    onNameEditingFinish(entity.instanceGuid, entity.name, newName);
  };

  return (
    <>
      <div
        draggable={entity.isDraggable}
        onDragStart={(e) => onDragStart?.(e, entity)}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: background,
          padding: '2px 4px',
          paddingLeft: `${level * 16 + 8}px`,
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }} onClick={() => onClick(entity)}>
          {hasExpander ? (
            <div
              style={{ cursor: 'pointer', marginRight: 4, width: 16, display: 'flex', justifyContent: 'center' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
            >
              {isExpanded ? <SvgChevronDown /> : <SvgChevronRight />}
            </div>
          ) : (
            <div style={{ width: 16, marginRight: 4 }} />
          )}

          {entity.icon && <div style={{ marginRight: 6 }}>{entity.icon}</div>}

          {isEditingName ? (
            <Input
              instanceGuid={`input-${entity.name}`}
              defaultValue={entity.name}
              isFocused={true}
              onBlur={handleNameEditFinish}
            />
          ) : (
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
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded &&
        entity.children!.map((child) => (
          <EntityTreeItem
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


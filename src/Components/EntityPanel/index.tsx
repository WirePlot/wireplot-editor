import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Panels } from '../../FisUI/Panel';
import { ButtonWithSvgIcon } from '../../FisUI/ButtonWithSvgIcon';
import { EntityItemProps, EntityPanelProps } from './types';

import SvgAdd from '../../Icons/SvgIcons/SvgAdd';
import Dropdown from '../../FisUI/Dropdown';
import { Input } from '../../FisUI/Input';
import styles from './style.module.css';

export const EntityPanel: FC<EntityPanelProps> = ({
  title,
  entities,
  selectedEntityInstanceGuid,
  isDraggable,
  canAddEntity,
  onSelectEntity,
  onCreateEntity,
  onRenameEntity,
  onDragStart,
  iconRenderer,
  namePrefix,
  validateName = (): boolean => true,
  getDropdownOptions,
  panelHeight,
  panelHeaderExtraButtons
}) => {
  const [editingState, setEditingState] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  console.log("Rerendering Entity Panel " + title);
  useEffect(() => {
    if (!entities) {
      return;
    }
    
    // Reset search when dataset changes
    setSearchTerm('');

    setEditingState((prev) => {
      const updated: Record<string, boolean> = {};
      entities.forEach((entity) => {
        updated[entity.name] = prev[entity.name] ?? false;
      });
      return updated;
    });
  }, [entities]);

  const filteredEntities = useMemo(() => {
    if (!searchTerm.trim()) {
      return entities;
    }

    const q = searchTerm.toLowerCase();
    return entities?.filter((e) =>
      e.name.toLowerCase().includes(q)
    );
  }, [entities, searchTerm]);


  const addNewEntity = useCallback(() => {
    if (!entities) {
      return;
    }

    let nameSuffix = '';
    let loopCounter = 0;
    let nameToBeAssigned = namePrefix;

    while (entities.find((e) => e.name === nameToBeAssigned)) {
      nameSuffix = (++loopCounter).toString();
      nameToBeAssigned = `${namePrefix}${nameSuffix}`;
    }

    onCreateEntity(nameToBeAssigned);

    setEditingState(() => {
      const updated: Record<string, boolean> = {};
      entities.forEach((entity) => {
        updated[entity.name] = false;
      });
      updated[nameToBeAssigned] = true;
      return updated;
    });
  }, [entities, namePrefix, onCreateEntity]);

  const onEntityNameEditingFinish = useCallback((instanceGuid: string, oldName: string, newName: string) => {
    if (!entities) {
      return;
    }
    if (newName === oldName || !validateName(newName) || entities.find((e) => e.name === newName)) {
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

  return (
    <Panels.Panel id="entity-selector" panelHeight={panelHeight}>
      <Panels.Header>
        <div>{title}</div>
        <div style={{ display: 'flex' }}>
          {panelHeaderExtraButtons && (
            Array.isArray(panelHeaderExtraButtons) ? (
              panelHeaderExtraButtons.map((button: ReactNode, idx: number) => (
                <span style={{ margin: 2 }} key={idx}>
                  {button}
                </span>
              ))
            ) : (
              <span style={{ margin: 2 }}>
                {panelHeaderExtraButtons}
              </span>
            )
          )}
          {canAddEntity && <ButtonWithSvgIcon style={{ margin: 2 }} icon={<SvgAdd />} tooltip={`Create new ${title.toLowerCase()}`} onClick={addNewEntity} />}
        </div>
      </Panels.Header>
      <Panels.Search>
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

      </Panels.Search>
      <Panels.Body>
        {filteredEntities?.map((entity, index) => {
          return (
            <EntityItem
              key={entity.instanceGuid}
              description={entity.description}
              instanceGuid={entity.instanceGuid}
              label={entity.name}
              isSelected={entity.instanceGuid === selectedEntityInstanceGuid}
              isEditingName={editingState[entity.name] ?? false}
              isDraggable={isDraggable ?? false}
              dropdownOptions={getDropdownOptions(entity, setEditingState)}
              onNameEditingFinish={onEntityNameEditingFinish}
              applyBrighterBackgroundColor={index % 2 === 0}
              onDragStart={(event) => { if (onDragStart) { onDragStart(entity, event); } }}
              icon={iconRenderer?.(entity)}
              onClick={() => onSelectEntity(entity)}
            />
          );
        })}
      </Panels.Body>
    </Panels.Panel>
  );
};

export const EntityItem: FC<EntityItemProps> = ({ label, instanceGuid, description, isEditingName, isDraggable, isSelected, applyBrighterBackgroundColor, dropdownOptions, onNameEditingFinish, onClick, onDragStart, icon }) => {
  const [isHovered, setHovered] = useState(false);
  const background = isHovered ? 'var(--background-color-hover)' : isSelected ? 'var(--background-color-blurred-but-selected)' : applyBrighterBackgroundColor ? 'var(--background-color-brighter)' : 'var(--background-color-darker)';


  return (
    <div draggable={isDraggable}
      title={description}
      onDragStart={onDragStart}
      style={{ display: 'flex', justifyContent: 'space-between', userSelect: 'none' }}>
      {isEditingName ?
        (<Input
          instanceGuid={`input-${label}`}
          defaultValue={label}
          isFocused={true}
          onBlur={(event) => {
            onNameEditingFinish(instanceGuid, label, event);
          }}
        />)
        :
        <button
          key={`button-${label}`}
          style={{
            width: '100%',
            color: 'var(--font-color)',
            fontSize: 'var(--font-size)',
            padding: '2px 2px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            background: background,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            overflow: 'hidden'
          }}
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
        >
          {icon}
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            flex: 1
          }}>
            {label}
          </span>
        </button>

      }
      <Dropdown options={dropdownOptions} direction='LEFT' applyBrighterBackgroundColor={applyBrighterBackgroundColor} />
    </div >
  );
};

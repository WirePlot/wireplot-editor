import '@xyflow/react/dist/style.css';

import { MouseEvent, DragEvent, useCallback, useRef, useEffect, useState, JSX } from 'react';
import { NodeMouseHandler, ReactFlow, useNodesState, useEdgesState, Background, BackgroundVariant, ReactFlowInstance, Node, Edge, Controls, Connection, ControlButton, MiniMap, XYPosition, OnConnectStart, OnConnectEnd } from '@xyflow/react';
import { saveCurrentGrid, selectActiveGridState, setActiveElement } from '../redux/project';
import { Grid } from '../Models/Grids';
import { useAppSelector } from '../hooks';
import ExecutableNode from '../Nodes/ExecutableNode';
import ReferenceNode from '../Nodes/ReferenceableNode';
import { useDispatch } from 'react-redux';
import { GridManager } from '../Managers/GridManager';
import { ColorHelper } from '../Helpers/ColorHelper';
import { EntityPair } from './EntityPanel/types';
import { flipDisplayMiniMapStatus, flipDisplayNodeCommentsStatus, selectDisplayMiniMap, selectDisplayNodeComments } from '../redux/workflowDesigner';
import { ENodeOperationType } from '../Nodes/types';
import { HandleGroup } from '../Models/HandleGroups';
import { HandleInfo } from '../Models/HandleInfo';
import { selectSchema } from '../redux/schemas/schemasSelectors';
import { store } from '../store';
import { SchemaUtils, WirePlotSchemaObject } from '../redux/schemas';
import { useIntelliSense } from '../hooks/useIntelliSense';
import SvgRun from '../Icons/SvgIcons/SvgRun';
import SvgSave from '../Icons/SvgIcons/SvgSave';



const nodeTypes = {
  Executable: ExecutableNode,
  Referenceable: ReferenceNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const GridRendererPanel = (): JSX.Element => {
  const dispatch = useDispatch();
  const activeGrid: Grid | undefined = useAppSelector((state) => selectActiveGridState(state));
  const displayNodeComments = useAppSelector((state) => selectDisplayNodeComments(state));
  const displayMiniMap = useAppSelector((state) => selectDisplayMiniMap(state));
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge>>();

  const { showIntelliSense, hideIntelliSense, intelliSenseElement } = useIntelliSense();

  const [autoPanEnabled, setAutoPanEnabled] = useState<boolean>(false);
  const autoPanRafRef = useRef<number | null>(null);

  // TODO EVENT FOR DEMOS
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // vyber si kláves, ktorý nikdy nepoužívaš
      if (e.key === 'F9') {
        setAutoPanEnabled((v) => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);


  // TODO EVENT FOR DEMOS
  useEffect(() => {
    if (!reactFlowInstance) return;
    if (!autoPanEnabled) return;

    const speed = 2.0;

    const step = () => {
      const viewport = reactFlowInstance.getViewport();

      reactFlowInstance.setViewport(
        {
          x: viewport.x - speed, // ← minus = scroll doprava
          y: viewport.y,
          zoom: viewport.zoom,
        },
        { duration: 0 }
      );

      autoPanRafRef.current = requestAnimationFrame(step);
    };

    autoPanRafRef.current = requestAnimationFrame(step);

    return () => {
      if (autoPanRafRef.current) {
        cancelAnimationFrame(autoPanRafRef.current);
        autoPanRafRef.current = null;
      }
    };
  }, [reactFlowInstance, autoPanEnabled]);


  useEffect(() => {
    return (): void => {
      if (reactFlowInstance) {
        try {
          const reactFlowJsonObject = reactFlowInstance.toObject();
          dispatch(saveCurrentGrid({ reactFlowJsonObject }));
        } catch (error) {
          console.error('Error saving grid state:', error);
        }
      }
    };
  }, [reactFlowInstance, dispatch]);


  const onDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (event.dataTransfer.types.length === 0) {
      return;
    }

    if (!reactFlowInstance) {
      return;
    }

    const message = event.dataTransfer?.getData(event.dataTransfer.types[0]);
    const entity: EntityPair = JSON.parse(message);

    if (entity === undefined || entity === null || reactFlowInstance === undefined) {
      return;
    }

    console.log(entity);
    const position: XYPosition = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY, });
    if (event.dataTransfer.types[0] === 'variable-node') {
      showIntelliSense(
        `Variable: ${entity.name}`,
        SchemaUtils.buildVariableIntelliSense(entity), // returns IntelliSenseNode[]
        { x: event.clientX, y: event.clientY },
        (node) => {
          if (!reactFlowInstance) {
            return;
          }
          if (!node.metadata?.nodeOperationType) {
            return;
          }

          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          // Use metadata.nodeOperationType from the selected node
          GridManager.spawnNewNode(
            reactFlowInstance,
            {
              ...entity,
              operationType: node.metadata?.nodeOperationType,
            },
            position
          );
        }
      );
      return;
    }

    GridManager.spawnNewNode(reactFlowInstance, entity, position);
  }, [reactFlowInstance, showIntelliSense]);

  // TODO: REFACTOR NEEDED
  const onConnectEnd: OnConnectEnd = useCallback((_event, connectionState) => {
    if (!connectionState.fromNode) {
      return;
    }
    // If is connection to node, exit, do not display intellisense 
    if (connectionState.toNode) {
      return;
    }

    const allHandles =
      ((connectionState.fromNode.data.outputs as HandleGroup[]) || []).flatMap(
        (group) => group.handles || []
      );

    const handle = allHandles.find(
      (h: HandleInfo) => h.instanceGuid === connectionState.fromHandle?.id
    );

    if (!handle) {
      console.warn("⚠️ Handle not found in any output group:", connectionState.fromHandle?.id);
      return;
    }

    const schemaDef: WirePlotSchemaObject | undefined = selectSchema(store.getState(), handle.namespace, handle.schema);

    if (!schemaDef) {
      return;
    }

    const nodes = SchemaUtils.buildSchemaIntelliSenseTree(schemaDef);

    if (nodes.length > 0 && connectionState.to) {
      const pos = { x: connectionState.to.x, y: connectionState.to.y };

      // ⚠️ React Flow triggers both `onConnectEnd` and `onPaneClick` from the same mouseup event.
      // The `onPaneClick` handler closes any open popups (via `hidePopup()`), which would immediately
      // close the MethodsPopup right after it opens.
      //
      // Wrapping `showIntelliSense()` in a small `setTimeout` ensures it executes *after*
      // the pane click event has finished bubbling, allowing the popup to remain visible.
      setTimeout(() => {
        showIntelliSense(
          `${handle.schema} methods`,
          nodes,
          pos,
          (node) => {
            if (!reactFlowInstance) {
              return;
            }

            const event = _event as globalThis.MouseEvent;
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            // Extract metadata from the selected IntelliSense node
            const metadata = node.metadata;
            if (node.metadata?.nodeOperationType) {
              console.log(JSON.stringify(metadata));
              GridManager.spawnNewNode(
                reactFlowInstance,
                {
                  name: node.label, // previously option.value
                  instanceGuid: "string",
                  type: "string",
                  description: node.tooltip,
                  metadata: {
                    hasOwner: true,
                    tooltip: node.tooltip,
                    ownerNamespace: handle.namespace,
                    ownerSchema: handle.schema,
                    // TO DO HOT FIX TODO
                    // inputParameters: metadata?.parameters ?? [],
                    // outputParameters: metadata?.returnType
                    //   ? [
                    //     {
                    //       name: "Return",
                    //       isOptional: false,
                    //       $ref: metadata.returnType,
                    //     },
                    //   ]
                    //   : [],
                  },
                  operationType: node.metadata?.nodeOperationType,
                },
                position
              );
            }
          }
        );
      }, 0);
    }

  },
    [reactFlowInstance, showIntelliSense]
  );

  const onConnectStart: OnConnectStart = useCallback((_event, params) => {
    if (!reactFlowInstance || params.handleId === null || params.nodeId === null) {
      return;
    }

    const type = GridManager.getHandleDataType(
      reactFlowInstance,
      params.handleId,
      params.nodeId,
      'outputs'
    );

    if (!type) {
      return;
    }

    document.documentElement.style.setProperty('--connection-color', ColorHelper.mixWithWhite(ColorHelper.getColorForSchema(type), 0.3));
  }, [reactFlowInstance]);

  const onConnect = useCallback((params: Connection) => {
    if (reactFlowInstance) {
      console.log(params);
      GridManager.createConnection(reactFlowInstance, params);
    }
  }, [reactFlowInstance]);

  const onPaneClick = useCallback(() => {
    console.log("onPaneClick");
    hideIntelliSense();
    dispatch(setActiveElement(undefined));
  }, [dispatch, hideIntelliSense]);



  const onNodeDoubleClick: NodeMouseHandler<Node> = (_event, node) => {
    console.log("node", node);
    if (reactFlowInstance) {
      if (node.data.operationType === ENodeOperationType.GRID) {
        const ref: string | undefined = node.data['schemaRef'] as string | undefined;
        console.log("ref", ref);

        if (ref) {
          dispatch(setActiveElement({ instanceGuid: ref, elementType: "gridButton" }));
          GridManager.saveActiveGrid(reactFlowInstance, ref);
          GridManager.activateGrid(reactFlowInstance, ref);
        }
      }
    }
  };

  const onNodeClick = (_event: MouseEvent, node: Node): void => {
    console.log("node", node);
    if ((node.data.operationType === ENodeOperationType.GRID_INPUT || node.data.operationType === ENodeOperationType.GRID_OUTPUT) && activeGrid !== undefined && node.data.schemaRef) {
      dispatch(setActiveElement({ instanceGuid: node.data.schemaRef as string, elementType: "gridButton" }));
    } else {
      dispatch(setActiveElement(undefined));
    }
  };

  return (
    <div
      style={{
        height: 'calc(100vh - var(--header-height) - var(--footer-height))',
        backgroundColor: '#0b0b0b',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#031633',
          color: '#6ea8fe',
          padding: '4px 8px',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left column */}
          <div style={{ userSelect: 'none' }}>
            {"Get customer from SAP."}
          </div>

          {/* Right column – button group */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ borderLeft: '1px solid gray', height: 30, margin: '0 4px' }}></div>
            <button
              style={{
                padding: 2,
                margin: '0 2px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6ea8fe',
              }}
              title="Save"
            >
              <SvgSave />
            </button>
            <div style={{ borderLeft: '1px solid gray', height: 30, margin: '0 4px' }}></div>
            <button
              onClick={() => setAutoPanEnabled(!autoPanEnabled)}
              style={{
                padding: 2,
                margin: '0 2px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6ea8fe',
              }}
              title="Run"
            >
              <SvgRun />
            </button>
            <div style={{ borderLeft: '1px solid gray', height: 30, margin: '0 4px' }}></div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 5, position: 'relative', background: '#222528' }}>
        {intelliSenseElement}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneClick={onPaneClick}
          onInit={(e: ReactFlowInstance<Node, Edge>) => {
            setReactFlowInstance(e);
            GridManager.initializeGrid(e);
          }}
          proOptions={{ hideAttribution: true }}
          maxZoom={2}
          minZoom={0.25}
        >
          <Background id="1" gap={10} color="#343434" variant={BackgroundVariant.Lines} />
          <Background id="2" gap={100} color="#171717" variant={BackgroundVariant.Lines} />

          {displayMiniMap && (
            <MiniMap
              nodeColor={(node) =>
                node.style?.backgroundColor ? node.style.backgroundColor : '#f700ffff'
              }
              maskColor="rgba(26, 26, 26, 0.6)"
              nodeBorderRadius={5}
              nodeStrokeColor="#ccc"
              style={{
                backgroundColor: '#3a3a3aff',
                border: '2px solid #747474',
                borderRadius: 5,
                position: 'absolute',
                right: 10,
                bottom: 10,
                height: 140,
                width: 200,
              }}
              pannable
              zoomable
            />
          )}

          <Controls position="bottom-left">
            <ControlButton
              onClick={() => {
                dispatch(flipDisplayNodeCommentsStatus());
                setNodes((nds) =>
                  nds.map((node) => {
                    if ('toolbox' in node.data) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          toolbox: {
                            ...node.data.toolbox ?? {},
                            visible: !displayNodeComments,
                          },
                        },
                      };
                    }
                    return node;
                  })
                );
              }}
              title="toggle node comments"
            >
              💬
            </ControlButton>

            <ControlButton
              onClick={() => dispatch(flipDisplayMiniMapStatus())}
              title="toggle mini map"
            >
              🗺️
            </ControlButton>
          </Controls>
        </ReactFlow>
      </div>
    </div>

  );
}
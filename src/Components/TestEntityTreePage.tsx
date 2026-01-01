import { TreeEntity } from "./EntityTreePanel/types";
import { useAppSelector } from "../hooks";
import { selectSchemasTree } from "../redux/schemas";
import SvgHttpMethod from "../Icons/SvgIcons/SvgHttpMethod";
import { EntityApiMethodMetadata, EntityPair } from "./EntityPanel/types";
import { RestApiFunctionsPanel } from "./RestApiFunctionsPanel";
import { NodeUtils } from "../Nodes/nodeUtils";
import { JSX, ReactNode } from "react";



export const TestEntityTreePage = (): JSX.Element => {
    const entityRestApiTree = useAppSelector(selectSchemasTree);
    const entityRestApiFunctionsWithIcons = (): TreeEntity[] => {
        const addIcons = (entities: TreeEntity[]): TreeEntity[] => {
            return entities.map(entity => {
                let icon: ReactNode;

                if (entity.type === 'method') {
                    const method = (entity.metadata as any)?.method as string;
                    if (method) {
                        icon = <SvgHttpMethod method={method} />;
                    }
                } else {
                    icon = <span>📄</span>;
                }

                const childrenWithIcons = entity.children ? addIcons(entity.children) : undefined;

                return {
                    ...entity,
                    icon,
                    children: childrenWithIcons,
                };
            });
        };

        return addIcons(entityRestApiTree);
    };

    const handleSelect = (entity: TreeEntity): void => {
        console.log('Selected:', entity);
        // setSelectedId(entity.instanceGuid);
    };

    const handleCreate = (name: string): void => {
        console.log('Create entity:', name);
    };

    const handleRename = (guid: string, oldName: string, newName: string): void => {
        console.log(`Rename ${oldName} (${guid}) to ${newName}`);
    };

    return (
        <RestApiFunctionsPanel
            title="Functions - REST API"
            entities={entityRestApiFunctionsWithIcons()}
            onSelectEntity={handleSelect}
            onCreateEntity={handleCreate}
            onRenameEntity={handleRename}
            onDragStart={(event, entity: TreeEntity) => {
                event.stopPropagation();
                const metadata: EntityApiMethodMetadata = entity.metadata as EntityApiMethodMetadata;

                if (metadata) {
                    const payload: EntityPair = {
                        $ref: entity.instanceGuid,
                        name: entity.name,
                        type: entity.type,
                        description: undefined,
                        metadata: metadata,
                        operationType: NodeUtils.getNodeOperationType(`REST_${metadata.method.toUpperCase()}`)
                    };

                    if (event.dataTransfer) {
                        event.dataTransfer.setData('application/json', JSON.stringify(payload));
                        event.dataTransfer.effectAllowed = 'move';
                    }
                }
            }}
            namePrefix="NewEntity"
            canAddEntity={false}
            validateName={(name) => name.length > 0}
            getDropdownOptions={(entity, setEditingState) => [
                {
                    label: 'Rename',
                    onClick: () => setEditingState((prev) => ({ ...prev, [entity.name]: true })),
                    tooltip: 'Rename this entity',
                    enabled: true,
                    instanceGuid: entity.instanceGuid,
                },
            ]}
            panelHeight={"calc(100vh - var(--footer-height) - 150px)"}
        />
    );
};


// TO DO TODO REFACTOR
// export const NamespaceExplorer: FC = () => {
//     const tree = useAppSelector(selectNamespacesTree);

//     const [selectedNamespace, setSelectedNamespace] = useState<TreeEntity | null>(null);

//     const handleSelectNamespace = (node: TreeEntity) => {
//         if (node.type === "namespace") {
//             setSelectedNamespace(node);
//         }
//     };

//     return (

//         <div style={{ display: "flex" }}>
//             <div
//                 style={{
//                     width: "16rem", // ~w-64
//                     height: '30vh',
//                     borderRight: "1px solid #374151", // border-gray-700
//                     overflowY: "scroll",
//                     backgroundColor: "#111827", // bg-gray-900
//                 }}
//             >
//                 {tree.map((node) => (
//                     <div
//                         key={node.instanceGuid}
//                         onClick={() => handleSelectNamespace(node)}
//                         style={{
//                             padding: "0.5rem 0.75rem",
//                             cursor: "pointer",
//                             backgroundColor:
//                                 selectedNamespace?.instanceGuid === node.instanceGuid
//                                     ? "#1f2937" // bg-gray-800
//                                     : "transparent",
//                         }}
//                         onMouseEnter={(e) => {
//                             if (selectedNamespace?.instanceGuid !== node.instanceGuid) {
//                                 (e.currentTarget.style.backgroundColor = "#1f2937"); // hover
//                             }
//                         }}
//                         onMouseLeave={(e) => {
//                             if (selectedNamespace?.instanceGuid !== node.instanceGuid) {
//                                 (e.currentTarget.style.backgroundColor = "transparent");
//                             }
//                         }}
//                     >
//                         📁 {node.name}
//                     </div>
//                 ))}
//             </div>
//             <div
//                 style={{
//                     flex: 1,
//                     height: '30vh',
//                     overflowY: "scroll",
//                     backgroundColor: "#0f172a", // bg-gray-950
//                 }}
//             >
//                 {selectedNamespace ? (
//                     <div
//                         style={{
//                             display: "grid",
//                             gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
//                             gap: "1.5rem",
//                         }}
//                     >
//                         {selectedNamespace.children?.map((schema) => (
//                             <div
//                                 key={schema.instanceGuid}
//                                 style={{
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     alignItems: "center",
//                                     cursor: "pointer",
//                                     userSelect: "none",
//                                     borderRadius: "0.5rem",
//                                     padding: "0.75rem",
//                                     transition: "background-color 0.15s ease",
//                                 }}
//                                 onMouseEnter={(e) =>
//                                     (e.currentTarget.style.backgroundColor = "#1f2937")
//                                 }
//                                 onMouseLeave={(e) =>
//                                     (e.currentTarget.style.backgroundColor = "transparent")
//                                 }
//                             >
//                                 📄
//                                 <span
//                                     style={{
//                                         marginTop: "0.5rem",
//                                         textAlign: "center",
//                                         fontSize: "0.875rem",
//                                         color: "#e5e7eb", // text-gray-200
//                                         width: "100%",
//                                         overflow: "hidden",
//                                         textOverflow: "ellipsis",
//                                         whiteSpace: "nowrap",
//                                     }}
//                                 >
//                                     {schema.name}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div
//                         style={{
//                             color: "#6b7280", // text-gray-500
//                             fontSize: "0.875rem",
//                             fontStyle: "italic",
//                         }}
//                     >
//                         Select a namespace from the left panel.
//                     </div>
//                 )}
//             </div>
//         </div>

//         // <div style={{ display: "flex", height: '30vh' }}>
//         //         <div
//         //             style={{
//         //                 width: "16rem", // ~w-64
//         //                 borderRight: "1px solid #374151", // border-gray-700
//         //                 overflowY: "auto",
//         //                 backgroundColor: "#111827", // bg-gray-900
//         //             }}
//         //         >
//         //             {tree.map((node) => (
//         //                 <div
//         //                     key={node.instanceGuid}
//         //                     onClick={() => handleSelectNamespace(node)}
//         //                     style={{
//         //                         padding: "0.5rem 0.75rem",
//         //                         cursor: "pointer",
//         //                         backgroundColor:
//         //                             selectedNamespace?.instanceGuid === node.instanceGuid
//         //                                 ? "#1f2937" // bg-gray-800
//         //                                 : "transparent",
//         //                     }}
//         //                     onMouseEnter={(e) => {
//         //                         if (selectedNamespace?.instanceGuid !== node.instanceGuid) {
//         //                             (e.currentTarget.style.backgroundColor = "#1f2937"); // hover
//         //                         }
//         //                     }}
//         //                     onMouseLeave={(e) => {
//         //                         if (selectedNamespace?.instanceGuid !== node.instanceGuid) {
//         //                             (e.currentTarget.style.backgroundColor = "transparent");
//         //                         }
//         //                     }}
//         //                 >
//         //                     📁 {node.name}
//         //                 </div>
//         //             ))}
//         //         </div>
//         //         <div
//         //             style={{
//         //                 flex: 1,
//         //                 padding: "1rem",
//         //                 overflow: "auto",
//         //                 backgroundColor: "#0f172a", // bg-gray-950
//         //             }}
//         //         >
//         //             {selectedNamespace ? (
//         //                 <div
//         //                     style={{
//         //                         display: "grid",
//         //                         gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
//         //                         gap: "1.5rem",
//         //                     }}
//         //                 >
//         //                     {selectedNamespace.children?.map((schema) => (
//         //                         <div
//         //                             key={schema.instanceGuid}
//         //                             style={{
//         //                                 display: "flex",
//         //                                 flexDirection: "column",
//         //                                 alignItems: "center",
//         //                                 cursor: "pointer",
//         //                                 userSelect: "none",
//         //                                 borderRadius: "0.5rem",
//         //                                 padding: "0.75rem",
//         //                                 transition: "background-color 0.15s ease",
//         //                             }}
//         //                             onMouseEnter={(e) =>
//         //                                 (e.currentTarget.style.backgroundColor = "#1f2937")
//         //                             }
//         //                             onMouseLeave={(e) =>
//         //                                 (e.currentTarget.style.backgroundColor = "transparent")
//         //                             }
//         //                         >
//         //                             📄
//         //                             <span
//         //                                 style={{
//         //                                     marginTop: "0.5rem",
//         //                                     textAlign: "center",
//         //                                     fontSize: "0.875rem",
//         //                                     color: "#e5e7eb", // text-gray-200
//         //                                     width: "100%",
//         //                                     overflow: "hidden",
//         //                                     textOverflow: "ellipsis",
//         //                                     whiteSpace: "nowrap",
//         //                                 }}
//         //                             >
//         //                                 {schema.name}
//         //                             </span>
//         //                         </div>
//         //                     ))}
//         //                 </div>
//         //             ) : (
//         //                 <div
//         //                     style={{
//         //                         color: "#6b7280", // text-gray-500
//         //                         fontSize: "0.875rem",
//         //                         fontStyle: "italic",
//         //                     }}
//         //                 >
//         //                     Select a namespace from the left panel.
//         //                 </div>
//         //             )}
//         //         </div>
//         //     </div>

//     );
// };

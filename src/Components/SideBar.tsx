import { FC } from "react";
import SvgJsonSchemaEditor from "../Icons/SvgSideNavButtons/SvgJsonSchemaEditor";
import SvgWorkflowEditor from "../Icons/SvgSideNavButtons/SvgWorkflowEditor";

interface SideBarProps { selected: string; setSelected: (value: string) => void; }

export const SideBar: FC<SideBarProps> = ({ selected, setSelected }) => {
    return ( 
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button
                title={"Integration flow editor"}
                data-toggle="tooltip"
                data-placement="top"
                style={{ margin: 0, padding: 0, background: 'var(--background-color-darker)' }}
                onClick={() => setSelected("workflow-designer")} >
                <SvgWorkflowEditor isSelected={selected === "workflow-designer"} />
            </button>
            <button
                title={"Schemas editor"}
                data-toggle="tooltip"
                data-placement="top"
                style={{ margin: 0, padding: 0, background: 'var(--background-color-darker)' }}
                onClick={() => { setSelected("json-schema-creator"); }}            >
                <SvgJsonSchemaEditor isSelected={selected === "json-schema-creator"} />
            </button>
            <button
                title={"Project Data"}
                data-toggle="tooltip"
                data-placement="top"
                style={{ margin: 0, padding: 0, background: 'var(--background-color-darker)' }}
                onClick={() => setSelected("project-data")} >
                <SvgWorkflowEditor isSelected={selected === "project-data"} />
            </button>
        </div >
    );
};


// // /UI/SideBar.tsx
// import React from "react";

// export interface SideBarItem {
//   id: string;
//   title: string;
//   icon: React.ReactElement<{ className?: string }>;
// }

// interface SideBarProps {
//   items: SideBarItem[];
//   selected: string;
//   setSelected: (value: string) => void;
// }

// export const SideBar: React.FC<SideBarProps> = ({ items, selected, setSelected }) => {
//   return (
//     <div style={{ display: "flex", flexDirection: "column" }}>
//       {items.map((item) => (
//         <button
//           key={item.id}
//           title={item.title}
//           data-toggle="tooltip"
//           data-placement="top"
//           style={{
//             margin: 0,
//             padding: 0,
//             background: "var(--background-color-darker)",
//           }}
//           onClick={() => setSelected(item.id)}
//         >
//           {React.isValidElement(item.icon)
//             ? React.cloneElement(item.icon, {
//               className: selected === item.id ? "selectedSideNavIcon" : "sideNavIcon",
//             })
//             : item.icon}
//         </button>
//       ))}
//     </div>
//   );
// };

import { FC, Fragment, useState } from "react";
import "./IntelliSensePicker.css";
import { ColorHelper } from "../Helpers/ColorHelper";
import { ENodeOperationType } from "../Nodes/types";
import { WirePlotMethodParameter } from "../redux/schemas";

// TODO HOT FIX
// TODO: REFACTOR NEEDED
export interface NodeMetadata {
  hasOwner: boolean;
  ownerNamespace: string;
  ownerSchema: string;
  tooltip: string;
  inputParameters: WirePlotMethodParameter[];
  outputParameters: WirePlotMethodParameter[];
}

export interface IntelliSenseNode {
  id: string;
  label: string;
  type: "folder" | "item";
  icon?: string;
  tooltip?: string;
  color?: string;
  children?: IntelliSenseNode[];
  metadata?: {
    returnType?: string;
    inputParameters?: WirePlotMethodParameter[];
    outputParameters?: WirePlotMethodParameter[];
    methodKind?: "static" | "instance";
    nodeOperationType?: ENodeOperationType;
  };
}




interface IntelliSenseTreeProps {
  nodes: IntelliSenseNode[];
  onSelect: (node: IntelliSenseNode) => void;
}

/**
 * Recursive tree component used to render IntelliSense suggestions.
 * - Supports unlimited nesting depth.
 * - Displays tooltips, parameter types and return types.
 * - Folders can be expanded/collapsed.
 */
export const IntelliSenseTree: FC<IntelliSenseTreeProps> = ({ nodes, onSelect }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const toggle = (id: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="intellisense-tree">
      {nodes.map((node) => (
        <div key={node.id} className={`tree-node ${node.type}`}>
          {node.type === "folder" ? (
            <>
              <div className="folder-label" onClick={() => toggle(node.id)}>
                <span className="folder-arrow">{expanded.has(node.id) ? "▼" : "▶"}</span>
                {node.label}
              </div>

              {expanded.has(node.id) && node.children && (
                <div className="folder-children">
                  <IntelliSenseTree nodes={node.children} onSelect={onSelect} />
                </div>
              )}
            </>
          ) : (
            <div
              className="tree-item"
              onClick={() => onSelect(node)}
              onMouseEnter={(e) => {
                if (node.tooltip) {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setHoveredTooltip(node.tooltip);
                  setTooltipPosition({ x: rect.right + 10, y: rect.top });
                }
              }}
              onMouseLeave={() => {
                setHoveredTooltip(null);
                setTooltipPosition(null);
              }}
            >
              {/* Display return type with color */}
              {node.metadata?.returnType && (
                <span
                  className="method-return"
                  style={{ color: ColorHelper.getColorForSchema(node.metadata.returnType) }}
                >
                  {node.metadata.returnType}
                </span>
              )}{" "}

              {/* Display method name */}
              <span className="method-name">{node.label}</span>

              {/* Render method parameters */}
              {node.metadata?.inputParameters && (
                <>
                  <span className="method-params">(</span>
                  {node.metadata.inputParameters.map((p, i) => {
                    const typeName =
                      p.$ref?.split("/").pop() ?? p.name ?? "?";
                    const color = ColorHelper.getColorForSchema(typeName);
                    return (
                      <Fragment key={i}>
                        {i > 0 && <span className="method-params">, </span>}
                        <span style={{ color }}>{typeName}</span>
                      </Fragment>
                    );
                  })}
                  <span className="method-params">)</span>
                </>
              )}

              {/* Display method kind (static/instance) */}
              {node.metadata?.methodKind === "static" && (
                <span className="method-kind"> • static</span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Tooltip rendering */}
      {hoveredTooltip && tooltipPosition && (
        <div
          className="intellisense-tooltip"
          style={{
            top: tooltipPosition.y,
            left: tooltipPosition.x,
          }}
        >
          {hoveredTooltip}
        </div>
      )}
    </div>
  );
};

import React from "react";
import ReactDOM from "react-dom";
import "./MethodIntelliSensePopup.css";
import { IntelliSenseNode, IntelliSenseTree } from "./IntelliSensePicker";

type Props = {
  open: boolean;
  title: string;
  nodes: IntelliSenseNode[];
  position: { x: number; y: number };
  onSelect: (node: IntelliSenseNode) => void;
  onClose: () => void;
};

/**
 * Top-level IntelliSense popup that renders over the canvas (via React portal).
 * Handles:
 *  - popup positioning,
 *  - click-out selection,
 *  - closing after item selection.
 */
export const MethodIntelliSensePopup: React.FC<Props> = ({
  open,
  title,
  nodes,
  position,
  onSelect,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  const popup = (
    <div
      className="method-intellisense-popup"
      style={{ left: position.x, top: position.y }}
    >
      <div className="method-intellisense-header">{title}</div>
      <IntelliSenseTree
        nodes={nodes}
        onSelect={(node) => {
          onSelect(node);
          onClose();
        }}
      />
    </div>
  );

  return ReactDOM.createPortal(popup, document.body);
};

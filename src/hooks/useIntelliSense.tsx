import { useState, useCallback } from "react";
import { MethodIntelliSensePopup } from "../FisUI/MethodIntelliSensePopup";
import { IntelliSenseNode } from "../FisUI/IntelliSensePicker";

/**
 * Hook to manage the IntelliSense popup lifecycle.
 * - Handles open/close logic.
 * - Keeps track of popup title, position and node data.
 * - Returns helper functions + ready-to-render popup element.
 */
export const useIntelliSense = () => {
  const [popupState, setPopupState] = useState<{
    open: boolean;
    title: string;
    nodes: IntelliSenseNode[];
    position: { x: number; y: number };
    onSelect?: (node: IntelliSenseNode) => void;
  }>({
    open: false,
    title: "",
    nodes: [],
    position: { x: 0, y: 0 },
  });

  /**
   * Opens the IntelliSense popup with the given data.
   */
  const showIntelliSense = useCallback(
    (
      title: string,
      nodes: IntelliSenseNode[],
      position: { x: number; y: number },
      onSelect: (node: IntelliSenseNode) => void
    ) => {
      setPopupState({ open: true, title, nodes, position, onSelect });
    },
    []
  );

  /**
   * Hides the IntelliSense popup.
   */
  const hideIntelliSense = useCallback(() => {
    setPopupState((prev) => ({ ...prev, open: false }));
  }, []);

  /**
   * Ready-to-render React element (Portal-based popup).
   */
  const intelliSenseElement = (
    <MethodIntelliSensePopup
      open={popupState.open}
      title={popupState.title}
      nodes={popupState.nodes}
      position={popupState.position}
      onSelect={(node) => {
        popupState.onSelect?.(node);
        hideIntelliSense();
      }}
      onClose={hideIntelliSense}
    />
  );

  return { showIntelliSense, hideIntelliSense, intelliSenseElement };
};

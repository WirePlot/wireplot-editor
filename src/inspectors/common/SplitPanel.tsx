import '../InspectorPanel.css';
import { MouseEvent, CSSProperties, JSX, useRef, useState, ReactNode } from "react";


interface SplitPanelProps {
    left: ReactNode;
    right: ReactNode;
    minPercent?: number;
    maxPercent?: number;
}

export const SplitPanel = ({ left, right, minPercent = 14, maxPercent = 86 }: SplitPanelProps): JSX.Element => {
    const [leftWidth, setLeftWidth] = useState(30);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
        const startX = e.clientX;
        const startWidth = leftWidth;

        const handleMouseMove = (e: globalThis.MouseEvent): void => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newLeftWidth = startWidth + ((e.clientX - startX) / containerWidth) * 100;
                setLeftWidth(Math.max(minPercent, Math.min(maxPercent, newLeftWidth)));
            }
        };

        const handleMouseUp = (): void => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const shared: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        whiteSpace: "nowrap",
        userSelect: "none",
    };

    return (
        <div ref={containerRef} style={{ display: "flex", width: "100%" }}>
            <div
                key="split-panel-left"
                style={{ ...shared, width: `${leftWidth}%` }}>
                {left}
            </div>
            <div
                key="split-panel-center"
                style={{ width: "2px", cursor: "col-resize", backgroundColor: "#888" }}
                onMouseDown={handleMouseDown}
            />
            <div
                key="split-panel-right"
                style={{ ...shared, width: `${100 - leftWidth}%` }}>
                {right}
            </div>
        </div>
    );
};
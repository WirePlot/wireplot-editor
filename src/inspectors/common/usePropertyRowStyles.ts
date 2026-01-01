import { CSSProperties } from "react";


// ==========================================================
// Shared property-row styles (used by both Variable & Grid panels)
// ==========================================================
export const usePropertyRowStyles = (): { labelStyle: (index: number) => CSSProperties; valueContainer: (index: number) => CSSProperties; inputStyle: CSSProperties; checkboxStyle: CSSProperties; } => {
    const rowBase: CSSProperties = {
        display: "flex",
        alignItems: "center",
        height: "32px",
        fontSize: "13px",
        borderBottom: "1px solid #1a1a1a",
        userSelect: "none",
    };

    const labelStyle = (index: number): CSSProperties => ({
        ...rowBase,
        padding: "0 10px",
        backgroundColor: index % 2 === 0 ? "var(--background-color-brighter)" : "var(--background-color-middle)",
        color: "#d0d0d0",
    });

    const valueContainer = (index: number): CSSProperties => ({
        ...rowBase,
        padding: "0px",
        margin: "0px",
        backgroundColor: index % 2 === 0 ? "var(--background-color-brighter)" : "var(--background-color-middle)",
    });

    const inputStyle: CSSProperties = {
        width: "100%",
        height: "22px",
        backgroundColor: "#202020",
        border: "1px solid #333",
        color: "#fff",
        fontSize: "13px",
        padding: "0px",
        margin: "0px 5px 0px 5px",
        borderRadius: "3px",
    };

    const checkboxStyle: CSSProperties = {
        width: "16px",
        height: "16px",
        cursor: "pointer",
    };

    return { labelStyle, valueContainer, inputStyle, checkboxStyle };
};

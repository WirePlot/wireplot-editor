import { CSSProperties, JSX } from "react";
import { SelectWithCategories, SelectWithCategoriesOption, SelectWithCategoriesOptionGroup } from "../../FisUI/SelectWithCategories";

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

export function createInspectorRowBuilder(left: JSX.Element[], right: JSX.Element[]) {
    let row = 0;

    function pushRow(label: string, content: JSX.Element) {
        left.push(
            <div style={labelStyle(row)}>
                {label}
            </div>
        );
        right.push(

            <div style={valueContainer(row)}>
                {content}
            </div>
        );
        row++;
    }

    function pushReadOnlyRow(label: string, value: string) {
        left.push(
            <div style={labelStyle(row)}>
                {label}
            </div>
        );
        right.push(
            <div style={valueContainer(row)}>
                <input
                    value={value ?? ""}
                    readOnly
                    style={{ ...inputStyle, opacity: 0.7 }}
                />
            </div>
        );
        row++;
    }

    function pushInputRow(label: string, value: string, onBlur: (value: string) => void) {
        left.push(
            <div style={labelStyle(row)}>
                {label}
            </div>
        );
        right.push(
            <div style={valueContainer(row)}>
                <input
                    defaultValue={value}
                    style={{ ...inputStyle }}
                    onBlur={(event) => onBlur(event.target.value)}
                />
            </div>
        );
        row++;
    }


    function pushCheckboxRow(label: string, checked: boolean, onBlur: (checked: boolean) => void) {
        pushRow(label, <input type="checkbox" defaultChecked={checked} style={checkboxStyle} onBlur={(e) => onBlur(e.target.checked)} />
        );
    }

    function pushSelectWithCategoriesRow(label: string, selected: string, groups: SelectWithCategoriesOptionGroup[], onChange: (value: SelectWithCategoriesOption) => void) {
        pushRow(
            label,
            <SelectWithCategories
                groups={groups}
                selected={selected}
                onChange={(event) => { onChange(event); }}
                style={{ width: "100%" }}
            />
        );
    }

    function pushSimpleSelectRow<T extends string>(label: string, value: T, options: readonly T[], onChange: (value: T) => void) {
        pushRow(
            label,
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        );
    }

    return {
        pushCheckboxRow,
        pushInputRow,
        pushRow,
        pushReadOnlyRow,
        pushSimpleSelectRow,
        pushSelectWithCategoriesRow
    };
}
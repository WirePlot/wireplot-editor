import React, { useRef } from "react";
import { store } from "../store";


export const ProjectDataComponent: React.FC = () => {
    const preRef = useRef<HTMLPreElement>(null);

    const handleCopy = (): void => {
        if (preRef.current) {
            const range = document.createRange();
            range.selectNodeContents(preRef.current);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            try {
                document.execCommand("copy");
                alert("JSON copied to clipboard!");
            } catch (err) {
                alert(`Failed to copy! ${err}`);
            }
            selection?.removeAllRanges(); // Clear selection
        }
    };

    const jsonData = JSON.stringify(store.getState().projectSlice, null, 2);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                background: '#212529',
                border: '#424549 solid 1px',
                color: 'white',
            }}
        >
            <button
                onClick={handleCopy}
                style={{
                    margin: '1rem',
                    alignSelf: 'flex-start',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3a3f44',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Copy JSON
            </button>

            <pre
                ref={preRef}
                style={{
                    flexGrow: 1,
                    margin: '1rem',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    backgroundColor: '#2d2d2d',
                    padding: '1rem',
                    borderRadius: '5px',
                }}
            >
                {jsonData}
            </pre>
        </div>
    );
};

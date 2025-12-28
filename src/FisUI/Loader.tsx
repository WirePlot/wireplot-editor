import React from 'react';
import './Loader.css';

interface LoaderProps {
    style?: React.CSSProperties;
}

export const Loader: React.FC<LoaderProps> = ({ style }) => {
    return (
        <div className="loader-container" style={style}>
            <div className="loader-text">Loading</div>
            <div className="loader-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </div>
        </div>
    );
};

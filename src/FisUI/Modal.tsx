import React from 'react';
import { Button } from './Button';

import './Modal.css';

interface ModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <p>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <Button
                        label='Confirm'
                        style={{ padding: '8px', margin: '10px' }}
                        onClick={onConfirm}
                    />
                    <Button
                        label='Cancel'
                        style={{ padding: '8px', margin: '10px' }}
                        onClick={onCancel}
                    />
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideConfirmationDialog } from '../../redux/confirmationDialog';
import { RootState } from '../../store';
import { Button } from '../../FisUI/Button';
import styles from './style.module.css';

const ConfirmationDialog: React.FC = () => {
    const dispatch = useDispatch();
    const dialog = useSelector((state: RootState) => state.confirmationDialogSlice);

    if (!dialog.open) {
        return null;
    }

    const handleConfirm = (): void => {
        dialog.onConfirm?.();
        dispatch(hideConfirmationDialog());
    };

    const handleCancel = (): void => {
        dialog.onCancel?.();
        dispatch(hideConfirmationDialog());
    };

    return (
        <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
                <h3>{dialog.title}</h3>
                <p>{dialog.message}</p>
                <div className={styles.modalButtons}>
                    <Button
                        label='Confirm'
                        style={{ padding: '8px', margin: '10px' }}
                        onClick={handleConfirm}
                    />
                    <Button
                        label='Cancel'
                        style={{ padding: '8px', margin: '10px' }}
                        onClick={handleCancel}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConfirmationDialogState } from "./confirmationDialogTypes";


const initialState: ConfirmationDialogState = {
    open: false,
}

const confirmationDialogSlice = createSlice({
    name: 'confirmationDialog',
    initialState,
    reducers: {
        showConfirmationDialog: (state, action: PayloadAction<{ title: string; message: string; onConfirm: () => void; onCancel: () => void; }>) => {
            state.open = true;
            state.title = action.payload.title;
            state.message = action.payload.message;
            state.onConfirm = action.payload.onConfirm;
            state.onCancel = action.payload.onCancel;
        },
        hideConfirmationDialog: (state) => {
            state.open = false;
            state.title = undefined;
            state.message = undefined;
            state.onConfirm = undefined;
        },
    },
});

export default confirmationDialogSlice.reducer;
export const { showConfirmationDialog, hideConfirmationDialog } = confirmationDialogSlice.actions;

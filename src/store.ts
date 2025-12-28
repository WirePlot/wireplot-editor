import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./redux/project/projectSlice";
import workflowDesignerReducer from "./redux/workflowDesigner";
import schemaEditorReducer from "./redux/schemaEditor/schemasEditorSlice";
import schemasReducer from "./redux/schemas";
import confirmationDialogReducer from "./redux/confirmationDialog";

export const store = configureStore({
  reducer: {
    projectSlice: projectReducer,
    schemaEditorSlice: schemaEditorReducer,
    schemasSlice: schemasReducer,
    workflowDesignerSlice: workflowDesignerReducer,
    confirmationDialogSlice: confirmationDialogReducer

  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
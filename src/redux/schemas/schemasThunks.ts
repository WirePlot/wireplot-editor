import { createAsyncThunk } from '@reduxjs/toolkit';
import { SchemaUtils } from './schemasUtils';
import { WirePlotDocument } from './schemasTypes';

// Fetch schema from string
export const fetchSchemaFromString = createAsyncThunk<
    { source: string; isFlowCapable: boolean; isEditable: boolean; schema: WirePlotDocument },
    { jsonString: string; flowCapable: boolean; isEditable: boolean; shouldNormalizeSchema?: boolean }
>(
    'schemas/fetchFromString',
    async ({ jsonString, flowCapable, isEditable, shouldNormalizeSchema = false }) => {
        try {
            const parsed = JSON.parse(jsonString);

            // Normalize schema if requested
            const schema = shouldNormalizeSchema
                ? SchemaUtils.normalizeOpenApiSchemaWithRefs(parsed)
                : parsed;

            // Find schema name
            const source =
                typeof parsed.info?.title === 'string' && parsed.info.title.trim()
                    ? parsed.info.title.trim()
                    : 'unnamed-schema';

            return { source, isFlowCapable: flowCapable, schema, isEditable };
        } catch (err: unknown) {
            if (err instanceof Error) {
                throw new Error(`Failed to parse JSON string: ${err.message}`);
            }
            throw new Error(`Failed to parse JSON string: ${String(err)}`);
        }
    }
);

// Fetch schema from file
export const fetchSchemaFromFile = createAsyncThunk<
    { source: string; isFlowCapable: boolean; isEditable: boolean; schema: WirePlotDocument },
    { path: string; flowCapable: boolean; isEditable: boolean; shouldNormalizeSchema?: boolean }
>(
    'schemas/fetchFromFile',
    async ({ path, flowCapable, isEditable, shouldNormalizeSchema = false }, { dispatch }) => {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const jsonString = await response.text();
            const result = await dispatch(
                fetchSchemaFromString({ jsonString, flowCapable, isEditable, shouldNormalizeSchema })
            ).unwrap();

            return { ...result, isFlowCapable: flowCapable };
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(`Failed to load schema: ${err.message}`);
                throw new Error(`Failed to load schema: ${err.message}`);
            } else {
                console.error('Failed to load schema: Unknown error', err);
                throw new Error('Failed to load schema: Unknown error');
            }
        }
    }
);

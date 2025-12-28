import { FC, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectSchemaImporterOpen, setSchemaImporterOpen } from '../redux/schemaEditor';
import { fetchSchemaFromString } from '../redux/schemas';



export const SchemaImporter: FC = () => {
  const dispatch = useAppDispatch();
  const [schemaText, setSchemaText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOpen = useAppSelector((state) => selectSchemaImporterOpen(state));

  const handleClose = (): void => {
    dispatch(setSchemaImporterOpen(false));
    setError(null);
    setSchemaText('');
  };


  const handleImport = (): void => {
    try {
      const parsed = JSON.parse(schemaText);

      console.log(JSON.stringify(parsed, null, 2));
      dispatch(
        fetchSchemaFromString({
          jsonString: JSON.stringify(parsed, null, 2),
          flowCapable: false,
          isEditable: true,
          shouldNormalizeSchema: true
        })
      );
      handleClose();
    } catch {
      setError("Invalid JSON. Please check your input.");
    }
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        <h3>Paste OpenAPI JSON Schema</h3>
        <textarea
          style={{
            width: '100%',
            height: '300px',
            fontFamily: 'monospace',
            fontSize: '14px',
            marginBottom: '10px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            resize: 'vertical'
          }}
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
        />
        {error && (
          <p style={{ color: 'red', marginTop: 0, marginBottom: '10px' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={handleClose} style={{ padding: '8px 16px' }}>
            Cancel
          </button>
          <button onClick={handleImport} style={{ padding: '8px 16px' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

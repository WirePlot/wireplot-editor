import './app.css'
import './Styles/DragAndDrop.css'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Routes, Route, HashRouter } from "react-router-dom";
import { Footer } from './Components/Footer';
import { setProjectName } from './redux/project/projectSlice';
import { ReactFlowProvider } from '@xyflow/react';
import ResizableComponent from './Components/Test';
import { SideBar } from './Components/SideBar';
import { WorkflowDesignerComponent } from './Components/WorkflowDesignerComponent';
import { SchemaCreatorComponent } from './Components/SchemaCreatorComponent';
import { ProjectDataComponent } from './Components/ProjectDataComponent';
import { fetchSchemaFromFile } from './redux/schemas';
import { useAppDispatch } from './hooks';
import ConfirmationDialog from './Components/ConfirmationDialog';
import { Loader } from './FisUI/Loader';
import { loadMockProject } from './redux/project/projectThunks';


export class DataProvider {
  constructor() { }
}

function App(): JSX.Element {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<string>("workflow-designer");

  const [projectLoaded, setProjectLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadSchemas = async (): Promise<void> => {
      // -------------------------------------------------------------
      //    LOAD SCHEMAS FROM PUBLIC FOLDER
      // -------------------------------------------------------------
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Project.json', isEditable: true, flowCapable: true }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/Sharepoint365.json', isEditable: true, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/SAP.HANA.REST.API.json', isEditable: true, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/WeatherService.json', isEditable: true, flowCapable: false }));


      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Buffers.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Buffers.Binary.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Buffers.Text.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.CodeDom.Compiler.json', isEditable: false, flowCapable: false }));

      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Collections.json', isEditable: false, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Collections.Concurrent.json', isEditable: false, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Collections.Generic.json', isEditable: false, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Collections.ObjectModel.json', isEditable: false, flowCapable: false }));

      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.ComponentModel.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Configuration.Assemblies.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Diagnostics.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Diagnostics.CodeAnalysis.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Diagnostics.Contracts.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Diagnostics.SymbolStore.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Diagnostics.Tracing.json', isEditable: false, flowCapable: false }));

      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Globalization.json', isEditable: false, flowCapable: false }));

      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.IO.json', isEditable: false, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.IO.Enumeration.json', isEditable: false, flowCapable: false }));

      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Net.json', isEditable: false, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Net.Http.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Numerics.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Reflection.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Reflection.Emit.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Reflection.Metadata.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Resources.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.CompilerServices.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.ConstrainedExecution.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.ExceptionServices.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.InteropServices.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.Intrinsics.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.Loader.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.Remoting.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.Serialization.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Runtime.Versioning.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Security.json', isEditable: false, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Security.Cryptography.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Security.Permissions.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Security.Principal.json', isEditable: false, flowCapable: false }));

      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Text.json', isEditable: false, flowCapable: false }));
      await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Text.Unicode.json', isEditable: false, flowCapable: false }));

      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Threading.json', isEditable: false, flowCapable: false }));
      // await dispatch(fetchSchemaFromFile({ path: 'OpenApiSchemas/Generated/System.Threading.Tasks.json', isEditable: false, flowCapable: false }));


      // -------------------------------------------------------------
      // 🔥 SCHEMAS ARE READY — LET's LOAD MOCK PROJECT
      // -------------------------------------------------------------
      await dispatch(loadMockProject());

      setProjectLoaded(true);
      dispatch(setProjectName("WeatherService"));
    };

    loadSchemas();
  }, [dispatch]);


  const renderComponent = useMemo(() => {
    switch (selected) {
      case "workflow-designer": return <WorkflowDesignerComponent />;
      case "json-schema-creator": return <SchemaCreatorComponent />;
      case "project-data": return <ProjectDataComponent />;
      default: return null;
    }
  }, [selected]);

  return (
    <>
      <HashRouter>
        <ReactFlowProvider>
          {/* <Header></Header> */}
          <Routes>
            <Route path='/b' element={
              <ResizableComponent></ResizableComponent>
            } />
            <Route path="/" element={
              <div style={{ display: 'flex', height: 'calc(100vh - var(--header-height) - var(--footer-height))' }}>
                {projectLoaded ? (
                  <>
                    <SideBar selected={selected} setSelected={setSelected} />
                    {renderComponent}
                  </>
                ) : (<Loader />)}
              </div>
            } />
          </Routes>
          <ConfirmationDialog />
          <Footer></Footer>
        </ReactFlowProvider>
      </HashRouter>
    </>
  )
}


export default App
import './index.css'
import App from './app.tsx'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './store.ts';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)




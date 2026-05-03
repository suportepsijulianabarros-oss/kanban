import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CRMKanbanProvider } from './components/kanban/CRMKanbanContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CRMKanbanProvider>
      <App />
    </CRMKanbanProvider>
  </StrictMode>,
);

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { SystemProvider } from './context/SystemContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SystemProvider>
  </StrictMode>,
);

import React from 'react'
import ReactDOM from 'react-dom/client' 
import { SignUp } from './pages/sign_up'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './pages/App';
import { UserProvider } from './contexts/UserContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/home" element={<App></App>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);


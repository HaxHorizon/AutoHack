import { StrictMode } from 'react'
import React from 'react';
import { createRoot } from 'react-dom/client'
import RouterComponent from './Router'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterComponent />
  </StrictMode>,
)
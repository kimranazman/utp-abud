import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

// Debug logging for deployment verification
console.log('🚀 App initializing...');
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Mode:', import.meta.env.MODE);
console.log('Vite env vars:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">Root element not found</h1>';
} else {
  console.log('✓ Root element found, rendering app...');
  createRoot(rootElement).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}

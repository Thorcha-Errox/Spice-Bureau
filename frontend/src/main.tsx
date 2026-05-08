import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import "leaflet/dist/leaflet.css";
import { SocketProvider } from './context/SocketContext.tsx';

export const authService = "https://spice-auth.onrender.com";
export const restaurantService = "https://spice-restaurant.onrender.com";
export const utilsService = "https://spice-utils.onrender.com";
export const realtimeService = "https://spice-realtime.onrender.com";
export const riderService = "https://spice-rider.onrender.com";
export const adminService = "https://spice-admin.onrender.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="417480107911-uj9esqhu528pnjfma3n17bv84udtibl3.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);

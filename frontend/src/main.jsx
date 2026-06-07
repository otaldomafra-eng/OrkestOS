import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { DataProvider } from './context/DataProvider.jsx'
import { DailyPlanProvider } from './context/DailyPlanProvider.jsx'
import { AppProvider } from './store/AppProvider.jsx'
import GamificationProvider from './context/GamificationProvider.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <DailyPlanProvider>
              <GamificationProvider>
                <App />
              </GamificationProvider>
            </DailyPlanProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
)

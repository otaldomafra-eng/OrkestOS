import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { DailyPlanProvider } from './context/DailyPlanContext.jsx'
import { AppProvider } from './store/AppContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <DailyPlanProvider>
              <AppProvider>
                <App />
              </AppProvider>
            </DailyPlanProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
)

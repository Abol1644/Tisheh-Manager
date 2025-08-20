import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/providers/AppProviders'
import App from '@/App'
import '@/index.css'
import '@/assets/css/style.css'
import ErrorBoundary from '@/pages/Errors/ErrorBoundry'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from '@/utils/dayjs-jalali';
import { PersianNumbersProvider } from '@/contexts/PersianNumber'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fa">
            <PersianNumbersProvider>
              <App />
            </PersianNumbersProvider>
          </LocalizationProvider>
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
)
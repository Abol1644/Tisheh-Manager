import { createContext, useContext, useMemo, useEffect, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import CssBaseline from '@mui/material/CssBaseline'
import rtlPlugin from 'stylis-plugin-rtl'
import { prefixer } from 'stylis'

const ThemeModeContext = createContext()

export const useThemeMode = () => useContext(ThemeModeContext)

export function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', mode)
  }, [mode])

  const toggleMode = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const toggleLight = () => {
    setMode('light')
  }

  const toggleDark = () => {
    setMode('dark')
  }

  const theme = useMemo(() => createTheme({
    direction: 'rtl',
    palette: {
      mode,
      primary: {
        main: '#fbb800',
        shade: '#ffce53',
        warning: '#ff8000',
        warningShade: '#ffbd59',
      },
      background: {
        default: mode === 'dark' ? '#000000 !important' : '#ECEBEB !important',
        glass: mode === 'dark' ? 'rgba(30, 30, 30, 0.7) !important' : 'rgba(255, 255, 255, 0.7) !important',
        secondary: '#9c27b0 !important',
        secondaryShade: '#efb7f9 !important',
        paper: mode === 'dark' ? '#1e1e1e !important' : '#ffffff !important',
        overlay: mode === 'dark' ? '#212121 !important' : '#ECEBEB !important',
        fade: mode === 'dark' ? 'rgb(0, 0, 0, 0.1) !important' : 'rgb(255, 255, 255, 0.1) !important',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? '#aaaaaa' : '#555555',
        light: mode === 'dark' ? '#ffffff' : '#ffffff',
        dark: mode === 'dark' ? '#222222' : '#222222',
        warning: mode === 'dark' ? '#F15050' : '#BB1616',
      },
      icon: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? '#0062ff' : '#0062ff',
        success: '#1b5e20',
        successShade: '#86f18d'
      }
    },
    typography: {
      fontFamily: 'IRANYekanX, Arial, sans-serif', // your Persian font
    }
  }), [mode])

  // Create a cache for RTL
  const cacheRtl = useMemo(() => createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  }), [])

  // Dynamic function to set CSS custom properties
  // const setCSSProperties = (obj, prefix = '') => {
  //   Object.entries(obj).forEach(([key, value]) => {
  //     if (typeof value === 'object' && value !== null) {
  //       // Recursively handle nested objects
  //       setCSSProperties(value, prefix ? `${prefix}-${key}` : key)
  //     } else {
  //       const propertyName = prefix ? `--${prefix}-${key}` : `--${key}`
  //       const cleanValue = typeof value === 'string' ? value.replace(' !important', '') : value
  //       document.body.style.setProperty(propertyName, cleanValue)
  //     }
  //   })
  // }

  // useEffect(() => {
  //   // Dynamically set all palette colors as CSS custom properties
  //   setCSSProperties(theme.palette)
  // }, [theme])

  // ...existing code...

  useEffect(() => {
    if (mode === 'dark') {
      document.body.style.setProperty('--primary-main', '#fbb800');
      document.body.style.setProperty('--primary-shade', '#ffce53');
      document.body.style.setProperty('--primary-warning', '#ff8000');
      document.body.style.setProperty('--primary-warningShade', '#ffbd59');
      document.body.style.setProperty('--background-default', '#000000');
      document.body.style.setProperty('--background-secondary', '#9c27b0');
      document.body.style.setProperty('--background-secondaryShade', '#1b061e');
      document.body.style.setProperty('--background-paper', '#1e1e1e');
      document.body.style.setProperty('--background-overlay', '#212121');
      document.body.style.setProperty('--background-overlay-light', '#2F2F2F');
      document.body.style.setProperty('--background-fade', 'rgb(0, 0, 0, 0.1)');
      document.body.style.setProperty('--background-glass', 'rgb(30, 30, 30, 0.3)');
      document.body.style.setProperty('--text-primary', '#ffffff');
      document.body.style.setProperty('--text-secondary', '#aaaaaa');
      document.body.style.setProperty('--text-light', '#ffffff');
      document.body.style.setProperty('--text-dark', '#222222');
      document.body.style.setProperty('--text-warning', '#F15050');
      document.body.style.setProperty('--icon-primary', '#ffffff');
      document.body.style.setProperty('--icon-success', '#1b5e20');
      document.body.style.setProperty('--icon-successShade', '#86f18d');
      document.body.style.setProperty('--table-header', '#292929');
      document.body.style.setProperty('--table-border-overlay', '#333333');
      document.body.style.setProperty('--info-shade', '#002b41');
      document.body.style.setProperty('--icon-main', '#0288d1');
      document.body.style.setProperty('--border-main', 'rgba(255, 255, 255, 0.23)');
      document.body.style.setProperty('--transparent', 'rgba(0, 0, 0, 0)');

    } else {
      document.body.style.setProperty('--primary-main', '#fbb800');
      document.body.style.setProperty('--primary-shade', '#ffce53');
      document.body.style.setProperty('--primary-warning', '#ff8000');
      document.body.style.setProperty('--primary-warningShade', '#ffbd59');
      document.body.style.setProperty('--background-default', '#ffffff');
      document.body.style.setProperty('--background-secondary', '#9c27b0');
      document.body.style.setProperty('--background-secondaryShade', '#F5F5F5');
      document.body.style.setProperty('--background-paper', '#ffffff');
      document.body.style.setProperty('--background-overlay', '#ECEBEB');
      document.body.style.setProperty('--background-overlay-light', '#fbfbfb');
      document.body.style.setProperty('--background-fade', 'rgb(255, 255, 255, 0.1)');
      document.body.style.setProperty('--background-glass', 'rgb(255, 255, 255, 0.3)');
      document.body.style.setProperty('--text-primary', '#000000');
      document.body.style.setProperty('--text-secondary', '#555555');
      document.body.style.setProperty('--text-light', '#ffffff');
      document.body.style.setProperty('--text-dark', '#222222');
      document.body.style.setProperty('--text-warning', '#BB1616');
      document.body.style.setProperty('--icon-primary', '#000000');
      document.body.style.setProperty('--icon-success', '#1b5e20');
      document.body.style.setProperty('--icon-successShade', '#86f18d');
      document.body.style.setProperty('--table-header', '#FFF3D1');
      document.body.style.setProperty('--table-border-overlay', '#dfdfdf');
      document.body.style.setProperty('--info-shade', '#edf9ff');
      document.body.style.setProperty('--icon-main', '#0288d1');
      document.body.style.setProperty('--border-main', 'rgba(0, 0, 0, 0.23)');
      document.body.style.setProperty('--transparent', 'rgba(0, 0, 0, 0)');
    }
  }, [mode]);


  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode, toggleLight, toggleDark }}>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </ThemeModeContext.Provider>
  )
}

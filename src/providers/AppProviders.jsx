import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CustomThemeProvider } from '@/contexts/ThemeContext'
import { WorkGroupProvider } from '@/contexts/WorkGroupContext'
import { FinancialPeriodProvider } from '@/contexts/FinancialPeriodContext'
import { SnackbarProvider } from '@/contexts/SnackBarContext'

const combineProviders = (providers) => ({ children }) => {
  return providers.reduce(
    (acc, [Provider, props = {}]) => 
      React.createElement(Provider, props, acc),
    children
  )
}

export const AppProviders = combineProviders([
  [CustomThemeProvider, { dir: 'rtl' }],
  [WorkGroupProvider],
  [FinancialPeriodProvider],
  [AuthProvider],
  [SnackbarProvider],
])
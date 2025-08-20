import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Snackbar, Alert, AlertColor, Slide, CircularProgress, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function SlideTransition(props: any) {
  return <Slide {...props} direction="up" />;
}

interface SnackbarMessage {
  id: string;
  message: string;
  severity: AlertColor;
  duration?: number;
  icon?: ReactNode;
  open: boolean;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity: AlertColor, duration?: number, icon?: ReactNode) => string;
  closeSnackbarById: (id: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);
  const maxSnack = 3;

  const showSnackbar = (message: string, severity: AlertColor, duration: number = 5000, icon?: ReactNode): string => {
    const id = Date.now().toString();
    const newSnackbar = { id, message, severity, duration, icon, open: true };
    
    setSnackbars(prev => {
      const updated = [...prev, newSnackbar];
      return updated.slice(-maxSnack);
    });

    if (duration > 0) {
      setTimeout(() => {
        closeSnackbar(id);
      }, duration);
    }

    return id;
  };

  const closeSnackbar = (id: string) => {
    setSnackbars(prev => 
      prev.map(snackbar => 
        snackbar.id === id ? { ...snackbar, open: false } : snackbar
      )
    );
    
    // Remove from array after animation completes
    setTimeout(() => {
      setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
    }, 300); // Match transition duration
  };

  const closeSnackbarById = (id: string) => {
    closeSnackbar(id);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbarById }}>
      {children}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={snackbar.open}
          onClose={() => closeSnackbar(snackbar.id)}
          autoHideDuration={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          slots={{ transition: SlideTransition }}
          sx={{
            display: 'flex',
            flexDirection: 'row-reverse',
            bottom: `${16 + (snackbars.length - 1 - index) * 70}px !important`,
            '& .MuiAlert-action':{
              marginLeft: '0 !important',
              marginRight: 'auto !important',
              padding: '7px 0 !important',
              alignItems: 'center'
            },
            '& .MuiAlert-icon':{
              marginLeft: '8px !important',
              marginRight: '0 !important',
            },
            '& .MuiIconButton-root ':{
              padding: '0 !important'
            },
            '& .MuiAlert-message  ':{
              lineHeight: 'normal'
            },
          }}
        >
          <Alert
            onClose={() => closeSnackbar(snackbar.id)}
            severity={snackbar.severity}
            variant="filled"
            icon={snackbar.icon}
            sx={{ 
              width: '100%',
              minWidth: '300px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '50px',
              lineHeight: 'normal !important',
              alignItems: 'center'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};
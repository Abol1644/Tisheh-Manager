import * as React from 'react'
import { Box, IconButton, Button } from '@mui/material'
import NoAccessImage from '@/assets/images/NoAccess.png'
import { useThemeMode } from '@/contexts/ThemeContext'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Brightness7Icon from '@mui/icons-material/DarkMode';
import { useNavigate } from 'react-router-dom';

export default function NoAccess() {

  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();

  return (
    <>
    <Box
      sx={{
        position: 'absolute',
        right: 20,
        top: 20,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <IconButton
        onClick={toggleMode}
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          transition: "all 0.3s ease-in-out",
          '&:hover': {
            transform: 'scale(1.05)',
          }
        }}
      >
        {mode === "light" ? <DarkModeIcon /> : <Brightness7Icon />}
      </IconButton>
    </Box>
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        transition: "all 0.3s ease",
        background: mode === 'light' 
        ? 'radial-gradient(ellipse at 50% 50%, hsl(148, 100.00%, 97.10%), hsl(0, 0%, 100%))'
        : 'radial-gradient(at 50% 50%, hsla(157, 100.00%, 16.10%, 0.50), hsl(220, 30%, 5%))'
      }}
    >
      <img src={ NoAccessImage } style={{ width: '350px', marginBottom: '20px' }}></img>
      <h1>شما به این صفحه دسترسی ندارید</h1>
      <Btn onClick={() => navigate('/dashboard/managment', { replace: true }) } variant='contained' sx={{ borderRadius: '50px', mt: 3 }}> بازگشت </Btn>
    </Box>
    </>
  )
}
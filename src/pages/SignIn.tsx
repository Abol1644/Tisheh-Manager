import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'

import { Box } from '@mui/material';
import Alert from '@mui/material/Alert';
import MuiCard from '@mui/material/Card';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CircularProgress from '@mui/material/CircularProgress';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import type { User } from '@/models/Users';
import favLogo from '@/assets/favicon.svg?react';
import { useAuth } from '@/contexts/AuthContext';
import { loginApi } from '@/api/authApi';
import { useThemeMode } from "@/contexts/ThemeContext";
import rawLogoDark from '@/assets/images/Raw-Dark.png';
import rawLogoLight from "@/assets/images/Raw-Light.png";
import backgroundPaper from "@/assets/images/paper-texture.jpg";
import Btn from '@/components/elements/Btn';
import { position } from 'stylis';
import { flex, width, height } from '@/models/ReadyStyles';
import zIndex from '@mui/material/styles/zIndex';
import DotGrid from '@/components/elements/DotGrid';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  borderRadius: '20px',
  width: '400px',
  height: 'fit-content',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  transition: 'all 0.3s ease',
  backgroundColor: 'transparent',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...(theme.applyStyles && theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  })),
}));

type SignInProps = {
  onLoginSuccess?: () => void;
};

export default function SignIn({ onLoginSuccess }: SignInProps) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [phoneError, setPhoneError] = React.useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const { mode, toggleDark } = useThemeMode();
  const [loading, setLoading] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackError, setSnackError] = React.useState('');
  const [authResponse, setAuthResponse] = React.useState('');
  const [loginSuccess, setLoginSuccess] = React.useState(false);
  const [snack, setSnack] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // useEffect(() => {
  //   toggleDark();
  // }, [toggleDark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    let mobile = (form.elements.namedItem('mobile') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (mobile.startsWith('0')) {
      mobile = mobile.slice(1);
    }

    setLoading(true);
    try {
      const auth = await loginApi(mobile, password);
      setAuthResponse(auth.message);
      login(auth);
      setLoginSuccess(true); // Set login success to true
      setSnack({ open: true, msg: 'ورود موفق', type: 'success' });

      // This will trigger Chrome to offer saving the password
      if (onLoginSuccess) onLoginSuccess();

      // Optionally navigate after successful login
      // navigate('/dashboard');
    } catch (err: any) {
      setLoginSuccess(false); // Ensure this is false on failure
      setSnack({ open: true, msg: authResponse || 'خطا در ورود', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: '0'
        }}
      >
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </Box>
      <Box
        className='signin-container'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: "background-color 0.3s ease",
          ...width.screen
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
            borderRadius: '20px',
            width: '400px',
            height: 'fit-content',
            padding: 4,
            gap: 2,
            margin: 'auto',
            transition: 'all 0.3s ease',
            backgroundColor: 'transparent',
            backdropFilter: 'blur(10px) brightness(0.9)',
            // border: '1px solid rgba(255, 255, 255, 0.23)',
            boxShadow: '0 30px 10px -20px rgba(0, 0, 0, 0.23)',
            position: 'relative',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', width: '100%', color: 'text.light' }}>
            ورود به حساب کاربری
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            {...({ noValidate: true } as any)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'start',
              width: '100%',
              gap: 2,
              position: 'relative'
            }}
          >
            <FormControl sx={{ width: '100%' }}>
              <TextField
                error={phoneError}
                helperText={phoneErrorMessage}
                id="mobile"
                type="tel"
                name="mobile"
                placeholder="شماره موبایل"
                autoComplete="username"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={phoneError ? 'error' : 'primary'}
                size="small"
                inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*' }}
                disabled={loading}
                sx={{
                  borderRadius: '42px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '42px',
                  },
                  '& .MuiInputBase-root, .MuiInputBase-input, .MuiOutlinedInput-input:-webkit-autofill': {
                    borderRadius: '42px',
                  }
                }}
              />
            </FormControl>
            <FormControl sx={{ width: '100%' }}>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="رمز عبور"
                autoComplete={loginSuccess ? "current-password" : "off"}
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
                size="small"
                disabled={loading}
                sx={{
                  borderRadius: '42px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '42px',
                  },
                  '& .MuiInputBase-root, .MuiInputBase-input, .MuiOutlinedInput-input:-webkit-autofill': {
                    borderRadius: '42px',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      tabIndex={-1}
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </FormControl>
            <Btn
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2, fontWeight: 700, fontSize: '1.1rem', width: '50%' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : <>{<LoginRoundedIcon sx={{ mr: 1 }} />} ورود</>}
            </Btn>
          </Box>
        </Box>
      </Box >
      {/* Success Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)
        }
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          ورود موفق
        </Alert>
      </Snackbar >
      {/* Error Snackbar */}
      < Snackbar
        open={!!snackError}
        autoHideDuration={2500}
        onClose={() => setSnackError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackError}
        </Alert>
      </Snackbar >
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.type}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}

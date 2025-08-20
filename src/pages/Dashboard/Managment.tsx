import React, { useEffect, useState} from 'react'
import { Box, Container, Paper, Typography, Backdrop, CircularProgress, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '@/contexts/AuthContext';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useThemeMode } from "@/contexts/ThemeContext";
import { findUser } from '@/api/usersApi';
import { UserData } from '@/models/Users';
import PageContainer from '@/components/PageContainer'

export default function Managment() {
  interface DecodedToken {
    UserId: string;
  }

  const { decodedToken } = useAuth() as { decodedToken: DecodedToken };
  const { mode } = useThemeMode();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    setLoading(true);
    findUser(decodedToken?.UserId)
      .then(user => setUserData(user))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  if (userData) {
    // console.log('Updated userData:', userData);
  }
}, [userData]);

  return (
      <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <PageContainer justif='flex-start'>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '250px', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 40, mr: 1 }} />
            <Typography variant="h4">مدیریت</Typography>
          </Box>
            <div
              style={{
                height: '2px',
                width: '130%',
                margin: '10px auto',
                backgroundImage: mode === "light"
                  ? 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgb(0, 0, 0) 100%)'
                  : 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
                transition: 'background-image 0.3s ease'
              }}
            />
        </Box>
        <Grid container spacing={3}>
          <Grid>
            <Paper
              sx={{
                p: 2,
                mb: 4,
                display: 'inline-block',
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
                gap: 2
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                اطلاعات کاربر
              </Typography>
              <Typography variant="body2" sx={{mb: 1}}>
                نام: {userData?.name || '-'} { userData?.lastName || '' }
              </Typography>
              <Typography variant="body2">
                شماره: { userData?.mobile || '' }
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </PageContainer>
      </>
  );
}
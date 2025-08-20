// CompanySelect.tsx - Updated to use Zustand
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Period } from '@/models/Period';
import { Box, Button, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress, Backdrop, IconButton } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useThemeMode } from '@/contexts/ThemeContext';
import { getPeriods } from '@/api/authApi';
import type { UserTable } from '@/models/Users';
import Btn from '@/components/elements/Btn';

import { useOrgansStore } from '@/stores/organStore';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  borderRadius: '20px',
  width: '480px',
  height: 'fit-content',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...(theme.applyStyles?.('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  })),
}));

type CompanySelectProps = {
  onCompanySelected?: () => void;
  onBack?: () => void;
};

export default function CompanySelect({ onCompanySelected, onBack }: CompanySelectProps) {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  
  const { organs, loading: organsLoading, fetchOrgans } = useOrgansStore();
  
  // Keep periods as local state since they're specific to this component
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | ''>('');
  const [selectedPeriod, setSelectedPeriod] = useState<number | ''>('');
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { decodedToken } = useAuth() as { decodedToken: UserTable };

  // ✅ Fetch organs using Zustand
  useEffect(() => {
    if (organs.length === 0) {
      fetchOrgans();
    }
  }, [organs.length, fetchOrgans]);

  // Fetch periods when company is selected (keep this logic as is)
  useEffect(() => {   
    if (selectedCompany) {
      setPeriodsLoading(true);
      getPeriods(Number(selectedCompany))
        .then(periods => setPeriods(Array.isArray(periods) ? periods : []))
        .finally(() => setPeriodsLoading(false));
      setSelectedPeriod('');
    } else {
      setPeriods([]);
      setSelectedPeriod('');
    }
  }, [selectedCompany]);

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      const selectedOrgan = organs.find(o => o.id === selectedCompany);
      const selectedPeriodObj = periods.find(p => p.id === selectedPeriod);

      if (selectedOrgan && selectedPeriodObj) {
        localStorage.setItem('selectedCompany', String(selectedCompany));
        localStorage.setItem('selectedCompanyTitle', selectedOrgan.companyName);
        localStorage.setItem('selectedPeriod', String(selectedPeriod));
        localStorage.setItem('selectedPeriodObj', Object(selectedPeriod));
        localStorage.setItem('selectedPeriodTitle', selectedPeriodObj.title);
        localStorage.setItem('periodData', JSON.stringify(selectedPeriodObj));
      }
      if (onCompanySelected) onCompanySelected();
      navigate('/dashboard/managment', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Combine loading states
  const isLoading = organsLoading || periodsLoading;

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3 ease'
      }}
      className={
        (mode === "light"
          ? "signin-container signin-container-light"
          : "signin-container signin-container-dark"
        ) + " fade-in"
      }
    >
      <Backdrop open={isLoading || submitting} sx={{ zIndex: 9999, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {onBack && (
        <Btn
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, fontWeight: '800', fontSize: "1.1rem", color: 'text.primary', border: '1px solid', borderColor: 'text.primary' }}
          size='large'
        >
          بازگشت
        </Btn>
      )}
      <Card variant="outlined">
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', width: '100%' }}>انتخاب شرکت و دوره مالی</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%' }}>
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', alignItems: 'center', gap : 1}}>
            <FormControl fullWidth>
              <InputLabel id="company-select-label">شرکت</InputLabel>
              <Select
                labelId="company-select-label"
                id="company-select"
                value={selectedCompany}
                label="شرکت"
                onChange={e => setSelectedCompany(Number(e.target.value))}
              >
                {/* ✅ Using organs from Zustand store */}
                {organs.map(company => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.subTitle + ' ' + company.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {decodedToken?.Manage === "True" && (
              <IconButton sx={{width: '45px', height: '45px'}} aria-label="add" color="primary">
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', alignItems: 'center', gap : 1}}>
            <FormControl fullWidth disabled={!selectedCompany}>
              <InputLabel id="period-select-label">دوره مالی</InputLabel>
              <Select
                labelId="period-select-label"
                id="period-select"
                value={selectedPeriod}
                label="دوره مالی"
                onChange={e => setSelectedPeriod(Number(e.target.value))}
              >
                {periods.map(period => (
                  <MenuItem key={period.id} value={period.id}>{period.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {decodedToken?.Manage === "True" && (
              <IconButton sx={{width: '45px', height: '45px'}} aria-label="add" color="primary">
                <AddIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        <Btn
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleContinue}
          fullWidth
          disabled={!selectedCompany || !selectedPeriod || submitting}
        >
          ادامه
        </Btn>
      </Card>
    </Box>
  );
}
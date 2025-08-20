import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
} from '@mui/material';

import Btn from '@/components/elements/Btn';

const UserDialog = ({ open, onClose, onSubmit, title, sendButtonText, initialData = {} }) => {
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Mobile: '',
    Password: '',
    IsAdmin: false,
    IsActive: true,
    Code: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        FirstName: '',
        LastName: '',
        Mobile: '',
        Password: '',
        IsAdmin: false,
        IsActive: true,
        Code: '',
        ...initialData
      });
    }
  }, [initialData, open]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(formData);
  }, [onSubmit, formData]);

  // Don't render anything when closed
  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      transitionDuration={150}
      sx={{
        '& .MuiPaper-root ': {
          borderRadius: '8px',
          p: 1,
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="نام"
            value={formData.FirstName}
            onChange={(e) => handleInputChange('FirstName', e.target.value)}
            fullWidth
            size="small"
            autoComplete="off"
          />
          <TextField
            label="نام خانوادگی"
            value={formData.LastName}
            onChange={(e) => handleInputChange('LastName', e.target.value)}
            fullWidth
            size="small"
            autoComplete="off"
          />
          <TextField
            label="شماره موبایل"
            value={formData.Mobile}
            onChange={(e) => handleInputChange('Mobile', e.target.value)}
            placeholder="09xxxxxxxxx"
            fullWidth
            size="small"
            autoComplete="off"
          />
          <TextField
            label="رمز عبور"
            type="password"
            value={formData.Password}
            onChange={(e) => handleInputChange('Password', e.target.value)}
            fullWidth
            size="small"
            autoComplete="new-password"
          />
          <TextField
            label="کد کاربری"
            type="number"
            value={formData.Code}
            onChange={(e) => handleInputChange('Code', e.target.value)}
            fullWidth
            size="small"
            autoComplete="off"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.IsAdmin}
                onChange={(e) => handleInputChange('IsAdmin', e.target.checked)}
                size="small"
              />
            }
            label="مدیر"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.IsActive}
                onChange={(e) => handleInputChange('IsActive', e.target.checked)}
                size="small"
              />
            }
            label="فعال"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Btn onClick={onClose} color='error' sx={{ minWidth: 100 }} >انصراف</Btn>
        <Btn onClick={handleSubmit} color='primary' variant="contained" sx={{ minWidth: 100, ml: 2 }} >
          {sendButtonText}
        </Btn>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;

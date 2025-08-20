import React from 'react';
import { Box, Typography, Button, Paper, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useThemeMode } from "@/contexts/ThemeContext";
import PageContainer from '@/components/PageContainer';

import { persianDataGridLocale } from '@/components/datagrids/DataGridProps';

import Btn from '@/components/elements/Btn';

const ManagmentLayout = ({
  header,
  headerIcon,
  buttons = [],
  columns,
  rows,
  loading = false,
  getRowId,
  children,
  snackbar = { open: false, message: '', severity: 'success' },
  onSnackbarClose,
}: any) => {
  const { mode } = useThemeMode();

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {headerIcon}
              <Typography variant="h4">{header}</Typography>
            </Box>
            <Box
              sx={{
                height: '2px',
                width: '130%',
                mt: 1,
                backgroundImage: mode === "light"
                  ? 'linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgb(0, 0, 0) 100%)'
                  : 'linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
                transition: 'background-image 0.3s ease'
              }}
            />
          </Box>
          {buttons.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexDirection: 'row-reverse' }}>
              {buttons.map((button: any, index: any) => (
                <Btn
                  key={index}
                  variant={button.variant || 'contained'}
                  color={button.color || 'primary'}
                  startIcon={button.icon}
                  onClick={button.onClick}
                  sx={button.sx || {}}
                >
                  {button.text}
                </Btn>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ width: '100%', height: '100%', }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100, { value: -1, label: 'همه' }]}
          rowHeight={52}
          columnHeaderHeight={56}
          density="compact"
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-mainContent': {
              border: mode === 'light' ? '2px solid #e3e3e3' : '2px solid #6b6b6b',
              borderRadius: '16px',
              backgroundColor: 'background.paper',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderBottomColor: mode === 'light' ? '#e0e0e0' : '#292929',
              p: '20px',
              display: 'flex',
              backgroundColor: "background.default",
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'black',
              borderBottom: '2px solid',
              borderBottomColor: mode === 'light' ? '#e0e0e0' : '#616161',
            },
            '& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader': {
              backgroundColor: mode === 'light' ? '#f5f5f5' : '#292929',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: mode === 'light' ? '#f5f5f5' : '#292929',
            },
            '& .MuiDataGrid-row': {
              maxHeight: "56px !important",
              '--height': "56px !important"
            }
          }}
          localeText={{
            ...persianDataGridLocale
          }}

        />
      </Box>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={onSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onSnackbarClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ManagmentLayout;
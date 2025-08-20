import * as React from 'react'
import { useState, useMemo } from 'react'

import { useThemeMode } from '@/contexts/ThemeContext';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';

import {
  Box, Typography,
  Button, Paper,
  Snackbar, Alert,
  Container, IconButton,
  Theme, useTheme,
  OutlinedInput, InputLabel,
  MenuItem, FormControl,
  Select, ListItemText,
  Checkbox, TextField,
  Accordion, AccordionActions,
  AccordionSummary, AccordionDetails,
  Drawer
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import TuneIcon from '@mui/icons-material/Tune';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SelectChangeEvent } from '@mui/material/Select';
import PageContainer from '@/components/PageContainer';

import Btn from '@/components/elements/Btn';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, selectedOperations: readonly string[], theme: Theme) {
  return {
    fontWeight: selectedOperations.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const operations = [
  'ورود به سیستم',
  'ویرایش پروفایل',
  'حذف فایل',
  'آپلود فایل',
  'تغییر رمز عبور',
  'خروج از سیستم',
  'دسترسی غیرمجاز',
  'ایجاد گزارش',
  'بروزرسانی اطلاعات',
  'ورود ناموفق',
];

export default function UserLogs() {
  const { mode } = useThemeMode();
  const theme = useTheme();
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  const handleChange = (event: SelectChangeEvent<typeof selectedOperations>) => {
    const {
      target: { value },
    } = event;
    setSelectedOperations(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const openFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen)
  }

  const accordionStyles = useMemo(() => ({
    marginTop: '8px',
    borderRadius: '10px',
    borderBottomRightRadius: '10px !important',
    borderBottomLeftRadius: '10px !important',
    '&::before': {
      display: 'none',
    }
  }), [theme]);


  const columns: GridColDef[] = [
    {
      field: 'rowNumber',
      headerName: 'ردیف',
      width: 60,
      align: 'center' as const,
      headerAlign: 'center' as const,
      sortable: false,
      filterable: false,
      resizable: true,
      renderCell: (params) => {
        const rowIndex = params.api.getAllRowIds().indexOf(params.id);
        return rowIndex + 1;
      }
    },
    {
      field: 'username',
      headerName: 'نام کاربری',
      width: 120,
      resizable: true,
      flex: 0.2
    },
    {
      field: 'form',
      headerName: 'فرم',
      width: 120,
      resizable: true,
      flex: 0.2
    },
    {
      field: 'action',
      headerName: 'عملیات',
      width: 220,
      resizable: true,
      flex: 0.2
    },
    {
      field: 'timestamp',
      headerName: 'زمان',
      width: 200,
      resizable: true,
      flex: 0.25
    },
    {
      field: 'details',
      headerName: 'جزئیات',
      width: 400,
      resizable: true,
      flex: 0.35
    },
  ];

  const rows = [
    {
      id: 1,
      username: 'احمد_محمدی',
      action: 'ورود به سیستم',
      timestamp: '1402/08/15 - 14:30',
      details: 'ورود موفق از IP: 192.168.1.100',
      form: 'فرم ورود'
    },
    {
      id: 2,
      username: 'فاطمه_احمدی',
      action: 'ویرایش پروفایل',
      timestamp: '1402/08/15 - 13:45',
      details: 'تغییر شماره تلفن و آدرس ایمیل',
      form: 'فرم ویرایش پروفایل'
    },
    {
      id: 3,
      username: 'علی_رضایی',
      action: 'حذف فایل',
      timestamp: '1402/08/15 - 12:20',
      details: 'حذف فایل document.pdf از پوشه اسناد',
      form: 'فرم حذف فایل'
    },
    {
      id: 4,
      username: 'مریم_کریمی',
      action: 'آپلود فایل',
      timestamp: '1402/08/15 - 11:15',
      details: 'آپلود فایل image.jpg با حجم 2.5 مگابایت',
      form: 'فرم آپلود فایل'
    },
    {
      id: 5,
      username: 'حسن_موسوی',
      action: 'تغییر رمز عبور',
      timestamp: '1402/08/15 - 10:30',
      details: 'تغییر رمز عبور با موفقیت انجام شد',
      form: 'فرم تغییر رمز عبور'
    },
    {
      id: 6,
      username: 'زهرا_حسینی',
      action: 'خروج از سیستم',
      timestamp: '1402/08/15 - 09:45',
      details: 'خروج عادی از سیستم',
      form: 'فرم خروج از سیستم'
    },
    {
      id: 7,
      username: 'محمد_نوری',
      action: 'دسترسی غیرمجاز',
      timestamp: '1402/08/15 - 08:20',
      details: 'تلاش برای دسترسی به صفحه محدود - دسترسی رد شد',
      form: 'فرم دسترسی غیرمجاز'
    },
    {
      id: 8,
      username: 'سارا_قاسمی',
      action: 'ایجاد گزارش',
      timestamp: '1402/08/14 - 16:30',
      details: 'ایجاد گزارش ماهانه فروش',
      form: 'فرم ایجاد گزارش'
    },
    {
      id: 9,
      username: 'رضا_جعفری',
      action: 'بروزرسانی اطلاعات',
      timestamp: '1402/08/14 - 15:10',
      details: 'بروزرسانی اطلاعات شخصی و تصویر پروفایل',
      form: 'فرم بروزرسانی اطلاعات'
    },
    {
      id: 10,
      username: 'نرگس_صادقی',
      action: 'ورود ناموفق',
      timestamp: '1402/08/14 - 14:25',
      details: 'تلاش ورود با رمز عبور اشتباه - 3 بار',
      form: 'فرم ورود ناموفق'
    }
  ]

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            <AssignmentIcon sx={{ fontSize: '40px', mr: 1 }} />
            <Typography variant="h4">رفتار کاربران</Typography>
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
        <Box sx={{ display: 'flex', flexDirection: 'row-reverse', gap: 1 }}>
          <Btn startIcon={<TuneIcon />} color='primary' variant='contained' onClick={openFilterDrawer}>
            فیلترها
          </Btn>
        </Box>
      </Box>
      <Box
        className='datagrid-filter-container'
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* Filter Drawer */}
        <Box
          className={`filter-container ${filterDrawerOpen ? 'filter-container-open' : 'filter-container-close'}`}
          sx={{
            py: 2,
            px: 2,
            borderRadius: '16px',
            border: '2px solid',
            borderColor: mode === 'light' ? '#e3e3e3' : '#6b6b6b',
            backgroundColor: mode === 'light' ? '#f7f7f7' : '#1e1e1e',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: filterDrawerOpen ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <Box
            className='filter-body'
            sx={{
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.0)',
                borderRadius: '10px',
                transition: 'background 0.3s ease',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0, 0, 0, 0.0)',
              },
              scrollbarWidth: 'none',
              scrollbarColor: 'rgba(0, 0, 0, 0.0) transparent',
            }}
          >
            <Box
              className='filter-header'
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <IconButton onClick={openFilterDrawer}>
                <CloseFullscreenIcon />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <FilterAltIcon sx={{ mr: 1, fontSize: '30px' }} />
                <Typography variant="h5">فیلتر</Typography>
              </div>
            </Box>

            <Accordion sx={accordionStyles}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography component="span">نام کاربر</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl sx={{ flex: 1, width: '100%' }}>
                  <TextField
                    id="filled-search"
                    label="نام کاربر"
                    type="search"
                    variant="outlined"
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  />
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyles}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography component="span">فرم ها</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl sx={{ flex: 1, width: '100%' }}>
                  <TextField
                    id="filled-search"
                    label="فرم"
                    type="search"
                    variant="outlined"
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  />
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyles}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography component="span">عملیات</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="operations-select-label">عملیات</InputLabel>
                  <Select
                    labelId="demo-multiple-name-label"
                    id="demo-multiple-name"
                    multiple
                    value={selectedOperations}
                    onChange={handleChange}
                    input={<OutlinedInput label="Name" />}
                    MenuProps={MenuProps}
                  >
                    {operations.map((operation) => (
                      <MenuItem
                        key={operation}
                        value={operation}
                        style={getStyles(operation, selectedOperations, theme)}
                      >
                        {operation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setSelectedOperations([])}
                  disabled={selectedOperations.length === 0}
                >
                  <ClearIcon />
                </IconButton>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyles}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography component="span">تاریخ</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl sx={{ flex: 1, width: '100%', alignItems: 'center' }}>
                  <DatePicker sx={{ width: '100%' }} label='از تاریخ' />
                  <p>تا</p>
                  <DatePicker sx={{ width: '100%' }} label='تا تاریخ' />
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyles}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography component="span">زمان</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl sx={{ flex: 1, width: '100%', alignItems: 'center' }}>
                  <TimePicker sx={{ width: '100%' }} label='زمان شروع' />
                  <p>تا</p>
                  <TimePicker sx={{ width: '100%' }} label='زمان پایان' />
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Btn variant='contained' color='error' sx={{ width: '100%', p: 1, borderRadius: '10px', mb: 1 }} startIcon={<DeleteForeverIcon />}>
            حذف فیلتر
          </Btn>
          <Btn variant='contained' color='success' sx={{ width: '100%', p: 1, borderRadius: '10px' }} startIcon={<TuneIcon />}>
            اعمال فیلتر
          </Btn>
        </Box>

        <Box
          className={`datagrid-container ${filterDrawerOpen ? 'datagrid-container-with-filter' : ''}`}
          sx={{
            width: '100%',
            height: '100%',
            minWidth: 0,
            overflow: 'auto',

          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={52}
            columnHeaderHeight={56}
            density="compact"
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100, { value: -1, label: 'همه' }]}
            sx={{
              border: 0,
              '& .MuiDataGrid-main': {
                overflow: 'hidden',
              },
              '& .MuiDataGrid-mainContent': {
                border: mode === 'light' ? '2px solid #e3e3e3' : '2px solid #6b6b6b',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderBottomColor: mode === 'light' ? '#e0e0e0' : '#292929',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'black',
                borderBottom: '2px solid',
                borderBottomColor: mode === 'light' ? '#e0e0e0' : '#616161',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row--borderBottom, .MuiDataGrid-columnHeader': {
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
              noRowsLabel: 'هیچ داده‌ای یافت نشد',
              columnMenuSortAsc: 'مرتب کردن از کوچک',
              columnMenuSortDesc: 'مرتب کردن از بزرگ',
              columnMenuFilter: 'فیلتر',
              columnMenuUnsort: 'حذف مرتب‌سازی',
              columnMenuHideColumn: 'پنهان کردن ستون',
              columnMenuShowColumns: 'نشان دادن ستون',
              columnMenuManageColumns: 'مدیریت ستون‌ها',
              paginationRowsPerPage: 'تعداد ردیف‌ها در هر صفحه:',
              filterPanelColumns: 'ستون',
              filterPanelOperator: 'عملیات',
              filterPanelInputLabel: 'ورودی',
              filterPanelInputPlaceholder: 'مقدار',
              columnsManagementShowHideAllText: 'نشان دادن/پنهان کردن همه',
              columnsManagementSearchTitle: 'جستجوی ستون‌ها',
              columnsManagementReset: 'بازنشانی',
              filterOperatorContains: 'شامل می‌شود',
              filterOperatorDoesNotContain: 'شامل نمی‌شود',
              filterOperatorEquals: 'برابر است با',
              filterOperatorDoesNotEqual: 'برابر نیست با',
              filterOperatorStartsWith: 'شروع می‌شود با',
              filterOperatorEndsWith: 'پایان می‌یابد با',
              filterOperatorIs: 'است',
              filterOperatorNot: 'نیست',
              filterOperatorAfter: 'بعد از',
              filterOperatorOnOrAfter: 'در یا بعد از',
              filterOperatorBefore: 'قبل از',
              filterOperatorOnOrBefore: 'در یا قبل از',
              filterOperatorIsEmpty: 'خالی است',
              filterOperatorIsNotEmpty: 'خالی نیست',
              filterOperatorIsAnyOf: 'هر یک از',
              paginationDisplayedRows: ({ from, to, count, estimated }) => {
                if (!estimated) {
                  return `${from}–${to} از ${count !== -1 ? count : `بیش از ${to}`}`;
                }
                const estimatedLabel = estimated && estimated > to ? `حدود ${estimated}` : `بیش از ${to}`;
                return `${from}–${to} از ${count !== -1 ? count : estimatedLabel}`;
              },
            }}
          />
        </Box>
      </Box>
    </PageContainer>
  );

}

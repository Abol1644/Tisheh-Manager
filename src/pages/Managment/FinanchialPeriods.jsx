import { useState } from 'react';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useThemeMode } from "@/contexts/ThemeContext";
import { useFinancialPeriod } from "@/contexts/FinancialPeriodContext";
import ManagmentLayout from "@/layout/ManagmentLayout"
import { Box, Container, Grid, Paper, Typography, IconButton } from '@mui/material';

export default function FinanchialPeriods() {
  const { mode } = useThemeMode();
  const {
      financialPeriods,
      addFinancialPeriod,
      updateFinancialPeriod,
      deleteFinancialPeriod,
      getFinancialPeriodById,
      getActiveFinancialPeriods,
    } = useFinancialPeriod();

    const [open, setOpen] = useState(false);
      const [editMode, setEditMode] = useState(false);
      const [selectedFinancialPeriod, setSelectedFinancialPeriod] = useState(null);
      const [deleteDialog, setDeleteDialog] = useState({ open: false, groupId: null, groupName: '' });
      const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
      const [formData, setFormData] = useState({ title: '', description: '', organId: 1 });
    
      const handleOpenDialog = (financialPeriod = null) => {
        if (financialPeriod) {
          setEditMode(true);
          setSelectedFinancialPeriod(financialPeriod);
          setFormData({
            title: financialPeriod.title,
            description: financialPeriod.description,
            organId: financialPeriod.organId
          });
        } else {
          setEditMode(false);
          setSelectedFinancialPeriod(null);
          setFormData({
            title: '',
            description: '',
            organId: 1
          });
        }
        setOpen(true);
      };
    
      const handleCloseDialog = () => {
        setOpen(false);
        setEditMode(false);
        setSelectedFinancialPeriod(null);
        setFormData({
          title: '',
          description: '',
          organId: 1
        });
      };
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };
    
      const handleSubmit = () => {
        if (!formData.title.trim()) {
          setSnackbar({
            open: true,
            message: 'عنوان دوره مالی الزامی است',
            severity: 'error'
          });
          return;
        }
    
        try {
          if (editMode && selectedFinancialPeriod) {
            updateFinancialPeriod(selectedFinancialPeriod.id, formData);
            setSnackbar({
              open: true,
              message: 'دوره مالی با موفقیت ویرایش شد',
              severity: 'success'
            });
          } else {
            addFinancialPeriod(formData);
            setSnackbar({
              open: true,
              message: 'دوره مالی جدید با موفقیت اضافه شد',
              severity: 'success'
            });
          }
          handleCloseDialog();
        } catch (error) {
          setSnackbar({
            open: true,
            message: 'خطا در انجام عملیات',
            severity: 'error'
          });
        }
      };
    
      const handleDeleteOpen = (id, name) => {
        setDeleteDialog({ open: true, groupId: id, groupName: name });
      };
    
      const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, groupId: null, groupName: '' });
      };
    
      const handleDeleteConfirm = () => {
        if (deleteDialog.groupId != null) {
          try {
            deleteFinancialPeriod(deleteDialog.groupId);
            setSnackbar({
              open: true,
              message: 'دوره مالی با موفقیت حذف شد',
              severity: 'success'
            });
          } catch (error) {
            setSnackbar({
              open: true,
              message: 'خطا در حذف گروه کاربری',
              severity: 'error'
            });
          }
        }
        handleDeleteCancel();
      };
    
      const handleRefresh = () => {
        // Add refresh logic here
        setSnackbar({
          open: true,
          message: 'داده‌ها به‌روزرسانی شد',
          severity: 'info'
        });
      };
    
      const handleExport = () => {
        // Add export logic here
        setSnackbar({
          open: true,
          message: 'داده‌ها صادر شد',
          severity: 'success'
        });
      };
    
      const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
      };
    
      const buttons = [
        {
          text: 'افزودن گروه جدید',
          icon: <AddIcon />,
          variant: 'contained',
          color: 'success',
          onClick: () => handleOpenDialog()
        },
        {
          text: 'به‌روزرسانی',
          icon: <RefreshIcon />,
          variant: 'outlined',
          color: 'secondary',
          onClick: handleRefresh
        },
        {
          text: 'دریافت خروجی',
          icon: <FileDownloadIcon />,
          variant: 'outlined',
          color: 'success',
          onClick: handleExport
        }
      ];
    
      // DataGrid columns
      const columns = [
        { field: 'id', headerName: 'کد', width: 35, align: 'center', headerAlign: 'center' },
        { field: 'title', headerName: 'عنوان گروه', width: 200, align: 'center', headerAlign: 'center' },
        { field: 'description', headerName: 'توضیحات', width: 300, align: 'center', headerAlign: 'center' },
        { field: 'organId', headerName: 'شناسه سازمان', width: 150, align: 'center', headerAlign: 'center' },
        { field: 'parentId', headerName: 'گروه والد', width: 120, align: 'center', headerAlign: 'center' },
        {
          field: 'actions',
          headerName: 'عملیات',
          width: 150,
          align: 'center',
          headerAlign: 'center',
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" size="small" onClick={() => handleOpenDialog(params.row)} title="ویرایش">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton color="error" size="small" onClick={() => handleDeleteOpen(params.row.Id, params.row.title)} title="حذف">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ),
        },
      ];
    
      const rows = getActiveFinancialPeriods();

  return (
    // <Container>
    //   <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '250px', mb: 3 }}>
    //       <Box sx={{ display: 'flex', alignItems: 'center' }}>
    //         <AttachMoneyIcon sx={{ fontSize: 40, mr: 1 }} />
    //         <Typography variant="h4">دوره‌های مالی</Typography>
    //       </Box>
    //         <div style={{
    //           height: '2px',
    //           width: '130%',
    //           margin: '10px auto',
    //           backgroundImage: mode === "light"
    //             ? 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgb(0, 0, 0) 100%)'
    //             : 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
    //           transition: 'background-image 0.3s ease'
    //         }} />
    //     </Box>

    //     <Paper sx={{ height: 600, width: '100%' }}></Paper>
    // </Container>
    <ManagmentLayout
      header="دوره‌های مالی"
      headerIcon={<AttachMoneyIcon sx={{ fontSize: 40, mr: 1 }} />}
      buttons={buttons}
      columns={columns}
      rows={rows}
      getRowId={(row) => row.Id}
      snackbar={snackbar}
      onSnackbarClose={handleCloseSnackbar}
    ></ManagmentLayout>
  )
}
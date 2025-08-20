import React, { useState, useCallback } from 'react';
import KeyIcon from '@mui/icons-material/Key';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ManagmentLayout from '@/layout/ManagmentLayout';
import { useThemeMode } from "@/contexts/ThemeContext";
import { useWorkGroups } from "@/contexts/WorkGroupContext";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogContentText
} from '@mui/material';

import Btn from '@/components/elements/Btn';

export default function AccessWorkGroup() {
  const { mode } = useThemeMode();
  const {
    workGroups,
    addWorkGroup,
    updateWorkGroup,
    deleteWorkGroup,
    getActiveWorkGroups
  } = useWorkGroups();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, groupId: null, groupName: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({ title: '', description: '', organId: 1 });
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenDialog = (workGroup = null) => {
    if (workGroup) {
      setEditMode(true);
      setSelectedWorkGroup(workGroup);
      setFormData({
        title: workGroup.title,
        description: workGroup.description,
        organId: workGroup.organId
      });
    } else {
      setEditMode(false);
      setSelectedWorkGroup(null);
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
    setSelectedWorkGroup(null);
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
        message: 'عنوان گروه کاربری الزامی است',
        severity: 'error'
      });
      return;
    }

    try {
      if (editMode && selectedWorkGroup) {
        updateWorkGroup(selectedWorkGroup.id, formData);
        setSnackbar({
          open: true,
          message: 'گروه کاربری با موفقیت ویرایش شد',
          severity: 'success'
        });
      } else {
        addWorkGroup(formData);
        setSnackbar({
          open: true,
          message: 'گروه کاربری جدید با موفقیت اضافه شد',
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
        deleteWorkGroup(deleteDialog.groupId);
        setSnackbar({
          open: true,
          message: 'گروه کاربری با موفقیت حذف شد',
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

  const handleLog = () => {
    const currentPage = location.pathname; // gets current URL
    navigate('/target', { state: { fromPage: currentPage } });
  };

  const handleRefresh = () => {
    setSnackbar({
      open: true,
      message: 'داده‌ها به‌روزرسانی شد',
      severity: 'info'
    });
  };

  const handleExport = () => {
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

  const rows = getActiveWorkGroups();

  return (
    <ManagmentLayout
      header="گروه‌های کاربری"
      headerIcon={<KeyIcon sx={{ fontSize: 40, mr: 1 }} />}
      buttons={buttons}
      columns={columns}
      rows={rows}
      snackbar={snackbar}
      onSnackbarClose={handleCloseSnackbar}
    >
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'ویرایش گروه کاربری' : 'افزودن گروه کاربری جدید'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="عنوان گروه"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="توضیحات"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="ID"
              name="organId"
              type="number"
              value={formData.organId}
              onChange={handleInputChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Btn onClick={handleCloseDialog}>انصراف</Btn>
          <Btn onClick={handleSubmit} variant="contained">
            {editMode ? 'ویرایش' : 'افزودن'}
          </Btn>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          تأیید حذف گروه کاربری
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            آیا از حذف "{deleteDialog.groupName}" مطمئن هستید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Btn onClick={handleDeleteCancel} color="primary">
            لغو
          </Btn>
          <Btn onClick={handleDeleteConfirm} color="error" variant="contained">
            حذف
          </Btn>
        </DialogActions>
      </Dialog>
    </ManagmentLayout>
  );
}

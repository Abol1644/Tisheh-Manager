import React, { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { useThemeMode } from "@/contexts/ThemeContext";
import ManagmentLayout from '@/layout/ManagmentLayout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '@/contexts/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import {
  Box,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Typography
} from '@mui/material';

import UserDialog from '@/components/UserDialog';
import { User } from '@/models/Users';
import { getListOfUsers } from '@/api/usersApi';

import Btn from '@/components/elements/Btn';

interface StatusCellProps {
  userId: number;
  isActive: boolean;
  onToggle: (userId: number) => void;
  disabled?: boolean;
}

const StatusCell = React.memo<StatusCellProps>(({ userId, isActive, onToggle, disabled = false }) => (
  <Switch
    checked={isActive}
    onChange={() => onToggle(userId)}
    disabled={disabled}
    size="small"
  />
));

interface ActionsCellProps {
  user: any;
  onEdit: (user: any) => void;
  onDelete: (userId: number) => void;
}

const ActionsCell = React.memo<ActionsCellProps>(({ user, onEdit, onDelete }) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <IconButton
        onClick={() => onEdit(user)}
        size="small"
      >
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => onDelete(user.id || user.Id)} size="small" color="error">
        <DeleteIcon />
      </IconButton>
    </Box>
  );
});

interface DeleteDialogState {
  open: boolean;
  userId: number | null;
  userName: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ControlUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ 
    open: false, 
    userId: null, 
    userName: '' 
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getListOfUsers();
        console.log('Fetched users data:', usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        showSnackbar('خطا در دریافت لیست کاربران', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const dialogTitle = useMemo(() => {
    return isEditMode ? 'تغییر کاربر' : 'افزودن کاربر جدید';
  }, [isEditMode]);

  const buttonText = useMemo(() => {
    return isEditMode ? 'ذخیره' : 'افزودن';
  }, [isEditMode]);

  const showSnackbar = useCallback((message: string, severity: SnackbarState['severity'] = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleToggleActive = useCallback((id: number) => {
    console.log('Toggle active for user ID:', id);
    // TODO: Implement API call to toggle user active status
    const userToUpdate = users.find(u => (u.id || u.Id) === id);
    if (userToUpdate) {
      showSnackbar(`کاربر ${userToUpdate.activate || userToUpdate.IsActive ? 'غیرفعال' : 'فعال'} شد`);
    }
  }, [users, showSnackbar]);

  const handleDelete = useCallback((id: number) => {
    console.log('Delete user ID:', id);
    const userToDelete = users.find(u => (u.id || u.Id) === id);
    if (userToDelete) {
      setDeleteDialog({
        open: true,
        userId: id,
        userName: `${userToDelete.name || userToDelete.FirstName || ''} ${userToDelete.lastName || userToDelete.LastName || ''}`.trim()
      });
    }
  }, [users]);

  const handleDeleteConfirm = useCallback(() => {
    console.log('Confirm delete user ID:', deleteDialog.userId);
    // TODO: Implement API call to delete user
    if (deleteDialog.userId) {
      showSnackbar('کاربر با موفقیت حذف شد');
    }
    setDeleteDialog({ open: false, userId: null, userName: '' });
  }, [deleteDialog.userId, showSnackbar]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, userId: null, userName: '' });
  }, []);

  const handleEdit = useCallback((userData: any) => {
    console.log('Edit user:', userData);
    setSelectedUser(userData);
    setIsEditMode(true);
    setIsDialogOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    console.log('Add new user');
    setSelectedUser(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  }, []);

  const handleDialogSubmit = useCallback((formData: any) => {
    console.log('Dialog submit:', formData);
    // TODO: Implement API calls for add/update user
    
    if (!formData.FirstName || !formData.LastName || !formData.Mobile || !formData.Password) {
      showSnackbar('لطفا تمام فیلدهای اجباری را پر کنید', 'error');
      return;
    }

    if (!/^09\d{9}$/.test(formData.Mobile)) {
      showSnackbar('شماره موبایل باید به فرمت 09xxxxxxxxx باشد', 'error');
      return;
    }

    const userData = {
      ...formData,
      Code: parseInt(formData.Code) || Math.floor(Math.random() * 100000000),
    };

    setIsDialogOpen(false);

    startTransition(() => {
      if (isEditMode && selectedUser) {
        showSnackbar('کاربر با موفقیت ویرایش شد');
      } else {
        showSnackbar('کاربر با موفقیت اضافه شد');
      }
    });
  }, [isEditMode, selectedUser, showSnackbar]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const buttons = useMemo(() => [
    {
      text: 'افزودن کاربر جدید',
      icon: <AddIcon />,
      variant: 'contained' as const,
      color: 'primary' as const,
      onClick: handleAdd
    }
  ], [handleAdd]);


  const columns = useMemo(() => [
    {
      field: 'rowNumber',
      headerName: 'ردیف',
      width: 60,
      align: 'center' as const,
      headerAlign: 'center' as const,
      sortable: false,
      filterable: false,
      resizable: true,
      renderCell: (params:any) => {
        const rowIndex = params.api.getAllRowIds().indexOf(params.id);
        return rowIndex + 1;
      }
    },
    // {
    //   field: 'id',
    //   headerName: 'ID',
    //   width: 80,
    //   minWidth: 80,
    //   type: 'number',
    //   flex: 0,
    // },
    {
      field: 'fullName',
      headerName: 'نام کاربر',
      width: 200,
      minWidth: 150,
      flex: 0.7,
      valueGetter: (value: any, row: any) => {
        const firstName = row.name || row.FirstName || '';
        const lastName = row.lastName || row.LastName || '';
        return `${firstName} ${lastName}`.trim();
      },
    },
    {
      field: 'mobile',
      headerName: 'شماره موبایل',
      width: 150,
      minWidth: 120,
      flex: 0.5,
      valueGetter: (value: any, row: any) => row.mobile || row.Mobile || '',
    },
    {
      field: 'userName',
      headerName: 'گروه کاربری',
      width: 150,
      minWidth: 120,
      flex: 0.5,
      valueGetter: (value: any, row: any) => row.userName || row.UserName || row.Code || '',
    },
    {
      field: 'role',
      headerName: 'نقش',
      width: 100,
      minWidth: 80,
      flex: 0.5,
      valueGetter: (value: any, row: any) => {
        if (row.manage || row.IsAdmin || row.systemy) return 'Admin';
        return 'User';
      },
    },
    {
      field: 'status',
      headerName: 'وضعیت',
      width: 120,
      minWidth: 100,
      flex: 0.5,
      sortable: false,
      renderCell: (params: any) => (
        <StatusCell
          userId={params.row.id || params.row.Id}
          isActive={params.row.activate || params.row.IsActive || false}
          onToggle={handleToggleActive}
          disabled={false}
        />
      ),
    },
    {
      field: 'dateTime',
      headerName: 'تاریخ ثبت نام',
      width: 180,
      minWidth: 150,
      flex: 0.5,
      type: 'date',
      valueGetter: (value: any, row: any) => row.dateTime || row.RegisterDate || '',
      valueFormatter: (value: string) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('fa-IR');
      },
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 150,
      minWidth: 120,
      flex: 0.5,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <ActionsCell
          user={params.row}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ),
    },
  ], [handleToggleActive, handleEdit, handleDelete]);


  // Filter active users (non-deleted)
  const activeUsers = useMemo(() => {
    return users.filter(user => !(user.IsDeleted || user.deleted));
  }, [users]);

  return (
    <ManagmentLayout
      header="مدیریت کاربران"
      headerIcon={<AccountCircleIcon sx={{ fontSize: 40, mr: 1 }} />}
      buttons={buttons}
      columns={columns}
      rows={activeUsers}
      loading={loading}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
      getRowId={(row: any) => row.id || row.Id}
    >
      <UserDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        title={dialogTitle}
        initialData={selectedUser}
        sendButtonText={buttonText}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          تأیید حذف کاربر
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            آیا از حذف "{deleteDialog.userName}" مطمئن هستید؟
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
};

export default ControlUsers;

import React from 'react';

import {
  Typography,
  Modal,
  Box,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Slide,
  Backdrop,
  Paper,
  Zoom,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  CircularProgress,
  InputAdornment,
  Menu,
  MenuItem
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded"
import StayCurrentPortraitRoundedIcon from "@mui/icons-material/StayCurrentPortraitRounded"
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import { TransitionGroup } from 'react-transition-group';

import Btn from '@/components/elements/Btn';
import { flex, width, height, gap } from '@/models/ReadyStyles';
import { addSaleAccount, editAccount, findAccount, deleteAccountNumber } from '@/api/accountsApi';
import { useSnackbar } from '@/contexts/SnackBarContext';
import { useAccountStore } from '@/stores';
import { Account, AccountSale } from '@/models';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  formMode: 'create' | 'edit';
}

interface FormField {
  id: string;
  phoneNumber: string;
  infoText: string;
  phoneNumberError: boolean;
  phoneNumberHelperText: string;
  originalIdidentity?: number;
}

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export default React.memo(function CreateAccountModal({ open, onClose, formMode }: ModalProps) {
  const [gender, setGender] = React.useState('men');
  const [numberType, setNumberType] = React.useState<1 | 2 | 3 | 4>(1);
  const [checked, setChecked] = React.useState(false);
  const [accountTitle, setAccountTitle] = React.useState('');
  const [nationalId, setNationalId] = React.useState('');
  const [accountDescription, setAccountDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [findingAccount, setFindingAccount] = React.useState(false);
  const [account, setAccount] = React.useState<AccountSale | null>(null);
  const [originalContactDetails, setOriginalContactDetails] = React.useState<any[]>([]);
  const [removedContactIds, setRemovedContactIds] = React.useState<number[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [formFields, setFormFields] = React.useState<FormField[]>(() => [
    { id: generateId(), phoneNumber: '', infoText: '', phoneNumberError: false, phoneNumberHelperText: '' },
  ]);

  const { showSnackbar } = useSnackbar();
  const { selectedAccount, addAccount, replaceAccount } = useAccountStore();

  const handleCheckChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  }, []);

  const handleGenderChange = React.useCallback((
    event: React.MouseEvent<HTMLElement>,
    newGender: string | null
  ) => {
    if (newGender !== null) {
      setGender(newGender);
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleChangeNumberType = (id: number) => {
    setAnchorEl(null);
    setNumberType(id as 1 | 2 | 3 | 4);
  };



  const handleAddRow = () => {
    setFormFields((prev) => [
      ...prev,
      { id: generateId(), phoneNumber: '', infoText: '', phoneNumberError: false, phoneNumberHelperText: '' },
    ]);
  };

  const handleCancel = () => {
    onClose();
    setGender('men');
    setChecked(false);
    setAccountTitle('');
    setNationalId('');
    setAccountDescription('');
    setLoading(false);
    setFindingAccount(false);
    setOriginalContactDetails([]);
    setRemovedContactIds([]);
    setFormFields([
      { id: generateId(), phoneNumber: '', infoText: '', phoneNumberError: false, phoneNumberHelperText: '' },
    ]);
  };

  const handleRemoveRow = (idToRemove: string) => {
    setFormFields((prev) => {
      const fieldToRemove = prev.find(field => field.id === idToRemove);
      // If this field has an originalIdidentity, track it for deletion
      if (fieldToRemove?.originalIdidentity) {
        setRemovedContactIds(prevIds => [...prevIds, fieldToRemove.originalIdidentity!]);
      }
      return prev.filter((field) => field.id !== idToRemove);
    });
  };

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const { value } = event.target;
    setFormFields((prev) =>
      prev.map((field) => {
        if (field.id === id) {
          return {
            ...field,
            phoneNumber: value,
            phoneNumberError: false,
            phoneNumberHelperText: '',
          };
        }
        return field;
      }),
    );
  };

  const handleInfoTextChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const { value } = event.target;
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, infoText: value } : field,
      ),
    );
  };

  const handleSave = async () => {
    setLoading(true);

    if (formMode === 'create') {
      try {
        // Map gender to genderId
        const genderMap: Record<string, number> = {
          'men': 1,
          'women': 2,
          'company': 3
        };

        // Extract phone numbers and descriptions
        const phoneNumbers = formFields.map(field => field.phoneNumber);
        const phoneNumberDescriptions = formFields.map(field => field.infoText);

        await addSaleAccount(
          accountTitle,
          accountDescription,
          genderMap[gender] || 1,
          numberType,
          checked ? '' : nationalId,
          checked,
          phoneNumbers,
          phoneNumberDescriptions
        ).then((accountSale) => {
          // Convert AccountSale to Account format for the UI
          const account: Account = {
            ididentity: accountSale.codeAcc.toString(),
            tabagheAcc: '',
            groupAcc: '',
            kolAcc: '',
            moeinAcc: '',
            tafziliAcc: '',
            codeAccLen: '',
            codeAcc: accountSale.codeAcc,
            title: accountSale.title,
            description: accountSale.description,
            systemy: false,
            accType: true,
            accessWorkGroupId: '',
            activate: true,
            genderId: accountSale.genderId,
            genderTitle: accountSale.genderTitle
          };
          addAccount(account);
          showSnackbar('حساب با موفقیت ایجاد شد', 'success');
          handleCancel();
        });
      } catch (error: any) {
        console.error('Error creating account:', error);
        showSnackbar(error.message || 'خطا در ایجاد حساب', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      const genderMap: Record<string, number> = {
        'men': 1,
        'women': 2,
        'company': 3
      };

      // Extract phone numbers and descriptions
      const phoneNumbers = formFields.map(field => field.phoneNumber);
      const phoneNumberDescriptions = formFields.map(field => field.infoText);

      // Delete explicitly removed contacts first
      try {
        for (const removedContactId of removedContactIds) {
          await deleteAccountNumber(removedContactId);
          console.log(`Deleted contact with ididentity: ${removedContactId}`);
        }
      } catch (error: any) {
        console.error('Error deleting phone numbers:', error);
        showSnackbar('خطا در حذف شماره تلفن', 'error');
        setLoading(false);
        return;
      }

      const updatedAccount = {
        ...account,
        title: accountTitle,
        description: accountDescription,
        genderId: genderMap[gender] || 1,
        nationalId: nationalId,
        foreignNational: checked,
        accountsSaleContactDetails: formFields
          .filter(field => field.phoneNumber && field.phoneNumber.trim() !== '')
          .map(field => ({
            ididentity: field.originalIdidentity || 0,
            countryNumber: 98,
            provinceNumber: 21,
            numberId: numberType,
            numberDescription: parseInt(field.phoneNumber),
            description: field.infoText || null
          }))
      };
      console.log("⬆ ~ handleSave ~ updatedAccount:", updatedAccount)
      // @ts-ignore
      editAccount(updatedAccount).then((updatedAccountSale) => {
        console.log("💕 ~ handleSave ~ updatedAccount:", updatedAccountSale)
        // Convert AccountSale to Account format for the UI
        const updatedAccount: Account = {
          ididentity: updatedAccountSale.codeAcc.toString(),
          tabagheAcc: '',
          groupAcc: '',
          kolAcc: '',
          moeinAcc: '',
          tafziliAcc: '',
          codeAccLen: '',
          codeAcc: updatedAccountSale.codeAcc,
          title: updatedAccountSale.title,
          description: updatedAccountSale.description,
          systemy: false,
          accType: true,
          accessWorkGroupId: '',
          activate: true,
          genderId: updatedAccountSale.genderId,
          genderTitle: updatedAccountSale.genderTitle
        };
        replaceAccount(updatedAccount);
        showSnackbar('حساب با موفقیت ویرایش شد', 'success');
        setLoading(false);
        handleCancel();
      }).catch((error) => {
        console.error('Error editing account:', error);
        showSnackbar(error.message || 'خطا در ویرایش حساب', 'error');
        setLoading(false);
      });

    }
  };

  React.useEffect(() => {
    if (open && formMode === 'edit' && selectedAccount && selectedAccount.codeAcc) {
      console.log("finding account");
      setFindingAccount(true);
      showSnackbar('درحال دریافت اطلاعات حساب', 'info');
      findAccount(selectedAccount.codeAcc).then((foundAccount) => {
        console.log("🚀 ~ CreateAccountModal ~ foundAccount:", foundAccount)
        if (foundAccount) {
          setAccount(foundAccount);

          // Fill form fields with found account data
          setAccountTitle(foundAccount.title || '');
          setAccountDescription(foundAccount.description || '');
          setNationalId(foundAccount.nationalId || '');
          setChecked(foundAccount.foreignNational || false);

          // Map genderId to gender string
          const genderIdMap: Record<number, string> = {
            1: 'men',
            2: 'women',
            3: 'company'
          };
          setGender(genderIdMap[foundAccount.genderId] || 'men');

          // Fill phone numbers and descriptions
          if (foundAccount.accountsSaleContactDetails && foundAccount.accountsSaleContactDetails.length > 0) {
            // Store original contact details for comparison
            setOriginalContactDetails([...foundAccount.accountsSaleContactDetails]);
            
            const contactFields = foundAccount.accountsSaleContactDetails.map(contact => ({
              id: generateId(),
              phoneNumber: contact.numberDescription?.toString() || '',
              infoText: contact.description || '',
              phoneNumberError: false,
              phoneNumberHelperText: '',
              originalIdidentity: contact.ididentity
            }));
            setFormFields(contactFields);
          } else {
            // If no contact details, keep default empty field
            setOriginalContactDetails([]);
            setFormFields([
              { id: generateId(), phoneNumber: '', infoText: '', phoneNumberError: false, phoneNumberHelperText: '' }
            ]);
          }

          setFindingAccount(false);
          showSnackbar('اطلاعات حساب دریافت شد', 'success');
        } else {
          console.error("Error: Account not found");
        }
      }).catch((error) => {
        setFindingAccount(false);
        showSnackbar('خطا در دریافت اطلاعات حساب', 'error');
        console.error("Error finding account:", error);
      });
    }
  }, [open, formMode, selectedAccount]);

  return (
    <React.Fragment>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 150,
          },
        }}
      >
        <Slide in={open} direction="up">
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              '&:focus-visible': {
                outline: 'none'
              },
              pointerEvents: 'none'
            }}
          >
            <Box
              sx={{
                width: '680px',
                height: 'auto',
                bgcolor: 'background.paper',
                background: 'linear-gradient(-165deg, #00ff684d, var(--transparent) 75%)',
                border: 'none',
                boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
                p: '20px 20px',
                borderRadius: '25px',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                
                '&:focus-visible': {
                  outline: 'none'
                },
                pointerEvents: 'auto',
                overflowX: 'hidden'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant='h6' sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <PersonAddAlt1RoundedIcon />
                  ایجاد حساب جدید
                </Typography>
                <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                  <IconButton
                    aria-label="بستن"
                    onClick={handleCancel}
                    color='error'
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ position: 'relative', width: '100%', mt: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: '10px' }}>
                  <ToggleButtonGroup
                    color="info"
                    value={gender}
                    size='medium'
                    onChange={handleGenderChange}
                    exclusive
                    sx={{ borderRadius: '12px' }}
                  >
                    <ToggleButton sx={{ width: '60px', borderRadius: '12px' }} value="men">آقا</ToggleButton>
                    <ToggleButton sx={{ width: '60px', borderRadius: '12px' }} value="women">خانم</ToggleButton>
                    <ToggleButton sx={{ width: '60px', borderRadius: '12px' }} value="company">شرکت</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    id="account-title"
                    label="عنوان حساب"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    sx={{ width: '100%' }}
                  />
                </Box>
                <Divider sx={{ my: 2, mx: 2 }} />
                <Box
                  sx={{
                    width: '100%',
                    gap: '10px',

                  }}
                >
                  <Box
                    className='heheheh'
                    sx={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      scrollbarWidth: 'thin'
                    }}
                  >
                    <TransitionGroup>
                      {formFields.map((field, index) => (
                        <Slide key={field.id} direction="right" mountOnEnter unmountOnExit>
                          <Grid container spacing={1.5} alignItems="center">
                            <Grid sx={{ ...flex.one }}>
                              <TextField
                                autoFocus={index === 0}
                                margin="dense"
                                label={
                                  (() => {
                                    const typeNames = {
                                      1: 'همراه',
                                      2: 'منزل', 
                                      3: 'محل کار',
                                      4: 'فکس'
                                    };
                                    const typeName = typeNames[numberType];
                                    return formFields.length === 1
                                      ? `شماره ${typeName}`
                                      : `شماره ${typeName} (${index + 1})`;
                                  })()
                                }
                                value={field.phoneNumber}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  handlePhoneNumberChange(e, field.id);
                                }}
                                error={field.phoneNumberError}
                                helperText={field.phoneNumberHelperText}
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position='end'>
                                      <IconButton onClick={handleClick}>
                                        <MoreHorizRoundedIcon />
                                      </IconButton>
                                      <Menu
                                        anchorEl={anchorEl}
                                        open={menuOpen}
                                        onClose={handleClose}
                                        anchorOrigin={{
                                          vertical: 'bottom',
                                          horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                          vertical: 'top',
                                          horizontal: 'center',
                                        }}
                                      >
                                        <MenuItem onClick={() => handleChangeNumberType(1)} sx={{ mx: 1 }}>
                                          <StayCurrentPortraitRoundedIcon sx={{ mr: 1.5 }} />
                                          همراه
                                        </MenuItem>
                                        <MenuItem onClick={() => handleChangeNumberType(2)} sx={{ mx: 1 }}>
                                          <HomeRoundedIcon sx={{ mr: 1.5 }} />
                                          منزل
                                        </MenuItem>
                                        <MenuItem onClick={() => handleChangeNumberType(3)} sx={{ mx: 1 }}>
                                          <ApartmentRoundedIcon sx={{ mr: 1.5 }} />
                                          محل کار
                                        </MenuItem>
                                        <MenuItem onClick={() => handleChangeNumberType(4)} sx={{ mx: 1 }}>
                                          <LocalPrintshopRoundedIcon sx={{ mr: 1.5 }} />
                                          فکس
                                        </MenuItem>
                                      </Menu>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid sx={{ ...flex.one }}>
                              <TextField
                                margin="dense"
                                label={
                                  formFields.length === 1
                                    ? 'توضیحات'
                                    : `توضیحات (${index + 1})`
                                }
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={field.infoText}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleInfoTextChange(e, field.id)
                                }
                              />
                            </Grid>
                            <Grid sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                              {formFields.length > 1 && (
                                <IconButton
                                  aria-label="remove row"
                                  onClick={() => handleRemoveRow(field.id)}
                                  color="error"
                                >
                                  <RemoveCircleOutlineIcon />
                                </IconButton>
                              )}
                              {index === formFields.length - 1 && (
                                <IconButton aria-label="add row" onClick={handleAddRow} color="success">
                                  <AddIcon />
                                </IconButton>
                              )}
                            </Grid>

                          </Grid>
                        </Slide>
                      ))}
                    </TransitionGroup>
                  </Box>
                  <Divider sx={{ m: 2 }} />
                  <Box sx={{ ...flex.row, ...width.full, ...gap.ten }}>
                    <TextField
                      id="national-id"
                      label="کد ملی"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      sx={{ ...width.half }}
                      disabled={checked}
                    />
                    <FormControlLabel
                      label="اتباع خارجی"
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={handleCheckChange}
                        />
                      }
                    />
                  </Box>
                </Box>
                <Divider sx={{ mt: 2, mx: 2 }} />
                <TextField
                  id="account-description"
                  label="توضیحات حساب"
                  value={accountDescription}
                  onChange={(e) => setAccountDescription(e.target.value)}
                  sx={{ mt: 2, width: '100%' }}
                  multiline
                  minRows={1}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', mt: 1, height: '46px' }}>
                  <Btn variant='contained' color='error' onClick={handleCancel} sx={{ px: 2 }}>
                    انصراف
                  </Btn>
                  <Btn
                    variant='contained'
                    color='success'
                    onClick={handleSave}
                    endIcon={loading ? <CircularProgress size={24} color='inherit' /> : <DoneAllRoundedIcon />}
                    disabled={loading}
                    sx={{ px: 2 }}
                  >
                    {formMode === 'create' ? 'ایجاد' : 'ویرایش'}
                  </Btn>
                </Box>
              </Box>
            </Box>
          </Box>
        </Slide>
      </Modal>
    </React.Fragment>
  );
});
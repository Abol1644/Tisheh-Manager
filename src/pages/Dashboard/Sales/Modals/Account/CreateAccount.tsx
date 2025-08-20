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
  Grid
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { TransitionGroup } from 'react-transition-group'; // Import TransitionGroup

import Btn from '@/components/elements/Btn';
import { flex, width, height } from '@/models/ReadyStyles';
import PhoneField from '@/components/elements/PhoneField';

const MemoTextField = React.memo(TextField);
const MemoPhoneField = React.memo(PhoneField);

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormField {
  id: string;
  phoneNumber: string;
  infoText: string;
  phoneNumberError: boolean;
  phoneNumberHelperText: string;
}

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export default React.memo(function CreateAccountModal({ open, onClose }: AccountModalProps) {
  const [gender, setGender] = React.useState('men');
  const [checked, setChecked] = React.useState(false);
  const [formFields, setFormFields] = React.useState<FormField[]>(() => [
    { id: generateId(), phoneNumber: '', infoText: '', phoneNumberError: false, phoneNumberHelperText: '' },
  ]);

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

  const handleAddRow = () => {
    setFormFields((prev) => [
      ...prev,
      { id: generateId(), phoneNumber: '', infoText: '', phoneNumberError: false, phoneNumberHelperText: '' },
    ]);
  };

  const handleCancel = () => {
    onClose();
    setFormFields([
      { id: generateId(), phoneNumber: '', infoText: '', phoneNumberError: false, phoneNumberHelperText: '' },
    ]);
  };

  const handleRemoveRow = (idToRemove: string) => {
    setFormFields((prev) => prev.filter((field) => field.id !== idToRemove));
  };

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const { value } = event.target;
    setFormFields((prev) =>
      prev.map((field) => {
        if (field.id === id) {
          const numericValue = value.replace(/\D/g, '');
          let phoneNumberError = false;
          let phoneNumberHelperText = '';

          if (numericValue.length > 0 && numericValue.length !== 11) {
            phoneNumberError = true;
            phoneNumberHelperText = 'Phone number must be exactly 11 digits.';
          } else if (numericValue.length === 11) {
            phoneNumberError = false;
            phoneNumberHelperText = '';
          } else {
            phoneNumberError = false;
            phoneNumberHelperText = '';
          }

          return {
            ...field,
            phoneNumber: numericValue,
            phoneNumberError,
            phoneNumberHelperText,
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

  const handleSave = () => {
    const hasErrors = formFields.some(
      (field) => field.phoneNumber.length !== 11 || field.phoneNumberError,
    );

    if (hasErrors) {
      const updatedFields = formFields.map((field) => {
        if (field.phoneNumber.length !== 11) {
          return {
            ...field,
            phoneNumberError: true,
            phoneNumberHelperText: 'Phone number must be exactly 11 digits.',
          };
        }
        return field;
      });
      setFormFields(updatedFields);
      return;
    }

    onClose();
  };

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
                background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
                border: 'none',
                boxShadow: '0 20px 20px -20px var(--text-secondary)',
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
                    onClick={onClose}
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
                  <MemoTextField
                    id="account-title"
                    label="عنوان حساب"
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
                              <MemoPhoneField
                                autoFocus={index === 0}
                                margin="dense"
                                label={
                                  formFields.length === 1
                                    ? 'شماره'
                                    : `شماره (${index + 1})`
                                }
                                value={field.phoneNumber}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handlePhoneNumberChange(e, field.id)
                                }
                                error={field.phoneNumberError}
                                helperText={field.phoneNumberHelperText}
                                fullWidth
                              />
                            </Grid>
                            <Grid sx={{ ...flex.one }}>
                              <MemoTextField
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
                  <Box sx={{ ...flex.column, ...width.full }}>
                    <Box sx={{ ...flex.row, gap: '10px' }}>
                      <MemoTextField
                        id="account-title"
                        label="کد ملی"
                        sx={{ ...flex.half }}
                        disabled={checked && true}
                      />

                    </Box>
                    <FormControlLabel
                      label="اتباع خارجی"
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={handleCheckChange}
                        />
                      }
                      sx={{ width: 'fit-content', mt: 1 }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ mt: 2, mx: 2 }} />
                <MemoTextField
                  id="account-description"
                  label="توضیحات حساب"
                  variant='standard'
                  sx={{ width: '100%' }}
                  multiline
                  rows={3}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, height: '46px' }}>
                  <Btn variant='contained' color='success' onClick={handleSave} endIcon={<DoneAllRoundedIcon />} sx={{ px: 4 }}>
                    ایجاد
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
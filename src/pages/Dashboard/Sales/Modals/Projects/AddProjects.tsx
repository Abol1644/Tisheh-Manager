// @ts-check
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
  InputAdornment
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import AddHomeWorkRoundedIcon from '@mui/icons-material/AddHomeWorkRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import WhereToVoteRoundedIcon from '@mui/icons-material/WhereToVoteRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import SettingsPhoneRoundedIcon from '@mui/icons-material/SettingsPhoneRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import MarkerIcon from '@/assets/images/marker.png'

import Btn from '@/components/elements/Btn';
import { flex, width, height, gap } from '@/models/ReadyStyles';
import PhoneField from '@/components/elements/PhoneField';
import { useThemeMode } from '@/contexts/ThemeContext';
import Map from '@/components/Map';
import PriceField from '@/components/elements/PriceField';

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default React.memo(function AddProjectModal({ open, onClose }: ModalProps) {
  const [fullScreen, setFullScreen] = React.useState(true);
  const [projectName, setProjectName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [mapTile, setMapTile] = React.useState<'street' | 'satellite'>('street');
  const [position, setPosition] = React.useState<[number, number] | null>(null);
  const { mode } = useThemeMode()

  const closeWindow = () => {
    onClose();
    setFullScreen(true);
  }

  const ToggleMapTile = () => {
    if (mapTile === 'street') {
      setMapTile('satellite');
    } else {
      setMapTile('street');
    }
  }

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
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: fullScreen ? 'calc(100vw - 50px)' : '900px',
                height: fullScreen ? 'calc(100vh - 50px)' : '550px',
                bgcolor: 'background.paper',
                background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
                border: 'none',
                boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
                p: '15px 15px',
                borderRadius: '25px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease',
                // backdropFilter: 'blur(5px)',
                '&:focus-visible': {
                  outline: 'none'
                },
                pointerEvents: 'auto',
              }}
            >
              {/* Control Panel */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}
              >
                <Typography variant='h6' sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <AddHomeWorkRoundedIcon />
                  افزودن پروژه
                </Typography>
                <Box>
                  <IconButton
                    onClick={() => setFullScreen(!fullScreen)}
                    color='default'
                  >
                    {
                      fullScreen
                        ? <CloseFullscreenRoundedIcon />
                        : <OpenInFullRoundedIcon />
                    }
                  </IconButton>
                  <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                    <IconButton
                      onClick={closeWindow}
                      color='error'
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ position: 'relative', width: '100%', ...height.full, mt: 1 }}>
                <Box sx={{ ...flex.row, ...gap.ten, ...height.full }}>
                  <Box sx={{ ...flex.columnBetween, flex: fullScreen ? 0.3 : 1, transition: 'all 0.3s ease' }}>
                    <Box sx={{ ...flex.column, ...gap.ten }}>
                      <TextField
                        id="project-name"
                        label="عنوان پروژه"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        id="project-name"
                        label="تحویل گیرنده"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        fullWidth
                      />
                      <PhoneField
                        label="شماره تلفن"
                        variant="outlined"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <SettingsPhoneRoundedIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                      <TextField
                        id="project-name"
                        label="آدرس"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        fullWidth
                        multiline
                        rows={fullScreen ? 12 : 8}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ ...flex.column, ...flex.one, ...gap.ten }}>
                    <Box
                      className='neshan-container'
                      sx={{
                        borderRadius: '12px',
                        border: '2px solid var(--border-main)',
                        flex: 1,
                        ...width.full, ...height.full, ...flex.center,
                        '& .wm-container': {
                          '& a': {
                            display: 'none !important',
                            visibility: 'hidden !important',
                          },
                          visibility: 'hidden !important',
                        },
                        '& .mapboxgl-map': {
                          borderRadius: '10px',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          ...flex.columnBetween, ...flex.alignCenter, ...gap.fifteen,
                          px: 1.5,
                          py: 1,
                          position: 'absolute',
                          top: fullScreen ? '20px' : '15px',
                          right: fullScreen ? '20px' : '15px',
                          zIndex: 1200,
                          transition: 'all 0.5s ease',
                          width: '50px',
                          border: '2px solid var(--border-main)',
                          borderRadius: '30px',
                          backdropFilter: 'blur(10px) brightness(1.1)',
                        }}
                      >
                        <Tooltip title="دریافت موقعیت کنونی" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                          <IconButton>
                            <MyLocationRoundedIcon color='info' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={mapTile === 'satellite' ? "نقشه خیابانی" : "نقشه ماهواره ای"} placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                          <IconButton onClick={ToggleMapTile}>
                            <PublicRoundedIcon sx={{ display: mapTile === 'satellite' ? 'none' : 'block', fill: 'var(--text-dark)' }} />
                            <MapRoundedIcon sx={{ display: mapTile === 'satellite' ? 'block' : 'none' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box
                        sx={{
                          display: 'grid',
                          height: '100%',
                          width: '100%',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          '& .leaflet-control-container': {
                            display: 'none !important'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: '100%',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            minHeight: '400px', // Ensure minimum height
                            position: 'relative', // For proper leaflet rendering
                          }}
                        >
                          <Map
                            center={[35.6892, 51.3890]}
                            zoom={14}
                            markerPosition={position ?? undefined}
                            onPositionChange={setPosition}
                            height="100%"
                            mapTile={mapTile}
                            markerType="custom"
                            customMarkerIcon={MarkerIcon}
                            markerSize={[40, 40]}
                            lockView={true}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ ...flex.rowEnd, ...gap.ten, height: '44px' }}>
                      <Btn variant="contained" color="error" onClick={onClose} endIcon={<CloseRoundedIcon />}>
                        انصراف
                      </Btn>
                      <Btn
                        variant='contained'
                        color='secondary'
                        endIcon={
                          <Box className='location-icon-button' sx={{ ...flex.alignCenter }}>
                            <WhereToVoteRoundedIcon className='location-icon' sx={{ position: 'absolute' }} />
                            <ReplayRoundedIcon className='reload-icon' />
                          </Box>
                        }
                      >
                        پردازش دوباره مسیر
                      </Btn>
                      <Btn variant="contained" color="success" endIcon={<DoneAllRoundedIcon />}>
                        تأیید
                      </Btn>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Slide>
      </Modal>
    </React.Fragment>
  );
});
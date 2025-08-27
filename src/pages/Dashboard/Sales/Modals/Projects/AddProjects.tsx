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
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  Autocomplete
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
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded"
import StayCurrentPortraitRoundedIcon from "@mui/icons-material/StayCurrentPortraitRounded"

import Btn from '@/components/elements/Btn';
import { flex, width, height, gap } from '@/models/ReadyStyles';
import PhoneField from '@/components/elements/PhoneField';
import { useThemeMode } from '@/contexts/ThemeContext';
import Map from '@/components/Map';
import { useSnackbar } from "@/contexts/SnackBarContext";

import { getPointDetails, getPointElevation, getLocationSearch } from '@/api';

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default React.memo(function AddProjectModal({ open, onClose }: ModalProps) {
  const [fullScreen, setFullScreen] = React.useState(true);
  const [projectName, setProjectName] = React.useState('');
  const [receiverName, setReceiverName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [mapTile, setMapTile] = React.useState<'street' | 'satellite'>('street');
  const [level, setLevel] = React.useState<'first' | 'second'>('first');
  const [phoneType, setPhoneType] = React.useState<'mobile' | 'landline'>('mobile');
  const [position, setPosition] = React.useState<[number, number] | null>(null);
  const [elevation, setElevation] = React.useState<number | null>(null);
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([35.6892, 51.3890]);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [shouldFlyTo, setShouldFlyTo] = React.useState(false);
  const [lastSearchQuery, setLastSearchQuery] = React.useState('');
  const addressUpdateSource = React.useRef<'user' | 'map' | 'search'>('user');
  const { mode } = useThemeMode()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openPhoneMenu = Boolean(anchorEl);
  const { showSnackbar } = useSnackbar();

  const handlePhoneMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePhoneMenuClose = () => {
    setAnchorEl(null);
  };
  const handleChangePhoneType = (type: 'mobile' | 'landline') => {
    setPhoneType(type);
    setAnchorEl(null);
  };

  const closeWindow = () => {
    // Clean up search state when closing
    setSearchResults([]);
    setSelectedLocation(null);
    setIsSearching(false);
    setLastSearchQuery('');
    addressUpdateSource.current = 'user';
    setAddress('');
    setProjectName('');
    setReceiverName('');
    setPhoneNumber('');
    setPosition(null);
    setElevation(null);
    onClose();
    setFullScreen(true);
  }

  const handleNextLevel = () => {
    setLevel((prevLevel) => (prevLevel === 'first' ? 'second' : 'first'));
  }

  // Handle position changes from map clicks
  const handleMapPositionChange = React.useCallback((newPosition: [number, number]) => {
    setPosition(newPosition);
    setSelectedLocation(null); // Clear selected location since user clicked manually
    setSearchResults([]); // Clear search results
    
    // Set the address update source to map before updating address
    addressUpdateSource.current = 'map';
    
    // Get address for the clicked location
    getPointDetails(newPosition[1], newPosition[0])
      .then(details => {
        setAddress(details.formatted_address);
      })
      .catch(error => {
        console.error('Error getting address for clicked location:', error);
        setAddress(''); // Clear address if API fails
      });
    
    // Get elevation for the clicked location
    getPointElevation(newPosition[1], newPosition[0])
      .then(elevation => {
        setElevation(elevation.elevation);
      })
      .catch(error => {
        console.error('Error getting elevation for clicked location:', error);
        setElevation(null);
      });
  }, []);

  // This effect is now handled by handleMapPositionChange

  // Debounced search effect with duplicate prevention
  React.useEffect(() => {
    const trimmedAddress = address.trim();
    
    // Don't search if address was updated from map click or search selection
    if (addressUpdateSource.current === 'map' || addressUpdateSource.current === 'search') {
      // Reset the source to user for next input
      addressUpdateSource.current = 'user';
      return;
    }
    
    // Clear results if input is too short
    if (trimmedAddress.length <= 2) {
      setSearchResults([]);
      setIsSearching(false);
      setLastSearchQuery('');
      return;
    }

    // Don't search if we have a selected location or if it's the same query
    if (selectedLocation || trimmedAddress === lastSearchQuery) {
      return;
    }

    setIsSearching(true);
    const searchTimeout = setTimeout(() => {
      // Double-check if this search is still relevant
      if (trimmedAddress === address.trim() && !selectedLocation) {
        getLocationSearch(trimmedAddress, mapCenter[1], mapCenter[0])
          .then(results => {
            // Only update if this search is still the current one
            if (trimmedAddress === address.trim()) {
              const validItems = (results.items || []).filter(item => 
                item && 
                item.title && 
                item.address && 
                item.region && 
                item.location && 
                typeof item.location.x === 'number' && 
                typeof item.location.y === 'number'
              );
              setSearchResults(validItems);
              setLastSearchQuery(trimmedAddress);
            }
            setIsSearching(false);
          })
          .catch(error => {
            console.error('Search error:', error);
            setIsSearching(false);
            if (trimmedAddress === address.trim()) {
              setSearchResults([]);
            }
          });
      } else {
        setIsSearching(false);
      }
    }, 750); // Increased debounce time to 750ms for better performance

    return () => clearTimeout(searchTimeout);
  }, [address, mapCenter, selectedLocation, lastSearchQuery]);

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
                width: fullScreen ? 'calc(100vw - 32px)' : '900px',
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
                        label={<span>{phoneType === 'mobile' ? 'شماره موبایل' : 'شماره تلفن ثابت'}</span>}
                        variant="outlined"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handlePhoneMenuClick}
                                edge="end"
                              >
                                <MoreHorizRoundedIcon />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <Menu
                        id="phone-menu"
                        anchorEl={anchorEl}
                        open={openPhoneMenu}
                        onClose={handlePhoneMenuClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                      >
                        <MenuItem onClick={() => handleChangePhoneType('mobile')}>
                          <StayCurrentPortraitRoundedIcon sx={{ mr: 1 }} />
                          موبایل
                        </MenuItem>
                        <MenuItem onClick={() => handleChangePhoneType('landline')}>
                          <LocalPhoneRoundedIcon sx={{ mr: 1 }} />
                          خط ثابت
                        </MenuItem>
                      </Menu>
                      <Autocomplete
                        freeSolo
                        fullWidth
                        options={searchResults}
                        loading={isSearching}
                        open={searchResults.length > 0 || isSearching}
                        noOptionsText={isSearching ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
                        loadingText="در حال جستجو..."
                        value={selectedLocation}
                        inputValue={address}
                        onInputChange={(event, newInputValue) => {
                          setAddress(newInputValue);
                          if (!newInputValue || newInputValue !== selectedLocation?.address) {
                            setSelectedLocation(null);
                            // Clear search results if input is cleared
                            if (!newInputValue?.trim()) {
                              setSearchResults([]);
                            }
                          }
                        }}
                        onChange={(event, newValue) => {
                          if (newValue && typeof newValue === 'object') {
                            const coordinates: [number, number] = [newValue.location.y, newValue.location.x];
                            // Set the address update source to search before updating address
                            addressUpdateSource.current = 'search';
                            setSelectedLocation(newValue);
                            setAddress(newValue.address);
                            setPosition(coordinates);
                            setMapCenter(coordinates);
                            setSearchResults([]); // Clear search results after selection
                            setShouldFlyTo(true);
                            // Reset flyTo after animation
                            setTimeout(() => setShouldFlyTo(false), 500);
                          }
                        }}
                        getOptionLabel={(option) => {
                          if (typeof option === 'string') return option;
                          return option?.title || option?.address || '';
                        }}
                        renderOption={(props, option, { index }) => (
                          <Box component="li" {...props} key={`${option.title}-${option.region}-${index}`}>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {option.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.region}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="آدرس"
                            multiline
                            minRows={1}
                            maxRows={fullScreen ? 23 : 10}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isSearching ? <CircularProgress size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
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
                            center={mapCenter}
                            zoom={14}
                            markerPosition={position ?? undefined}
                            onPositionChange={handleMapPositionChange}
                            onCenterChange={setMapCenter}
                            height="100%"
                            mapTile={mapTile}
                            markerType="custom"
                            customMarkerIcon={MarkerIcon}
                            markerSize={[40, 40]}
                            lockView={false}
                            flyTo={shouldFlyTo}
                            clickable={true}
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
                      <Btn onClick={handleNextLevel} variant="contained" color="success" endIcon={<DoneAllRoundedIcon />}>
                        {level === 'first' ? 'مرحله بعدی' : 'تأیید'}
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
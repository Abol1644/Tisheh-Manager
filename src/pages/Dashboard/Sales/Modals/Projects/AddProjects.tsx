// @ts-check
import React from 'react';

import {
  Typography,
  Modal,
  Box,
  IconButton,
  Tooltip,
  TextField,
  Slide,
  Backdrop,
  Zoom,
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

// Added import for project store to enable optimistic updates
import { getPointDetails, getPointElevation, getLocationSearch, addProject, editProject, findProject } from '@/api';
import { useProjectStore } from '@/stores/';
import { Project } from '@/models/';

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default React.memo(function AddProjectModal({ open, onClose }: ModalProps) {
  const [fullScreen, setFullScreen] = React.useState(true);
  const [project, setProject] = React.useState<Project | null>(null);
  const [projectName, setProjectName] = React.useState('');
  const [receiverName, setReceiverName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [mapTile, setMapTile] = React.useState<'street' | 'satellite'>('street');
  const [level, setLevel] = React.useState<'first' | 'second'>('first');
  const [phoneType, setPhoneType] = React.useState<'mobile' | 'landline'>('mobile');
  const [buttonText, setButtonText] = React.useState<'تأیید' | 'مرحله بعدی'>('مرحله بعدی');
  const [formMode, setFormMode] = React.useState<'edit' | 'create'>('create');
  const [position, setPosition] = React.useState<[number, number] | null>(null);
  const [elevation, setElevation] = React.useState<number | null>(null);
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([35.6892, 51.3890]);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [shouldFlyTo, setShouldFlyTo] = React.useState(false);
  const [lastSearchQuery, setLastSearchQuery] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const addressUpdateSource = React.useRef<'user' | 'map' | 'search'>('user');
  const [findingProject, setFindingProject] = React.useState(false);
  const [openProjectDelete, setOpenProjectDelete] = React.useState(false);
  const [confirmProjectDelete, setConfirmProjectDelete] = React.useState(false);
  // Added project store for optimistic updates after project creation
  const { mode } = useThemeMode()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openPhoneMenu = Boolean(anchorEl);
  const { showSnackbar } = useSnackbar();
  const { addProjectToUnconnectedList, selectedProject, replaceProject } = useProjectStore();

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
    setSearchQuery('');
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

  // Updated to include optimistic update to project store after successful API call
  const handleNextLevel = () => {
    if (formMode === 'create') {
      setLevel((prevLevel) => (prevLevel === 'first' ? 'second' : 'first'));
      setButtonText((prevText) => (prevText === 'تأیید' ? 'مرحله بعدی' : 'تأیید'));
      setMapTile('satellite')
      if (level === 'second') {
        addProject(
          projectName,
          address,
          position ? position[0] : 0,
          position ? position[1] : 0,
          elevation ? elevation : 0,
          receiverName,
          phoneNumber,
          0,
        ).then((newProject) => {
          addProjectToUnconnectedList(newProject);
          showSnackbar('پروژه با موفقیت اضافه شد', 'success');
          closeWindow();
        }).catch((error) => {
          console.error('Error adding project:', error);
          showSnackbar('افزودن پروژه ناموفق بود', 'error');
        });
      }
    } else {
      if (selectedProject?.id && project) {
        const updatedProject = { ...project, title: projectName };
        editProject(
          updatedProject
        ).then((updatedProject) => {
          replaceProject(updatedProject);
          showSnackbar('پروژه با موفقیت ویرایش شد', 'success');
          closeWindow();
        }).catch((error) => {
          console.error('Error editing project:', error);
          showSnackbar('ویرایش پروژه ناموفق بود', 'error');
        });
      } else {
        console.error("Error: Project doesn't have an ID");
      }
    }
  }

  React.useEffect(() => {
    if (level === 'second') {
      setMapTile('satellite');
    } else {
      setMapTile('street');
    }
  }, [level]);

  React.useEffect(() => {
    if (open && selectedProject) {
      setFormMode('edit');
      setButtonText('تأیید');
      console.log("finding project");
      setFindingProject(true);
      showSnackbar('درحال دریافت اطلاعات پروژه', 'info');
      findProject(selectedProject.id).then((foundProject) => {
        if (foundProject) {
          setProject(foundProject);
          setFindingProject(false);
          showSnackbar('اطلاعات پروزه دریافت شد', 'success');
          setAddress(foundProject.address);
          setProjectName(foundProject.title);
          setReceiverName(foundProject.recipientName ?? '');
          setPhoneNumber(foundProject.recipientNumber ?? '');
          setPosition([foundProject.longitude, foundProject.latitude]);
          setElevation(foundProject.elevation);
        } else {
          console.error("Error: Project not found");
        }
      });
    }
  }, [open]);

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
        setProjectName(details.route_name);
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

  // Debounced search effect for search query only
  React.useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    // Clear results if input is too short
    if (trimmedQuery.length <= 2) {
      setSearchResults([]);
      setIsSearching(false);
      setLastSearchQuery('');
      return;
    }

    // Don't search if it's the same query
    if (trimmedQuery === lastSearchQuery) {
      return;
    }

    setIsSearching(true);
    const searchTimeout = setTimeout(() => {
      // Double-check if this search is still relevant
      if (trimmedQuery === searchQuery.trim()) {
        getLocationSearch(trimmedQuery, mapCenter[1], mapCenter[0])
          .then(results => {
            // Only update if this search is still the current one
            if (trimmedQuery === searchQuery.trim()) {
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
              setLastSearchQuery(trimmedQuery);
            }
            setIsSearching(false);
          })
          .catch(error => {
            console.error('Search error:', error);
            setIsSearching(false);
            if (trimmedQuery === searchQuery.trim()) {
              setSearchResults([]);
            }
          });
      } else {
        setIsSearching(false);
      }
    }, 750);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, mapCenter, lastSearchQuery]);

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
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <>
                              {findingProject ? <CircularProgress size={20} /> : null}
                            </>
                          ),
                        }}
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
                      <TextField
                        id="address-display"
                        label="آدرس"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={fullScreen ? 23 : 10}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ ...flex.column, ...flex.one, ...gap.ten }}>
                    <Box
                      className='neshan-container'
                      sx={{
                        position: 'relative',
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
                          backdropFilter: mode === 'dark' ? 'blur(5px) brightness(0.8)' : 'blur(5px) brightness(1.1)',
                          bgcolor: 'var(--background-glass)'
                        }}
                      >
                        <Tooltip title="دریافت موقعیت کنونی" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                          <IconButton>
                            <MyLocationRoundedIcon color='info' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={mapTile === 'satellite' ? "نقشه خیابانی" : "نقشه ماهواره ای"} placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                          <IconButton onClick={ToggleMapTile}>
                            <PublicRoundedIcon sx={{ display: mapTile === 'satellite' ? 'none' : 'block' }} />
                            <MapRoundedIcon sx={{ display: mapTile === 'satellite' ? 'block' : 'none' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          px: 2, py: 2,
                          zIndex: 1200,
                          width: fullScreen ? '350px' : '250px',
                        }}
                      >
                        <Autocomplete
                          freeSolo
                          fullWidth
                          options={searchResults}
                          loading={isSearching}
                          open={searchResults.length > 0 || isSearching}
                          noOptionsText={isSearching ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
                          loadingText="در حال جستجو..."
                          value={selectedLocation}
                          inputValue={searchQuery}
                          onInputChange={(event, newInputValue) => {
                            setSearchQuery(newInputValue);
                            if (!newInputValue || newInputValue !== selectedLocation?.title) {
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
                              setSearchQuery(newValue.title); // Update search query to selected title
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
                              label="جست و جو"
                              size={fullScreen ? 'medium' : 'small'}
                              sx={{
                                borderRadius: '12px',
                                backdropFilter: mode === 'dark' ? 'blur(5px) brightness(0.8)' : 'blur(5px) brightness(1.1)',
                                bgcolor: 'var(--background-glass)',
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'var(--border-main)',
                                    borderWidth: '2px',
                                  },
                                }
                              }}
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
                      <Btn
                        onClick={handleNextLevel}
                        variant="contained"
                        color="success"
                        endIcon={<DoneAllRoundedIcon />}
                        disabled={position === null}
                      >
                        {buttonText}
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
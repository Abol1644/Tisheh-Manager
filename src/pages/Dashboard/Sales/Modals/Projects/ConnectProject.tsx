import React, { useMemo, useState } from 'react';

import {
  Typography,
  Modal,
  Box,
  IconButton,
  Tooltip,
  Slide,
  Backdrop,
  Zoom,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Checkbox, 
  FormControlLabel,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';

import Btn from '@/components/elements/Btn';
import CloseIcon from '@mui/icons-material/Close';
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import SearchIcon from '@mui/icons-material/Search';

import { flex, width, gap, height } from '@/models/ReadyStyles';
import { findProject, connectProject, disconnectProject, getUnConnectedProjects, getConnectedProject } from '@/api';
import { useProjectStore, useAccountStore } from '@/stores';
import { useSnackbar } from '@/contexts/SnackBarContext';
import { Project } from '@/models';

export default function ConnectProjectModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { selectedProject, unconnectedProjects, addProjectToConnectedList, addProjectToUnconnectedList, setUnconnectedProjects, setConnectedProjects, connectedProjects } = useProjectStore();
  const { selectedAccount } = useAccountStore();
  const { showSnackbar } = useSnackbar();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [connectedProjectIds, setConnectedProjectIds] = useState<number[]>([]);
  const [initialConnectedIds, setInitialConnectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Load both unconnected and connected projects when modal opens
  React.useEffect(() => {
    if (open && selectedAccount) {
      setLoading(true);
      
      // Load both unconnected projects and connected projects for this account
      Promise.all([
        getUnConnectedProjects(),
        getConnectedProject(false, parseInt(selectedAccount.codeAcc)) // BranchCenterDelivery=false, account id
      ])
        .then(([unconnectedProjects, connectedProjects]) => {
          // Combine both lists, removing duplicates if any
          const combinedProjects = [...unconnectedProjects];
          
          // Add connected projects that aren't already in the unconnected list
          connectedProjects.forEach(connectedProject => {
            if (!combinedProjects.some(p => p.id === connectedProject.id)) {
              combinedProjects.push(connectedProject);
            }
          });
          
          setAllProjects(combinedProjects);
          
          // Set connected project IDs from the connected projects list
          const connectedIds = connectedProjects.map(project => project.id);
          setConnectedProjectIds(connectedIds);
          setInitialConnectedIds(connectedIds); // Store initial state for comparison
          
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error loading projects:', error);
          showSnackbar('خطا در بارگذاری پروژه‌ها', 'error');
          setLoading(false);
        });
    }
  }, [open, selectedAccount, showSnackbar]);

  const handleSaveChanges = async () => {
    if (!selectedAccount) {
      showSnackbar('حساب انتخاب نشده است', 'error');
      return;
    }

    const initialConnectedIdsSet = new Set(initialConnectedIds);
    const currentConnectedIds = new Set(connectedProjectIds);

    // Find projects to connect (newly selected)
    const toConnect = allProjects.filter(project => 
      currentConnectedIds.has(project.id) && !initialConnectedIdsSet.has(project.id)
    );

    // Find projects to disconnect (newly unselected)
    const toDisconnect = allProjects.filter(project => 
      initialConnectedIdsSet.has(project.id) && !currentConnectedIds.has(project.id)
    );

    if (toConnect.length === 0 && toDisconnect.length === 0) {
      showSnackbar('هیچ تغییری انجام نشده است', 'info');
      onClose();
      return;
    }

    setLoading(true);
    showSnackbar('در حال ذخیره تغییرات...', 'info');

    try {
      // Handle connections
      for (const project of toConnect) {
        await connectProject(project, selectedAccount);
        addProjectToConnectedList(project);
        // Remove from unconnected store
        const remainingUnconnected = unconnectedProjects.filter(p => p.id !== project.id);
        setUnconnectedProjects(remainingUnconnected);
      }

      // Handle disconnections
      for (const project of toDisconnect) {
        await disconnectProject(project, selectedAccount);
        addProjectToUnconnectedList(project);
        // Remove from connected store
        const remainingConnected = connectedProjects.filter(p => p.id !== project.id);
        setConnectedProjects(remainingConnected);
      }

      const totalChanges = toConnect.length + toDisconnect.length;
      showSnackbar(`${totalChanges} تغییر با موفقیت اعمال شد`, 'success');
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
      showSnackbar('خطا در ذخیره تغییرات', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
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
              width: '920px',
              height: 'auto',
              bgcolor: 'background.glass',
              background: 'linear-gradient(-165deg, #00ff684d, var(--transparent) 75%)',
              border: 'none',
              boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
              p: '20px 20px',
              borderRadius: '25px',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(5px)',
              justifyContent: 'space-between',
              '&:focus-visible': {
                outline: 'none'
              },
              pointerEvents: 'auto'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant='h6'
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}
              >
                <AddLinkRoundedIcon />
                اتصال پروژه به حساب
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
            <Box sx={{ width: '100%', mt: 4 }}>
              <AllProjectsTable 
                projects={allProjects}
                selectedProjects={connectedProjectIds}
                onSelectionChange={setConnectedProjectIds}
                loading={loading}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <Btn 
                  variant="contained" 
                  color="success" 
                  endIcon={<AddLinkRoundedIcon />} 
                  onClick={handleSaveChanges} 
                  sx={{ height: '42px', mt: 1, justifySelf: 'end' }}
                  disabled={loading}
                >
                  ذخیره تغییرات
                </Btn>
              </Box>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal >
  );
}


export function AllProjectsTable({ projects, selectedProjects, onSelectionChange, loading }: {
  projects: Project[];
  selectedProjects: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  loading: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyConnected, setShowOnlyConnected] = useState(false);

  // Filter projects based on search query and connection status
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by connection status first
    if (showOnlyConnected) {
      filtered = filtered.filter(project => selectedProjects.includes(project.id));
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter(project => {
        const title = project.title || '';
        const address = project.address || '';
        
        // For Persian text, just use includes without toLowerCase
        return title.includes(query) || address.includes(query);
      });
    }

    return filtered;
  }, [projects, searchQuery, showOnlyConnected, selectedProjects]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const filteredIds = filteredProjects.map(project => project.id);
      // Add filtered IDs to existing selection (don't overwrite other selected items)
      const newSelection = [...new Set([...selectedProjects, ...filteredIds])];
      onSelectionChange(newSelection);
    } else {
      // Remove filtered IDs from selection
      const filteredIds = new Set(filteredProjects.map(project => project.id));
      const newSelection = selectedProjects.filter(id => !filteredIds.has(id));
      onSelectionChange(newSelection);
    }
  };

  const handleSelectOne = (projectId: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange([...selectedProjects, projectId]);
    } else {
      onSelectionChange(selectedProjects.filter(id => id !== projectId));
    }
  };

  // Update checkbox states to work with filtered projects
  const filteredSelectedProjects = selectedProjects.filter(id => 
    filteredProjects.some(project => project.id === id)
  );
  const isAllSelected = filteredProjects.length > 0 && filteredSelectedProjects.length === filteredProjects.length;
  const isIndeterminate = filteredSelectedProjects.length > 0 && filteredSelectedProjects.length < filteredProjects.length;

  return (
    <React.Fragment>
      <Box sx={{ ...flex.rowCenter, ...gap.ten, mb: 2 }}>
        <TextField
          placeholder="جستجو در پروژه‌ها..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          type="search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          label="فقط پروژه‌های متصل"
          sx={{ whiteSpace: 'nowrap' }}
          control={
            <Checkbox
              checked={showOnlyConnected}
              onChange={(event) => setShowOnlyConnected(event.target.checked)}
              color="primary"
            />
          }
        />
      </Box>
      <Box className="income-modal-table-container" sx={{ mb: 1 }}>
      <TableContainer sx={{ maxHeight: '380px', overflow: 'auto' }} className="income-modal-table">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow
              className="income-modal-table-header"
              sx={{ '& .MuiTableCell-root': { p: 0.8 } }}
            >
              <TableCell align='center'>
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  color="primary"
                  disabled={loading}
                />
              </TableCell>
              <TableCell>عنوان</TableCell>
              <TableCell>آدرس</TableCell>
              <TableCell align='center'>اتصال</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography sx={{ mt: 1 }} color="text.secondary">
                    در حال بارگذاری پروژه‌ها...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    hover
                    selected={selectedProjects.includes(project.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onChange={handleSelectOne(project.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.address}</TableCell>
                    <TableCell align='center'>
                      <Typography 
                        variant="caption" 
                        color={selectedProjects.includes(project.id) ? 'success.main' : 'text.secondary'}
                      >
                        {selectedProjects.includes(project.id) ? 'متصل' : 'باز'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 && searchQuery.trim() && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        هیچ پروژه‌ای با این جستجو یافت نشد
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    </React.Fragment>
  );
}
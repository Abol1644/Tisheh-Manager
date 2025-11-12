import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '@/contexts/AuthContext';
import FolderIcon from '@mui/icons-material/Folder';
import rawLogoDark from '@/assets/images/Raw-Dark.png';
import { useThemeMode } from "@/contexts/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import rawLogoLight from '@/assets/images/Raw-Light.png';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { menuRoutes, ROUTE_ICON_MAP } from "@/models/menuConfig";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AppBar, Box, Button, Collapse, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';

import type { User } from '@/models/Users';

type MenuRoute = {
  label: string;
  path?: string;
  children?: MenuRoute[];
  admin?: boolean;
};

const drawerWidth = 310;

const companyNames: Record<string, string> = {
  tishe: 'تیشه',
  testco: 'تست‌کو',
};

const mainDrawerStyles = {
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    height: 'calc(100vh - 20px)',
    marginTop: '10px',
    borderRadius: '0 35px 35px 0',
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'none',
    scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
  },
  '& .MuiBackdrop-root': {
    transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
  }
};

const userProfileBoxStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: '50px',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#ff0000e0',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }
};

const userInfoBoxStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  backgroundColor: '#006aff',
  borderRadius: '50px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  p: 1.5,
};

type ExpandedMenus = { [label: string]: boolean };

interface DecodedToken {
  [key: string]: any;
}

interface MenuItemProps {
  route: MenuRoute;
  location: ReturnType<typeof useLocation>;
  onNavigate: (path: string) => void;
  userLevel?: string;
  expandedMenus: ExpandedMenus;
  onToggleExpand: (menuLabel: string, depth: number, parentPath?: string) => void;
  depth?: number;
  mode: string;
  parentPath?: string;
}

function MenuItem({
  route,
  location,
  onNavigate,
  userLevel,
  expandedMenus,
  onToggleExpand,
  depth = 0,
  mode,
  parentPath = ''
}: MenuItemProps) {
  const Icon = ROUTE_ICON_MAP[route.label as keyof typeof ROUTE_ICON_MAP] || FolderIcon;
  const hasChildren = route.children && route.children.length > 0;
  const isSelected = !hasChildren && route.path && location.pathname === route.path;
  const isExpanded = expandedMenus[route.label] || false;

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(route.label, depth, parentPath);
    } else if (route.path) {
      onNavigate(route.path);
    }
  };

  if (route.admin && userLevel !== 'admin') return null;

  const paddingLeft = depth === 0 ? 2 : 4 + (depth - 1) * 2;

  return (
    <>
      <div
        className='mui-menu-list-container'
        style={{
          backgroundColor: isExpanded
            ? mode === "light"
              ? "#c1c1c16e"
              : "#ffffff17"
            : "transparent",
          transition: "background-color 0.3s ease",
          borderRadius: "24px",
          overflow: "hidden",
          marginBottom: '5px'
        }}
      >
        <ListItemButton
          selected={!!isSelected}
          onClick={handleClick}
          sx={{
            pl: paddingLeft,
            '& .MuiListItemText-root, .MuiListItemIcon-root': {
              transition: 'transform 0.3s ease',
            },
            '&:hover .MuiListItemText-root, &:hover .MuiListItemIcon-root': {
              transform: 'translateX(10px) scale(1.08)',
              transition: 'transform 0.3s ease',
            },
          }}
        >
          <ListItemIcon>
            {depth === 0 ? (
              <Icon fontSize="small" />
            ) : (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'text.secondary',
                }}
              />
            )}
          </ListItemIcon>
          <ListItemText primary={route.label} />

          {hasChildren && (
            <ListItemIcon
              sx={{
                minWidth: 20,
              }}
            >
              <ExpandMoreIcon
                sx={{
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(-180deg)' : 'rotate(0deg)',
                }}
              />
            </ListItemIcon>
          )}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List
              component="div"
              disablePadding
              className='list-drawer'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {route.children?.map((childRoute: MenuRoute) => (
                <MenuItem
                  key={childRoute.path || childRoute.label}
                  route={childRoute}
                  location={location}
                  onNavigate={onNavigate}
                  userLevel={userLevel}
                  expandedMenus={expandedMenus}
                  onToggleExpand={onToggleExpand}
                  depth={depth + 1}
                  mode={mode}
                  parentPath={parentPath ? `${parentPath}.${route.label}` : route.label}
                />
              ))}
            </List>
          </Collapse>
        )}
      </div>
    </>
  );
}

interface UserProfileProps {
  className?: string;
  user: User | null;
  onNavigateToProfile: () => void;
  onLogout: (e?: React.MouseEvent) => void;
}

function UserProfile({ className, user, onNavigateToProfile, onLogout }: UserProfileProps) {
  const { decodedToken } = useAuth();
  const userName =
    (decodedToken as DecodedToken)?.Name ||
    (user as any)?.FirstName ||
    'کاربر';

  return (
    <Box className={className || "user-profile"} sx={userProfileBoxStyles} onClick={onNavigateToProfile}>
      <Box sx={userInfoBoxStyles}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <AccountCircleIcon sx={{ mr: 1, fontSize: '2rem', color: "#fff" }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff' }}>
            {userName}
          </Typography>
        </Box>
      </Box>
      <Box onClick={onLogout} style={{ display: 'flex', alignItems: 'center', margin: '10px' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          خروج
        </Typography>
        <ExitToAppIcon sx={{ ml: 1, fontSize: '1.5rem', rotate: '180deg' }} />
      </Box>
    </Box>
  );
}

export default function MainLayout() {
  const { mode, toggleMode } = useThemeMode();
  const [mainDrawerOpen, setMainDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({});

  const handleToggleExpand = (menuLabel: string, depth: number, parentPath?: string) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[menuLabel];
      const newState = { ...prev };
      
      if (isCurrentlyExpanded) {
        // If clicking on an already expanded menu, just close it
        newState[menuLabel] = false;
      } else {
        // If opening a new menu, close siblings at the same level
        if (depth === 0) {
          // For top-level menus, close all other top-level menus
          menuRoutes.forEach(route => {
            if (route.label !== menuLabel && route.children) {
              newState[route.label] = false;
            }
          });
        } else {
          // For nested menus, find and close siblings with the same parent
          Object.keys(prev).forEach(key => {
            if (key !== menuLabel) {
              // Check if this is a sibling (same parent path)
              const currentMenuPath = parentPath ? `${parentPath}.${menuLabel}` : menuLabel;
              const existingMenuParent = currentMenuPath.split('.').slice(0, -1).join('.');
              const keyParent = key.includes('.') ? key.split('.').slice(0, -1).join('.') : '';
              
              if (existingMenuParent === keyParent) {
                newState[key] = false;
              }
            }
          });
        }
        newState[menuLabel] = true;
      }
      
      return newState;
    });
  };

  const selectedCompany = localStorage.getItem('selectedCompany');
  const selectedPeriod = localStorage.getItem('selectedPeriod');
  const companyName = companyNames[selectedCompany ?? ''] || '';
  const logoSrc = mode === "light" ? rawLogoDark : rawLogoLight;
  const headerTitle = selectedCompany && selectedPeriod
    ? `سیستم مدیریتی ${companyName} دوره مالی ${selectedPeriod}`
    : 'سیستم مدیریتی';

  const handleNavigate = (path: string) => {
    navigate(path);
    setMainDrawerOpen(false);
  };

  const handleLogout = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    logout();
    setMainDrawerOpen(false);
    navigate('/signin', { replace: true });
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
    setMainDrawerOpen(false);
  };

  const handleMainDrawerClose = () => {
    setMainDrawerOpen(false);
  };

  const handleMainDrawerOpen = () => {
    setMainDrawerOpen(true);
  };

  const drawerMenu = useMemo(() => (
    <List>
      {menuRoutes.map((route: MenuRoute) => (
        <MenuItem
          key={route.path || route.label}
          route={route}
          location={location}
          onNavigate={handleNavigate}
          userLevel={(user as any)?.level}
          expandedMenus={expandedMenus}
          onToggleExpand={handleToggleExpand}
          depth={0}
          mode={mode}
          parentPath=""
        />
      ))}
    </List>
  ), [location, user, expandedMenus, mode]);

  const renderDrawerContent = () => {
    return (
      <>
        <Box sx={{
          padding: '6px',
          flexShrink: 0,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        }}>
          <UserProfile
            className="user-profile"
            user={user}
            onNavigateToProfile={handleNavigateToProfile}
            onLogout={handleLogout}
          />
        </Box>

        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: "12px",
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '10px',
            transition: 'background 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0, 0, 0, 0.3)',
          },
          scrollbarWidth: 'none',
          scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
        }}>
          {drawerMenu}
        </Box>
      </>
    );
  };

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: "background.paper",
        color: "text.primary",
        transition: "all 0.3s ease-in-out",
        display: 'flex'
      }}
    >
      <AppBar
        sx={{
          boxShadow: mode === 'light'
            ? '0 0 5px rgba(0, 0, 0, 0.2)'
            : '0 0 5px rgba(255, 255, 255, 0.3)',
          zIndex: '1'
        }}
        position="fixed">
        <Box
          sx={{
            backgroundColor: "background.paper",
            color: "text.primary",
            transition: "all 0.3s ease-in-out",
          }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleMainDrawerOpen}>
              <MenuIcon />
            </IconButton>
            <img src={logoSrc} style={{ height: '40px', margin: "0 10px 0 10px" }} alt="Logo" />
            <Typography variant="h6" noWrap sx={{ flex: 1 }}>
              {headerTitle}
            </Typography>
            <IconButton
              onClick={toggleMode}
              sx={{
                bgcolor: "background.default",
                color: "text.primary",
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                transition: "all 0.3s ease-in-out",
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              {mode === "light" ? <DarkModeIcon /> : <Brightness7Icon />}
            </IconButton>
          </Toolbar>
        </Box>
      </AppBar>

      <Drawer
        open={mainDrawerOpen}
        onClose={() => setMainDrawerOpen(false)}
        sx={mainDrawerStyles}
        variant='temporary'
        anchor='left'
        transitionDuration={250}
      >
        {renderDrawerContent()}
      </Drawer>
      <Box
        component="main"
        sx={{
          flex: 1,
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          backgroundColor: "background.default",
          p: 2,
          transition: 'background-color 0.3s ease'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
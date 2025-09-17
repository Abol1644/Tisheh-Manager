import React from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Tooltip,
  InputAdornment,
  Slide,
  CircularProgress,
  Zoom,
  Grow,
  Fade,
  Divider,
} from '@mui/material';

import Btn from '@/components/elements/Btn';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';

import { getSaleCategories } from '@/api';
import { CategorySale } from '@/models';

import { useProductsStore } from '@/stores/';

const MemoAccordion = React.memo(Accordion);

const CategoryItem = React.memo(({
  parent,
  index,
  isPinnedSection,
  children,
  isPinned,
  isAnimating,
  isJustPinned,
  expandedParentId,
  categoryEnable,
  loading,
  value,
  drawerOpen,
  onTogglePin,
  onAccordionChange,
  onCategorySelect,
  selectedCategory,
}: {
  parent: CategorySale;
  index: number;
  isPinnedSection: boolean;
  children: CategorySale[];
  isPinned: boolean;
  isAnimating: boolean;
  isJustPinned: boolean;
  expandedParentId: number | false;
  categoryEnable: boolean;
  loading: boolean;
  value: number;
  drawerOpen?: boolean;
  onTogglePin: (id: number) => void;
  onAccordionChange: (id: number) => (event: React.SyntheticEvent, isExp: boolean) => void;
  onCategorySelect?: (category: CategorySale) => void;
  selectedCategory?: CategorySale | null;
}) => {

  return (
    <Zoom
      in={!isAnimating || isPinnedSection === isPinned}
      timeout={{
        enter: isPinnedSection && isJustPinned ? 600 : 300,
        exit: 300
      }}
      style={{
        transformOrigin: isPinnedSection ? 'center top' : 'center bottom',
      }}
    >
      <Slide
        direction="up"
        in={value === 1 || drawerOpen === true}
        mountOnEnter
        unmountOnExit
        timeout={300}
        style={{
          transitionDelay: `${index * (isPinnedSection ? 30 : 50)}ms`,
        }}
      >
        <MemoAccordion
          disabled={!categoryEnable || loading}
          expanded={expandedParentId === parent.id}
          onChange={onAccordionChange(parent.id)}
          sx={{
            transform: `scale(${isJustPinned ? 1.015 : 1}) translateZ(0)`,
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            borderLeft: isPinned ? '3px solid' : 'none',
            borderLeftColor: 'secondary.main',
            willChange: 'transform, box-shadow',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            '&.MuiPaper-root:first-of-type': {
              borderTopLeftRadius: isPinned ? '5px' : '12px !important',
              borderTopRightRadius: isPinned ? '5px' : '12px !important',
            },
            '&.MuiPaper-root:last-of-type': {
              borderBottomLeftRadius: isPinned ? '5px' : '12px !important',
              borderBottomRightRadius: isPinned ? '5px' : '12px !important',
            },
            '&.MuiPaper-root.Mui-expanded': {
              backgroundColor: isPinned ? 'var(--background-secondaryShade) !important' : 'var(--info-shade) !important',
              borderRadius: '12px',
              margin: '4px 0',
              transition: 'all 0.3s ease'
            },
            '&.MuiPaper-root, .Mui-expanded ': {
              transition: 'all 0.3s ease'
            }
          }}
        >
          <AccordionSummary
            component="div"
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiPaper-root-MuiAccordion-root:first-of-type': {
                borderTopLeftRadius: '12px !important',
                borderTopRightRadius: '12px !important',
                scale: '2.0',
              }
            }}
          >
            <Tooltip
              title={isPinned ? "حذف علاقه مندی" : "افزودن به علاقه مندی"}
              placement="top"
              arrow
              disableInteractive
              slots={{ transition: Zoom }}
            >
              <Btn
                color="info"
                variant="text"
                sx={{
                  width: '30px',
                  minWidth: '30px',
                  p: 0,
                  transition: 'transform 0.15s ease-out',
                  '&:hover': {
                    transform: 'scale(1.08)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(parent.id);
                }}
              >
                <Box
                  sx={{
                    transform: `rotate(${isAnimating ? 360 : 0}deg) translateZ(0)`,
                    transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    willChange: 'transform',
                    display: 'flex'
                  }}
                >
                  {isPinned ? (
                    <StarRateRoundedIcon
                      sx={{
                        fontSize: '22px',
                        color: 'secondary.main',
                        filter: isJustPinned ? 'drop-shadow(0 0 6px rgba(255,193,7,0.4))' : 'none',
                        transition: 'filter 0.3s ease',
                      }}
                    />
                  ) : (
                    <StarOutlineRoundedIcon
                      sx={{
                        fontSize: '22px',
                        transition: 'color 0.15s ease',
                        '&:hover': {
                          color: 'secondary.main',
                        }
                      }}
                    />
                  )}
                </Box>
              </Btn>
            </Tooltip>
            <Typography
              component="span"
              sx={{
                ml: 1,
                fontWeight: isPinned ? 500 : 400,
                transition: 'color 0.2s ease, font-weight 0.2s ease',
              }}
            >
              {parent.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ '&.MuiAccordionDetails-root': { padding: '8px 16px 8px' } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                '& .MuiBox-root:last-child .MuiDivider-root': { display: 'none' }
              }}
            >
              {children.length > 0 ? (
                children.map((child, childIndex) => (
                  <Box
                    key={child.id}
                    sx={{
                      opacity: 1,
                      transform: 'translateX(0) translateZ(0)',
                      transition: `opacity 0.2s ease ${childIndex * 20}ms, transform 0.2s ease ${childIndex * 20}ms`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    <Btn
                      variant="text"
                      color="inherit"
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'right',
                        width: '90%',
                        px: 1,
                        pl: 2,
                        minHeight: '32px',
                        // Enhanced selection state - maintains hover-like appearance when selected
                        backgroundColor: selectedCategory?.id === child.id
                          ? 'action.selected'
                          : 'transparent',
                        color: selectedCategory?.id === child.id
                          ? isPinned ? 'secondary.main' : 'info.main'
                          : 'inherit',
                        transform: selectedCategory?.id === child.id
                          ? 'translateX(10px)'
                          : 'translateX(0)',
                        fontWeight: selectedCategory?.id === child.id ? 600 : 400,
                        borderLeft: selectedCategory?.id === child.id
                          ? '2px solid'
                          : 'none',
                        borderLeftColor: isPinned ? 'secondary.main' : 'info.main',

                        transition: 'all 0.1s ease',

                        '&:hover': {
                          color: isPinned ? 'secondary.main' : 'info.main',
                          transform: 'translateX(10px)',
                          backgroundColor: selectedCategory?.id === child.id
                            ? 'action.selected'
                            : 'action.hover',
                          // Add subtle scale effect on hover
                          scale: selectedCategory?.id === child.id ? 1.02 : 1,
                        },

                        // Active state for click feedback
                        '&:active': {
                          transform: 'translateX(8px) scale(0.98)',
                          transition: 'all 0.1s ease',
                        }
                      }}
                      onClick={() => {
                        if (onCategorySelect) {
                          onCategorySelect(child);
                        }
                      }}
                      disabled={!categoryEnable}
                    >
                      {child.title}
                    </Btn>
                    <Divider sx={{ my: 0.5, mx: 2 }} />
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: 'center',
                    py: 1,
                    opacity: 0.7,
                  }}
                >
                  زیرمجموعه‌ای وجود ندارد
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </MemoAccordion>
      </Slide>
    </Zoom>
  );
});

CategoryItem.displayName = 'CategoryItem';

export function Category({
  value,
  drawerOpen,
  categoryEnable,
  categories = [],
  loading,
  onRefresh,
  onCategorySelect,
}: {
  value: number;
  drawerOpen?: boolean;
  categoryEnable: boolean;
  categories: CategorySale[];
  loading: boolean;
  onRefresh: () => void;
  onCategorySelect?: (category: CategorySale | null) => void;
}) {
  const isServer = typeof window === 'undefined';


  const { selectedCategory } = useProductsStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [expandedParentId, setExpandedParentId] = React.useState<number | false>(false);


  const [animatingItems, setAnimatingItems] = React.useState<Set<number>>(new Set());
  const [justPinnedItems, setJustPinnedItems] = React.useState<Set<number>>(new Set());


  const [pinnedParents, setPinnedParents] = React.useState<number[]>(
    isServer ? [] : JSON.parse(localStorage.getItem('pinnedParents') || '[]')
  );

  const handleCategorySelect = React.useCallback((category: CategorySale) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  }, [onCategorySelect]);

  const { parentCategories, childCategoriesByParentId } = React.useMemo(() => {
    const parents = categories.filter(cat => cat.parentId === 1);
    const childMap = new Map<number, CategorySale[]>();

    categories.forEach(cat => {
      if (cat.parentId !== 1) {
        if (!childMap.has(cat.parentId)) childMap.set(cat.parentId, []);
        childMap.get(cat.parentId)!.push(cat);
      }
    });

    return { parentCategories: parents, childCategoriesByParentId: childMap };
  }, [categories]);


  const filteredParents = React.useMemo(() => {
    if (!debouncedSearchTerm) return parentCategories;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return parentCategories.filter(parent => {
      const children = childCategoriesByParentId.get(parent.id) || [];
      return (
        parent.title.toLowerCase().includes(searchLower) ||
        children.some(child => child.title.toLowerCase().includes(searchLower))
      );
    });
  }, [parentCategories, childCategoriesByParentId, debouncedSearchTerm]);


  const { pinnedParentsList, unpinnedParentsList } = React.useMemo(() => {
    const pinned = filteredParents
      .filter(parent => pinnedParents.includes(parent.id))
      .sort((a, b) => pinnedParents.indexOf(a.id) - pinnedParents.indexOf(b.id));

    const unpinned = filteredParents.filter(parent => !pinnedParents.includes(parent.id));

    return { pinnedParentsList: pinned, unpinnedParentsList: unpinned };
  }, [filteredParents, pinnedParents]);


  const togglePin = React.useCallback((id: number) => {
    const isPinning = !pinnedParents.includes(id);


    requestAnimationFrame(() => {
      setAnimatingItems(prev => new Set([...prev, id]));

      if (isPinning) {
        setPinnedParents(prev => [...prev, id]);
        setJustPinnedItems(prev => new Set([...prev, id]));


        setTimeout(() => {
          requestAnimationFrame(() => {
            setAnimatingItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
            setJustPinnedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          });
        }, 300);
      } else {
        setPinnedParents(prev => prev.filter(p => p !== id));

        setTimeout(() => {
          requestAnimationFrame(() => {
            setAnimatingItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          });
        }, 300);
      }
    });
  }, [pinnedParents]);


  const handleChange = React.useCallback((id: number) =>
    (_: React.SyntheticEvent, isExp: boolean) => {
      setExpandedParentId(isExp ? id : false);
    }, []
  );

  const debouncedSave = React.useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (data: number[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          localStorage.setItem('pinnedParents', JSON.stringify(data));
        }, 100);
      };
    }, []),
    []
  );

  const isDebouncing = debouncedSearchTerm !== searchTerm;

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('pinnedParents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPinnedParents(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load pinned parents from localStorage');
    }
  }, []);

  React.useEffect(() => {
    if (!isServer) {
      debouncedSave(pinnedParents);
    }
  }, [pinnedParents, debouncedSave, isServer]);

  return (
    <Box sx={{ p: 2 }}>
      <Box
        className="category-search-box"
        sx={{
          mb: 1.5,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: 0,
        }}
      >
        <TextField
          disabled={!categoryEnable || loading}
          label="جست‌و‌جو"
          variant="outlined"
          type='search'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              transition: 'box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {isDebouncing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SearchRoundedIcon sx={{ fontSize: 20 }} />
                  )}
                </InputAdornment>
              ),
            },
          }}
        />
        <Tooltip title="بارگذاری مجدد" placement="top" arrow disableInteractive slots={{ transition: Zoom }}>
          <Btn
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            sx={{
              color: 'text.secondary',
              width: '44px',
              minWidth: '44px',
              height: '44px',
              transition: 'all 0.15s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                color: 'primary.main',
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
            disabled={!categoryEnable}
          >
            <RefreshRoundedIcon sx={{ fontSize: 24 }} />
          </Btn>
        </Tooltip>
      </Box>
      <Box sx={{
        '& > *': {
          marginBottom: 1,
        },
      }}>
        {pinnedParentsList.length > 0 && (
          <Box sx={{ mb: 2, }}>
            <Fade in={true} timeout={300}>
              <Typography
                variant="caption"
                sx={{
                  color: 'secondary.main',
                  fontWeight: 600,
                  display: 'block',
                  my: 1,
                  px: 1,
                  fontSize: '0.75rem',
                }}
              >
                ✨ علاقه مندی ها
              </Typography>
            </Fade>
            {pinnedParentsList.map((parent, index) => (
              <CategoryItem
                key={`pinned-${parent.id}`}
                parent={parent}
                index={index}
                isPinnedSection={true}
                children={childCategoriesByParentId.get(parent.id) || []}
                isPinned={true}
                isAnimating={animatingItems.has(parent.id)}
                isJustPinned={justPinnedItems.has(parent.id)}
                expandedParentId={expandedParentId}
                categoryEnable={categoryEnable}
                loading={loading}
                value={value}
                drawerOpen={drawerOpen}
                onTogglePin={togglePin}
                onAccordionChange={handleChange}
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            ))}
          </Box>
        )}
        {unpinnedParentsList.length > 0 && (
          <Box>
            {pinnedParentsList.length > 0 && (
              <Fade in={true} timeout={300}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    display: 'block',
                    mb: 1,
                    px: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  📋 سایر دسته‌ها
                </Typography>
              </Fade>
            )}
            <Box>
              {unpinnedParentsList.map((parent, index) => (
                <CategoryItem
                  key={`unpinned-${parent.id}`}
                  parent={parent}
                  index={index}
                  isPinnedSection={false}
                  children={childCategoriesByParentId.get(parent.id) || []}
                  isPinned={pinnedParents.includes(parent.id)}
                  isAnimating={animatingItems.has(parent.id)}
                  isJustPinned={justPinnedItems.has(parent.id)}
                  expandedParentId={expandedParentId}
                  categoryEnable={categoryEnable}
                  loading={loading}
                  value={value}
                  drawerOpen={drawerOpen}
                  onTogglePin={togglePin}
                  onAccordionChange={handleChange}
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
      {pinnedParentsList.length === 0 && unpinnedParentsList.length === 0 && !loading && (
        <Fade in={true} timeout={400}>
          <Box sx={{
            textAlign: 'center',
            mt: 2,
            py: 2,
            borderRadius: '50px',
            backgroundColor: 'action.hover',
          }}>
            <Typography variant="body2" color="text.secondary">
              🔍 هیچ دسته‌بندی یافت نشد
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
}
import React, { useMemo, useCallback, useState, useEffect } from "react";

import OrderConfirmModal from "@/pages/Dashboard/Sales/Modals/SabtSefaresh/OrderConfirmModal";
import usePersianNumbers from "@/hooks/usePersianNumbers";

import Combo from "@/components/elements/Combo";
import { flex, size } from "@/models/ReadyStyles";
import { useThemeMode } from "@/contexts/ThemeContext";

import { Account, Project, Warehouse } from "@/models/";
import {
  getUnConnectedProjects,
  getConnectedProject,
  getWarehouses,
  getSaleAccounts,
} from "@/api/";

import {
  Typography,
  ToggleButton,
  Box,
  ToggleButtonGroup,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Zoom
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CachedRoundedIcon from "@mui/icons-material/CachedRounded"

import { useOrgansStore } from '@/stores/organStore';
import { useProductsStore, useProjectStore, useAccountStore, useBranchDeliveryStore, useDistanceStore, useControlCart } from '@/stores/';
import { useSnackbar } from "@/contexts/SnackBarContext";

export function ProductSelect(props: any) {
  const { setCategoryEnable } = props;
  const { isCartOpen } = useControlCart();

  const {
    products,
    selectedWarehouse,
    selectedCategory,
    setSelectedWarehouse,
    filteredProducts,
    error,
  } = useProductsStore();

  const { organs, fetchOrgans } = useOrgansStore();
  const { showSnackbar, closeSnackbarById } = useSnackbar();
  const [modalOpen, setModalOpen] = useState(false);
  const [initDone, setInitDone] = useState(false);
  const [alternateShow, setAlternateShow] = useState(false);
  const [dis3show, setDis3Show] = useState(false);
  // Replaced local project state with global project store
  const [Warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const {
    selectedProject,
    setSelectedProject,
    unconnectedProjects,
    connectedProjects,
    loading: projectsLoading,
    setUnconnectedProjects,
    setConnectedProjects,
    setLoading: setProjectsLoading
  } = useProjectStore();
  const { accounts, selectedAccount, setSelectedAccount, setAccounts } = useAccountStore();
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [isFetchingDistance, setIsFetchingDistance] = useState(false);
  const { mode } = useThemeMode();
  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);
  const setIsBranchDelivery = useBranchDeliveryStore((s) => s.setIsBranchDelivery);
  const { distance, fetchDistance } = useDistanceStore();
  const { setSelectedItem } = useProductsStore();
  const primaryDistance = useMemo(() => distance.find((d) => d.warehouseId > 0)?.warehouseId || null, [distance]);
  const { toPersianPrice } = usePersianNumbers();

  useEffect(() => {
    const isAlt = products.find(product => product.activateAlternate);
    const haveDis3 = products.find(product => product.discountPriceWarehouse2);
    setAlternateShow(!!isAlt);
    setDis3Show(!!haveDis3);
  }, [products]);

  useEffect(() => {
    const storedDeliveryType = localStorage.getItem('isBranchDelivery');
    if (storedDeliveryType !== null) {
      setIsBranchDelivery(JSON.parse(storedDeliveryType));
    }
  }, [setIsBranchDelivery]);

  useEffect(() => {
    return () => {
      setSelectedProject(null);
      setSelectedWarehouse(null);
    };
  }, [setSelectedProject, setSelectedWarehouse]);

  useEffect(() => {
    if (organs.length === 0) {
      fetchOrgans();
    }
  }, [organs.length, fetchOrgans]);

  const handleRowClick = (params: any) => {
    setSelectedItem(params.row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    if (!initDone) return;
    const shouldEnable = !!selectedWarehouse;
    if (typeof setCategoryEnable === 'function') {
      setCategoryEnable(shouldEnable);
    }
  }, [initDone, selectedWarehouse, setCategoryEnable]);

  React.useEffect(() => {
    if (accounts.length > 0) return;
    setAccountsLoading(true); 
    getSaleAccounts()
      .then((accounts) => {
        setAccounts(accounts);
      })
      .catch((error) => {
        let errorMessage = 'خطا در دریافت حساب ها';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      })
      .finally(() => { setAccountsLoading(false) });
  }, [accounts.length, setAccounts, showSnackbar]);

  React.useEffect(() => {
    if (unconnectedProjects.length > 0) return;

    setProjectsLoading(true);
    getUnConnectedProjects()
      .then((projects) => {
        setUnconnectedProjects(projects);
      })
      .catch((error) => {
        let errorMessage = 'خطا در دریافت پروژه ها';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      })
      .finally(() => setProjectsLoading(false));
  }, [unconnectedProjects.length, setUnconnectedProjects, setProjectsLoading, showSnackbar]);

  React.useEffect(() => {
    if (!selectedProject || isBranchDelivery || isFetchingDistance) {
      setSelectedWarehouse(null);
      return;
    }
    if (!primaryDistance || Warehouse.length === 0) {
      setSelectedWarehouse(null);
      return;
    }
    const matchedWarehouse = Warehouse.find(wh => wh.id === primaryDistance);
    setSelectedWarehouse(matchedWarehouse || null);
  }, [primaryDistance, Warehouse, isBranchDelivery, selectedProject, isFetchingDistance]);

  React.useEffect(() => {
    if (!selectedProject || isBranchDelivery) {
      setIsFetchingDistance(false);
      setSelectedWarehouse(null);
      return;
    }
    const fetchData = async () => {
      setIsFetchingDistance(true);
      try {
        const loadingSnackbarId = showSnackbar('درحال پردازش انبار', 'info', 0, <InfoRoundedIcon />);
        await fetchDistance();
        closeSnackbarById(loadingSnackbarId);
      } catch (error: any) {
        setSelectedWarehouse(null);
        let errorMessage = 'خطا در دریافت فاصله';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        console.error("API error fetching distance:", error);
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      } finally {
        setIsFetchingDistance(false);
        showSnackbar('انبار پردازش شد', 'success', 4000, <DoneAllRoundedIcon />);
      }
    };
    if (!isCartOpen) fetchData();
  }, [selectedProject, isBranchDelivery, fetchDistance]);

  React.useEffect(() => {
    setWarehousesLoading(true);
    getWarehouses()
      .then((warehouses) => {
        setWarehouse(warehouses);
        if (isBranchDelivery) {
          try {
            const stored = localStorage.getItem('selectedWarehouse');
            if (stored) {
              const parsed = JSON.parse(stored);
              const matched = warehouses.find(wh => wh.id === parsed?.id);
              if (matched) {
                setSelectedWarehouse(matched);
              }
            }
          } catch (e) {
            console.warn("Failed to parse stored warehouse", e);
          }
        }
      })
      .catch((error) => {
        let errorMessage = 'خطا در دریافت انبارها';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      })
      .finally(() => {
        setWarehousesLoading(false);
        setInitDone(true);
      });
  }, [isBranchDelivery, setSelectedWarehouse]);

  // Updated filteredProjects to use global project store instead of local state
  const filteredProjects = useMemo(() => {
    if (!selectedAccount) {
      return unconnectedProjects.filter(
        (project) =>
          project.codeAccConnect === null &&
          (!isBranchDelivery ? project.id !== 1 : true)
      );
    }
    return connectedProjects.filter((project) => {
      return !isBranchDelivery ? project.id !== 1 : true;
    });
  }, [unconnectedProjects, selectedAccount, isBranchDelivery, connectedProjects]);

  // Gender mapping for accounts
  const getGenderTitle = (genderId: number) => {
    const genderMap: Record<number, string> = {
      1: 'آقای',
      2: 'خانم',
      3: 'شرکت'
    };
    return genderMap[genderId] || '';
  };

  const handleAccountChange = useCallback(async (value: any) => {
    const account = value as Account | null;
    setSelectedAccount(account);
    console.log("🚀 ~ ProductSelect ~ account:", account)
    setSelectedProject(null);
    setSelectedWarehouse(null);
    // Updated to use global project store for connected projects
    if (account) {
      setProjectsLoading(true);
      try {
        const projects = await getConnectedProject(true, account.codeAcc);
        setConnectedProjects(projects);
      } catch (error: any) {
        console.error("Error fetching connected projects:", error);

        let errorMessage = 'خطا در دریافت پروژه های متصل';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      } finally {
        setProjectsLoading(false);
      }
    } else {
      setConnectedProjects([]);
      setSelectedWarehouse(null);
    }
  }, []);

  const handleDeliveryTypeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newValue: string | null) => {
      if (newValue === null) return;
      const isBranch = newValue === 'true';

      // Save the user's choice to localStorage
      localStorage.setItem('isBranchDelivery', JSON.stringify(isBranch));
      setIsBranchDelivery(isBranch);

      if (isBranch) {
        try {
          const stored = localStorage.getItem('selectedWarehouse');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Warehouse.some((wh) => wh.id === parsed.id)) {
              setSelectedWarehouse(parsed);
            }
          }
        } catch (e) {
          console.warn("Failed to restore warehouse", e);
        }
        const warehouseProject = connectedProjects.find((p) => p.id === 1);
        if (warehouseProject) {
          setSelectedProject(warehouseProject);
        }
      } else {
        if (selectedProject?.id === 1) {
          setSelectedProject(null);
        }
        setSelectedWarehouse(null);
      }
    },
    [connectedProjects, Warehouse, selectedProject, setSelectedWarehouse, setIsBranchDelivery]
  );

  const handleProjectChange = useCallback(
    async (value: any) => {
      const project = value as Project | null;
      setSelectedProject(project);
      console.log("🚀 ~ ProductSelect ~ project:", project)
      if (!project) {
        setSelectedWarehouse(null);
        return;
      }
      if (!isBranchDelivery) {
        setWarehousesLoading(false);
      }
    },
    [isBranchDelivery]
  );

  const handleWarehouseChange = useCallback(
    (newValue: any) => {
      setSelectedWarehouse(newValue);
      localStorage.setItem('selectedWarehouse', JSON.stringify(newValue));
    },
    [setSelectedWarehouse]
  );

  return (
    <>
      <Box sx={{ ...flex.column, ...size.full, gap: "16px" }}>
        <Box className="sale-header" sx={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "center" }}>
          <ToggleButtonGroup
            value={isBranchDelivery.toString()} exclusive
            color="primary"
            onChange={handleDeliveryTypeChange}
            aria-label="delivery type"
            className={mode === 'dark' ? 't-button-group t-button-group-dark' : 't-button-group t-button-group-light '}
            sx={{
              ml: 1, '& button': { borderRadius: '50px', minWidth: '80px' },
              minWidth: '120px',
              height: '56px'
            }}
          >
            <ToggleButton value="false" aria-label="ارسال به پروژه">
              ارسال به پروژه
            </ToggleButton>
            <ToggleButton value="true" aria-label="تحویل درب انبار">
              تحویل درب انبار
            </ToggleButton>
          </ToggleButtonGroup>

          <Combo
            className="customer-account-combo"
            multiple={false}
            label="حساب مشتری"
            sx={{ flex: 1, ml: 1 }}
            options={accounts}
            value={selectedAccount}
            onChange={handleAccountChange}
            loading={accountsLoading}
            loadingText="در حال بارگذاری..."
            noOptionsText="هیچ گزینه‌ای موجود نیست"
            getOptionLabel={(option) => {
              const account = option as Account;
              const genderTitle = account.genderId ? getGenderTitle(account.genderId) : '';
              return genderTitle ? `${genderTitle} ${account.title}` : account.title;
            }}
            menu={true}
            menuItems={[
              {
                label: "افزودن حساب",
                icon: <AddIcon color="info" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("accountAdd"),
                menuClassName: "add-account-menu-item",
              },
              {
                label: "ویرایش حساب",
                icon: <EditRoundedIcon color="info" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("accountEdit"),
                menuClassName: "details-account-menu-item",
                menuItemDisabled: !selectedAccount,
              },
              {
                label: "مدیریت پروژه ها",
                icon: <AddLinkRoundedIcon color="info" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("projectConnect"),
                menuClassName: "connect-account-menu-item",
                menuItemDisabled: !selectedAccount,
              },
              {
                label: "حذف حساب",
                icon: <DeleteRoundedIcon color="error" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("accountDelete"),
                menuClassName: "delete-account-menu-item",
                menuItemDisabled: !selectedAccount,
              },
            ]}
          />

          <Combo
            sx={{ flex: 1, ml: 1 }}
            label="پروژه"
            options={filteredProjects}
            value={selectedProject}
            onChange={handleProjectChange}
            loading={projectsLoading}
            loadingText="در حال بارگذاری..."
            noOptionsText="هیچ گزینه‌ای موجود نیست"
            menu={true}
            menuItems={[
              {
                label: "افزودن پروژه",
                icon: <AddIcon color="info" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("projectAdd"),
                menuClassName: "add-account-menu-item",
              },
              {
                label: "ویرایش پروژه",
                icon: <EditRoundedIcon color="info" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("projectEdit"),
                menuClassName: "details-account-menu-item",
                menuItemDisabled: !selectedProject,
              },
              {
                label: "قطع ارتباط با پروژه",
                icon: <LinkOffRoundedIcon color="info" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("projectDisconnect"),
                menuClassName: "connect-account-menu-item",
                menuItemDisabled: !selectedProject || !selectedAccount,
              },
              {
                label: "محاسبه دوباره مسیر",
                icon: <CachedRoundedIcon color="success" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("projectRecalculate"),
                menuClassName: "recalculate-menu-item",
                menuItemDisabled: !selectedProject,
              },
              {
                label: "حذف پروژه",
                icon: <DeleteRoundedIcon color="error" sx={{ mr: 1 }} />,
                onClick: () => props.openModal("projectDelete"),
                menuClassName: "delete-account-menu-item",
                menuItemDisabled: !selectedProject,
              },
            ]}
          />
          <Combo
            sx={{ flex: 0.75, ml: 1 }}
            label="انبار"
            options={Warehouse}
            value={selectedWarehouse}
            onChange={handleWarehouseChange}
            loading={warehousesLoading}
            loadingText="در حال بارگذاری..."
            noOptionsText="هیچ گزینه‌ای موجود نیست"
            disabled={!isBranchDelivery}
          />
        </Box>
        <Box
          sx={{
            width: "100%",
            overflow: "auto",
            border: "2px solid var(--border-main)",
            borderRadius: '18px',
            height: '100%'
          }}
        >
          <Table size="small">
            <TableHead
              sx={{
                backgroundColor: "var(--table-header)",
                '& .MuiTableCell-root': {
                  p: 1.5,
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  '&:not(.first-cell)::before': {
                    content: '""',
                    position: 'absolute',
                    top: '6px',
                    left: 0,
                    right: 0,
                    bottom: '6px',
                    width: '2px',
                    backgroundColor: 'var(--border-main)',
                  },
                },
                '& .span-cell': {
                  position: 'relative',
                  borderBottom: 'none',
                  '&:not(.first-cell)::before': {
                    content: '""',
                    position: 'absolute',
                    left: '50%',
                    top: '100%',
                    width: 'calc(100% - 12px)',
                    height: '2px',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--border-main)',
                  },
                  '&:not(.first-cell)::after': {
                    content: '""',
                    position: 'absolute',
                    top: '6px',
                    left: 0,
                    right: 0,
                    bottom: '6px',
                    width: '2px',
                    backgroundColor: 'var(--border-main)',
                  },
                },
                '& .bottom-row': {
                  borderBottom: '2px solid var(--border-main)'
                },
              }}
            >
              <TableRow>
                <TableCell className="first-cell" align="center" rowSpan={2} width={60}>ردیف</TableCell>
                <TableCell align="center" colSpan={1} rowSpan={2} width={420}>نام کالا / خدمات</TableCell>
                <TableCell align="center" rowSpan={2} width={200}>مقدار</TableCell>
                <TableCell className="span-cell" align="center" colSpan={dis3show ? 4 : 3}>قیمت از انبار</TableCell>
                <TableCell className="span-cell" align="center" colSpan={alternateShow ? 2 : 1}>قیمت مستقیم از کارخانه</TableCell>
                <TableCell align="center" rowSpan={2} width={300}>فروشنده</TableCell>
              </TableRow>
              <TableRow className="bottom-row">
                <TableCell align="center" width={200}>قیمت</TableCell>
                <TableCell align="center" width={200}>تخفیف سطح 1</TableCell>
                <TableCell align="center" width={200}>تخفیف سطح 2</TableCell>
                {dis3show &&
                  <TableCell align="center" width={200}>تخفیف سطح 3</TableCell>
                }
                <TableCell align="center" width={alternateShow ? 400 : 200}>عادی</TableCell>
                {alternateShow && <TableCell align="center" width={400}>نوبت دار</TableCell>}
              </TableRow>
            </TableHead>

            {/* بدنه جدول */}
            <TableBody
              sx={{
                '& .MuiTableRow-root': {
                  transition: 'background-color 0.1s ease-in-out',
                },
              }}
            >
              {filteredProducts().length === 0 ? (
                <TableRow sx={{ height: '100%' }}>
                  <TableCell colSpan={11} align="center" sx={{ height: '100%' }}>
                    <Box sx={{ width: '100%', height: '100%', ...flex.center, ...flex.one }}>
                      {selectedCategory ? 'هیچ محصولی در این دسته‌بندی یافت نشد' : 'لطفاً یک دسته‌بندی انتخاب کنید'}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts().map((row, index) => {
                  const rowId = `${row.id}${row.modelId}${row.valueId}${row.warehouseId}`;
                  const isEven = index % 2 === 0;

                  // Hookهای داخل render

                  return (
                    <TableRow
                      key={rowId}
                      onClick={() => handleRowClick({ row })}
                      hover
                      sx={{
                        cursor: "pointer",
                        '& .MuiTableCell-root': {
                          position: 'relative',
                          '&:not(.first-cell)::before': {
                            content: '""',
                            position: 'absolute',
                            top: '6px',
                            left: 0,
                            right: 0,
                            bottom: '6px',
                            width: '1px',
                            backgroundColor: 'var(--table-border-overlay)',
                          },
                        },
                      }}
                    >
                      {/* ردیف */}
                      <TableCell className="first-cell" align="center">{toPersianPrice(index + 1)}</TableCell>

                      {/* نام کالا / خدمات */}
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", whiteSpace: "nowrap" }}>
                          <Typography variant="body2">{row.title} {row.attributeTitle}, {row.titleCompany}</Typography>
                        </Box>
                      </TableCell>

                      {/* مقدار */}
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", justifyContent: "center", gap: 1 }}>
                          <Typography variant="body2">{row.valueTitle}</Typography>
                          {(() => {
                            const relatedUnits = products
                              .filter(p => p.priceId === row.priceId)
                              .map(p => p.valueTitle);
                            const uniqueUnits = [...new Set(relatedUnits)];
                            const hasMultipleUnits = uniqueUnits.length > 1;
                            if (hasMultipleUnits) {
                              return (
                                <Tooltip title="چند واحد" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                                  <ScaleRoundedIcon fontSize="small" color="info" />
                                </Tooltip>
                              );
                            }
                            return null;
                          })()}
                        </Box>
                      </TableCell>

                      {/* قیمت از انبار */}
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                          {row.priceWarehouse === 0 ? "-" : toPersianPrice(row.priceWarehouse)}
                        </Typography>
                      </TableCell>

                      {/* تخفیف سطح 1 */}
                      <TableCell>
                        <div style={{ display: "flex", flexDirection: "column", padding: "4px 0", gap: "2px", width: "fit-content" }}>
                          <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                            {row.priceWarehouse !== 0 && row.discountPriceWarehouse !== null
                              ? row.discountPriceWarehouse === 0
                                ? '-'
                                : toPersianPrice(row.discountPriceWarehouse)
                              : '-'}
                          </Typography>
                          <Typography variant="caption" color="text.warning" sx={{ whiteSpace: "nowrap", width: "fit-content" }}>
                            {row.promotionTitle && row.priceWarehouse !== 0 && row.lowestNumberOfDiscount > 0
                              ? `${row.promotionTitle} حداقل از ${row.lowestNumberOfDiscount} ${row.valueTitle}`
                              : ''}
                          </Typography>
                        </div>
                      </TableCell>

                      {/* تخفیف سطح 2 */}
                      <TableCell>
                        <div style={{ display: "flex", flexDirection: "column", padding: "4px 0", gap: "2px" }}>
                          <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                            {row.percentage !== 0 && row.discountPriceWarehouse1 !== null
                              ? row.discountPriceWarehouse1 === 0
                                ? '-'
                                : toPersianPrice(row.discountPriceWarehouse1)
                              : '-'}
                          </Typography>
                          <Typography variant="caption" color="text.warning" sx={{ whiteSpace: "nowrap" }}>
                            {row.promotionTitle && row.lowestNumberOfDiscount1 > 0 && row.priceWarehouse !== 0
                              ? `${row.promotionTitle} حداقل از ${row.lowestNumberOfDiscount1} ${row.valueTitle}`
                              : ''}
                          </Typography>
                        </div>
                      </TableCell>

                      {/* تخفیف سطح 3 */}
                      {dis3show &&
                        <TableCell>
                          <div style={{ display: "flex", flexDirection: "column", padding: "4px 0", gap: "2px" }}>
                            <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                              {row.percentage !== 0 && row.discountPriceWarehouse2 !== null
                                ? row.discountPriceWarehouse2 === 0
                                  ? '-'
                                  : toPersianPrice(row.discountPriceWarehouse2)
                                : '-'}
                            </Typography>
                            <Typography variant="caption" color="text.warning" sx={{ whiteSpace: "nowrap" }}>
                              {row.promotionTitle && row.lowestNumberOfDiscount2 > 0 && row.priceWarehouse !== 0
                                ? `${row.promotionTitle} حداقل از ${row.lowestNumberOfDiscount1} ${row.valueTitle}`
                                : ''}
                            </Typography>
                          </div>
                        </TableCell>
                      }

                      {/* قیمت مستقیم از کارخانه - عادی */}
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                          {row.priceTransit === 0 ? "-" : toPersianPrice(row.priceTransit)}
                        </Typography>
                      </TableCell>

                      {/* قیمت نوبت دار */}
                      {alternateShow &&
                        <TableCell>
                          <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                            {row.priceAlternate === 0 ? "-" : toPersianPrice(row.priceAlternate)}
                          </Typography>
                        </TableCell>
                      }
                      {/* فروشنده */}
                      <TableCell>
                        <div style={{ display: "flex", flexDirection: "column", padding: "4px 0", gap: "2px" }}>
                          {organs.map(company => (
                            <div key={company.id}>
                              <strong>
                                {row.codeAccSeller === 0 ? company.title : null}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>

        <OrderConfirmModal
          open={modalOpen}
          onClose={handleCloseModal}
        />
      </Box>
    </>
  );
}
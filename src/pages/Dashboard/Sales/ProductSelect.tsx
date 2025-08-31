import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import { DataGrid, GridColDef, gridClasses } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

import OrderConfirmModal from "@/pages/Dashboard/Sales/Modals/SabtSefaresh/OrderConfirmModal";
import usePersianNumbers from "@/hooks/usePersianNumbers";
import { persianDataGridLocale, useDataGridStyles } from "@/components/datagrids/DataGridProps";

import Combo from "@/components/elements/Combo";
import { flex, size } from "@/models/ReadyStyles";
import { useThemeMode } from "@/contexts/ThemeContext";

import { Account, Project, Warehouse, Distance } from "@/models/";
import {
  getUnConnectedProjects,
  getConnectedProject,
  getWarehouses,
  getSaleAccounts,
  getDistance,
} from "@/api/";

import {
  Typography,
  ToggleButton,
  Box,
  alpha,
  ToggleButtonGroup,
  Tooltip,
  Zoom,
  Chip,
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

// Updated imports to use the enhanced project store
import { useOrgansStore } from '@/stores/organStore';
import { useProductsStore, useProjectStore, useAccountStore, useBranchDeliveryStore, useDistanceStore } from '@/stores/';
import { useSnackbar } from "@/contexts/SnackBarContext";

const ODD_OPACITY = 0.1;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: "#FAFAFA",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
    "&.Mui-selected": {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity
      ),
      "&:hover": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
          theme.palette.action.selectedOpacity +
          theme.palette.action.hoverOpacity
        ),
        "@media (hover: none)": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity
          ),
        },
      },
    },
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
}));

export function ProductSelect(props: any) {
  const { setCategoryEnable } = props;

  const {
    products,
    loading: productsLoading,
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
  const [loading, setLoading] = useState(true);
  const [isFetchingDistance, setIsFetchingDistance] = useState(false);
  const { mode } = useThemeMode();
  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);
  const setIsBranchDelivery = useBranchDeliveryStore((s) => s.setIsBranchDelivery);
  const { distance, fetchDistance } = useDistanceStore();
  const { setSelectedItem } = useProductsStore();
  const primaryDistance = useMemo(
    () => distance.find((d) => d.warehouseId > 0)?.warehouseId || null,
    [distance]
  );

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
    if (accounts.length > 0) return; // Don't fetch if we already have accounts
    
    setLoading(true);
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
      .finally(() => { setLoading(false) });
  }, [accounts.length, setAccounts, showSnackbar]);

  // Updated to use global project store for unconnected projects - only fetch if store is empty
  React.useEffect(() => {
    if (unconnectedProjects.length > 0) return; // Don't fetch if we already have data
    
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
    fetchData();
  }, [selectedProject, isBranchDelivery, fetchDistance]);

  React.useEffect(() => {
    setLoading(true);
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
        setLoading(false);
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
        const projects = await getConnectedProject(true, parseInt(account.codeAcc));
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
        setLoading(true);
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

  const columns: GridColDef[] = [
    {
      field: "rowNumber",
      headerName: "ردیف",
      width: 60,
      align: "center" as const,
      headerAlign: "center" as const,
      sortable: false,
      filterable: false,
      resizable: true,
      renderCell: (params) => {
        const { toPersianPrice } = usePersianNumbers();
        const rowIds = params.api.getAllRowIds();
        const currentRowId = params.id;
        const rowIndex = rowIds.indexOf(currentRowId);
        return toPersianPrice(rowIndex + 1);
      },
    },
    {
      field: "title",
      headerName: "نام کالا / خدمات",
      width: 420,
      resizable: true,
      flex: 0.6,
      renderCell: (params) => {
        return (
          <Box sx={{ ...flex.alignCenter, gap: '4px', height: '100%' }}>
            <Typography variant="body2">
              {params.value}
            </Typography>
            <Typography variant="body2">
              {params.row.attributeTitle}
            </Typography>
            <Typography variant="body2">
              , {params.row.titleCompany}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "valueTitle",
      headerName: "مقدار",
      width: 200,
      resizable: true,
      flex: 0.17,
      renderCell: (params) => {
        const { products } = useProductsStore();

        const relatedUnits = products
          .filter(p => p.priceId === params.row.priceId)
          .map(p => p.valueTitle);

        const uniqueUnits = [...new Set(relatedUnits)];

        const hasMultipleUnits = uniqueUnits.length > 1;

        return (
          <Tooltip
            title={
              hasMultipleUnits
              && `${uniqueUnits.join("، ")}`
            }
            placement="top"
            arrow
            disableInteractive
            slots={{ transition: Zoom }}
            followCursor
          >
            <Box sx={{
              ...flex.column,
              ...flex.justifyCenter,
              height: '100%',
            }}>
              <Typography variant="body2">
                {params.value}
              </Typography>
              {hasMultipleUnits && (
                <Chip
                  size="medium"
                  label="چند واحد"
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 25, mr: 'auto' }}
                  icon={<ScaleRoundedIcon fontSize="small" />}
                />
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "priceWarehouse",
      headerName: "قیمت",
      width: 200,
      resizable: true,
      flex: 0.25,
      renderCell: (params) => {
        const { toPersianPrice } = usePersianNumbers();
        if (params.value === 0) return "-";
        return toPersianPrice(params.value);
      },
    },
    {
      field: "discountPriceWarehouse",
      headerName: "تخفیف سطح 1",
      width: 400,
      resizable: true,
      flex: 0.35,
      renderCell: (params) => {
        const { toPersianPrice } = usePersianNumbers();
        if (params.value === null) return "-";
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            padding: "4px 0",
            justifyContent: "center",
            height: "100%",
            gap: "2px",
          }}>
            <Typography variant="body2">
              {params.row.priceWarehouse != 0
                ?
                params.value === 0
                  ?
                  '-'
                  :
                  toPersianPrice(params.value)
                :
                '-'
              }
            </Typography>
            <Typography variant="caption" color="text.warning">
              {params.row.promotionTitle != null && params.row.priceWarehouse != 0
                ?
                `${params.row.promotionTitle} حداقل از ${params.row.lowestNumberOfDiscount} ${params.row.valueTitle}`
                :
                ''
              }
            </Typography>
          </div>
        );
      },
    },
    {
      field: "discountPriceWarehouse1",
      headerName: "تخفیف سطح 2",
      width: 400,
      resizable: true,
      flex: 0.35,
      renderCell: (params) => {
        const { toPersianPrice } = usePersianNumbers();
        if (params.value === null) return "-";
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            padding: "4px 0",
            justifyContent: "center",
            height: "100%",
            gap: "2px",
          }}>
            <Typography variant="body2">
              {params.row.percentage != 0
                ?
                params.value === 0
                  ?
                  '-'
                  :
                  toPersianPrice(params.value)
                :
                '-'
              }
            </Typography>
            <Typography variant="caption" color="text.warning">
              {params.row.promotionTitle != null && params.row.lowestNumberOfDiscount1 != 0 && params.row.priceWarehouse != 0
                ?
                `${params.row.promotionTitle} حداقل از ${params.row.lowestNumberOfDiscount1} ${params.row.valueTitle}`
                :
                ''
              }
            </Typography>
          </div>
        );
      },
    },
    {
      field: "discountPriceWarehouse2",
      headerName: "تخفیف سطح 3",
      width: 400,
      resizable: true,
      flex: 0.35,
      renderCell: (params) => {
        const { toPersianPrice } = usePersianNumbers();
        if (params.value === null) return "-";
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            padding: "4px 0",
            justifyContent: "center",
            height: "100%",
            gap: "2px",
          }}>
            <Typography variant="body2">
              {params.row.percentage != 0
                ?
                params.value === 0
                  ?
                  '-'
                  :
                  toPersianPrice(params.value)
                :
                '-'
              }
            </Typography>
            <Typography variant="caption" color="text.warning">
              {params.row.promotionTitle != null && params.row.lowestNumberOfDiscount1 != 0 && params.row.priceWarehouse != 0
                ?
                `${params.row.promotionTitle} حداقل از ${params.row.lowestNumberOfDiscount1} ${params.row.valueTitle}`
                :
                ''
              }
            </Typography>
          </div>
        );
      },
    },
    {
      field: "priceTransit",
      headerName: "عادی",
      width: 400,
      resizable: true,
      flex: 0.22,
      renderCell: (params) => {
        const { toPersianPrice } = usePersianNumbers();
        if (params.value === 0) return "-";
        return toPersianPrice(params.value);
      },
    },
    {
      field: "priceAlternate",
      headerName: "نوبت دار",
      width: 400,
      resizable: true,
      flex: 0.22,
      renderCell: (params) => {
        const { toPersianPrice } = usePersianNumbers();
        if (params.value === 0) return "-";
        return toPersianPrice(params.value);
      },
    },
    {
      field: "titleCompany",
      headerName: "فروشنده",
      width: 400,
      resizable: true,
      flex: 0.2,
      renderCell: (params) => {
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            padding: "4px 0",
            justifyContent: "center",
            height: "100%",
            gap: "2px",
          }}>
            {organs.map(company => (
              <div key={company.id}>
                <strong>
                  {params.row.codeAccSeller === 0 ? company.title : null}
                </strong>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  const columnGroupingModel = [
    {
      groupId: "group1",
      headerName: "کالا / خدمات",
      headerAlign: "center" as const,
      children: [{ field: "title" }, { field: "quantity" }],
    },
    {
      groupId: "group2",
      headerName: "قیمت از انبار",
      headerAlign: "center" as const,
      children: [
        { field: "priceWarehouse" },
        { field: "discountPriceWarehouse" },
        { field: "discountPriceWarehouse1" },
        { field: "discountPriceWarehouse2" },
      ],
    },
    {
      groupId: "group3",
      headerName: "قیمت مستقیم از کارخانه",
      headerAlign: "center" as const,
      children: [{ field: "priceTransit" }, { field: "priceAlternate" }],
    },
  ];

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
            loading={loading}
            loadingText="در حال بارگذاری..."
            noOptionsText="هیچ گزینه‌ای موجود نیست"
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
            loading={loading}
            loadingText="در حال بارگذاری..."
            noOptionsText="هیچ گزینه‌ای موجود نیست"
            disabled={!isBranchDelivery}
          />
        </Box>
        <StripedDataGrid
          rows={filteredProducts()}
          columns={columns}
          columnVisibilityModel={{
            priceAlternate: alternateShow,
            discountPriceWarehouse2: dis3show,
          }}
          columnGroupingModel={columnGroupingModel}
          onRowClick={handleRowClick}
          rowHeight={60}
          getRowId={(row) => `${row.id}${row.modelId}${row.valueId}${row.warehouseId}`}
          columnHeaderHeight={54}
          loading={productsLoading}
          pagination={false}
          pageSizeOptions={[]}
          rowSelection={false}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          localeText={{
            ...persianDataGridLocale,
            noRowsLabel: selectedCategory
              ? 'هیچ محصولی در این دسته‌بندی یافت نشد'
              : 'لطفاً دسته‌بندی انتخاب کنید',
          }}
          sx={{
            ...useDataGridStyles(),
            "& .shipment-merged-cell": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: mode === "light" ? "#FFF3D1" : "#292929",
            },
            "& .MuiDataGrid-noRowsLabel": {
              fontSize: '1rem',
              color: 'text.secondary',
            },
            "& .MuiDataGrid-footerContainer": {
              display: "none",
            },
          }}
        />

        <OrderConfirmModal
          open={modalOpen}
          onClose={handleCloseModal}
        />
      </Box>
    </>
  );
}
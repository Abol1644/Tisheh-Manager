import { useThemeMode } from "@/contexts/ThemeContext";
import { width } from "@/models/ReadyStyles";
import { Height } from "@mui/icons-material";
import { alpha } from "@mui/material";
import styled from "@mui/material";
import {
  DataGrid,
  GridColDef,
  gridClasses,
  GridRowsProp,
} from "@mui/x-data-grid";

export const persianDataGridLocale = {
  noRowsLabel: "هیچ داده‌ای یافت نشد",
  columnMenuSortAsc: "مرتب کردن از کوچک",
  columnMenuSortDesc: "مرتب کردن از بزرگ",
  columnMenuFilter: "فیلتر",
  columnMenuUnsort: "حذف مرتب‌سازی",
  columnMenuHideColumn: "پنهان کردن ستون",
  columnMenuShowColumns: "نشان دادن ستون",
  columnMenuManageColumns: "مدیریت ستون‌ها",
  paginationRowsPerPage: "تعداد ردیف‌ها در هر صفحه:",
  filterPanelColumns: "ستون",
  filterPanelOperator: "عملیات",
  filterPanelInputLabel: "ورودی",
  filterPanelInputPlaceholder: "مقدار",
  columnsManagementShowHideAllText: "نشان دادن/پنهان کردن همه",
  columnsManagementSearchTitle: "جستجوی ستون‌ها",
  columnsManagementReset: "بازنشانی",
  filterOperatorContains: "شامل می‌شود",
  filterOperatorDoesNotContain: "شامل نمی‌شود",
  filterOperatorEquals: "برابر است با",
  filterOperatorDoesNotEqual: "برابر نیست با",
  filterOperatorStartsWith: "شروع می‌شود با",
  filterOperatorEndsWith: "پایان می‌یابد با",
  filterOperatorIs: "است",
  filterOperatorNot: "نیست",
  filterOperatorAfter: "بعد از",
  filterOperatorOnOrAfter: "در یا بعد از",
  filterOperatorBefore: "قبل از",
  filterOperatorOnOrBefore: "در یا قبل از",
  filterOperatorIsEmpty: "خالی است",
  filterOperatorIsNotEmpty: "خالی نیست",
  filterOperatorIsAnyOf: "هر یک از",
  columnMenuLabel: "منو",
  footerRowSelected: (count: any) =>
    count !== 1
      ? `${count.toLocaleString()} ردیف انتخاب شده`
      : `${count.toLocaleString()} ردیف انتخاب شده`,
  paginationDisplayedRows: ({
    from,
    to,
    count,
    estimated,
  }: {
    from: number;
    to: number;
    count: number;
    estimated?: number;
  }) => {
    if (!estimated) {
      return `${from}–${to} از ${count !== -1 ? count : `بیش از ${to}`}`;
    }
    const estimatedLabel =
      estimated && estimated > to ? `حدود ${estimated}` : `بیش از ${to}`;
    return `${from}–${to} از ${count !== -1 ? count : estimatedLabel}`;
  },
};

export const useDataGridStyles = () => {
  const { mode } = useThemeMode();

  return {
    border: 0,
    "& .MuiDataGrid-mainContent": {
      border: mode === "light" ? "2px solid #D1D1D1 " : "2px solid #6b6b6b",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "1px solid",
      borderBottomColor: mode === "light" ? "#D1D1D1" : "#292929",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "black",
      borderBottom: "2px solid",
      borderBottomColor: mode === "light" ? "#D1D1D1" : "#616161",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: "bold",
    },
    "& .MuiDataGrid-row--borderBottom, .MuiDataGrid-columnHeader": {
      backgroundColor: 'var(--table-header)',
    },
    "& .MuiDataGrid-panelContent  ": {
      backgroundColor: "background.paper",
    },
    "& .MuiDataGrid-scrollbar": {
      scrollbarWidth: "none",
      scrollbarColor: "transparent",
    },
    "& .MuiDataGrid-scrollbarFiller, .MuiDataGrid-filler ": {
      width: 0,
      maxWidth: 0,
      display: "none",
    },
    '& .default-row': {
      "& .MuiDataGrid-cell": {
        borderTop: mode === "light" ? "2px solid #D1D1D1 " : "2px solid #6b6b6b",
      },
    }
  };
};

export const hiddenFooterStyles = () => {
  const { mode } = useThemeMode();

  return {
    border: 0,
    "& .MuiDataGrid-main": {
      overflow: "hidden",
    },
    "& .MuiDataGrid-mainContent": {
      border: mode === "light" ? "2px solid #D1D1D1 " : "2px solid #6b6b6b",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "1px solid",
      borderBottomColor: mode === "light" ? "#D1D1D1" : "#292929",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "black",
      borderBottom: "2px solid",
      borderBottomColor: mode === "light" ? "#D1D1D1" : "#616161",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: "bold",
    },
    "& .MuiDataGrid-row--borderBottom, .MuiDataGrid-columnHeader": {
      backgroundColor: "var(--table-header)",
    },
    "& .MuiDataGrid-row": {
      maxHeight: "64px !important",
      "--height": "64px !important",
    },
    "& .MuiDataGrid-panelContent  ": {
      backgroundColor: "background.paper",
    },
    "& .shipment-merged-cell": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    "& .MuiDataGrid-footerContainer": {
      display: "none",
    },
    "& .default-row": {
      height: "75px",
      minHeight: "65px !important",
      maxHeight: "100% !important",
      "& .MuiDataGrid-cell": {
        height: "75px",
        borderTop: mode === "light" ? "2px solid #D1D1D1 " : "2px solid #6b6b6b",
      },
    },
  };
};

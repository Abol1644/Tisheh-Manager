import * as React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'


export default function TestPage() {


  const columns: GridColDef[] = [
      {
        field: 'rowNumber',
        headerName: 'ردیف',
        width: 30,
        align: 'center' as const,
        headerAlign: 'center' as const,
        sortable: false,
        filterable: false,
        renderCell: (params:any) => {
          const rowIndex = params.api.getAllRowIds().indexOf(params.id);
          return rowIndex + 1;
        }
      },
      { field: 'username', headerName: 'نام کاربری', width: 180 },
      { field: 'action', headerName: 'عملیات', width: 220 },
      { field: 'timestamp', headerName: 'زمان', width: 200 },
      { field: 'details', headerName: 'جزئیات', width: 400 },
    ];
  
    const rows = [
      {
        id: 1,
        username: 'احمد_محمدی',
        action: 'ورود به سیستم',
        timestamp: '1402/08/15 - 14:30',
        details: 'ورود موفق از IP: 192.168.1.100'
      },
      {
        id: 2,
        username: 'فاطمه_احمدی',
        action: 'ویرایش پروفایل',
        timestamp: '1402/08/15 - 13:45',
        details: 'تغییر شماره تلفن و آدرس ایمیل'
      },
      {
        id: 3,
        username: 'علی_رضایی',
        action: 'حذف فایل',
        timestamp: '1402/08/15 - 12:20',
        details: 'حذف فایل document.pdf از پوشه اسناد'
      },
      {
        id: 4,
        username: 'مریم_کریمی',
        action: 'آپلود فایل',
        timestamp: '1402/08/15 - 11:15',
        details: 'آپلود فایل image.jpg با حجم 2.5 مگابایت'
      },
      {
        id: 5,
        username: 'حسن_موسوی',
        action: 'تغییر رمز عبور',
        timestamp: '1402/08/15 - 10:30',
        details: 'تغییر رمز عبور با موفقیت انجام شد'
      },
      {
        id: 6,
        username: 'زهرا_حسینی',
        action: 'خروج از سیستم',
        timestamp: '1402/08/15 - 09:45',
        details: 'خروج عادی از سیستم'
      },
      {
        id: 7,
        username: 'محمد_نوری',
        action: 'دسترسی غیرمجاز',
        timestamp: '1402/08/15 - 08:20',
        details: 'تلاش برای دسترسی به صفحه محدود - دسترسی رد شد'
      },
      {
        id: 8,
        username: 'سارا_قاسمی',
        action: 'ایجاد گزارش',
        timestamp: '1402/08/14 - 16:30',
        details: 'ایجاد گزارش ماهانه فروش'
      },
      {
        id: 9,
        username: 'رضا_جعفری',
        action: 'بروزرسانی اطلاعات',
        timestamp: '1402/08/14 - 15:10',
        details: 'بروزرسانی اطلاعات شخصی و تصویر پروفایل'
      },
      {
        id: 10,
        username: 'نرگس_صادقی',
        action: 'ورود ناموفق',
        timestamp: '1402/08/14 - 14:25',
        details: 'تلاش ورود با رمز عبور اشتباه - 3 بار'
      }
    ]

  return (
    <div style={{ height: 400, width: '800px', overflowX: 'hidden' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[10, 25, 50, 100, { value: -1, label: 'همه' }]}
      />
    </div>
  )
}
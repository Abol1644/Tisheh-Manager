import React from 'react'
import { DataGrid, GridColDef, gridClasses, GridRowsProp } from '@mui/x-data-grid';
import { hiddenFooterStyles, persianDataGridLocale } from '@/components/datagrids/DataGridProps';

function SabadKharidGrid({ rows, columns }:any) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowHeight={52}
      rowSpanning={true}
      showCellVerticalBorder
      columnHeaderHeight={64}
      rowSelection={false}
      density="compact"
      initialState={{
        pagination: {
          paginationModel: { pageSize: 25, page: 0 },
        },
      }}
      getRowClassName={(params) => {
        if (params.row.isDefaultRow) {
          return 'default-row';
        }
        return params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
      }}
      pageSizeOptions={[10, 25, 50, 100, { value: -1, label: 'همه' }]}
      sx={{
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'background.paper'
        },
        ...hiddenFooterStyles(),
      }}
      localeText={persianDataGridLocale}
    />
  );
}

export default React.memo(SabadKharidGrid)
import * as React from 'react';
import { Checkbox, FormGroup, FormControlLabel, Box, Container, Typography, Stack } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { styled, alpha } from '@mui/material/styles';
import { useThemeMode } from '@/contexts/ThemeContext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import Link from '@mui/material/Link';

export interface AccessSystemGroup {
  id: string;
  label: string;
  children?: AccessSystemGroup[];
  access?: string[];
}

const sampleData: AccessSystemGroup[] = [
  {
    id: '1',
    label: 'سیستم دسترسی 1',
    children: [
      { id: '1-1', label: 'زیرسیستم 1-1', access: ['کالا 1', 'کالا 2'] },
      { id: '1-2', label: 'زیرسیستم 1-2' },
    ],
  },
  {
    id: '2',
    label: 'سیستم دسترسی 2',
    children: [
      { id: '2-1', label: 'زیرسیستم 2-1', children: [{ id: '2-1-1', label: 'زیرزیرسیستم 2-1-1', access: ['کالا 3', 'کالا 4'] }] },
    ],
  },
];

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer} [data-testid="TreeViewExpandIconIcon"]`]: {
    rotate: '180deg',
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    padding: '0 8px',
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.8)}`,
  },
}));

function renderTree(items: AccessSystemGroup[]) {
  return items.map((item) => (
    <CustomTreeItem key={item.id} itemId={item.id} label={item.label}>
      {item.children ? renderTree(item.children) : null}
    </CustomTreeItem>
  ));
}

function findNodeById(items: AccessSystemGroup[], id: string): AccessSystemGroup | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findNodeById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getBreadcrumbPath(items: AccessSystemGroup[], id: string): AccessSystemGroup[] {
  for (const item of items) {
    if (item.id === id) return [item];
    if (item.children) {
      const path = getBreadcrumbPath(item.children, id);
      if (path.length) return [item, ...path];
    }
  }
  return [];
}

export default function AccessSystem() {
  const { mode } = useThemeMode();
  const [selectedNode, setSelectedNode] = React.useState<AccessSystemGroup | null>(null);

  const handleSelect = (event: React.SyntheticEvent<Element, Event> | null, itemIds: string | null) => {
    if (!itemIds) {
      setSelectedNode(null);
      return;
    }
    const node = findNodeById(sampleData, Array.isArray(itemIds) ? itemIds[0] : itemIds);
    setSelectedNode(node);
  };

  return (
    <>
      <Container sx={{ height: 'calc(100% - 64px)', maxWidth: '100vw !important', padding: '18px' }}>
        <Typography variant="h5" sx={{ mb: 1 }}>گروه‌های دسترسی</Typography>
        <Box sx={{ mb: 1, height: '3px', width: '220px', backgroundImage: mode === "light"
          ? 'linear-gradient(to left, rgba(255,255,255,0) 0%, #000 100%)'
          : 'linear-gradient(to left, rgba(255,255,255,0) 0%, #fff 100%)'
        }} />
        <Box
          sx={{
            p: 1,
            border: '1px solid #eee',
            mb: 1,
            borderRadius: 3,
          }}
        >
          <Breadcrumbs
            separator={<NavigateBeforeIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {selectedNode
              ? getBreadcrumbPath(sampleData, selectedNode.id).map((node, idx, arr) => (
                  <Link
                    key={node.id}
                    underline="hover"
                    color={idx === arr.length - 1 ? "text.primary" : "inherit"}
                    sx={{ cursor: idx === arr.length - 1 ? "default" : "pointer" }}
                    onClick={() => {
                      if (idx !== arr.length - 1) setSelectedNode(node);
                    }}
                  >
                    {node.label}
                  </Link>
                ))
              : <span>انتخاب کنید</span>
            }
          </Breadcrumbs>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, height: 'calc(100% - 50px)' }}>
          <Stack direction="row" sx={{flex: 1, gap: 2, height: '100%'}}>
            <Box
              sx={{
                width: 500,
                minWidth: 250,
                maxWidth: 600,
                border: '1px solid #eee',
                borderRadius: 3,
                p: 2,
                resize: 'horizontal',
                overflow: 'auto',
              }}
            >
              <SimpleTreeView defaultExpandedItems={['1']} onSelectedItemsChange={handleSelect}>
                {renderTree(sampleData)}
              </SimpleTreeView>
            </Box>
            <Box sx={{ flex: 1, border: '1px solid #eee', borderRadius: 3, p: 2 }}>
              {selectedNode?.children ? (
                <Box>
                  {selectedNode.children.map(child => (
                    // <Link
                    //   key={child.id}
                    //   underline="hover"
                    //   color="primary"
                    //   sx={{ display: 'block', cursor: 'pointer', mb: 1 }}
                    //   onClick={() => setSelectedNode(child)}
                    // >
                    //   {child.label}
                    // </Link>
                    <p></p>
                  ))}
                </Box>
              ) : selectedNode?.access ? (
                <FormGroup>
                  {selectedNode.access.map((good, idx) => (
                    <FormControlLabel
                      key={idx}
                      control={<Checkbox />}
                      label={good}
                    />
                  ))}
                </FormGroup>
              ) : (
                <div>هیچ موردی برای نمایش وجود ندارد</div>
              )}
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
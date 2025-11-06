import React from 'react';

import {
  Typography,
  Box,
} from '@mui/material';

import LocationPinIcon from '@mui/icons-material/LocationPin';

import { useProjectStore } from '@/stores';
import SimpleMap from '@/components/StaticMap';

export default function ProjectInfo() {
  const { selectedProject } = useProjectStore();

  if (!selectedProject) {
    return (
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography>پروژه‌ای انتخاب نشده است</Typography>
      </Box>
    );
  }

  const { title, address, postalCode, latitude, longitude } = selectedProject;

  const hasValidLocation =
    selectedProject?.latitude != null &&
    selectedProject?.longitude != null &&
    !isNaN(selectedProject.latitude) &&
    !isNaN(selectedProject.longitude);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'start',
        height: '100%',
        px: 2,
        gap: 2,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        اطلاعات پروژه
      </Typography>

      {/* Info Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          width: '100%',
          flexDirection: { xs: 'column', md: 'row' },
          height: '150px',
          mt: 1,
        }}
      >
        {/* Text Info */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'start',
            p: 2,
            borderRadius: '12px',
            border: '1px solid var(--text-disabled)',
            backgroundColor: '#f9f9f9',
          }}
        >
          <Typography variant="subtitle1">
            <strong>نام:</strong> {title}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            <strong>کد پستی:</strong> {postalCode || '—'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            <strong>آدرس:</strong> {address || '—'}
          </Typography>
        </Box>

        {/* Map */}
        <Box
          sx={{
            flex: 1,
            height: '250px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--text-disabled)',
          }}
        >
          {/* Replace previous map */}
          {latitude && longitude ? (
                <SimpleMap center={[selectedProject.latitude, selectedProject.longitude]} />
          ) : (
            <Box
              sx={{
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#eee',
                borderRadius: '12px',
                '& .leaflet-control-container' : {
                  display: 'none'
                }
              }}
            >
              <Typography variant="body2" color="textSecondary">
                موقعیت نامشخص
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
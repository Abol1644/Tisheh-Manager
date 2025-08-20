import React, { ReactNode } from 'react'
import { Container, SxProps, Theme } from '@mui/material'

interface PageContainerProps {
  children: ReactNode;
}

interface PageContainerProps {
  children: ReactNode;
  justif?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, justif, className, sx }) => {
  return (
    <Container
      className={className}
      sx={{
        m: 'auto 0',
        p: "20px",
        paddingRight: '20px !important',
        paddingLeft: '20px !important',
        backgroundColor: "background.paper",
        maxWidth: '100vw !important',
        overflowX: 'hidden',
        height: '100%',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: justif || 'center',
        transition: 'background-color 0.3s ease',
        ...sx,
      }}
    >
      {children}
    </Container>
  )
}

export default PageContainer
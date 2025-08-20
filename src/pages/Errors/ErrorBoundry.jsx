import React from 'react';
import { Container,  Box } from '@mui/material'

import Btn from '@/components/elements/Btn';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Optionally log error to external service
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    
    if (this.state.hasError) {
      return (
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            maxWidth: '100% !important',
            width: '100vw',
            transition: 'all 0.3s ease-in-out',
          }}
        >
        <div style={{ padding: "2rem", border: "1px solid red", backgroundColor: "#fee", borderRadius: '20px', direction: 'ltr', transition: 'all 0.3s ease-in-out', }}>
          <h1>مشکلی پیش آمده است</h1>
          <pre style={{ overflowY: 'auto', color: 'darkred' }}>
            {this.state.error?.toString()}
          </pre>
          <Box sx={{ overflowY: 'auto', maxHeight: '650px', scrollbarWidth: 'none' }}>
            <details style={{ whiteSpace: 'pre-wrap', transition: 'all 0.3s ease-in-out', }}>
              {this.state.errorInfo?.componentStack}
            </details>
          </Box>
          <Btn variant='contained' sx={{ borderRadius: '50px', mt: 3, ml: 2 }}> <a href="/dashboard/managment">بازگشت</a> </Btn>
          <Btn variant='contained' sx={{ borderRadius: '50px', mt: 3 }} onClick={() => window.location.reload()}> نوسازی </Btn>
        </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

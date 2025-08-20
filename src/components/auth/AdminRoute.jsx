import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { decodedToken } = useAuth();
  if (decodedToken && decodedToken.Manage === 'True') {
    return children;
  }
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1.2rem', color: 'red' }}>
      شما به این صفحه دسترسی ندارید
    </div>
  );
}

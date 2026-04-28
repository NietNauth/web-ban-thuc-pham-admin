import { useAuth } from './useAuth';

export const usePermission = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isStaff = user?.role === 'staff';

  return { isAdmin, isManager, isStaff, role: user?.role };
};

export default usePermission;

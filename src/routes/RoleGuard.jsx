import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * RoleGuard — Bảo vệ route theo role của employee.
 * Dùng kết hợp với PrivateRoute (đã xác thực token).
 *
 * @param {string[]} allowedRoles - Danh sách role được phép truy cập
 * @param {React.ReactNode} children - Component cần render
 */
export default function RoleGuard({ allowedRoles, children }) {
  const user = useSelector((state) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

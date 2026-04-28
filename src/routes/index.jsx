import { createBrowserRouter, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleGuard from './RoleGuard';
import AdminLayout from '../components/Layout/AdminLayout';

// Pages
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard';
import Category from '../pages/Category';
import Product from '../pages/Product';
import ProductForm from '../pages/Product/ProductForm';
import Order from '../pages/Order';
import OrderDetail from '../pages/Order/OrderDetail';
import Customer from '../pages/Customer';
import CustomerDetail from '../pages/Customer/CustomerDetail';
import Employee from '../pages/Employee';
import EmployeeForm from '../pages/Employee/EmployeeForm';
import Coupon from '../pages/Coupon';
import Statistics from '../pages/Statistics';
import Store from '../pages/Store';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'categories', element: <Category /> },
          { path: 'products', element: <Product /> },
          { path: 'products/create', element: <ProductForm /> },
          { path: 'products/edit/:id', element: <ProductForm /> },
          { path: 'orders', element: <Order /> },
          { path: 'orders/:id', element: <OrderDetail /> },
          { path: 'customers', element: <Customer /> },
          { path: 'customers/:id', element: <CustomerDetail /> },
          { path: 'coupons', element: <Coupon /> },
          { path: 'statistics', element: <Statistics /> },
          { path: 'stores', element: <Store /> },
          // Routes chỉ dành cho admin
          {
            path: 'employees',
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <Employee />
              </RoleGuard>
            ),
          },
          {
            path: 'employees/create',
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <EmployeeForm />
              </RoleGuard>
            ),
          },
          {
            path: 'employees/edit/:id',
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <EmployeeForm />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;


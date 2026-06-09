import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  PercentageOutlined,
  StarOutlined,
  BarChartOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { usePermission } from '../../hooks/usePermission';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = usePermission();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
    { key: '/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
    { key: '/orders', icon: <FileTextOutlined />, label: 'Đơn hàng' },
    { key: '/customers', icon: <UserOutlined />, label: 'Khách hàng' },
    // Only show Employees to Admin
    ...(isAdmin
      ? [{ key: '/employees', icon: <TeamOutlined />, label: 'Tài khoản' }]
      : []),
    { key: '/coupons', icon: <PercentageOutlined />, label: 'Khuyến mãi' },
    { key: '/statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
    { key: '/stores', icon: <ShopOutlined />, label: 'Hệ thống cửa hàng' },
  ];

  return (
    <Sider
      breakpoint='lg'
      collapsedWidth='80'
      theme='light'
      width={250}
      className='border-r border-gray-200'
    >
      <div className='h-16 flex items-center justify-center border-b border-gray-200'>
        <h1 className='text-xl font-bold text-primary m-0'>TomFruits Admin</h1>
      </div>
      <Menu
        theme='light'
        mode='inline'
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
        className='mt-4 border-r-0'
      />
    </Sider>
  );
};

export default Sidebar;

import React from 'react';
import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getFirstChar = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const menuItems = [
    {
      key: 'profile',
      disabled: true,
      label: (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{user?.name || 'Admin'}</span>
          <span className="text-xs text-gray-500 capitalize">{user?.role || 'Admin role'}</span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader className="bg-white px-6 flex justify-end items-center border-b-[2px] border-green-100 h-16">
      <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
        <Space className="cursor-pointer">
          <Avatar className="bg-primary text-white" icon={!user?.name && <UserOutlined />}>
            {user?.name ? getFirstChar(user.name) : ''}
          </Avatar>
          <span className="font-medium hidden sm:inline-block text-white">{user?.name || 'Admin'}</span>
        </Space>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;

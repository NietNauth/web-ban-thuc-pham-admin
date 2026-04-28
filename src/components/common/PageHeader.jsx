import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const breadcrumbNameMap = {
  '/dashboard': 'Dashboard',
  '/categories': 'Danh mục',
  '/products': 'Sản phẩm',
  '/orders': 'Đơn hàng',
  '/customers': 'Khách hàng',
  '/employees': 'Nhân viên',
  '/coupons': 'Khuyến mãi',
  '/reviews': 'Đánh giá',
  '/statistics': 'Thống kê',
};

const PageHeader = ({ title, extra }) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      key: url,
      title: <Link to={url}>{breadcrumbNameMap[url] || title}</Link>,
    };
  });

  const breadcrumbItems = [
    {
      title: <Link to="/">Home</Link>,
      key: 'home',
    },
  ].concat(extraBreadcrumbItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {extra && <div className="mt-4 sm:mt-0">{extra}</div>}
    </div>
  );
};

export default PageHeader;

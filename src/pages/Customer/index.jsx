import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm,
  Card,
  Switch,
  Image
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import axiosClient from '../../api/axiosClient';
import { formatDate } from '../../utils/formatDate';

const Customer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
    search: '',
  });

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/users', { params: queryParams });
      setCustomers(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách khách hàng!');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setQueryParams({ ...queryParams, search: value, page: 1 });
  };

  const handleTableChange = (pagination) => {
    setQueryParams({ 
      ...queryParams, 
      page: pagination.current,
      per_page: pagination.pageSize 
    });
  };

  const handleDelete = async (id) => {
    try {
      // Backend handles setting is_active = 0
      await axiosClient.delete(`/admin/users/${id}`);
      message.success('Đã khóa tài khoản khách hàng!');
      fetchCustomers();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Không thể thao tác!');
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 70,
      render: (url) => <Image src={url} width={40} height={40} className="rounded-full object-cover" fallback="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E" />
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      className: 'font-medium',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => formatDate(val),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/customers/${record.id}`)} 
            size="small"
          />
          <Popconfirm
            title="Khóa/Xóa tài khoản này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Quản lý Khách hàng" 
      />

      <Card className="shadow-sm rounded-lg">
        <div className="mb-4">
          <SearchInput 
            placeholder="Tìm theo Tên, Email hoặc SĐT..." 
            onSearch={handleSearch} 
            className="w-full sm:w-96"
          />
        </div>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.per_page,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          bordered={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Customer;

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  message, 
  Popconfirm,
  Card,
  Tag,
  Switch,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import axiosClient from '../../api/axiosClient';

const Employee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
    search: '',
  });

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/employees', { params: queryParams });
      setEmployees(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
       // if 403, might happen if strict backend check
      console.error(error);
      message.error('Không thể tải danh sách nhân viên!');
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
      await axiosClient.delete(`/admin/employees/${id}`);
      message.success('Xóa nhân viên thành công!');
      fetchEmployees();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Không thể xóa nhân viên này!');
    }
  };

  const handleToggleStatus = async (id, checked) => {
     try {
       await axiosClient.put(`/admin/employees/${id}/status`, { is_active: checked ? 1 : 0 });
       message.success('Cập nhật trạng thái thành công!');
       setEmployees(employees.map(e => e.id === id ? { ...e, is_active: checked } : e));
     } catch (error) {
       message.error('Không thể cập nhật trạng thái');
       fetchEmployees();
     }
  }

  const getRoleTag = (role) => {
    switch(role) {
      case 'admin': return <Tag color="red">Quản trị viên</Tag>;
      case 'manager': return <Tag color="blue">Quản lý</Tag>;
      default: return <Tag color="green">Nhân viên</Tag>;
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
      title: 'Tên nhân viên',
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
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      render: (role) => getRoleTag(role),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            ghost
            icon={<EditOutlined />} 
            onClick={() => navigate(`/employees/edit/${record.id}`)} 
            size="small"
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            disabled={record.role === 'admin'}
          >
            <Button danger icon={<DeleteOutlined />} size="small" disabled={record.role === 'admin'} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Quản lý Nhân viên" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/employees/create')}
            className="bg-primary"
          >
            Thêm nhân viên
          </Button>
        }
      />

      <Card className="shadow-sm rounded-lg">
        <div className="mb-4">
          <SearchInput 
            placeholder="Tìm theo Tên hoặc Email..." 
            onSearch={handleSearch} 
            className="w-full sm:w-80"
          />
        </div>

        <Table
          columns={columns}
          dataSource={employees}
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

export default Employee;

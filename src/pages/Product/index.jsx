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
  Select,
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
import StatusBadge from '../../components/common/StatusBadge';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatCurrency';

const { Option } = Select;

const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
    search: '',
    category_id: undefined,
    status: undefined,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/admin/categories', { params: { per_page: 100 } });
      setCategories(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/products', { params: queryParams });
      setProducts(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setQueryParams({ ...queryParams, search: value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setQueryParams({ ...queryParams, [key]: value, page: 1 });
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
      await axiosClient.delete(`/admin/products/${id}`);
      message.success('Xóa sản phẩm thành công!');
      fetchProducts();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Không thể xóa sản phẩm này!');
    }
  };

  const handleToggleStatus = async (id, checked, field = 'status') => {
    try {
      const data = {};
      if (field === 'status') {
        data.status = checked ? 'in_stock' : 'out_of_stock';
      } else {
        data[field] = checked;
      }
      
      await axiosClient.patch(`/admin/products/${id}/status`, data);
      message.success('Cập nhật trạng thái thành công!');
      // Update local state gently to avoid full reload
      setProducts(products.map(p => p.id === id ? { ...p, [field]: field === 'status' ? (checked ? 'in_stock' : 'out_of_stock') : checked } : p));
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái!');
      fetchProducts(); // rollback UI
    }
  };

  const getTagColor = (tag) => {
    switch (tag?.toLowerCase()) {
      case 'sale': return 'orange';
      case 'hot': return 'red';
      case 'new': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (url) => (
        <Image
          src={url || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2250%22%20height%3D%2250%22%20viewBox%3D%220%200%2050%2050%22%3E%3Crect%20width%3D%2250%22%20height%3D%2250%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E'}
          alt="product"
          width={50}
          height={50}
          className="object-cover rounded"
          fallback="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2250%22%20height%3D%2250%22%20viewBox%3D%220%200%2050%2050%22%3E%3Crect%20width%3D%2250%22%20height%3D%2250%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      className: 'font-medium',
      width: 250,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.title || 'Không có',
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (val) => <span className="text-green-600 font-medium">{formatCurrency(val)}</span>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Nhãn (Tag)',
      dataIndex: 'tag',
      key: 'tag',
      align: 'center',
      render: (tag) => tag ? <Tag color={getTagColor(tag)}>{tag.toUpperCase()}</Tag> : '-',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 'in_stock'}
          onChange={(checked) => handleToggleStatus(record.id, checked, 'status')}
          checkedChildren="Còn hàng"
          unCheckedChildren="Hết hàng"
          size="small"
        />
      ),
    },
    {
      title: 'Nổi bật',
      key: 'is_featured',
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.is_featured}
          onChange={(checked) => handleToggleStatus(record.id, checked, 'is_featured')}
          size="small"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${record.id}`)}
            size="small"
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
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
        title="Quản lý Sản phẩm"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/create')}
            className="bg-primary"
          >
            Thêm sản phẩm
          </Button>
        }
      />

      <Card className="shadow-sm rounded-lg mb-6">
        <Space wrap className="mb-4 flex justify-between w-full">
          <Space wrap>
            <SearchInput
              placeholder="Tên sản phẩm..."
              onSearch={handleSearch}
              className="w-64"
            />
            <Select
              placeholder="Chọn danh mục"
              style={{ width: 200 }}
              allowClear
              onChange={(val) => handleFilterChange('category_id', val)}
            >
              {categories.map(c => (
                <Option key={c.id} value={c.id}>{c.title}</Option>
              ))}
            </Select>
            <Select
              placeholder="Trạng thái hiển thị"
              style={{ width: 150 }}
              allowClear
              onChange={(val) => handleFilterChange('status', val)}
            >
              <Option value="in_stock">Còn hàng</Option>
              <Option value="out_of_stock">Hết hàng</Option>
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={products}
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
          scroll={{ x: 1000 }}
          bordered={false}
          size="middle"
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Card>
    </div>
  );
};

export default Product;

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Tabs, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const { TabPane } = Tabs;

const Order = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
    search: '',
    status: '', // '' = tất cả
  });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/orders', {
        params: queryParams,
      });
      setOrders(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setQueryParams({ ...queryParams, search: value, page: 1 });
  };

  const handleTabChange = (key) => {
    setQueryParams({ ...queryParams, status: key, page: 1 });
  };

  const handleTableChange = (pagination) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current,
      per_page: pagination.pageSize,
    });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color='orange'>Chờ xử lý</Tag>;
      case 'processing':
        return <Tag color='blue'>Đang xử lý</Tag>;
      case 'shipping':
        return <Tag color='cyan'>Đang giao</Tag>;
      case 'completed':
        return <Tag color='green'>Hoàn thành</Tag>;
      case 'cancelled':
        return <Tag color='red'>Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'order_code',
      key: 'order_code',
      render: (text, record) => (
        <span className='font-semibold text-gray-700'>
          #{text || record.id}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.name || 'Vãng lai',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (val) => (
        <span className='font-medium text-green-600'>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Phương thức TT',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) =>
        method === 'cod'
          ? 'Thanh toán khi nhận hàng'
          : method === 'bank'
            ? 'Chuyển khoản'
            : method === 'vnpay'
              ? 'VNPay'
              : method,
    },
    {
      title: 'TT Thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      align: 'center',
      render: (status) => {
        if (status === 'paid') return <Tag color='success'>Đã thanh toán</Tag>;
        if (status === 'unpaid')
          return <Tag color='default'>Chưa thanh toán</Tag>;
        if (status === 'refunded')
          return <Tag color='purple'>Đã hoàn tiền</Tag>;
        return <Tag>{status}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size='small'>
          <Button
            type='primary'
            ghost
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${record.id}`)}
            size='small'
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title='Quản lý Đơn hàng' />

      <Card className='shadow-sm rounded-lg'>
        <Tabs defaultActiveKey='' onChange={handleTabChange}>
          <TabPane tab='Tất cả' key='' />
          <TabPane tab='Chờ xử lý' key='pending' />
          <TabPane tab='Đang xử lý' key='processing' />
          <TabPane tab='Đang giao' key='shipping' />
          <TabPane tab='Hoàn thành' key='completed' />
          <TabPane tab='Đã huỷ' key='cancelled' />
        </Tabs>

        <div className='mb-4'>
          <SearchInput
            placeholder='Tìm theo mã đơn hoặc tên khách hàng...'
            onSearch={handleSearch}
            className='w-full sm:w-80'
          />
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey='id'
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.per_page,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          bordered={false}
          size='middle'
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Card>
    </div>
  );
};

export default Order;

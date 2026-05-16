import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  message, 
  Spin,
  Tag,
  Descriptions,
  Space
} from 'antd';
import { ArrowLeftOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      // Giả sử API cung cấp thông tin user và query param nhận orders nếu backend support
      // Hoặc gọi 2 request.
      const resUser = await axiosClient.get(`/admin/users/${id}`);
      setCustomer(resUser.data);
      
      const resOrders = await axiosClient.get('/admin/orders', { params: { user_id: id, per_page: 50 }});
      setOrders(resOrders.data?.data || resOrders.data || []);
      
    } catch (error) {
      console.error(error);
      message.error('Không thể tải chi tiết khách hàng!');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'pending': return <Tag color="orange">Chờ xử lý</Tag>;
      case 'shipping': return <Tag color="blue">Đang giao</Tag>;
      case 'completed': return <Tag color="green">Hoàn thành</Tag>;
      case 'cancelled': return <Tag color="red">Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  if (loading || !customer) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // Calculate totals
  const totalSpent = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseInt(o.total_amount || 0), 0);
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'order_code',
      key: 'order_code',
      render: (text) => <span className="font-semibold text-gray-700">#{text}</span>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val) => <span className="font-medium text-green-600">{formatCurrency(val)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
         <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>Chi tiết</Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>Quay lại</Button>
          <h2 className="text-xl font-bold m-0 text-gray-800 ml-2">Hồ sơ khách hàng</h2>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card className="shadow-sm rounded-lg mb-6 border-t-4 border-t-primary">
            <div className="text-center mb-6">
               <div className="w-24 h-24 rounded-full bg-green-100 mx-auto flex items-center justify-center text-primary text-4xl mb-4">
                  {customer.name?.charAt(0).toUpperCase()}
               </div>
               <h3 className="text-xl font-bold m-0">{customer.name}</h3>
               <p className="text-gray-500 m-0">{customer.email}</p>
            </div>
            
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Điện thoại">{customer.phone || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{customer.address || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">{formatDate(customer.created_at)}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={16}>
             <Col span={12}>
               <Card className="text-center shadow-sm">
                  <ShoppingOutlined className="text-3xl text-blue-500 mb-2" />
                  <p className="text-gray-500 mb-1 text-sm">Đơn thành công</p>
                  <h3 className="text-xl font-bold my-0">{completedOrdersCount}</h3>
               </Card>
             </Col>
             <Col span={12}>
               <Card className="text-center shadow-sm">
                  <DollarOutlined className="text-3xl text-green-500 mb-2" />
                  <p className="text-gray-500 mb-1 text-sm">Đã chi tiêu</p>
                  <h3 className="text-lg font-bold my-0 text-green-600">{formatCurrency(totalSpent)}</h3>
               </Card>
             </Col>
          </Row>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Lịch sử đơn hàng" className="shadow-sm rounded-lg h-full">
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              bordered={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDetail;

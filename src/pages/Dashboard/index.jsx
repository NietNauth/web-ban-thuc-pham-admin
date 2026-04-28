import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Table, Typography, message, Spin } from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  UserOutlined, 
  AppstoreOutlined 
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatCurrency';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalOrdersToday: 0,
    revenueToday: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenue7Days: [],
    topProducts: [],
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      // Giả lập call API hoặc gọi thực tế
      const res = await axiosClient.get('/admin/statistics/overview');
      setData(res.data || res); // tuỳ cấu trúc trả về
    } catch (error) {
      console.error(error);
      message.error('Không thể tải dữ liệu tổng quan thật!');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Đơn hàng hôm nay',
      value: data.totalOrdersToday,
      icon: <ShoppingCartOutlined className="text-4xl text-blue-500" />,
      color: 'border-blue-500',
    },
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(data.revenueToday),
      icon: <DollarOutlined className="text-4xl text-green-500" />,
      color: 'border-green-500',
    },
    {
      title: 'Khách hàng',
      value: data.totalCustomers,
      icon: <UserOutlined className="text-4xl text-purple-500" />,
      color: 'border-purple-500',
    },
    {
      title: 'Sản phẩm',
      value: data.totalProducts,
      icon: <AppstoreOutlined className="text-4xl text-orange-500" />,
      color: 'border-orange-500',
    },
  ];

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold',
      align: 'center',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (val) => <span className="font-medium text-green-600">{formatCurrency(val)}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Tổng quan Dashboard" />

      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable className={`border-b-4 ${card.color} shadow-sm rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1 font-medium">{card.title}</p>
                  <h3 className="text-2xl font-bold text-gray-800 m-0">{card.value}</h3>
                </div>
                <div>{card.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card 
            title={<Title level={5} className="!m-0">Doanh thu 7 ngày gần nhất</Title>} 
            className="shadow-sm rounded-lg h-full"
            bodyStyle={{ height: 350 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenue7Days} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280'}}
                  tickFormatter={(value) => `${value / 1000000}tr`}
                />
                <RechartsTooltip 
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh thu" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card 
            title={<Title level={5} className="!m-0">Top 5 sản phẩm bán chạy</Title>} 
            className="shadow-sm rounded-lg h-full"
          >
            <Table
              dataSource={data.topProducts}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

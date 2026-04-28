import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tabs,
  message,
  Spin,
  Button,
  Modal
} from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import axiosClient from '../../api/axiosClient';
import aiService from '../../api/aiService';
import { formatCurrency } from '../../utils/formatCurrency';

const { TabPane } = Tabs;

const Statistics = () => {
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [revenueType, setRevenueType] = useState('week');
  const [revenueData, setRevenueData] = useState([]);
  const [bestSellingData, setBestSellingData] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);

  useEffect(() => {
    fetchRevenueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revenueType]);

  useEffect(() => {
    fetchBestSellingProducts();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoadingRevenue(true);
      const res = await axiosClient.get('/admin/statistics/revenue', { params: { type: revenueType } });
      setRevenueData(res.data || []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải dữ liệu doanh thu thật!');
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchBestSellingProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await axiosClient.get('/admin/statistics/best-selling');
      setBestSellingData(res.data || []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải dữ liệu sản phẩm bán chạy thật!');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleTabChange = (key) => {
    setRevenueType(key);
  };

  const handleAiAnalysis = async () => {
    try {
      setLoadingAi(true);
      setIsAiModalVisible(true);
      const analysis = await aiService.analyzeStatistics(
        { revenue: revenueData, bestSelling: bestSellingData },
        revenueType === 'week' ? 'Tuần này' : revenueType === 'month' ? 'Tháng này' : 'Năm này'
      );
      setAiAnalysis(analysis);
    } catch (error) {
      console.error(error);
      message.error('Không thể thực hiện phân tích AI!');
      setIsAiModalVisible(false);
    } finally {
      setLoadingAi(false);
    }
  };

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
      className: 'font-medium',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => cat?.name || 'Không có',
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'sold_quantity',
      key: 'sold_quantity',
      align: 'center',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      align: 'right',
      render: (val) => <span className="text-green-600 font-medium">{formatCurrency(val)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Thống kê & Báo cáo" />

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card className="shadow-sm rounded-lg" bodyStyle={{ padding: '0 24px 24px' }}>
            <Tabs 
              defaultActiveKey="week" 
              onChange={handleTabChange} 
              tabBarExtraContent={
                <div className="flex items-center gap-4">
                  <Button 
                    type="primary" 
                    icon={<RobotOutlined />} 
                    onClick={handleAiAnalysis} 
                    className="bg-purple-600 hover:bg-purple-700 border-none"
                  >
                    Phân tích bằng AI
                  </Button>
                  <span className="font-semibold px-4 text-gray-500">Biểu đồ doanh thu</span>
                </div>
              }
            >
              <TabPane tab="Theo tuần" key="week" />
              <TabPane tab="Theo tháng" key="month" />
              <TabPane tab="Theo năm" key="year" />
            </Tabs>

            {loadingRevenue ? (
              <div className="flex justify-center items-center h-[400px]">
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280' }}
                      tickFormatter={(val) => `${val / 1000000}tr`}
                    />
                    <RechartsTooltip
                      formatter={(val) => [formatCurrency(val), 'Doanh thu']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Doanh thu"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24}>
          <Card title={<h3 className="m-0 text-lg font-bold">Top sản phẩm bán chạy nhất</h3>} className="shadow-sm rounded-lg border-t-4 border-t-primary">
            <Table
              columns={columns}
              dataSource={bestSellingData}
              rowKey="id"
              loading={loadingProducts}
              pagination={false}
              bordered={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
            <span>Trợ lý Phân tích AI - Gemini</span>
          </div>
        }
        open={isAiModalVisible}
        onCancel={() => setIsAiModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsAiModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {loadingAi ? (
          <div className="py-12 text-center">
            <Spin tip="Gemini đang phân tích dữ liệu kinh doanh của bạn..." size="large" />
            <p className="mt-4 text-gray-500">Việc này có thể mất vài giây...</p>
          </div>
        ) : (
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <div className="prose prose-purple max-w-none prose-p:my-2 prose-li:my-1">
              {aiAnalysis.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-purple-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-gray-700">{line.replace('* ', '')}</li>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-gray-700">{line.replace('- ', '')}</li>;
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="text-gray-700">{line}</p>;
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Statistics;

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Select,
  Button,
  message,
  Spin,
  Tag,
  Divider,
  Space,
  Image,
} from 'antd';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const { Option } = Select;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/admin/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải chi tiết đơn hàng!');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (value) => {
    if (value === 'completed' && order.payment_status !== 'paid') {
      message.error('Đơn hàng phải được thanh toán mới có thể hoàn thành!');
      return;
    }

    try {
      setUpdating(true);
      await axiosClient.patch(`/admin/orders/${id}/status`, { status: value });
      message.success('Cập nhật trạng thái thành công!');
      fetchOrderDetail();
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || 'Cập nhật trạng thái thất bại!'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (value) => {
    try {
      setUpdating(true);
      await axiosClient.patch(`/admin/orders/${id}/payment-status`, {
        payment_status: value,
      });
      message.success('Cập nhật trạng thái thanh toán thành công!');
      fetchOrderDetail();
    } catch (error) {
      console.error(error);
      message.error('Cập nhật trạng thái thanh toán thất bại!');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      // Giả sử API trả về link PDF hoặc HTML
      const res = await axiosClient.get(`/admin/orders/${id}/invoice`);
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        // Fallback: Just open print window for current page
        window.print();
      }
    } catch (error) {
      // Fallback
      window.print();
    }
  };

  if (loading || !order) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spin size='large' />
      </div>
    );
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Ảnh',
      dataIndex: 'product_image_url',
      key: 'product_image_url',
      width: 70,
      render: (url) => (
        <Image
          src={url}
          width={40}
          height={40}
          className='rounded object-cover'
          fallback='data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E'
        />
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (_, record) => (
        <div>
          <p className='font-medium m-0'>
            {record.product_name || record.product?.name || 'Sản phẩm đã xóa'}
          </p>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <span className='font-medium text-green-600'>
          {formatCurrency(record.price * record.quantity)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/orders')}
          >
            Quay lại
          </Button>
          <h2 className='text-xl font-bold m-0 text-gray-800'>
            Chi tiết đơn hàng #{order.order_code || order.id}
          </h2>
        </Space>
        <Space>
          <Select
            value={order.status}
            onChange={handleUpdateStatus}
            style={{ width: 160 }}
            loading={updating}
            disabled={
              order.status === 'completed' || order.status === 'cancelled'
            }
          >
            <Option value='pending'>Chờ xử lý</Option>
            <Option value='processing'>Đang xử lý</Option>
            <Option value='shipping'>Đang giao</Option>
            <Option value='completed'>Hoàn thành</Option>
            <Option value='cancelled'>Đã hủy</Option>
          </Select>
          <Button
            type='primary'
            icon={<PrinterOutlined />}
            onClick={handlePrintInvoice}
            className='bg-blue-500 hover:bg-blue-600 border-none'
          >
            In hoá đơn
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card
            title='Danh sách sản phẩm'
            className='shadow-sm rounded-lg mb-6'
          >
            <Table
              columns={columns}
              dataSource={order.items || order.order_details || []}
              rowKey='id'
              pagination={false}
              bordered={false}
              size='middle'
            />

            <Divider />

            <div className='flex justify-end pr-4'>
              <div className='w-64'>
                <div className='flex justify-between mb-2'>
                  <span className='text-gray-500'>Tạm tính:</span>
                  <span className='font-medium'>
                    {formatCurrency(order.total_price)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className='flex justify-between mb-2'>
                    <span className='text-gray-500'>
                      Giảm giá{' '}
                      {order.coupon?.code && (
                        <Tag color='blue' className='ml-1'>
                          {order.coupon.code}
                        </Tag>
                      )}
                      :
                    </span>
                    <span className='text-red-500 font-medium'>
                      -{formatCurrency(order.discount_amount)}
                    </span>
                  </div>
                )}
                <Divider className='my-2' />
                <div className='flex justify-between'>
                  <span className='text-lg font-bold'>Tổng cộng:</span>
                  <span className='text-xl font-bold text-green-600'>
                    {formatCurrency(order.final_price)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title='Thông tin người nhận'
            className='shadow-sm rounded-lg mb-6 bg-green-50 bg-opacity-30'
          >
            <div className='mb-4'>
              <p className='text-gray-500 text-sm mb-1'>Tên người nhận</p>
              <p className='font-medium'>
                {order.receiver_name || order.user?.name}
              </p>
            </div>
            <div className='mb-4'>
              <p className='text-gray-500 text-sm mb-1'>Số điện thoại</p>
              <p className='font-medium'>
                {order.receiver_phone || order.user?.phone}
              </p>
            </div>
            <div className='mb-4'>
              <p className='text-gray-500 text-sm mb-1'>Địa chỉ giao hàng</p>
              <p className='font-medium'>
                {order.shipping_address || order.address}
              </p>
            </div>
            <div className='mb-4'>
              <p className='text-gray-500 text-sm mb-1'>Ghi chú</p>
              <p className='font-medium text-red-500'>
                {order.note || 'Không có'}
              </p>
            </div>
          </Card>

          <Card title='Thông tin thanh toán' className='shadow-sm rounded-lg'>
            <div className='mb-4'>
              <p className='text-gray-500 text-sm mb-1'>Phương thức</p>
              <p className='font-medium'>
                {order.payment_method === 'cod'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : order.payment_method === 'bank'
                    ? 'Chuyển khoản ngân hàng'
                    : order.payment_method === 'vnpay'
                      ? 'Thanh toán qua VNPay'
                      : order.payment_method}
              </p>
            </div>
            <div className='mb-4'>
              <p className='text-gray-500 text-sm mb-1'>
                Trạng thái thanh toán
              </p>
              <Select
                value={order.payment_status}
                onChange={handleUpdatePaymentStatus}
                loading={updating}
                style={{ width: '100%' }}
                className={
                  order.payment_status === 'paid'
                    ? 'status-paid'
                    : 'status-unpaid'
                }
              >
                <Option value='unpaid'>Chưa thanh toán</Option>
                <Option value='paid'>Đã thanh toán</Option>
              </Select>
            </div>
            <div>
              <p className='text-gray-500 text-sm mb-1'>Ngày đặt hàng</p>
              <p className='font-medium'>{formatDate(order.created_at)}</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetail;

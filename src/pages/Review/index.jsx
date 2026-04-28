import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  message, 
  Popconfirm,
  Card,
  Rate,
  Tag,
  Avatar
} from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import axiosClient from '../../api/axiosClient';
import { formatDate } from '../../utils/formatDate';

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
  });

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/reviews', { params: queryParams });
      setReviews(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setQueryParams({ 
      ...queryParams, 
      page: pagination.current,
      per_page: pagination.pageSize 
    });
  };

  const handleApprove = async (id, isApproved) => {
    try {
      await axiosClient.patch(`/admin/reviews/${id}/approve`, { is_approved: isApproved ? 1 : 0 });
      message.success(isApproved ? 'Đã duyệt đánh giá!' : 'Đã hủy duyệt đánh giá!');
      fetchReviews();
    } catch (error) {
       message.error('Không thể thay đổi trạng thái!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/reviews/${id}`); // Giả sử có route xoá
      message.success('Xóa đánh giá thành công!');
      fetchReviews();
    } catch (error) {
       message.error('Xóa đánh giá thất bại!');
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      width: 200,
      render: (product) => (
         <div className="flex items-center gap-2">
            <Avatar src={product?.img} shape="square" />
            <span className="font-medium text-xs break-words" style={{width: 130}}>{product?.name || 'Sản phẩm đã xóa'}</span>
         </div>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (user) => (
         <Space>
            <Avatar icon={<UserOutlined />} size="small" />
            <span className="text-sm">{user?.name || 'Vãng lai'}</span>
         </Space>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => <Rate disabled defaultValue={rating} className="text-sm" />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      width: 300,
      render: (text) => <div className="text-sm text-gray-600 line-clamp-3">{text || <i>(Không có nội dung)</i>}</div>,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      render: (val) => <span className="text-xs">{formatDate(val)}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'is_approved',
      width: 120,
      align: 'center',
      render: (_, record) => (
         record.is_approved 
            ? <Tag color="green">Đã duyệt</Tag> 
            : <Tag color="orange">Chờ duyệt</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.is_approved ? (
             <Popconfirm title="Bạn muốn hủy duyệt đánh giá này?" onConfirm={() => handleApprove(record.id, false)} okText="Đồng ý" cancelText="Hủy">
               <Button size="small" icon={<CloseOutlined />}>Hủy duyệt</Button>
             </Popconfirm>
          ) : (
             <Button type="primary" size="small" className="bg-primary" icon={<CheckOutlined />} onClick={() => handleApprove(record.id, true)}>Duyệt</Button>
          )}
          <Popconfirm title="Xóa đánh giá này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Quản lý Đánh giá" />

      <Card className="shadow-sm rounded-lg">
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.per_page,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          bordered={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Review;

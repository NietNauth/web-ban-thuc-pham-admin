import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Select,
  DatePicker,
  message, 
  Popconfirm,
  Card,
  Switch,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
    search: '',
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/coupons', { params: queryParams });
      setCoupons(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách khuyến mãi!');
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

  const showModal = (coupon = null) => {
    setEditingCoupon(coupon);
    if (coupon) {
      form.setFieldsValue({
        ...coupon,
        date_range: [
          coupon.start_date ? dayjs(coupon.start_date) : null,
          coupon.end_date ? dayjs(coupon.end_date) : null
        ],
        is_active: !!coupon.is_active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true, discount_type: 'percent' });
    }
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCoupon(null);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const payload = {
        ...values,
        start_date: values.date_range?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_date: values.date_range?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        is_active: values.is_active ? 1 : 0,
      };
      delete payload.date_range;

      if (editingCoupon) {
        await axiosClient.put(`/admin/coupons/${editingCoupon.id}`, payload);
        message.success('Cập nhật khuyến mãi thành công!');
      } else {
        await axiosClient.post('/admin/coupons', payload);
        message.success('Thêm khuyến mãi thành công!');
      }
      handleCancelModal();
      fetchCoupons();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/coupons/${id}`);
      message.success('Xóa khuyến mãi thành công!');
      fetchCoupons();
    } catch (error) {
       message.error('Không thể xóa mã khuyến mãi!');
    }
  };

  const handleToggleStatus = async (id, checked) => {
     try {
       await axiosClient.put(`/admin/coupons/${id}`, { is_active: checked ? 1 : 0 });
       message.success('Cập nhật trạng thái thành công!');
       fetchCoupons();
     } catch (error) {
       message.error('Không thể cập nhật trạng thái');
     }
  }

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Loại/Giá trị',
      key: 'discount',
      render: (_, record) => {
        if (record.discount_type === 'fixed') {
           return <span className="text-green-600 font-medium">-{formatCurrency(record.discount_value)}</span>;
        }
        return <span className="text-orange-500 font-medium">-{record.discount_value}%</span>;
      }
    },
    {
      title: 'Đã dùng / Giới hạn',
      key: 'usage',
      align: 'center',
      render: (_, record) => `${record.used_count || 0} / ${record.usage_limit || '∞'}`,
    },
    {
      title: 'Hạn dùng',
      key: 'date',
      render: (_, record) => {
         const now = new Date();
         const endDate = new Date(record.end_date);
         const isExpired = endDate < now;
         return (
            <div>
               <div className="text-xs">{formatDate(record.start_date)} -</div>
               <div className={`text-xs ${isExpired ? 'text-red-500' : 'text-green-600'}`}>{formatDate(record.end_date)}</div>
               {isExpired && <Tag color="red" className="mt-1">Hết hạn</Tag>}
            </div>
         );
      }
    },
    {
      title: 'Trạng thái',
      key: 'is_active',
      align: 'center',
      render: (_, record) => (
        <Switch 
          checked={!!record.is_active} 
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
             type="primary" ghost icon={<EditOutlined />} onClick={() => showModal(record)} size="small"
          />
          <Popconfirm
             title="Bạn có chắc muốn xóa mã này?"
             onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
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
        title="Quản lý Khuyến mãi" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} className="bg-primary">
            Thêm mới
          </Button>
        }
      />

      <Card className="shadow-sm rounded-lg">
        <div className="mb-4">
          <SearchInput placeholder="Tìm mã khuyến mãi..." onSearch={handleSearch} className="w-full sm:w-80" />
        </div>

        <Table
          columns={columns}
          dataSource={coupons}
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
          scroll={{ x: 'max-content' }}
          bordered={false}
          size="middle"
        />
      </Card>

      <Modal
        title={editingCoupon ? 'Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới'}
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
             <Form.Item name="code" label="Mã khuyến mãi (Code)" rules={[{ required: true, message: 'Tham số bắt buộc!' }]}>
               <Input placeholder="Ví dụ: SUMMER2024" className="uppercase" />
             </Form.Item>
             <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
               <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
             </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
             <Input.TextArea rows={2} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="discount_type" label="Loại giảm giá" rules={[{ required: true }]}>
               <Select>
                  <Option value="percent">Theo phần trăm (%)</Option>
                  <Option value="fixed">Số tiền cố định (VNĐ)</Option>
               </Select>
            </Form.Item>
            <Form.Item name="discount_value" label="Giá trị giảm" rules={[{ required: true, message: 'Nhập giá trị giảm!' }]}>
               <InputNumber className="w-full" min={1} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Form.Item name="min_order_value" label="Đơn tối thiểu (VNĐ)" rules={[{ required: true }]}>
               <InputNumber className="w-full" min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
             </Form.Item>
             <Form.Item name="usage_limit" label="Giới hạn số lần dùng (để trống = ∞)">
               <InputNumber className="w-full" min={1} />
             </Form.Item>
          </div>

          <Form.Item name="date_range" label="Thời gian áp dụng" rules={[{ required: true, message: 'Chọn thời gian áp dụng!' }]}>
             <RangePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
          </Form.Item>

          <Form.Item className="mb-0 text-right mt-6">
            <Space>
              <Button onClick={handleCancelModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="bg-primary" loading={submitting}>
                {editingCoupon ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Coupon;

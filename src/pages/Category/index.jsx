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
  Upload,
  Image,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import axiosClient from '../../api/axiosClient';
import { formatDate } from '../../utils/formatDate';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
    search: '',
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
    // Vòng lặp deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/categories', { params: queryParams });
      // Thích ứng với cấu trúc Laravel Pagination
      setCategories(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách danh mục!');
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

  const showModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({
        title: category.title,
        is_active: category.is_active,
      });
      if (category.image_url) {
        setFileList([
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: category.image_url,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCategory(null);
    setFileList([]);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('is_active', values.is_active ? 1 : 0);
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('img', fileList[0].originFileObj);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingCategory) {
        // NOTE: PHP/Laravel requires POST with _method=PUT to handle multipart/form-data properly via PUT
        formData.append('_method', 'PUT');
        await axiosClient.post(`/admin/categories/${editingCategory.id}`, formData, config);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await axiosClient.post('/admin/categories', formData, config);
        message.success('Thêm danh mục thành công!');
      }
      handleCancelModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, checked) => {
    try {
      await axiosClient.patch(`/admin/categories/${id}/status`, { is_active: checked });
      message.success('Cập nhật trạng thái thành công!');
      fetchCategories();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/categories/${id}`);
      message.success('Xóa danh mục thành công!');
      fetchCategories();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Không thể xóa danh mục này!');
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (queryParams.page - 1) * queryParams.per_page + index + 1,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'title',
      key: 'title',
      className: 'font-medium',
    },
    {
      title: 'Ảnh đại diện',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (img_url) => img_url ? (
        <Image src={img_url} alt="img" width={50} height={50} className="object-cover rounded" />
      ) : (
        <div className="w-[50px] h-[50px] bg-gray-100 flex items-center justify-center rounded text-gray-400 text-xs">No img</div>
      ),
    },
    {
      title: 'Hiển thị trang chủ',
      key: 'is_active',
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.is_active}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          size="small"
        />
      ),
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
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost
            icon={<EditOutlined />} 
            onClick={() => showModal(record)} 
            size="small"
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục này?"
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
        title="Quản lý Danh mục" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
            className="bg-primary"
          >
            Thêm danh mục
          </Button>
        }
      />

      <Card className="shadow-sm rounded-lg">
        <div className="mb-4 flex justify-between items-center">
          <div className="w-full sm:w-1/3">
            <SearchInput 
              placeholder="Tìm kiếm danh mục..." 
              onSearch={handleSearch} 
              className="w-full"
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.per_page,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            className: 'px-4'
          }}
          locale={{ emptyText: 'Không có dữ liệu' }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          bordered={false}
          size="middle"
        />
      </Card>

      <Modal
        title={editingCategory ? 'Sửa danh mục' : 'Thêm mới danh mục'}
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { max: 255, message: 'Tên danh mục không được vượt quá 255 ký tự!' }
            ]}
          >
            <Input placeholder="Ví dụ: Rau củ quả, Thịt cá..." />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Hiển thị trang chủ"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Ảnh đại diện"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancelModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="bg-primary" loading={submitting}>
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Category;

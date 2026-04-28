import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
  Switch
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import locationService from '../../api/locationService';
import PageHeader from '../../components/common/PageHeader';

const { Option } = Select;

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [form] = Form.useForm();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/stores');
      setStores(res || []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách cửa hàng!');
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const data = await locationService.getProvinces();
      setProvincesList(data || []);
    } catch (error) {
      console.error('Fetch provinces error:', error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchProvinces();
  }, []);

  const handleProvinceChange = (name) => {
    form.setFieldsValue({ district: undefined });
    const selected = provincesList.find(p => p.name === name);
    setDistrictsList(selected ? (selected.districts || []) : []);
  };

  const handleAdd = () => {
    setEditingStore(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingStore(record);
    form.setFieldsValue(record);
    // Find districts for the existing city
    const selected = provincesList.find(p => p.name === record.city);
    setDistrictsList(selected ? (selected.districts || []) : []);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/stores/${id}`);
      message.success('Xóa cửa hàng thành công!');
      fetchStores();
    } catch (error) {
      console.error(error);
      message.error('Không thể xóa cửa hàng!');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingStore) {
        await axiosClient.put(`/admin/stores/${editingStore.id}`, values);
        message.success('Cập nhật cửa hàng thành công!');
      } else {
        await axiosClient.post('/admin/stores', values);
        message.success('Thêm cửa hàng mới thành công!');
      }
      setIsModalVisible(false);
      fetchStores();
    } catch (error) {
      console.error(error);
      // antd handles form validation errors
    }
  };

  const columns = [
    {
      title: 'Tên cửa hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-bold text-green-700">{text}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (addr, record) => `${addr}, ${record.district}, ${record.city}`,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Giờ mở cửa',
      dataIndex: 'opening_hours',
      key: 'opening_hours',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Hoạt động' : 'Tạm nghỉ'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc muốn xóa cửa hàng này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Quản lý hệ thống cửa hàng" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700"
          >
            Thêm cửa hàng
          </Button>
        }
      />

      <Card className="shadow-sm rounded-lg">
        <Table
          columns={columns}
          dataSource={stores}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingStore ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingStore ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ is_active: true }}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên cửa hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
          >
            <Input prefix={<ShopOutlined className="text-gray-400" />} placeholder="Ví dụ: Tôm Fruits Cầu Giấy" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="city"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: 'Chọn tỉnh thành!' }]}
            >
              <Select placeholder="Chọn tỉnh thành" onChange={handleProvinceChange} showSearch optionFilterProp="children">
                {provincesList.map(c => <Option key={c.code} value={c.name}>{c.name}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: 'Chọn quận huyện!' }]}
            >
              <Select placeholder="Chọn quận huyện" disabled={!districtsList.length} showSearch optionFilterProp="children">
                {districtsList.map(d => (
                  <Option key={d.code} value={d.name}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Địa chỉ chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Ví dụ: Số 123 đường ABC" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label="Số điện thoại"
            >
              <Input placeholder="Ví dụ: 0123456789" />
            </Form.Item>

            <Form.Item
              name="opening_hours"
              label="Giờ mở cửa"
            >
              <Input placeholder="Ví dụ: 6h30 - 21h00" />
            </Form.Item>
          </div>

          <Form.Item
            name="is_active"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm nghỉ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StoreManagement;

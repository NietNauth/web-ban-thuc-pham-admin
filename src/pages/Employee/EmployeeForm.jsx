import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Switch, 
  message, 
  Card,
  Spin
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import axiosClient from '../../api/axiosClient';

const { Option } = Select;

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/admin/employees/${id}`);
      const emp = res.data;
      
      form.setFieldsValue({
        ...emp,
        is_active: !!emp.is_active,
      });
    } catch (error) {
      console.error(error);
      message.error('Không thể tải thông tin nhân viên!');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0,
      };

      if (!payload.password) {
         delete payload.password; // không gửi password rỗng khi edit
      }

      if (isEdit) {
        await axiosClient.put(`/admin/employees/${id}`, payload);
        message.success('Cập nhật nhân viên thành công!');
      } else {
        await axiosClient.post('/admin/employees', payload);
        message.success('Thêm nhân viên thành công!');
      }
      navigate('/employees');
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title={isEdit ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên'} 
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Card className="shadow-sm rounded-lg max-w-2xl mx-auto">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              is_active: true,
              role: 'staff'
            }}
          >
            <Form.Item
              name="name"
              label="Tên nhân viên"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
            >
              <Input placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email đăng nhập"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="admin@domain.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label={isEdit ? "Mật khẩu mới (bỏ trống nếu giữ nguyên)" : "Mật khẩu"}
              rules={[
                { required: !isEdit, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
            >
              <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
               <Form.Item
                 name="role"
                 label="Vai trò"
                 rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
               >
                 <Select placeholder="Chọn vai trò">
                   <Option value="admin">Quản trị viên (Admin)</Option>
                   <Option value="manager">Quản lý (Manager)</Option>
                   <Option value="staff">Nhân viên (Staff)</Option>
                 </Select>
               </Form.Item>

               <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
                 <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
               </Form.Item>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button onClick={() => navigate('/employees')} size="large">Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" size="large" loading={submitting} className="bg-primary">
                {isEdit ? 'Lưu cập nhật' : 'Tạo nhân viên'}
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default EmployeeForm;

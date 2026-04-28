import React, { useState } from 'react';
import { Form, Input, Button, Card, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import axiosClient from '../../api/axiosClient';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await axiosClient.post('/admin/login', values);

      const { user, access_token: token } = response.data ?? response; // hỗ trợ cả 2 cấu trúc API

      dispatch(setCredentials({ user, token }));
      message.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        'Tài khoản hoặc mật khẩu không chính xác';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Food Admin</h1>
          <p className="text-gray-500">Đăng nhập hệ thống quản lý</p>
        </div>

        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon text-gray-400" />} placeholder="Email" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon text-gray-400" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Button type="primary" htmlType="submit" className="w-full bg-primary" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

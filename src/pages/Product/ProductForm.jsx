import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Switch,
  Upload,
  message,
  Card,
  Row,
  Col,
  Space,
  Spin
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import axiosClient from '../../api/axiosClient';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const { Option } = Select;
const { TextArea } = Input;

// Quill modules for the toolbar
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/admin/categories', { params: { per_page: 100 } });
      setCategories(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/admin/products/${id}`);
      const product = res.data;

      form.setFieldsValue({
        ...product,
        stock: product.quantity,
        original_price: product.old_price,
        status: product.status === 'in_stock',
        is_featured: product.is_featured,
        nutritional_info: product.nutritional_info,
        upload: product.image_url ? [
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: product.image_url,
          }
        ] : [],
      });
      setImageUrl(product.img || product.image_url);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải thông tin sản phẩm!');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category_id', values.category_id);
      formData.append('price', values.price);
      if (values.original_price) formData.append('old_price', values.original_price);
      if (values.discount) formData.append('discount', values.discount);
      if (values.tag) formData.append('tag', values.tag);
      formData.append('unit', values.unit || 'cái');
      if (values.weight) formData.append('weight', values.weight);
      formData.append('quantity', values.stock !== undefined ? values.stock : 0);
      if (values.description) formData.append('description', values.description);
      if (values.nutritional_info) formData.append('nutritional_info', values.nutritional_info);
      formData.append('is_featured', values.is_featured ? 1 : 0);
      formData.append('status', values.status ? 'in_stock' : 'out_of_stock');

      // Handle file upload
      if (values.upload && values.upload.length > 0) {
        // Only append if it's a new file (has originFileObj)
        const file = values.upload[0].originFileObj;
        if (file) {
          formData.append('img', file);
        }
      }

      if (isEdit) {
        // In Laravel, PUT with form-data requires _method=PUT
        formData.append('_method', 'PUT');
        await axiosClient.post(`/admin/products/${id}`, formData);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await axiosClient.post('/admin/products', formData);
        message.success('Thêm sản phẩm thành công!');
      }
      navigate('/products');
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Mock upload logic (Vì chưa rõ API upload hay nhận multipart luôn trên route product)
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Card className="shadow-sm rounded-lg max-w-5xl mx-auto">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              status: true,
              is_featured: false,
              stock: 0,
              discount: 0,
            }}
          >
            <Row gutter={24}>
              <Col xs={24} md={16}>
                {/* Thông tin cơ bản */}
                <Card title="Thông tin cơ bản" className="mb-4 bg-gray-50 bg-opacity-50" bordered={false}>
                  <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                  >
                    <Input placeholder="Ví dụ: Thịt bò Kobe" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="category_id"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                      >
                        <Select placeholder="Chọn danh mục">
                          {categories.map(c => <Option key={c.id} value={c.id}>{c.title}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="tag"
                        label="Nhãn (Tag)"
                      >
                        <Select placeholder="Chọn nhãn" allowClear>
                          <Option value="new">Mới</Option>
                          <Option value="hot">Bán chạy</Option>
                          <Option value="sale">Giảm giá</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="description"
                    label="Mô tả sản phẩm"
                  >
                    <ReactQuill 
                      theme="snow" 
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Nhập mô tả sản phẩm..."
                      className="bg-white rounded"
                    />
                  </Form.Item>

                  <Form.Item
                    name="nutritional_info"
                    label="Thông tin dinh dưỡng"
                  >
                    <ReactQuill 
                      theme="snow" 
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Nhập thông tin dinh dưỡng..."
                      className="bg-white rounded"
                    />
                  </Form.Item>
                </Card>

                {/* Giá và Tồn kho */}
                <Card title="Giá & Kho" className="bg-gray-50 bg-opacity-50" bordered={false}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="price"
                        label="Giá bán (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                      >
                        <InputNumber
                          className="w-full"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="original_price"
                        label="Giá gốc (VNĐ)"
                      >
                        <InputNumber
                          className="w-full"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="stock"
                        label="Số lượng tồn kho"
                        rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }]}
                      >
                        <InputNumber className="w-full" min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="unit"
                        label="Đơn vị tính"
                        rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
                      >
                        <Input placeholder="Ví dụ: kg, hộp, cái" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="weight"
                        label="Khối lượng (gram)"
                      >
                        <InputNumber className="w-full" min={0} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                {/* Ảnh và Trạng thái */}
                <Card title="Cấu hình khác" className="bg-gray-50 bg-opacity-50" bordered={false}>
                  <Form.Item label="Trạng thái" name="status" valuePropName="checked">
                    <Switch checkedChildren="Còn hàng" unCheckedChildren="Hết hàng" />
                  </Form.Item>

                  <Form.Item label="Nổi bật" name="is_featured" valuePropName="checked">
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                  </Form.Item>

                  <Form.Item
                    name="upload"
                    label="Ảnh sản phẩm"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload
                      name="image"
                      listType="picture-card"
                      className="avatar-uploader"
                      maxCount={1}
                      beforeUpload={() => false} // Không upload tự động
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                      </div>
                    </Upload>
                  </Form.Item>
                  {imageUrl && !isEdit && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Ảnh hiện tại:</p>
                      <img src={imageUrl} alt="current" className="w-full max-w-[150px] object-cover rounded border" />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
              <Button onClick={() => navigate('/products')} size="large">Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" size="large" loading={submitting} className="bg-primary">
                {isEdit ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ProductForm;

import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchInput = ({ placeholder = "Tìm kiếm...", onSearch, className = "" }) => {
  return (
    <Input.Search
      placeholder={placeholder}
      allowClear
      enterButton={<SearchOutlined />}
      size="middle"
      onSearch={onSearch}
      className={`max-w-xs ${className}`}
    />
  );
};

export default SearchInput;

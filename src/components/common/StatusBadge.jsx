import React from 'react';
import { Badge } from 'antd';

const StatusBadge = ({ isAvailable, textAvailable = 'Còn hàng', textUnavailable = 'Hết hàng' }) => {
  return (
    <Badge
      color={isAvailable ? 'green' : 'red'}
      text={
        <span className={isAvailable ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
          {isAvailable ? textAvailable : textUnavailable}
        </span>
      }
    />
  );
};

export default StatusBadge;

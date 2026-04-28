import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { App as AntApp } from 'antd';
import router from './routes';

function App() {
  return (
    <AntApp>
      <RouterProvider router={router} />
    </AntApp>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import store from './store';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider 
        theme={{ 
          token: { 
            colorPrimary: '#16a34a', 
            colorSuccess: '#16a34a', 
            borderRadius: 8 
          } 
        }} 
        locale={viVN}
      >
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);

import axios from 'axios';

const locationService = {
  getProvinces: async () => {
    // We use a separate axios instance (native axios) to avoid baseURL and Auth interceptors of axiosClient
    const res = await axios.get('https://provinces.open-api.vn/api/?depth=2');
    return res.data;
  }
};

export default locationService;

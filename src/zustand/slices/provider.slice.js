import axios from 'axios';

const createProviderSlice = (set, get) => ({
  providers: [],
  providerEdit: [],
  fetchProviders: (showAll) => {
    const url = showAll ? '/api/provider/all' : '/api/provider';
    return axios({
      method: 'GET',
      url: url
    })
      .then((response) => {
        // console.log('GET request successful:', response.data);
        set({ providers: response.data });
      })
      .catch((err) => {
        console.log('Error with GET request:', err);
      });
  },
  fetchAdminProviders: (id) => {
    return axios({
      method: 'GET',
      url: `/api/provider/${id}`
    })
      .then((response) => {
        // console.log('GET request successful:', response.data);
        set({ providers: response.data });
      })
      .catch((err) => {
        console.log('Error with GET request:', err);
      });
  },
  editAdminProvider: (id) => {
    return axios({
      method: 'GET',
      url: `/api/provider/edit/${id}`
    })
      .then((response) => {
        // console.log('GET request successful:', response.data);
        set({ providerEdit: response.data });
      })
      .catch((err) => {
        console.log('Error with GET request:', err);
      });
  },
});

export default createProviderSlice;

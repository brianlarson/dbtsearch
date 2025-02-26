import axios from 'axios';

const createProviderSlice = (set, get) => ({
  providers: [],
  providerEdit: [],
  fetchProviders: () => {
    axios({
      method: 'GET',
      url: '/api/provider'
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
    axios({
      method: 'GET',
      url: `/api/provider/${id}`
    })
      .then((response) => {
        console.log('GET request successful:', response.data);
        set({ providers: response.data });
      })
      .catch((err) => {
        console.log('Error with GET request:', err);
      });
  },
  editAdminProvider: (id) => {
    axios({
      method: 'GET',
      url: `/api/provider/edit/${id}`
    })
      .then((response) => {
        console.log('GET request successful:', response.data);
        set({ providerEdit: response.data });
      })
      .catch((err) => {
        console.log('Error with GET request:', err);
      });
  },
});

export default createProviderSlice;

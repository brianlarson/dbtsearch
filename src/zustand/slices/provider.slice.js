import axios from 'axios';

const createProviderSlice = (set, get) => ({
  // providers: [{ "name": 'Brian' }, { "name": 'Mary' }],
  providers: [],
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
  }
});

export default createProviderSlice;

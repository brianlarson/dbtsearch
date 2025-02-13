import axios from 'axios';

const createProviderSlice = (set, get) => ({
  providers: [],
  fetchProviders: () => {
    axios({
      method: 'GET',
      url: '/api/provider'
    })
      .then((response) => {
        console.log('GET request successful:', response.data);
        set(response.data);
      })
      .catch((err) => {
        console.log('Error with GET request:', err);
      });
  }
});

export default createProviderSlice;

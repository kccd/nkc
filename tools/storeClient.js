const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

const formData = new FormData();
formData.append('filesInfo', JSON.stringify({
  avatar: {
    destination: 'resource/picture/2021/11/29485.png',
    time: new Date(`2021-11-09 00:00:00`)
  }
}));
formData.append('avatar', fs.createReadStream('d:/a.png'));

axios.post('http://127.0.0.1:10292', formData, {headers: formData.getHeaders()})
.then(console.log)
.catch(console.log);
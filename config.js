module.exports = {
  web: {
    useHttps: false,
    httpPort: 9000,
    httpsPort: 9000
  },
  socket: {
    useHttps: false,
    httpPort: 8080,
    httpsPort: 8080,
    redirectHttpPort: 8081
  },
  httpsCert: {
    email: '',
    approveDomains: ['www.kechuang.org']
  }
};
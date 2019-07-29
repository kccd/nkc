var app = new Vue({
  el: '#app',
  data: {
    error: '',
    success: false,
    saving: false,
    forced: [],
    server: {
      address: '0.0.0.0',
      port: 9000
    },
    account: {
      username: 'admin',
      password: ''
    },
    mongodb: {
      address: '127.0.0.1',
      port: 27017,
      databaseName: 'kc',
      username: '',
      password: '',
    },
    redis: {
      address: '127.0.0.1',
      port: 6379,
      password: '',
    },
    elasticSearch: {
      address: '127.0.0.1',
      port: 9200,
      username: '',
      password: '',
      articlesIndex: 'kc_articles',
      usersIndex: 'kc_users',
    }
  },
  mounted: function() {

  },
  methods: {
    save: function() {
      this.error = '';
      this.saving = true;
      nkcAPI('/save', 'POST', {
        account: this.account,
        mongodb: this.mongodb,
        elasticSearch: this.elasticSearch,
        redis: this.redis,
        server: this.server,
        forced: this.forced.length !== 0
      })
        .then(function() {
          app.success = true;
        })
        .catch(function(data) {
          app.error = data.error || data;
          app.saving = false;
        })
    }
  }
});
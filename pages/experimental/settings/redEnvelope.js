var app = new Vue({
  el: '#app',
  data: {
    random: {
      close: false,
      awards: []
    },
    draftFee: {
      close: false,
      defaultCount: 1,
      minCount: 1,
      maxCount: 5
    },
    share: {}
  },
  mounted: function() {
    // var data = document.getElementById('data');
    var data = this.$refs.data;
    data = JSON.parse(data.innerText);
    this.random = data.redEnvelopeSettings.random;
    this.draftFee = data.redEnvelopeSettings.draftFee;
    var arr = [];
    var obj = {};
    var s;
    for(var key in data.redEnvelopeSettings.share) {
      if (!data.redEnvelopeSettings.share.hasOwnProperty(key)) continue;
      s = data.redEnvelopeSettings.share[key];
      s.id = key;
      arr[s.order-1] = s;
    }
    for(var i = 0; i < arr.length; i++) {
      s = arr[i];
      obj[s.id] = s;
      delete s.id;
    }
    this.share = obj;
    // this.share = data.redEnvelopeSettings.share;
    if(this.random.awards.length === 0) {
      this.random.awards = [{
        name: '',
        kcb: '',
        chance: '',
        float: ''
      }];
    }
  },
  methods: {
    remove: function(index) {
      this.random.awards.splice(index, 1);
    },
    add: function(index) {
      this.random.awards.splice(index+1, 0, {
        name: '',
        kcb: '',
        chance: '',
        float: ''
      });
    },
    save: function(){
      if(this.random.close === 'false') {
        this.random.close = false;
      }
      if(this.random.close === 'true') {
        this.random.close = true;
      }
      if(this.draftFee.close === 'false') {
        this.draftFee.close = false;
      }
      if(this.draftFee.close === 'true') {
        this.draftFee.close = true;
      }
      var data = {
        random: this.random,
        draftFee: this.draftFee,
        share: this.share
      };
      nkcAPI('/e/settings/red-envelope',  'PATCH', data)
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  }
});
var app = new Vue({
  el: '#app',
  data: {
    forum: '',
    roles: [],
    permission: [],
    grades: [],
    operations: []
  },
  computed: {
    operationsId: function() {
      var arr = [];
      for(var i = 0; i < this.operations.length; i++) {
        arr.push(this.operations[i].name);
      }
      return arr;
    }
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    this.forum = data.forum;
    this.roles = data.roles;
    this.operations = data.operations;
    this.grades = data.grades;
    this.permission = data.permission;
  },
  methods: {
    selectAll: function(p) {
      if(p.operationsId.length === this.operationsId.length) {
        p.operationsId = [];
      } else {
        p.operationsId = this.operationsId;
      }
    }
  }
});
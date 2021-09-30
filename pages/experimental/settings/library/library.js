var data = NKC.methods.getDataById("data");
var rolesObj = {}, gradesObj = {};
var libSettings = data.librarySettings;
var permission = libSettings.permission;
var roles = permission.roles;
var grades = permission.grades;
for(var i = 0; i < roles.length; i++) {
  var r = roles[i];
  rolesObj[r._id] = r;
}
for(var i = 0; i < grades.length; i++) {
  var g = grades[i];
  gradesObj[g._id] = g;
}
var permissionRoles = [], permissionGrades = [];
for(var i = 0; i < data.roles.length; i++) {
  var r = data.roles[i];
  var r_ = rolesObj[r._id];
  if(r_) {
    permissionRoles.push(r_);
  } else {
    permissionRoles.push({
      _id: r._id,
      operations: []
    });
  }
}
for(var i = 0; i < data.grades.length; i++) {
  var g = data.grades[i];
  var g_ = gradesObj[g._id];
  if(g_) {
    permissionGrades.push(g_);
  } else {
    permissionGrades.push({
      _id: g._id,
      operations: []
    });
  }
}

var app = new Vue({
  el: "#app",
  data: {
    libSettings: data.librarySettings,
    grades: permissionGrades,
    roles: permissionRoles,
    libraryTip: data.librarySettings.libraryTip
  },
  methods: {
    getNameById: function(type, id) {
      if(type === "role") {
        for(var i = 0; i < data.roles.length; i++) {
          var r = data.roles[i];
          if(r._id === id) return r.displayName;
        }
      } else {
        for(var i = 0; i < data.grades.length; i++) {
          var r = data.grades[i];
          if(r._id === id) return r.displayName;
        }
      }
    },
    selectAll: function(r) {
      if(r.operations.length === 8) {
        r.operations = [];
      } else {
        r.operations = getAllOperations();
      }
    },
    submit: function() {
      nkcAPI("/e/settings/library", "PUT", {
        roles: this.roles,
        grades: this.grades,
        libraryTip: this.libraryTip
      })
        .then(function() {
          sweetSuccess("提交成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});


function getAllOperations() {
  var names = ["Folder", "File"];
  var operation = ["modify", "delete", "move", "create"];
  var arr = [];
  for(var i = 0; i < names.length; i++) {
    for(var j = 0; j < operation.length; j++) {
      arr.push(operation[j] + names[i]);
    }
  }
  return arr;
}

Object.assign(window, {
  rolesObj,
  gradesObj,
  libSettings,
  permission,
  roles,
  grades,
  permissionRoles,
  app,
  getAllOperations,
})

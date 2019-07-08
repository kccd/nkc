var checkbox;
var checkboxBody;
$(function() {
  checkbox = $(".post-checkbox input[type='checkbox']");
  checkboxBody = $(".post-checkbox label");
  console.log(21222222222222)
  if(window.moduleToColumn) {
    moduleToColumn.init();
  }
});
function managementPosts() {
  var btn = $("a.button[onclick='managementPosts()']");
  if(btn.hasClass("radius-right")) {
    btn.removeClass("radius-right");
  } else {
    btn.addClass("radius-right");
  }
  checkboxBody.toggle();
  $(".post-management-button").toggle();
}

function selectAll() {
  var total = checkbox.length;
  var checked = 0;
  for(var i = 0; i < total; i++) {
    if(checkbox.get(0).checked) {
      checked++;
    }
  }
  if(total === checked) {
    checkbox.prop("checked", false);
  } else {
    checkbox.prop("checked", true);
  }
}

function toColumn() {
  var pid = [];
  for(var i = 0; i < checkbox.length; i++) {
    if(checkbox.get(i).checked) {
      var id = checkbox.eq(i).attr("data-pid");
      pid.push(id);
    }
  }
  if(pid.length === 0) return;
  moduleToColumn.show(function(data) {
    var categoriesId = data.categoriesId;
    var columnId = data.columnId;
    nkcAPI("/m/" + columnId + "/post", "POST", {
      categoriesId: categoriesId,
      type: "addToColumn",
      postsId: pid
    })
      .then(function() {
        screenTopAlert("操作成功");
        moduleToColumn.hide();
      })
      .catch(function(data) {
        screenTopWarning(data);
      });
  }, {
    selectMul: true
  });
}
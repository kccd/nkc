$(function() {
  moduleToColumn.init();
});
function setPerpage() {
  var dom = $("#perpage");
  var columnId = dom.attr("data-column-id");
  var perpage = dom.val();
  perpage = parseInt(perpage);
  if(isNaN(perpage) || perpage < 1) perpage = "";
  openToNewLocation("/m/" + columnId + "/settings/post/add?c=" + perpage);
}

function showInfo(tid) {
  var dom = $(".column-thread-info[data-info-tid='"+tid+"']");
  dom.toggle();
}

function showAll() {
  var dom = $(".column-thread-info");
  var total = dom.length;
  var show = 0;
  for(var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    if(d.css("display") !== "none") {
      show++;
    }
  }
  if(show === total) {
    dom.hide();
  } else {
    dom.show();
  }
}

function selectAll() {
  var dom = $("input[type='checkbox']");
  var total = dom.length;
  var selected = 0;
  for(var i = 0; i < total; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) selected ++;
  }
  if(total === selected) {
    dom.prop("checked", false);
  } else {
    dom.prop("checked", true);
  }
}

function selectMark() {
  var dom = $("input[type='checkbox']");
  var postsId = [];
  for(var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) {
      postsId.push(d.attr("data-thread-oc"));
    }
  }
  if(postsId.length === 0) return;
  moduleToColumn.show(function(data) {
    var categoriesId = data.categoriesId;
    var columnId = data.columnId;
    nkcAPI("/m/" + columnId + "/post", "POST", {
      postsId: postsId,
      categoriesId: categoriesId,
      type: "addToColumn"
    })
      .then(function() {
        screenTopAlert("操作成功");
        moduleToColumn.hide();
      })
      .catch(function(data) {
        screenTopWarning(data);
      })
  }, {
    selectMul: true
  })
}
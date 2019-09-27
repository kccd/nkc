/*
* 删除单篇草稿
* */

function removeDraft(did) {
  nkcAPI('/u/' + NKC.configs.uid + "/drafts/" + did, "DELETE")
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })
}
function removeDraftSingle(did) {
  sweetQuestion("确定要删除当前草稿？删除后不可恢复。")
    .then(function() {
      removeDraft(did);
    })
    .catch(function() {})
}
/*
* 清空草稿箱
* */
function removeAll() {
  sweetQuestion("确定要删除全部草稿？删除后不可恢复。")
    .then(function() {
      removeDraft("all");
    })
    .catch(function(){})
}

function getInputs() {
  return $(".draft-checkbox input");
}

function getSelectedDraftsId() {
  var arr = [];
  var dom = getInputs();
  for(var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) {
      arr.push(d.attr("data-did"));
    }
  }
  return arr;
}

function selectAll() {
  var selectedDraftsId = getSelectedDraftsId();
  var dom = getInputs();
  if(selectedDraftsId.length !== dom.length) {
    dom.prop("checked", true);
  } else {
    dom.prop("checked", false);
  }
}

function removeSelectedDrafts() {
  var selectedDraftsId = getSelectedDraftsId();
  if(!selectedDraftsId.length) return;
  var did = selectedDraftsId.join("-");
  sweetQuestion("确定要删除已勾选的草稿？删除后不可恢复。")
    .then(function() {
      removeDraft(did);
    })
    .catch(function() {})
}
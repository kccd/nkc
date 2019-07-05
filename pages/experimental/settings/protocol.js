$("document").ready(function() {
  $(".w-e-text-container").css("height", "450px")
  //编辑器缩放
	if($(".w-e-text-container").length === 0) return;
  $(".w-e-text-container").resizable({
    containment: '#body',
    minHeight: 100,
    minWidth: 100,
    maxWidth: 1400
  });
})

function test() {
  var content = document.getElementById("text-elem").innerHTML;
  content = common.URLifyHTML(content);
}

// 新增协议
function addProtocol() {
  try{
    var post = getProtocol();
  }catch(err) {
    return screenTopWarning(err)
  }
  nkcAPI("/e/settings/protocol", "POST", post)
  .then(function(data) {
    screenTopAlert("保存成功");
    // window.location.href = '/e/settings/protocol/' + data.protocolTypeId;
    openToNewLocation('/e/settings/protocol/' + data.protocolTypeId);
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
}

// 跳转到协议修改页
function turnProtocolUpdate(id) {
  openToNewLocation("/e/settings/protocol/"+id+"?visitType=update");
  // window.location.href = "/e/settings/protocol/"+id+"?visitType=update";
}

// 修改协议
function updateProtocol(id) {
  try{
    var post = getProtocol();
  }catch(err) {
    return screenTopWarning(err)
  }
  post.id = id;
  nkcAPI("/e/settings/protocol/"+id, "PATCH", post)
  .then(function(data) {
    screenTopAlert("保存成功");
    openToNewLocation('/e/settings/protocol/' + data.protocolTypeId);
    // window.location.href = '/e/settings/protocol/' + data.protocolTypeId;
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
}

// 删除当前协议
function deleteProtocol(id) {
  var post = {id: id};
  var sureDel = confirm("是否删除当前协议？");
  if(sureDel) {
    nkcAPI("/e/settings/protocol/"+id, "POST", post)
    .then(function(data) {
      screenTopAlert("该协议已删除");
      openToNewLocation(/e/settings/protocol);
      // window.location.href = "/e/settings/protocol"
    })
    .catch(function(data) {
      screenTopWarning(data || data.error);
    })
  }
}

// 获取当前协议
function getProtocol() {
  var protocolName = $("#protocolName").val();
  if(!protocolName) throw("请填写协议名称");
  var protocolTypeId = $("#protocolTypeId").val();
  if(!protocolTypeId) throw("请使用小写英文填写协议类型ID");
  var protocolTypeName = $("#protocolTypeName").val();
  if(!protocolTypeName) throw("请使用中文填写协议类型名称");
  var protocolContent = document.getElementById("text-elem").innerHTML;
  protocolContent = common.URLifyHTML(protocolContent);
  var post = {
    protocolName: protocolName,
    protocolTypeId: protocolTypeId,
    protocolTypeName: protocolTypeName,
    protocolContent: protocolContent
  }
  return post;
}
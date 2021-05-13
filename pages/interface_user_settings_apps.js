$(document).ready(function(){

  // 如果不添加水印，则不可选中其他select
  $('input[type=radio][name=isWater]').change(function() {
    if (this.value == 'no') {
      $('#waterStyle').attr("disabled", "disabled");
      $('#waterGravity').attr("disabled", "disabled");
    }
    else{
      $('#waterStyle').removeAttr("disabled");
      $('#waterGravity').removeAttr("disabled");
    }
  });

  var isWaterVal = $('input:radio[name="isWater"]:checked').val();
  if(isWaterVal == "no"){
    $('#waterStyle').attr("disabled", "disabled");
    $('#waterGravity').attr("disabled", "disabled");
  };

  // var isPay = $("#isPay").attr("data");
  // if(isPay === "true"){
  //   $("#isPay").show();
  // }else{
  //   $("#payForWater").show()
  // }

})


// 改变添加水印方式，更换示例图片
function changeWaterStyle(para){
  console.log($("#waterStyle option:selected").attr("data"))
}


// 改变水印位置，更换示例图片
function changeWaterPosition(){
  console.log($("#waterGravity option:selected").attr("data"))
}


// 提交修改
function submit(uid) {
  var optionArr = {};
  var isWaterBool;
  var isWaterValue = $('input:radio[name="isWater"]:checked').val();
  if(isWaterValue == "yes"){
    isWaterBool = true;
  }else{
    isWaterBool = false;
  }
  var waterStyleValue = $("#waterStyle option:selected").attr("data");
  var waterGravityValue = $("#waterGravity option:selected").attr("data")
  optionArr = {
    type: "save",
    waterAdd: isWaterBool,
    waterStyle: waterStyleValue,
    waterGravity: waterGravityValue
  }
  nkcAPI('/u/'+uid+'/settings/water', 'PUT', optionArr)
    .then(function(){
      sweetSuccess('修改成功');
    })
    .catch(function(data) {
      sweetError(data);
    })
}

// 检测是否已经购买过不打水印的服务
function isAlreadyPay(info){
  if(!info){
    $("#payForWater").show();
    $("#radio2").prop("checked",false);
    $("#radio1").prop("checked",true);
  }
}

// 展示付费提醒
function showButton(){
  $("#payForWater").show()
}

// 隐藏付费提醒
function hideButton(){
  $("#payForWater").hide()
}

// 付费提示
function yesPayForWater(uid){
  nkcAPI('/u/'+uid+'/settings/water', 'PUT', {
    type: "pay"
  })
    .then(function(){
      sweetSuccess('修改成功');
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
      hideButton();
    })
}

//不买
function noPayForWater(){
  hideButton();
  $("#radio1").attr("checked",true)
}

// 切换示例图片
function turnImg(){
  // console.log($("#waterGravity").val())
  // var newImg = "< img src='/default/"+$("#waterGravity").val()+".jpg' style='width: 100%;'>"
  // $("#exampleImg").html(newImg)
  $("#newImg").attr("src","/default/"+$("#waterStyle").val()+$("#waterGravity").val()+".jpg");
  app.waterSetting.waterStyle = $("#waterStyle").val();
  app.waterSetting.waterGravity = $("#waterGravity").val();
}

var data = NKC.methods.getDataById("data");

NKC.methods.initSelectColor();

function saveAppInfo() {
  var homeThreadList = $("input[name='homeThreadList']");
  if(homeThreadList.eq(0).prop("checked")) {
    homeThreadList = "home";
  } else if(homeThreadList.eq(1).prop("checked")) {
    homeThreadList = "latest";
  } else {
    homeThreadList = "subscribe";
  }
  var showEnvelope = $("input[name='envelope']");
  showEnvelope = showEnvelope.eq(0).prop("checked");
  var selectTypesWhenSubscribe = $("input[name='selectTypes']");
  selectTypesWhenSubscribe = selectTypesWhenSubscribe.eq(0).prop("checked");
  var color = $("input[data-control='selectColor']");
  color = color.val();
  nkcAPI("/u/" + data.user.uid + "/settings/apps", "PUT", {
    homeThreadList: homeThreadList,
    color: color,
    showEnvelope: showEnvelope,
    selectTypesWhenSubscribe: selectTypesWhenSubscribe
  })
    .then(function() {
      sweetSuccess("保存成功");
    })
    .catch(function(data) {
      sweetError(data);
    })
}

var app = new Vue({
  el: '#watermarkApp',
  data: {
    waterSetting: data.waterSetting,
    noWatermark: data.noWatermark,
    columnName: data.columnName,
    username: data.user.username,
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
  },
  computed: {
    watermarkFile: function() {
      var file = {};
      if(this.waterSetting.waterStyle === 'siteLogo') {
        var normalAttachId = this.noWatermark.file.normalAttachId;
        if(normalAttachId) {
          file.url = this.getUrl('watermark', normalAttachId);
        } else {
          file.url = this.getUrl('defaultFile', 'watermark_normal.png')
        }
        file.size = 'normal';
      } else {
        var smallAttachId = this.noWatermark.file.smallAttachId;
        if(smallAttachId) {
          file.url = this.getUrl('watermark', smallAttachId);
        } else {
          file.url = this.getUrl('defaultFile', 'watermark_small.png');
        }
        file.size = 'small';
      }
      return file;
    },
    watermarkName: function() {
      if(this.waterSetting.waterStyle === 'userLogo') {
        return this.username;
      } else if(this.waterSetting.waterStyle === 'coluLogo') {
        return this.columnName;
      }
    }
  }
});

Object.assign(window, {
  changeWaterStyle,
  changeWaterPosition,
  submit,
  isAlreadyPay,
  showButton,
  hideButton,
  yesPayForWater,
  noPayForWater,
  turnImg,
  saveAppInfo,
  app,
});

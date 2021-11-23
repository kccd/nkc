$(document).ready(function(){

  // 如果不添加水印，则不可选中其他select
  $('input[type=radio][name=isWater]').change(function() {
    if (this.value == 'no') {
      $('#pictureWaterStyle').attr("disabled", "disabled");
      $('#pictureWaterGravity').attr("disabled", "disabled");
    }
    else{
      $('#pictureWaterStyle').removeAttr("disabled");
      $('#pictureWaterGravity').removeAttr("disabled");
    }
  });

  var isWaterVal = $('input:radio[name="isWater"]:checked').val();
  if(isWaterVal == "no"){
    $('#pictureWaterStyle').attr("disabled", "disabled");
    $('#pictureWaterGravity').attr("disabled", "disabled");
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
  console.log($("#pictureWaterStyle option:selected").attr("data"))
}


// 改变水印位置，更换示例图片
function changeWaterPosition(){
  console.log($("#pictureWaterGravity option:selected").attr("data"))
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
  var pictureWaterStyleValue = $("#pictureWaterStyle option:selected").attr("data");
  var pictureWaterGravityValue = $("#pictureWaterGravity option:selected").attr("data")
  var videoWaterStyleValue = $("#videoWaterStyle option:selected").attr("data");
  var videoWaterGravityValue = $("#videoWaterGravity option:selected").attr("data")
  optionArr = {
    type: "save",
    waterAdd: isWaterBool,
    pictureWaterStyle: pictureWaterStyleValue,
    pictureWaterGravity: pictureWaterGravityValue,
    videoWaterStyle: videoWaterStyleValue,
    videoWaterGravity: videoWaterGravityValue
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

// 切换图片水印示例图片
function turnPictureImg(){
  // console.log($("#pictureWaterGravity").val())
  // var newImg = "< img src='/default/"+$("#pictureWaterGravity").val()+".jpg' style='width: 100%;'>"
  // $("#exampleImg").html(newImg)
  // $("#newImg").attr("src","/default/"+$("#pictureWaterStyle").val()+$("#pictureWaterGravity").val()+".jpg");
  app.waterSetting.picture.waterStyle = $("#pictureWaterStyle").val();
  app.waterSetting.picture.waterGravity = $("#pictureWaterGravity").val();
}

// 切换视频水印示例图片
function turnVideoImg(){
  // console.log($("#pictureWaterGravity").val())
  // var newImg = "< img src='/default/"+$("#pictureWaterGravity").val()+".jpg' style='width: 100%;'>"
  // $("#exampleImg").html(newImg)
  // $("#newImg").attr("src","/default/"+$("#videoWaterStyle").val()+$("#videoWaterGravity").val()+".jpg");
  app.waterSetting.video.waterStyle = $("#videoWaterStyle").val();
  app.waterSetting.video.waterGravity = $("#videoWaterGravity").val();
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
    user: data.user,
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    getAppsWatermark(type){
      if(type === 'picture') {
        return `/wm/${this.user.uid}?type=` + type + '&style=' + this.waterSetting.picture.waterStyle + '&time=' + Date.now();
      } else {
        return `/wm/${this.user.uid}?type=` + type + '&style=' + this.waterSetting.video.waterStyle + '&time=' + Date.now();
      }
    }
  },
  computed: {
    pictureWatermarkFile: function() {
      var file = {};
      if(this.waterSetting.picture.waterStyle === 'siteLogo') {
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
    videoWatermarkFile: function() {
      var file = {};
      if(this.waterSetting.video.waterStyle === 'siteLogo') {
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
    pictureWatermarkName: function() {
      if(this.waterSetting.picture.waterStyle === 'userLogo') {
        return this.username;
      } else if(this.waterSetting.picture.waterStyle === 'coluLogo') {
        return this.columnName;
      }
    },
    videoWatermarkName: function() {
      if(this.waterSetting.video.waterStyle === 'userLogo') {
        return this.username;
      } else if(this.waterSetting.video.waterStyle === 'coluLogo') {
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
  turnPictureImg,
  turnVideoImg,
  saveAppInfo,
  app,
});

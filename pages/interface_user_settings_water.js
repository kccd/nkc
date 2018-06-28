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

  var isPay = $("#isPay").attr("data");
  if(isPay === "true"){
    $("#isPay").show();
  }else{
    $("#payForWater").show()
  }

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
	nkcAPI('/u/'+uid+'/settings/water', 'PATCH', optionArr)
		.then(function(){
      screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

// 检测是否已经购买过不打水印的服务
function isAlreadyPay(info){
  if(!info){
    $("#payForWater").show();
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
  optionArr = {
    type: "pay"
  }
	nkcAPI('/u/'+uid+'/settings/water', 'PATCH', optionArr)
		.then(function(){
			screenTopAlert('购买成功');
      window.location.reload();
		})
		.catch(function(data) {
      screenTopWarning(data.error || data);
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
  $("#newImg").attr("src","/default/"+$("#waterGravity").val()+".jpg");
}
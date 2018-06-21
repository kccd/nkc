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
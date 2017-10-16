var areaCode = '+86';
//选择国际区号
function chooseCountryNum(num){
  areaCode = parseInt(num);
}

function error_report(str){
  geid('error_info').innerHTML = '<strong style="color:red;">'+str+'</strong>';
  display('error_info_panel');  //下面的提示框
  screenTopWarning(str);
}

function info_report(str){
  geid('error_info').innerHTML = '<strong style="color:#4169E1;">'+str+'</strong>';
  display('error_info_panel');  //下面的提示框
  screenTopWarning(str);
}




function register_submit(){
  return Promise.resolve()
  .then(function(){
    var userobj={
      username : gv('username'),
      password : gv('password'),
      password2 : gv('password2'),
      regCode: gv('regCode'),
      phone:gv('phone'),
      mcode:gv('mcode'),
      areaCode: areaCode
      /*,
      icode:gv('icode')*/
    }

    if(userobj.username == ''){
      getFocus("#username")
      throw({detail:'请填写用户名！'})
      return
    }
    if(userobj.password == ''){
      getFocus("#password")
      throw({detail:'请填写密码！'})
      return;
    }
    if(userobj.password2 == ''){
      getFocus("#password2")
      throw({detail:'请再次填写密码！'})
      return;
    }
    if(userobj.password.length < 8){
      getFocus("#password")
      throw({detail:'密码长度要大于8位，请重新填写！'})
      return;
    }
    if(checkPass(userobj.password) < 2){
      getFocus("#password")
      throw({detail:'密码要具有数字、字母和符号三者中的至少两者！'})
      return;
    }
    if(userobj.password2!==userobj.password){
      getFocus("#password2")
      throw({detail:'两遍密码不一致！'})
      return;
    }
    if(userobj.regCode === '') {
      getFocus('#regCode');
      throw({detail: '请输入注册码'});
      return
    }
    if(userobj.phone == ''){
      getFocus("#phone")
      throw({detail:'请填写手机号码！'})
      return;
    }
    if(!(/(^[1-9]\d*$)/.test(userobj.phone))){
      getFocus("#phone")
      throw({detail:'手机号码格式不正确！'})
      return;
    }
    /*if(userobj.phone.length !== 11)
    {
      getFocus("#phone")
      throw({detail:'手机号码格式不正确！'})
      return;
    }*/
    if(userobj.mcode == ''){
      getFocus("#mcode")
      throw({detail:'请填写手机验证码！'})
      return;
    }
   /* if(userobj.icode == ''){
      getFocus("#icode")
      throw({detail:'请填写图片验证码！'})
      return;
    }*/
    return nkcAPI('userPhoneRegister',userobj)
  })
  .then(function(result){
    info_report('注册成功！5s后跳转到登录页面')
    setTimeout(function(){
      window.location = '/login'
    },5000)

  })
  .catch(function(err){
    console.log(err)
    if(err.detail == '用户名已存在，请输入其他用户名'){
      //refreshICode();
      getFocus("#username")
    }
    if(err.detail == '验证注册码失败，请检查！'){
      //refreshICode();
      getFocus("#regCode")
    }
    if(err.detail === '答卷的注册码过期，可能要重新参加考试') {
      //refreshICode();
      getFocus('#regCode')
    }
    if(err.detail == '手机验证码不正确，请检查'){
      //refreshICode();
      getFocus("#mcode")
    }
   /* if(err.detail == '图片验证码不正确，请检查'){
      //refreshICode();
      getFocus("#icode")
    }*/
    if(err.detail == '此号码已经用于其他用户注册，请检查或更换'){
      //refreshICode();
      getFocus("#phone")
    }
    error_report(err.detail);
  })

}


function getMcode(){
  var phone = geid('phone').value.trim();
  var username = geid('username').value.trim();
  var password = geid('password').value.trim();
  var password2 = geid('password2').value.trim();
  /*var icode = geid('icode').value.trim();*/
  var regCode = gv('regCode').trim();

  if(username == ''){
    getFocus("#username")
    return error_report('请填写用户名！')
  }
  if(password == ''){
    getFocus("#password")
    return error_report('请填写密码！')
  }
  if(password2 == ''){
    getFocus("#password2")
    return error_report('请再次填写密码！')
  }
  if(phone == ''){
    getFocus("#phone")
    return error_report('请填写手机号码！')
  }
  if(!(/(^[1-9]\d*$)/.test(phone))){
    getFocus("#phone")
    return error_report('手机号码格式不正确！')
  }
  /*if(phone == '' || phone.length !== 11 )
  {
    getFocus("#phone")
    return error_report('手机号码为空或者格式不正确！')
  }*/
 /* if(icode == ''){
    getFocus("#icode")
    return error_report('请填写图片验证码！')
  }*/
  if(regCode === '') {
    getFocus('#regCode');
    return error_report('请填写注册码')
  }

  else{
    nkcAPI('getMcode',{phone:phone/*, icode:icode*/, regCode: regCode, areaCode: areaCode})
    .then(function(res){
      var count = 120;
      var countdown = setInterval(CountDown, 1000);
      function CountDown() {
          $("#getMcode").attr("disabled", true);
          $("#getMcode").text(count + "秒后可重发");
          if (count == 0) {
              $("#getMcode").text("获取手机验证码");
              $("#getMcode").val("Submit").removeAttr("disabled");
              clearInterval(countdown);
          }
          count--;
      }
    })
    .catch(function(err){
      if(err.detail == '手机验证码不正确，请检查'){
        //refreshICode();
        getFocus("#mcode")
      }
     /* if(err.detail == '图片验证码不正确，请检查'){
        //refreshICode();
        getFocus("#icode")
      }*/
      if(err.detail == '此号码已经用于其他用户注册，请检查或更换'){
        //refreshICode()
        getFocus("#phone")
      }
      if(err.detail === '验证注册码失败，请检查！'){
        //refreshICode()
        getFocus("#regCode")
      }
      if(err.detail === '答卷的注册码过期，可能要重新参加考试') {
        //refreshICode();
        getFocus('#regCode')
      }
      error_report(err.detail);
    })
  }
}


/*function refreshICode() {
  nkcAPI('//refreshICode')
    .then(function(res) {
      $('#icodeImg').attr('src', '/static/captcha/captcha.svg?' + Math.random())
    })
}*/

//点击刷新图片验证码
/*
$(document).ready(function() {
	 $("#icodeImg").click(//refreshICode)
})
*/


function getFocus(a){
  $(a).css('border-color','#f88')
  $(a).focus()
  $(a).blur(function(){
    $(a).css('border-color','')
  })
}


//检查密码复杂度
function checkPass(s){
   var ls = 0;
   if(s.match(/([a-zA-Z])+/)){
      ls++;
   }
   if(s.match(/([0-9])+/)){
      ls++;
   }
   if(s.match(/[^a-zA-Z0-9]+/)){
      ls++;
   }
   return ls
 }

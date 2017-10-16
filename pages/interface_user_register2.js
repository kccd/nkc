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
      regCode: gv('regCode'),
      password : gv('password'),
      password2 : gv('password2'),
      email:gv('email'),
      /*icode:gv('icode'),*/
      regCode: gv('regCode')
    };

    if(userobj.username == ''){
      getFocus("#username")
      throw({detail:'请填写用户名！'})
      return;
    }
    if(userobj.regCode === '') {
      getFocus('#regCode');
      throw({detail: '请输入注册码'})
      return;
    }
    if(userobj.email == ''){
      getFocus("#email")
      throw({detail:'请填写邮箱地址！'})
      return;
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
    /*if(userobj.icode == ''){
      //refreshICode();
      getFocus("#icode");
      throw({detail:'请填写图片验证码！'})
      return;
    }*/
    if( !userobj.email.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/) ){
      getFocus("#email")
      //refreshICode();
      throw({detail:'邮箱格式不正确！'})
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
      throw {detail: '请输入注册码'};
      return
    }

    return nkcAPI('userMailRegister',userobj)

  })
  .then(function(result){
    nkcAPI('//refreshICode')  //再刷新一次图片验证码
    .then(function(res){
      //$("#icodeImg").attr("src","/static/captcha/captcha.svg?"+ Math.random() );
    })
    info_report('注册邮件发送成功，请点击邮件链接来激活您的账户！')
  })
  .catch(function(err){
    if(err.detail == '此用户名已存在，请更换一个'){
      //refreshICode();
      getFocus("#username")
    }
    if(err.detail == '此邮箱已注册过，请检查或更换'){
      //refreshICode();
      getFocus("#email")
    }
    /*if(err.detail == '图片验证码不正确，请检查'){
      //refreshICode();
      getFocus("#icode")
    }*/
    error_report(err.detail);
  })

}

/*function refreshICode() {
  nkcAPI('//refreshICode')
    .then(function(res) {
      $('#icodeImg').attr('src', '/static/captcha/captcha.svg?' + Math.random())
    })
}*/

//点击刷新图片验证码
/*$(document).ready(function() {
	 $("#icodeImg").click(//refreshICode)
});*/



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

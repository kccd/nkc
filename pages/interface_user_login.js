function login_submit(){
  var userobj={
    username : gv('username'),
    password : gv('password'),
  }

  if(userobj.username=='')
  return screenTopWarning('请填写用户名，下次不要忘了哦');
  if(userobj.password=='')
  return screenTopWarning('请填写密码，下次不要忘了哦');

  nkcAPI('userLogin',userobj)
  .then(function(res){
    //geid('error_info').innerHTML = JSON.stringify(res);
    //display('error_info_panel')  登录成功不用提示
    if(
      document.referrer.toString().indexOf('register')>=0 ||
      document.referrer.toString().indexOf('logout')>=0 ||
      document.referrer.toString().indexOf('login')>=0 ||
      document.referrer == ""
    )
    {
      location.href = '/'; //dont go back to register form
    }else{
      //alert(document.referrer)
      if(document.referrer.match('127.0.0.1:1086') || document.referrer.match('bbs.kechuang.org') ){
        location.href = '/';
      }else{
        location.href = document.referrer; //go back in history
      }
    }
  })
  .catch(function(err){
    geid('error_info').innerHTML = '<strong style="color:red;">'+err.detail+'</strong>';
    display('error_info_panel');
    geid('password').focus();
    //console.log(JSON.stringify(err));
    screenTopWarning(err.detail);
  })
}

function username_keypress(){
  e = event ? event :(window.event ? window.event : null);
  if(e.keyCode===13||e.which===13)
  geid('password').focus();
}

function password_keypress(){
  e = event ? event :(window.event ? window.event : null);
  if(e.keyCode===13||e.which===13)
  login_submit();
}

geid('username').focus();

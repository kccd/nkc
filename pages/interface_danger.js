var DangerEditor = (function(){
  var me = {}
  me.inputid=geid('DocID')
  me.inputcontent=geid('DocJSON')

  me.btnload=geid('LoadDoc')
  me.btnsubmit=geid('SaveDoc')
  me.btnLoadFromUsername=geid('LoadDocAsUsername')
  me.btnLoadMobile = geid('loadMobile');
  me.btnloadforum = geid('LoadDocFromSelection')

  me.btnban=geid('BanThisUser')

  me.btnrunaql=geid('runAQL')
  me.aqltext = geid('AQL')
  me.aqlresult = geid('AQLresult')

  me.init = function(){
    console.log('Danger init...');

    me.btnload.addEventListener('click',me.load);
    me.btnLoadFromUsername.addEventListener('click',me.loadFromUsername);
    me.btnLoadMobile.addEventListener('click', me.loadMobile);
    me.btnsubmit.addEventListener('click',me.submit);
    me.inputid.addEventListener('keypress', me.onkeypressID);

    me.btnban.addEventListener('click',me.BanThisUser);
    me.btnloadforum.addEventListener('click',me.loadforum);

    me.btnrunaql.addEventListener('click',me.runaql);

    var jsoneditorContainer = geid('jsoneditor')
    var opts = {}
    me.editor = new JSONEditor(jsoneditorContainer,opts)

    me.editor.set(JSON.parse(me.inputcontent.value))
  }

  me.load = function(id){
    window.location = '/danger?id=' + ((typeof id=='string'?id:null)||me.inputid.value.trim())
  }

  me.loadFromUsername=function(){
    window.location = '/danger?username=' +　me.inputid.value.trim()
  }

  me.loadMobile = function() {
    window.location = '/danger?info=' + me.inputid.value.trim()
  };

  me.submit=function(){
    try{
      var doc = me.editor.get()
    }catch(e){
      jwarning(e)
      return
    }

    nkcAPI('dangerouslyReplaceDoc',{doc:doc})
    .then(jalert)
    .catch(jwarning)
  }
  me.BanThisUser =function(){
    var doc = me.editor.get()
    if (doc._id.indexOf('users/')>=0){
      doc.certs=['banned'];

      nkcAPI('dangerouslyReplaceDoc',{doc:doc})
      .then(jalert)
      .catch(screenTopWarning)
    }else{
      screenTopWarning('not a user')
    }
  }

  me.onkeypressID= function(){
    e = event ? event :(window.event ? window.event : null);
    if(e.keyCode===13||e.which===13)

    me.load()
  }

  me.loadforum= function(){
    var targetforum = gv('TargetForum').trim().split(':')
    if(targetforum.length!==2)return screenTopWarning('请选择一个目标')
    targetforum = targetforum[0]

    me.load('forums/' + targetforum)
  }

  me.runaql=function(){
    jalert('AQL running...')
    nkcAPI('runAQL',{query:me.aqltext.value})
    .then(function(res){
      jalert('AQL done')

      me.aqlresult.innerHTML = '<pre><code>' + JSON.stringify(res,null,2) + '</code></pre>'
    })
    .catch(function(err){
      jwarning(err)
    })
  }
  return me
})()

DangerEditor.init()

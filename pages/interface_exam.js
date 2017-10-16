
function submit(){
  var sheet = [];
  var number_of_questions = ga('number_of_questions','value');

  for(var i=0;i<number_of_questions;i++)
  {
    var choice = geid('answer'+i.toString()).value;
    sheet.push(choice);
  }

  var exam = JSON.parse(decodeURI(ga('exam','exam-object')));

  var category=ga('category','category-string')

  var examobj={
    exam:exam,
    sheet:sheet,
    category:category.length?category:undefined,
  }

  //console.log('haha:'+examobj);
  return nkcAPI('submitExam',examobj)
  .then(function(result){
    if(result.taken_by_user){
      window.location = '/me?examinated=true';
      return
    }
    window.location = '/exam?result=' + result.token
  })
  .catch(function(err){   //测试没通过
    window.location = '/exam?result=fail&detail=' + encodeURI(err.detail);
  })
}

if(geid('submit'))geid('submit').addEventListener('click',submit);

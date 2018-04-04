
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
  return nkcAPI('/exam/subject','post',examobj)
  .then(function(data){
    window.location.href = '/exam?status=true&info=恭喜您，考试通过！&type=result&isA=' + data.isA;
  })
  .catch(function(data){   //测试没通过
    window.location.href = '/exam?status=false&type=result&info='+encodeURI(data.error);
  })
}

if(geid('submit'))geid('submit').addEventListener('click',submit);

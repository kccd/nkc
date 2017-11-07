
function xsflimit(p){
  //xsf limiting on post content
  p.c =
  p.c.replace(/\[hide=([0-9]{1,3}).*?]([^]*?)\[\/hide]/gm, //multiline match
  function(match,p1,p2,offset,string){
    var specified_xsf = parseInt(p1)
    var hidden_content = p2

    var xsf = p.user?p.user.xsf||0:0
    var canShowHiddenContent = (xsf >= specified_xsf)||p.contentClasses['classified']

    if(!canShowHiddenContent){
      hidden_content = ''
    }
    return '[hide='+specified_xsf+']'+hidden_content+'[/hide]'
  })

  return p
}

module.exports = xsflimit

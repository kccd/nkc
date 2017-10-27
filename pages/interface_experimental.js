var ItemContainer = React.createClass({
  click:function(event){
    event.index = this.props.index;
    this.props.click(event);
  },
  render:function(){
    var item = this.props.item;
    var index = this.props.index;
    var ItemClass = this.props.itemclass;

    return (
      <div className={'ItemContainer '+(item.selected?'ItemContainerSelected':'')} onClick={this.click}>
        <ItemClass index={index} item={item}/>
      </div>
    )
  }
})

var MyList = React.createClass({
  render:function(){
    var list = this.props.list
    var renderedNodes = []
    for(i in list){
      renderedNodes.push(
        <ItemContainer click={this.props.itemclick} key={i} index={i} item={list[i]} itemclass={this.props.itemclass}/>
      )
    }

    return(
      <div className="MyList">
        {renderedNodes}
      </div>
    )
  }
})

var MyButton = React.createClass({
  click:function(){
    this.props.button.action()
  },
  render:function(){
    var button = this.props.button
    return(
      <button className="MyButton btn btn-default" onClick={this.click}>{button.text}</button>
    )
  }
})

var ButtonList = React.createClass({
  render:function(){
    var buttons = this.props.buttons
    var renderedNodes = []
    for(i in buttons){
      renderedNodes.push(<MyButton key={i} button={buttons[i]}/>)
    }
    return(
      <div className="ButtonList">
        {renderedNodes}
      </div>
    )
  }
})

var ListControl = React.createClass({
  render:function(){
    var pc = this.props.pc
    return(
      <div className="ListControl">
        <h4>{pc.title}</h4>
        <MyList list={pc.list} itemclick={pc.itemclick} itemclass={pc.itemclass}/>
        <ButtonList buttons={pc.buttons}/>
      </div>
    )
  }
})

function InitThreadControl(options){

  function render(){
    React.render(
      <ListControl pc={pc}/>,
      options.rootnode
    );
  };

  function yell(err){
    return screenTopWarning(err.toString());
  }

  var pc =
  {
    title:'帖楼管理',
    buttons:{
      refresh:{
        text:'从管理车加载列表',
        action:function(){
          return nkcAPI('listCart')
          .then(function(result){
            pc.list = result
            logme('已获取管理车：共 '+result.length+' 项')
          })
          .then(render)
          .catch(logme)
        },
      },
      selectAll:{
        text:'全选/反选',
        action:function(){
          for(i in pc.list){
            pc.list[i].selected = !pc.list[i].selected;
          }
          render()
        },
      },

      deselectAll:{
        text:'全不选',
        action:function(){
          for(i in pc.list){
            pc.list[i].selected = false;
          }
          render()
        },
      },

      clear:{
        text:'清除选中的',
        action:function(){
          var newlist = []
          for(i in pc.list){
            if(!pc.list[i].selected)newlist.push(pc.list[i])
          }
          pc.list = newlist;
          render()
        },
      },

      clearCart:{
        text:'清空我的管理车',
        action:function(){
          nkcAPI('clearCart')
          .then(pc.actions.refresh)
          .then(function(){
            logme('服务器端管理车已清除')
          })
          .catch(logme)
        },
      },

      disableSelectedPost:{
        text:'将选中楼设为删除',
        action:function(){
          return disablePosts()
          .then(function(count){
            if(count!=0){
              logme(count.toString()+' executed')
              pc.actions.refresh()
            }
          })
          .catch(logme)
        }
      },

      recycleSelectedThread:{
        text:'将选中帖子移动到回收站',
        action:function(){
          return moveSelectedThread('recycle')
          .then(function(count){
            if(count!=0){
              logme(count.toString()+' executed')
              pc.actions.refresh()
            }
          })
          .catch(logme)
        }
      },

      draftifySelectedThread:{
        text:'将选中帖子撤到草稿版',
        action:function(){
          return moveSelectedThread('draft')
          .then(function(count){
            if(count!=0){
              logme(count.toString()+' executed')
              pc.actions.refresh()
            }
          })
          .catch(logme)
        }
      },

      listNewPosts:{
        text:'拉取24h新帖',
        action:function(){
          return nkcAPI('pullNewPosts24h')
          .then(function(arr){
            logme(arr.length+' posts got')
            pc.list = arr
            pc.render()
          })
          .catch(logme)
        }
      }

    },

    list:[
    ],

    itemclass:React.createClass({
      render:function(){
        var item = this.props.item
        var type = item._id.split('/')[0];

        if(type=='threads')
        return(
          <div className="SomeItemDisplay">
            <div className="ItemTypeText">{type}</div>
            <div className="ItemMeta">

              <a href={'/t/'+item._key}> 帖:{item._key} </a>

              <a href={'/f/'+item.fid}> 版:{item.fid} </a>

              <a href={'/m/'+item.uid}> 户:{item.oc.uid} </a>

            </div>
            <div className="ItemText"><span className='lighttext'>{(new Date(item.tlm)).getHours()}时</span> {item.oc.t}</div>
          </div>
        )

        if(type=='posts')
        return(
          <div className="SomeItemDisplay">
            <div className="ItemTypeText">{type}</div>
            <div className="ItemMeta">楼:{item._key}

              <a href={'/t/'+item.tid}> 帖: {item.tid} </a>

              <a href={'/m/'+item.uid}> 户:{item.uid} </a>

            </div>
            <div className="ItemText"><span className='lighttext'>{(new Date(item.tlm)).getHours()}时</span> {item.t} - {item.c.trim().replace(/\n/g,' ').slice(0,50)}</div>
          </div>
        )

      }
    }),

    itemclick:function(event){
      var index = event.index;
      pc.list[index].selected = !pc.list[index].selected
      //alert(index);
      render();
    },
  }

  pc.actions={};
  for(b in pc.buttons){
    pc.actions[b] = pc.buttons[b].action
  }
  pc.render = render;

  return pc;
}

var pc = InitThreadControl({
  rootnode:geid('Root'),
})

pc.render()
pc.actions.refresh();

function moveSelectedThread(fid){
  var parr=[]
  var count = 0;
  for(i in pc.list){
    var item = pc.list[i]
    var type = item._id.split('/')[0];
    if(type=='threads'&&item.selected){
      count++;
      var tid = item._key
      parr.push(
        nkcAPI('moveThread',{tid,fid})
        .then(function(result){
          logme('thread '+tid+' moved to '+fid)
        })
      )
    }
  }
  return Promise.all(parr)
  .then(function(){
    return count;
  })
}

function disablePosts(){
  var parr = []
  var count = 0;
  for(i in pc.list){
    var item = pc.list[i]
    var type = item._id.split('/')[0];

    if(type=='posts'&&item.selected){
      count++;

      var pid = item._key;
      parr.push(
        nkcAPI('disablePost',{pid})
        .then(function(result){
          logme(result._key + ' killed')
        })
      )
    }

  }
  return Promise.all(parr)
  .then(function(){
    return count;
  })
}


var loggerlist = []
function logme(tolog){
  loggerlist.push(JSON.stringify(tolog));
  loggerlist = loggerlist.slice(-20,20);

  var logtext = ''
  for(i in loggerlist){
    logtext+=loggerlist[i]+'\n'
  }

  geid('logger').innerHTML = logtext;
}

function directedMove(){
  var targetforum = gv('TargetForum').trim().split(':')
  if(targetforum.length!==2)return screenTopWarning('请选择一个移动目标')
  targetforum = targetforum[0]

  moveSelectedThread(targetforum)
  .then(count=>{
    screenTopAlert(count+' thread(s) moved to '+targetforum)
  })
  .catch(jwarning)
}
var ___nowAt = 0;
function listForumBranch(event, index) {
  $($('#cForum').children('.list-group-item')[___nowAt]).removeClass('now-at');
  $($('#branch-forum').children('.list-group')[___nowAt]).addClass('invisible');
  $($('#cForum').children('.list-group-item')[index]).addClass('now-at');
  $($('#branch-forum').children('.list-group')[index]).removeClass('invisible');
  ___nowAt = index;
}

function forumVisibilitySwitch(event, fid){
  $(event.target).addClass('disabled');
  nkcAPI('forumVisibilitySwitch', {fid: fid})
    .then(function(res) {
      console.log(res.visibility);
      if(res.visibility) {
        event.target.innerHTML = '对用户隐藏';
        $(event.target).removeClass('disabled');
        screenTopAlert(fid + ' 已对用户可见');
        return;
      }
      event.target.innerHTML = '对用户可见';
      $(event.target).removeClass('disabled');
      screenTopAlert(fid + ' 已对用户隐藏');
      return;
    })
    .catch(jwarning)
}

function forumIsVisibleForNCCSwitch(event, fid) {
  nkcAPI('forumIsVisibleForNCCSwitch', {fid: fid})
    .then(function(res) {
      if(res.isVisibleForNCC) {
        event.target.innerHTML = '对无权限隐藏';
        $(event.target).removeClass('disabled');
        return screenTopAlert(fid + ' 已对无权限用户可见');
      }
      event.target.innerHTML = '对无权限可见';
      $(event.target).removeClass('disabled');
      return screenTopAlert(fid + ' 已对无权限用户隐藏');
    })
    .catch(jwarning)
}
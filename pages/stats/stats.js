var initChartDefaults = function(){
  var g = Chart.defaults.global

  Chart.defaults.global.animation = false;
  //Chart.defaults.global.scaleOverride = true;
  //Chart.defaults.global.scaleSteps = 50;
  //Chart.defaults.global.scaleStepWidth = 10;
  Chart.defaults.global.scaleStartValue = 0;

  //g.hover.mode='single';
  g.responsive = true;
  g.maintainAspectRatio = false

  g.elements.point.radius=2
  g.elements.point.hitRadius=20

  g.elements.line.backgroundColor='rgba(0,0,0,0.02)'

}

var loadDataCreateChart = function(ctx,labels,datasets){
  var data={
    labels:labels,
    datasets:datasets
  };

  var mynewchart = new Chart(ctx,{
    type:'line',
    data:data,
  });

  mynewchart.update();

  return data
}

var loadChart = function(){
  initChartDefaults();

  var ctx=document.getElementById('dailyStat').getContext('2d');

  var datasetGen = function(label,arr,opt){
    return Object.assign({
      label:label,
      data:arr,
      //borderColor:'rgb(255,0,0)'
    },opt)
  }

  nkcAPI('getStatDaily')
  .then(function(list){
    var labels =[]
    var dailyDataset = []
    var dailyDisabled = []
    var dailyRegister = []
    var qualityFactor = []

    for(i in list){
      var l = list[i]
      var d = new Date(l.start)
      labels.push((d.getMonth()+1)+'-'+d.getDate())
      dailyDataset.push(l.count)
      dailyDisabled.push(l.count_disabled)
      dailyRegister.push(l.user_registered)

      qualityFactor.push(Math.pow((l.count-l.count_disabled)/(l.count||1),4)*100)
    }

    loadDataCreateChart(ctx,labels,[
      datasetGen('日帖量',dailyDataset,{borderColor:'rgb(150,180,220)'}),
      datasetGen('日帖量（被屏蔽）',dailyDisabled,{borderColor:'rgb(255,128,0)'}),
      datasetGen('日注册',dailyRegister,{borderColor:'rgb(120,180,120)'}),
      datasetGen('发帖质量 (( 未屏蔽 / 总帖数 ) ^ 4 * 100% )',qualityFactor,{borderColor:'rgb(200,100,140)'})
    ])
  })
}
//chart js 2.2.1
loadChart()

//angularfun.js

var myapp = angular.module('myapp',['be_included']);
//define a module named myapp

//add one controller named myctrl
myapp.controller('myctrl',['myfac','$http',function(myfac,$http){
  //initiate a variable named yourname
  this.yourname = 'james';

  var counter =1;
  this.bclick = function(){
    counter = myfac.by2(counter);
    this.nicelist.push(
      Date.now().toString()
      +' japanese'
    );
  };

  this.reverse=function(){
    this.nicelist.reverse();
  }

  this.sort=()=>{
    this.nicelist.sort();
  }

  //remove from array at index
  this.kill = function(index){
    this.nicelist.splice(index,1);
  }

  //append
  this.append = (row)=>{
    counter = myfac.by2(counter);
    this.nicelist.push(Date.now().toString()+" "+row);
  };

  this.addme=()=>{
    counter = myfac.by2(counter);
    this.nicelist.push(Date.now().toString()+" "+this.yourname);
  };

  this.nicelist = ["(not ready)"];

  this.gettable = function(){
    var scope = this;
    $http.get('/api/angularfun')
    .success(function(data) {
      scope.nicelist = data.table;
    });
  };

  this.savetable = function(){
    $http.post('/api/angularfun',{table:this.nicelist})
    .success(function(data){
      //dont do anything
      console.log(data);
    });
  };

  this.gettable(this);//obtain data
}]);

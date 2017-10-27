//be_included.js

var mymod = angular.module('be_included',[]);
//define a module named mymod

//add one factory named myfac
mymod.factory('myfac',[function(){

  //a factory should return something
  //that can be used later on
  function by2(num){return num*2};
  return {'by2':by2};
}]);

//add more factories if needed

$(document).ready(function() {
  	/* Settings Button */
	$('#shareButton').click(function() {
	  $('#shareBox').animate({
		  right:'0'
	  }, 500, function() {
		// Animation complete.
	  });
	  $('#shareButton').animate({
		  right:'-80'
	  }, 100, function() {
		// Animation complete.
	  });
	}); 


	$('#hideShare').click(function() {
		$('#shareBox').animate({
		right:'-999'
	  }, 500, function() {
		// Animation complete.
	  });
	  
	  $('#shareButton').animate({
		right:'0'
	  }, 700, function() {
		// Animation complete.
	  }); 
	});
})
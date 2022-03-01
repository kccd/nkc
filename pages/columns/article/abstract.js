function turnSearch(text) {
	if(text) {
		var url = "/search?c="+text;
		// window.location.href = url;
		openToNewLocation(url);
	}
}

Object.assign(window, {turnSearch})
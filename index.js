(function () {

	var hasInitialize = [];

	// 开启
	chrome.browserAction.onClicked.addListener(function (tab) {
		if ( hasInitialize.indexOf(tab.id) === -1 ) {
			chrome.browserAction.setIcon({path:"icon-on.png"});
			chrome.tabs.executeScript(null, {file: "debug.js"});

			hasInitialize.push(tab.id);
		}
	});

	// 当切换不同tap页面，更新icon状态
	chrome.tabs.onSelectionChanged.addListener(function (id) {
		chrome.browserAction.setIcon({
			path: hasInitialize.indexOf(id) === -1 ? "icon.png" : "icon-on.png"
		});
	});

	// 当刷新页面，重置当前tap状态
	chrome.tabs.onUpdated.addListener(function (id) {
		var index = hasInitialize.indexOf(id);
		if ( index > -1 ) {
			hasInitialize.splice(index, 1);
			chrome.browserAction.setIcon({
				path: "icon.png"
			});
		}
	});

})()
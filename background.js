if(!localStorage.length) {
	localStorage.setItem('time', 3);
	localStorage.setItem('ids', '');
	localStorage.setItem('channels', '');
}

let channels = [];

function updateFollowingTab() {
	channels = JSON.parse(localStorage.getItem('channels'));

	let views = browser.extension.getViews({
		type: "popup"
	});
	for(let i = 0; i < views.length; i++) {
		let tab = views[i].document.getElementById('following-tab');
		while (tab.firstChild) {
			tab.removeChild(tab.firstChild);
		}
		channels.forEach((e) => {
			
			let div = document.createElement('div');
			let divText = document.createElement('div');
			let img = document.createElement('img');
			let hr = document.createElement('hr');
			
			if(e[1]['status'] === 'Live') {
				img.src = e[1]['thumb'];
				if(e[1]['thumb'].search(/http/i) === -1)
					img.src = 'https:' + e[1]['thumb'];

				divText.className = 'text-block';
				divText.innerHTML = '<h4>' + e[1]['key'] + '</h4>';
				divText.innerHTML += '<p>' + e[1]['games'].slice(0,30) + ' - ' +
					e[1]['viewers'] +' ' + browser.i18n.getMessage("m4") + '</p>';
				divText.innerHTML += '<p>' + e[1]['title'].slice(0,42) + '</p>';
				div.className = 'container';
				div.setAttribute('contextmenu', 'menu');
				div.id = e[1]['key'];
				div.appendChild(img);
				div.appendChild(divText);
				
				tab.appendChild(div);
				tab.appendChild(hr);
			}
		});
	}
}
	
function notify(id) {
	browser.notifications.create("stream-notify", {
		"type": "basic",
		"iconUrl": browser.extension.getURL("icons/gg-128.png"),
		"title": "GoodGame Notifier",
		"message": id + " is online"
	});
}

function updateStreams(response) {

	if(!localStorage.getItem('channels')){
		channels = Object.entries(response);
		localStorage.setItem('channels', JSON.stringify(channels));
		channels.forEach((e) => {
			if(e[1]['status'] === 'Live')
				notify(e[1]['key']);
		});
		return;
	} else
		channels = JSON.parse(localStorage.getItem('channels'));
	
	let listOfStreams = Object.entries(response);
	
	listOfStreams.forEach((e, i) => {
		for(let j = 0; j < channels.length; j++){
			if(e[1]['key'] === channels[j][1]['key']){
				if(e[1]['status'] === 'Live' && channels[j][1]['status'] === 'Dead')
					notify(e[1]['key']);
				break;
			} else if(e[1]['key'] !== channels[j][1]['key'] && j === channels.length - 1 &&
			          e[1]['status'] === 'Live'){
				notify(e[1]['key']);
			}
		}
	});

	let count = 0;
	listOfStreams.forEach((e) => {
		if(e[1]['status'] === 'Live')
			count++;
	});

	if(count) {
		browser.browserAction.setBadgeText({text: count.toString()});
		browser.browserAction.setBadgeBackgroundColor({color: "#646464"});
	} else
		browser.browserAction.setBadgeText({text: ''});

	localStorage.setItem('channels', JSON.stringify(listOfStreams));
	
	updateFollowingTab();

}

function getJSON(ids, updateStreams) {
	const xhr = new XMLHttpRequest();
	xhr.responseType = 'json';
	xhr.onreadystatechange = () => {
		if(xhr.readyState === XMLHttpRequest.DONE) {
			updateStreams(xhr.response);
		}
	}
	xhr.open('GET', 'https://goodgame.ru/api/getchannelstatus?id=' + ids + '&fmt=json');
	xhr.send();
}


if(localStorage.getItem('ids'))
	getJSON(localStorage.getItem('ids'), updateStreams);

let counter = localStorage.getItem('time') * 60 * 1000;
let checkStatus = () => {
	counter = localStorage.getItem('time') * 60 * 1000;
	let ids = localStorage.getItem('ids');
	if(ids)
		getJSON(ids, updateStreams);

	setTimeout(checkStatus, counter);
}
setTimeout(checkStatus, counter);



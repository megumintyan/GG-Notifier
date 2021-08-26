if(!localStorage.length) {
	localStorage.setItem('time', 3);
	localStorage.setItem('ids', '');
	localStorage.setItem('channels', '');
	localStorage.setItem('volume', '50');
	localStorage.setItem('showNotifications', 'true');
}
localStorage.setItem('buttonStatus', true);
let channels = [];


function updateFollowingTab() {

	if(localStorage.getItem('channels'))
		channels = JSON.parse(localStorage.getItem('channels'));
	let count = 0;

	let views = browser.extension.getViews({
		type: "popup"
	});
	for(let i = 0; i < views.length; i++) {
		let tab = views[i].document.getElementById('following-tab');
		while (tab.firstChild) {
			tab.removeChild(tab.firstChild);
		}

		if(!localStorage.getItem('ids')) {
			let center = document.createElement('center');
			let h2 = document.createElement('h2');
			h2.textContent = browser.i18n.getMessage("m5");
			center.appendChild(h2);
			tab.appendChild(center);
			return;
		}

		channels.forEach((e) => {

			let div = document.createElement('div');
			let divText = document.createElement('div');
			let img = document.createElement('img');
			let hr = document.createElement('hr');

			if(e[1]['status'] === 'Live') {
				count++;

				if(e[1]['thumb'].search(/http/i) === -1)
					img.src = 'https:' + e[1]['thumb'];
				else
					img.src = e[1]['thumb'];
				img.onerror = () => { img.src = e[1]['img'];
				                      img.onerror = () => { img.src = '/img/stream-offline.jpg'; }; };

				divText.className = 'text-block';
				let h4 = document.createElement('h4');
				let pGames = document.createElement('p');
				let pTitle = document.createElement('p');
				h4.textContent = e[1]['key'];
				pGames.textContent = (e[1]['games'] ? e[1]['games'].slice(0,30) : '') + ' - ' + e[1]['viewers'] +' ' + browser.i18n.getMessage("m4");
				pTitle.textContent = (e[1]['title'] ? e[1]['title'].slice(0,42) : '');
				divText.appendChild(h4);
				divText.appendChild(pGames);
				divText.appendChild(pTitle);
				div.className = 'container';
				div.id = e[1]['key'];
				div.appendChild(img);
				div.appendChild(divText);

				tab.appendChild(div);
				tab.appendChild(hr);
			}
		});

		if(!count) {
			let center = document.createElement('center');
			let h2 = document.createElement('h2');
			h2.textContent = browser.i18n.getMessage("m10");
			center.appendChild(h2);
			tab.appendChild(center);
		}

		if(localStorage.getItem('buttonStatus') === 'false') {
			channels.forEach((e) => {
				let div = document.createElement('div');
				let divText = document.createElement('div');
				let img = document.createElement('img');
				let hr = document.createElement('hr');

				if(e[1]['status'] === 'Dead') {
					img.src = e[1]['img'];
					img.onerror = () => { img.src = '/img/stream-offline.jpg'; };

					divText.className = 'text-block';
					let h4 = document.createElement('h4');
					let pGames = document.createElement('p');
					let pTitle = document.createElement('p');
					h4.textContent = e[1]['key'];
					pGames.textContent = (e[1]['games'] ? e[1]['games'].slice(0,30) : '');
					pTitle.textContent = (e[1]['title'] ? e[1]['title'].slice(0,42) : '');
					divText.appendChild(h4);
					divText.appendChild(pGames);
					divText.appendChild(pTitle);
					div.className = 'container';
					div.id = e[1]['key'];
					div.appendChild(img);
					div.appendChild(divText);

					tab.appendChild(div);
					tab.appendChild(hr);
				}
			});
			return;
		}

		let offlineButton = document.createElement('button');
		let divButton = document.createElement('div');
		let br = document.createElement('br');
		divButton.id = 'divOfflineButton';
		offlineButton.className = 'button';
		offlineButton.innerText = browser.i18n.getMessage("m12");
		offlineButton.id = 'offlineButton';
		divButton.appendChild(offlineButton);
		tab.appendChild(br);
		tab.appendChild(divButton);

		offlineButton.addEventListener("click", () => {
			tab.removeChild(divButton);
			tab.removeChild(br);
			localStorage.setItem('buttonStatus', false);
			channels.forEach((e) => {

				let div = document.createElement('div');
				let divText = document.createElement('div');
				let img = document.createElement('img');
				let hr = document.createElement('hr');

				if(e[1]['status'] === 'Dead') {
					img.src = e[1]['img'];
					img.onerror = () => { img.src = '/img/stream-offline.jpg'; };

					divText.className = 'text-block';
					let h4 = document.createElement('h4');
					let pGames = document.createElement('p');
					let pTitle = document.createElement('p');
					h4.textContent = e[1]['key'];
					pGames.textContent = (e[1]['games'] ? e[1]['games'].slice(0,30) : '');
					pTitle.textContent = (e[1]['title'] ? e[1]['title'].slice(0,42) : '');
					divText.appendChild(h4);
					divText.appendChild(pGames);
					divText.appendChild(pTitle);
					div.className = 'container';
					div.id = e[1]['key'];
					div.appendChild(img);
					div.appendChild(divText);

					tab.appendChild(div);
					tab.appendChild(hr);
				}
			});
		});

	}
}

function notify(id, msg) {
	if(localStorage.getItem('showNotifications') == 'true') {
		browser.notifications.create("stream-notify", {
			"type": "basic",
			"iconUrl": browser.runtime.getURL("icons/gg-128.png"),
			"title": id,
			"message": msg
		});
	}
	let audio = new Audio("/audio/notification.mp3");
	audio.volume = localStorage.getItem('volume') / 100;
	audio.play();
}

function updateStreams(response) {

	let delay = 0;
	if(!localStorage.getItem('channels')){
		channels = Object.entries(response);
		localStorage.setItem('channels', JSON.stringify(channels));

		channels.forEach((e) => {
			if(e[1]['status'] === 'Live') {
				setTimeout(() => {
					notify(e[1]['key'], e[1]['title']);
				}, delay+=2000);
			}
		});
	} else
		channels = JSON.parse(localStorage.getItem('channels'));

	let listOfStreams = Object.entries(response);

	listOfStreams.forEach((e, i) => {
		for(let j = 0; j < channels.length; j++){
			if(e[1]['key'] === channels[j][1]['key']){
				if(e[1]['status'] === 'Live' && channels[j][1]['status'] === 'Dead') {
					setTimeout(() => {
						notify(e[1]['key'], e[1]['title']);
					}, delay+=2000);
				}

				break;
			} else if(e[1]['key'] !== channels[j][1]['key'] && j === channels.length - 1 &&
			          e[1]['status'] === 'Live'){
				setTimeout(() => {
					notify(e[1]['key'], e[1]['title']);
				}, delay+=2000);
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

function showErrorMessage(msg) {
	let err = document.getElementById('error');
	err.innerHTML = msg;
}

document.addEventListener("keyup", (e) => {
	e.preventDefault();
	if(e.target.id === "input-box") {
		if(e.keyCode === 13) {
			let id = e.target.value;
			e.target.value = '';
			let ids = localStorage.getItem('ids');
			let re = new RegExp(id, 'i');
			if(ids.match(re)) {
				showErrorMessage(browser.i18n.getMessage("m7")); // channel is already exists
				return;
			}
			const xhr = new XMLHttpRequest();
			xhr.responseType = 'json';
			xhr.onreadystatechange = () => {
				if(xhr.readyState === XMLHttpRequest.DONE) {
					if(Object.keys(xhr.response).length) {
						if(ids)
							ids += ',';
						localStorage.setItem('ids', ids + id);
						getJSON(ids + id, updateStreams);
						let err = document.getElementById('error');
						err.innerHTML = '';
					}
					else
						showErrorMessage(browser.i18n.getMessage("m6")); // no such channel
				}
			}
			xhr.open('GET', 'https://goodgame.ru/api/getchannelstatus?id=' + id + '&fmt=json');
			xhr.send();
		}
	}
});


document.addEventListener("click", (e) => {

	if(e.target.classList.contains("button-bar")) {
		let tabName = e.target.id + "-tab";

		let x = document.getElementsByClassName("tab");
		for(let i = 0; i < x.length; i++)
			x[i].style.display = "none";
		
		let btn = document.getElementsByClassName("button-bar");
		for(let i = 0; i < btn.length; i++)
			btn[i].style.backgroundColor = "#233056";

		e.target.style.backgroundColor = "#52709c";
		document.getElementById(tabName).style.display = "block";
	} else if(e.target.classList.contains("container")) {
		window.open("https://goodgame.ru/channel/" + e.target.id);
		window.close();
	} else if(e.target.id === 'testNotification')
		notify('Title', 'Test message');

});


window.addEventListener("load", (e) => {
	document.body.innerHTML = document.body.innerHTML.replace('__MSG_m1__', browser.i18n.getMessage("m1"));
	document.body.innerHTML = document.body.innerHTML.replace('__MSG_m2__', browser.i18n.getMessage("m2"));
	document.body.innerHTML = document.body.innerHTML.replace('__MSG_m9__', browser.i18n.getMessage("m9"));
	document.body.innerHTML = document.body.innerHTML.replace('__MSG_m11__', browser.i18n.getMessage("m11"));
	let slider = document.getElementById("refresh");
	let minutes = document.getElementById("minutes");
	let sliderVolume = document.getElementById("audio-volume");
	let percent = document.getElementById("volumePercentage");
	
		
	if(localStorage.getItem('time')) {
		minutes.innerHTML = localStorage.getItem('time') + ' ' + browser.i18n.getMessage("m3");
		slider.value = localStorage.getItem('time');
	}
	else
		minutes.innerHTML = slider.value + ' ' + browser.i18n.getMessage("m3");

	slider.oninput = function() {
		minutes.innerHTML = this.value + ' ' + browser.i18n.getMessage("m3");
		localStorage.setItem('time', this.value);
	}

	percent.innerHTML = localStorage.getItem('volume') + ' %';
	sliderVolume.value = localStorage.getItem('volume');
	sliderVolume.oninput = function() {
		percent.innerHTML = this.value + ' %';
		localStorage.setItem('volume', this.value);
	}
	
	if(localStorage.getItem('ids') == "") {
		let following = document.getElementById('following-tab');
		following.innerHTML = '<center><h2>'+ browser.i18n.getMessage("m5") + '</h2></center>';
	}
	
	browser.runtime.getBackgroundPage(e => {
		e.updateFollowingTab();
	});
	
});

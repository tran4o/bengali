alert("INIT APP!");
var isWebkit= typeof webkitSpeechRecognition != "undefined"; 
var recognition = null;
var langs = ["BG","EN","HI","BN"];
var aduioRecord = null;
var fileURL = null;

function isRecordSupported(lang) 
{
	if (lang == "EN" || lang == "BG" || lang == "HI" || lang == "DE" || lang == "ES")
		return true;
	return false;
}

var timerAccept;

function processRecognitionData(lang,event) {
	
	var ck = document.querySelector("#"+lang+" .on");
	if (!ck) {
		return;
	}
	
	var tel = document.querySelector("#"+lang+" .temp");
	tel.className="temp";
	tel.onclick=stopTemporary;
	var rr;
	while (rr=tel.querySelector(".intermediate")) {
		rr.parentNode.removeChild(rr);
	}
	if (event && event.results) 
	{
		var isOK=null;
		for (var i=event.resultIndex;i<event.results.length;i++) 
		{
			var res = event.results[i];
			if (res.isFinal && res.length) {
				if (isOK == null)
					isOK=true;
				tel.innerHTML+="<div class='final'>"+res[0].transcript+"</div>";		
			} else {
				tel.innerHTML+="<div class='intermediate'>"+res[0].transcript+"</div>";
				isOK=false;
			}
		}
		if (isOK) 
		{
			tel.scrollTop = tel.scrollHeight;
			if (timerAccept) {
				clearTimeout(timerAccept);
				delete timerAccept;
			}
			var param={lang:lang};
			timerAccept = setTimeout(doFinal.bind(param),2000);
			function doFinal() 
			{	
				delete timerAccept;
				var lang = this.lang;
				var tar = document.querySelector("#"+lang+" textarea");
				var rr;
				while (rr=tel.querySelector(".final")) 
				{
					if (tar.value && tar.value.length)
						tar.value+="\n";
					tar.value+=rr.innerHTML.trim();
					rr.parentNode.removeChild(rr);
				}
				tar.scrollTop = tar.scrollHeight;
				stopTemporary();
				onTextChange.bind(this)();
			}
		} else {
			if (timerAccept) {
				clearTimeout(timerAccept);
				delete timerAccept;
			}
		}
	}
}

function stopTemporary() {
	var els = document.querySelectorAll(".temp");
	for (var i=0;i<els.length;i++) {
		var el = els[i];
		el.className="temp disabled";
		el.innerHTML="";
	}
	if (timerAccept) {
		clearTimeout(timerAccept);
		delete timerAccept;
	}
}

function createLanguage(lang) 
{
	var iDiv = document.createElement('div');
	iDiv.id = lang;
	iDiv.className = 'language';
	iDiv.style.height=Math.round(10000.0/langs.length)/100.0+"%";
	document.getElementsByTagName('body')[0].appendChild(iDiv);
	
	iDiv.innerHTML="<textarea placeholder='Type text here'></textarea><div class='label'>"+lang+"</div><img src='images/micro.png' class='micro "+(isRecordSupported(lang) ? "" : "disabled") +"'/><div class='temp disabled'></div>";
	var mel = document.querySelector('#'+lang+" img.micro");

	var data={lang:lang};	
	function onLangClick() 
	{
		var ons = !document.querySelector("#"+this.lang+" .on");
		var els = document.querySelectorAll(".language img.micro");
		for (var i=0;i<els.length;i++) {
			var el=els[i];
			el.src="images/micro.png";				
		}
		var el = document.querySelector("#"+this.lang+" img.micro"); 
		if (ons && el)
			el.src="images/micro-on.png";
		var els = document.querySelectorAll(".language .label");
		for (var i=0;i<els.length;i++) {
			el=els[i];
			el.className="label";				
		}
		el = document.querySelector("#"+this.lang+" .label");
		if (ons && el) {
			
			var tel = document.querySelector("#"+this.lang+" textarea");
			tel.value="";
			
			el.className="label on";
			if (isWebkit) 
			{
				if (recognition) {
					recognition.__forced=true;
					recognition.stop();
				}
				recognition=new webkitSpeechRecognition();
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.lang = this.lang;						//bg-BG , en-US, hi-IN
				recognition.start();
				recognition.onresult = onRecognitionData.bind(this);
				function onStop() {
					if (!this.__forced) {
						console.warn("Restarting recognition...");
						this.start();
					}
				}
				
				function onStart() {
					this.onend = onStop.bind(this);
				}
				recognition.onstart = onStart.bind(recognition);
				function onRecognitionData(event)
				{
					processRecognitionData(this.lang,event);
				}
			} else {	
				var captureSuccess = function(mediaFiles) {
					alert("SUCCESS : "+mediaFiles.length);
				    var i, path, len;
				    for (i = 0, len = mediaFiles.length; i < len; i += 1) 
				    {
				        path = mediaFiles[i].fullPath;
					    alert("FULL PATH CAPTURE SUCCESS : "+path);
					    
				    	var audioRecord = mediaFiles[i];
					    alert("AUDIO RECORD : "+path);
						window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, fail);
						function gotFS(fileSystem) {
					        fileSystem.root.getFile(audioRecord, {
					            create: true,
					            exclusive: false
					        }, gotFileEntry, fail);
						}

					    function gotFileEntry(fileEntry) {
					        fileURL = fileEntry.toURL();
						    alert("FILE URL "+fileURL);
					    }
					    break;
				    }
				};

				// capture error callback
				var captureError = function(error) {
					alert('Error code: ' + error.code, null, 'Capture Error');
				};

				// start audio capture
				navigator.device.capture.captureAudio(captureSuccess, captureError, {limit:10});
			}
		} else {
			// JUST STOP
			if (recognition) {
				recognition.__forced=true;
				recognition.stop();
				recognition=null;
			}
		}
		stopTemporary();
	}
	mel.onclick = onLangClick.bind(data);
	iDiv.querySelector("textarea").onchange=onTextChange.bind(data); 
}

function onTextChange() 
{
	var txt = document.querySelector("#"+this.lang+" textarea");
	var rr = document.querySelectorAll(".language");
	for (var i=0;i<rr.length;i++) 
	{
		var el = rr[i];
		if (el.id != this.lang) 
		{
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "trans/"+this.lang+"/"+el.id+"/"+encodeURIComponent(txt.value), true);
			var data = {wdg:el.querySelector("textarea"),xhr:xhr};
			xhr.onreadystatechange = onDone.bind(data); 
			function onDone() 
			{
				if (this.xhr.readyState == 4) {
					this.wdg.value=this.xhr.responseText;
				}
			}
			xhr.send();
		}
	}
}
	
function init() 
{
	for (var e in langs) {
		createLanguage(langs[e]);
	}
}

init();
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		function onError() {
			alert("ON ERROR!");
		}
		function addScript(url) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;   
			try { 
				script.addEventListener("error", onError); 
				script.async = 'async';
			} catch(e) {alert("ERR JS : "+e);}
			document.getElementsByTagName('head')[0].appendChild(script);		
		}
		function addCss(url) {
			var link=document.createElement("link")
		    link.rel  = "stylesheet";
		    link.type = "text/css";
		    link.href = url;
		    link.media = "all";
			try { 
				link.addEventListener("error", onError);
				link.async = 'async'; 
			} catch(e) {alert("ERR CSS : "+e);}
			document.getElementsByTagName('head')[0].appendChild(link);		
		}
		addCss("http://dev-bg.plan-vision.com/bengali/css/app.css");
		addScript("http://dev-bg.plan-vision.com/bengali/js/app.js");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

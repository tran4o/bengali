var storage = require('node-persist');
var sys = require('sys');
var base32 = require('base32')
var request = require('request-json');

String.prototype.hashCode = function() 
{
	  var hash = 0, i, chr, len;
	  if (this.length === 0) return hash;
	  for (i = 0, len = this.length; i < len; i++) {
	    chr   = this.charCodeAt(i);
	    hash  = ((hash << 5) - hash) + chr;
	    hash |= 0; // Convert to 32bit integer
	  }
	  if (hash < 0)
		  hash=-hash;
	  return hash >> (32-12);
};

var KEY = "AIzaSyC0CLw14OVeFrZYxxr_DdTiie86Zsd7Ors";
storage.initSync();
module.exports=
{
	translate : function(text,from,to,onResult) 
	{
		var tarr = text.split("?").join("?\n").split(".").join("\n").split("\n");
		var arr=[];
		for (var i=0;i<tarr.length;i++) {
			var tel=tarr[i].trim();
			if (tel && tel.length)
				arr.push(tel);
		}
		//--------------------------------------------------
		var dataObj = {
			res : [],
			items : arr,
			onResult : onResult
		};
		if (!arr.length)
			return "";	
		function eat() 
		{
			var text = this.items.shift();
			var key = "TRANS-"+from+"-"+to+"-"+text.toUpperCase().hashCode();
			this.key=key;		
			this.text=text;
			var item = storage.getItem(key);
			if (item != null) 
				item=item[text.toUpperCase()];			
			if (item !== undefined) {
				this.res.push(item);
				if (!this.items.length)
					this.onResult(this.res.join("\n"));
				else 
					eat.bind(this)();
				return;
			}
			var url="https://www.googleapis.com";
			var params = "?key="+KEY+"&source="+from+"&target="+to+"&q="+encodeURIComponent(text);
			var client = request.createClient(url);
			function onDone(err,res,body) 
			{
				if (err) 
					console.error("ERROR ON TRANSLATE : "+err);
				else {
					if (body && body.data && body.data.translations && body.data.translations && body.data.translations) {
						for (var i in body.data.translations) {
							var tr = body.data.translations[i];
							if (tr.translatedText) {
								var text = tr.translatedText.trim().split("&#39;").join("'");								
								var item = storage.getItem(key);
								if (item == null)
									item={};
								item[this.text.toUpperCase()]=text;
								storage.setItem(this.key,item);
								this.res.push(text);
							}
						}
					}
				}
				if (!this.items.length)
					this.onResult(this.res.join("\n"));
				else 
					eat.bind(this)();
			}
			client.get('/language/translate/v2'+params, onDone.bind(this));		
		}
		
		eat.bind(dataObj)();
		
		
	}
}

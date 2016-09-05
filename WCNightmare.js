var Nightmare = require('nightmare');
var firebase = require("firebase");

firebase.initializeApp({
	databaseURL: "https://shield-5ec91.firebaseio.com/",
	serviceAccount: "ShieldSA.json",
	databaseAuthVariableOverride: {
		uid: "wcnightmare"
	}
});

var ref = firebase.database().ref('Sites/');
var urls = [];
var selectors = [];
var siteName = [];
var time;

setInterval(function(){
	time = new Date();
	console.log(time);
	receiveRequest();
}, 30000);

function receiveRequest(){
	ref.orderByKey().on("value", function(snapshot) {
		snapshot.forEach(function(data) {
			siteName.push(data.key);
			data.forEach(function(pages) {
				urls.push(pages.child('url').val());
				pages.forEach(function(sel){
					var subSelectors = [];
					sel.forEach(function(numbers){
						subSelectors.push(numbers.child('selector').val());
					});
					if(subSelectors[0] != null){
						selectors.push(subSelectors);
					}
				});
			});
		});
		if(selectors[0] != null){
			Access(0);
		}
	});
}

function Access(index){ 
	var nightmare = Nightmare({show:false});
	nightmare
		.goto(urls[index])
		.evaluate(function(selector, name){
			var temp = [];
			for(var count = 0; count < selector.length; count++){
				var subTemp = [];
				subTemp.push(name);
				subTemp.push(document.URL);
				subTemp.push(selector[count]);
				if(document.querySelector(selector[count]) != null){
					subTemp.push(true);
				} else {
					subTemp.push(false);
				}
				temp.push(subTemp);
			}
			return temp;
		}, selectors[index], siteName[index])
		.end()
		.then(function(result){
			for(var count2 = 0; count2 < result.length; count2++){
				firebase.database().ref('Status/' + result[count2][0] + '/selectors/' + count2).set({
					selector:result[count2][2],
					url:result[count2][1],
					status:result[count2][3]
				});
				
				firebase.database().ref('Status/' + result[count2][0]).update({
					time:new Date()
				})
			}
			if(index + 1 < urls.length){
				Access(index + 1);
			} else {
				urls = [];
				selectors = [];
				siteName = [];
			}
		})
		.catch(function (error) {
			console.error('Search failed:', error);
		})
}

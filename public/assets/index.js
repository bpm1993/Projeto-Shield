var count = 1;
var lastUpdate;

var config = {
	apiKey: "AIzaSyCdVwQN5CQD7Zyuxpvr08I6m3lZxtIbUj8",
	authDomain: "shield-5ec91.firebaseapp.com",
	databaseURL: "https://shield-5ec91.firebaseio.com",
	storageBucket: "shield-5ec91.appspot.com",
};
firebase.initializeApp(config);

var user = firebase.auth().currentUser;
var statusFB = firebase.database().ref('Status/');

function login(){
	var email = $('#email').val();
	var password = $('#pwd').val();
	
	
	firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
		alert("Logado");
		user = firebase.auth().currentUser;
	}, function(error){
		alert(error.message);
	});
	
	$('#email').val('');
	$('#pwd').val('');
}

function signIn(){
	var email = $('#email').val()
	var password = $('#pwd').val()
	var errorCode;
	var errorMessage;
	
	firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
	
	}, function(error){
	
	});
}

function signOut() {
	firebase.auth().signOut().then(function() {
		console.log('Signed Out');
		user = firebase.auth().currentUser;
	}, function(error) {
		console.error('Sign Out Error', error);
	});
}

function insertSelector(){
	console.log(count);
	var inputDiv = document.createElement('div');
	var inputLabel = document.createElement('LABEL');
	var input = document.createElement('Input');
	inputDiv.className = 'form-group';
	inputDiv.id = 'form' + count;
	inputLabel.innerHTML = 'Selector ' + count + ':';
	input.type ="text";
	input.className ="form-control";
	input.id ="pageSel" + count;
	input.placeholder="Insira o seletor";
	
	inputDiv.appendChild(inputLabel);
	inputDiv.appendChild(input);
	document.getElementById("InputForm").appendChild(inputDiv);
	
	count++;
}

function submitData(){
	if(user){
		console.log(user);
		var selectors = [];
		var pageName;
		var siteName;
		var urlPage;
		
		for(var count2 = 0; count2 < count; count2++){
			selectors[count2] = document.getElementById("pageSel" + count2).value;
			siteName = document.getElementById("name").value;
			pageName = document.getElementById("pageName").value;
			urlPage = document.getElementById("pageURL").value;
		}
		
		for(var count2 = 0; count2 < count; count2++){
			firebase.database().ref('Sites/' + siteName + '/' + pageName + '/selectors/' + count2).set({
				selector:selectors[count2]
			});
			if(count2 > 0){
				$('#pageSel' + count2).remove();
				$('#form' + count2).remove();
			} else {
				$('#pageSel' + count2).val('');
			}
		}
		
		firebase.database().ref('Sites/' + siteName + '/' + pageName).update({
			url:urlPage
		})
		
		$('#name').val('');
		$('#pageName').val('');
		$('#pageURL').val('');
		
		count = 1;
	} else {
		alert("É necessário se logar para finalizar!")
	}
}

Vue.component('demo-grid', {
	template: '#grid-template',
	props: {
		data: Array,
		columns: Array,
		filterKey: String
	},
	data: function () {
		var sortOrders = {}
		this.columns.forEach(function (key) {
		sortOrders[key] = 1
		})
		return {
			sortKey: '',
			sortOrders: sortOrders
		}
	},
	methods: {
	sortBy: function (key) {
		this.sortKey = key
		this.sortOrders[key] = this.sortOrders[key] * -1
		}
	}
})

var demo = new Vue({
	el: '#demo',
	data: {
		searchQuery: '',
		gridColumns: ['Site', 'URL', 'Seletor', 'Status', 'Update'],
		gridData: []
	}
})

statusFB.on("value", function(snapshot) {
demo.gridData = [];
	snapshot.forEach(function(data) {
		data.forEach(function(pages) {
			pages.forEach(function(sel){
				var temp = [];
				sel.forEach(function(numbers){
					var status;
					if(sel.child('status').val()){
						status = 'On';
					} else {
						status = 'Off';
					}
					temp.push(sel.child('url').val());
					temp.push(sel.child('selector').val());
					temp.push(status);
				});
				var date = String(new Date(data.child('time').val())).split(' ');
				var stringDate = date[1] + ' ' +  date[2] + ' ' + date[3] + ' ' + date[4];
				demo.gridData.push({
					Site: data.key,
					URL: temp[0],
					Seletor: temp[1],
					Status: temp[2],
					Update: stringDate
				});
			});
		});
	});
});
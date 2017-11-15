function showCommand(){
	var table = document.getElementById("table_div");
	table.value = '';
	table.style.visibility = "visible";

}
function go(){
	var q = document.getElementById("inserisci").value;
	console.log(q);
	if (q === "help")
	{
		showCommand();
	}
	else
	{
		//prima bisogna parsare la q e poi aggiungere il parametro polo/aula all'url
		var url = "result.html?q="+q;
		location.href = url;
	}
}

function getPlace(){
	var polo = getQueryVariable("q");
	return polo;
}

function enter() {
	document.getElementById("inserisci").addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode === 13) {
			document.getElementById("icon").click();
		}
	});
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	} 
	alert('Query Variable ' + variable + ' not found');
}
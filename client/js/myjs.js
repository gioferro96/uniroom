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
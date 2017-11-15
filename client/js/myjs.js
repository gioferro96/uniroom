
//funzione per mostrare la tabella di help nella index.html
function showCommand(){
	var table = document.getElementById("table_div");
	table.value = '';
	table.style.visibility = "visible";

}

//funzione per chiamare result.html con la query inserita dall'utente
function go(){
	var q = document.getElementById("inserisci").value;

	if (q === "help")
	{
		showCommand();
	}
	else
	{
		//prima bisogna parsare la q e poi aggiungere il parametro polo/aula all'url
		var url = "/client/result.html?q="+q;

		location.href = url;
	}
}

//funzione per prendere la query inserita dall'utente
function getQueryVariable(url_string) {
	var url = new URL(url_string);
	var query = url.searchParams.get("q");
	if(query)
		return query;
	alert('Query Variable ' + query + ' not found');
}
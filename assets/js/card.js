$.getJSON('https://indonesia-covid-19.mathdro.id/api', function(data) 
{
  document.getElementById("totalpositif").appendChild(document.createTextNode(data['perawatan']));
  document.getElementById("totalsembuh").appendChild(document.createTextNode(data['sembuh']));
  document.getElementById("totalmeninggal").appendChild(document.createTextNode(data['meninggal']));
});
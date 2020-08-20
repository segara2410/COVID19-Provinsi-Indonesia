var map = L.map('map').setView({lon: 117.9213, lat: -1.7893}, 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

L.control.scale().addTo(map);

var geojsonLayer

var provinsi = new Object();

var info = L.control();

info.onAdd = function (map) 
{
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) 
{
  this._div.innerHTML = '<h4>Persebaran COVID-19</h4>Arahkan ke Suatu Provinsi';

  if (props)
  {
    var current_provinsi = provinsi[`${props.Propinsi}`];
    
    this._div.innerHTML = '<h4>Persebaran COVID-19</h4>' + (props ? '<b>' + props.Propinsi + '</b><br />' : 'Arahkan ke Suatu Provinsi') + 
      (current_provinsi ?
      'Jumlah Positif : ' + current_provinsi.positif + ' orang<br />' +
      'Jumlah Sembuh : ' + current_provinsi.sembuh + ' orang<br />' +
      'Jumlah Meninggal : ' + current_provinsi.meninggal + ' orang'
      : '');
  }
};

info.addTo(map);

function categorycolor(f)
{
  var current_provinsi = provinsi[`${f.properties['Propinsi']}`];
  
  var positif = 0;

  if (current_provinsi)
  {
    positif = current_provinsi.positif;
    
    if(positif > 10000) 
    {
      color = '#DC143C';
      return color;
    }
    else if (positif > 1000)
    {
      color = '#FFA500';
      return color;
    }
    else if (positif > 0)
    {
      color = '#FFFF33';
      return color;
    }
    else if (!positif)
    {
      color = '#00cc00';
      return color;
    }
  }
  else 
  {
    color = '#A9A9A9';
    return color;
  }
}

function stylecolor(feature) 
{
  return {
    fillColor: categorycolor(feature),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

function highlightFeature(e) 
{
  var layer = e.target;

  layer.setStyle(
    {
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) 
  {
    layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

function resetHighlight(e) 
{
  geojsonLayer.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) 
{
  map.fitBounds(e.target.getBounds());
  highlightFeature(e);
}

function onEachFeature(feature, layer) 
{
  layer.on(
  {
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

$.getJSON('https://indonesia-covid-19.mathdro.id/api/provinsi', function(data) 
{
  for (datum in data.data)
  {
    var new_object = data.data[datum];
    var provinsi_name = new_object.provinsi.toUpperCase();
    provinsi[provinsi_name] = Object.assign({},
    {
      positif : new_object["kasusPosi"],
      sembuh : new_object["kasusSemb"],
      meninggal : new_object["kasusMeni"],
    })
  }
  geojsonLayer = new L.GeoJSON.AJAX(["assets/json/indonesia-province.json"], {onEachFeature:onEachFeature, style:stylecolor});       
  geojsonLayer.addTo(map);
});

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) 
{
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1000, 10000],
    labels = [];
    
    var color = ['#00cc00', '#FFFF33', '#FFA500', '#DC143C'];

    div.innerHTML += '<div class="text-left"><i style="background:' + color[0] + '"></i> ' + grades[0] + '</div>';

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<div class="text-left"><i style="background:' + color[i+1] + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</div>' : '+');
    }
    return div;
};

legend.addTo(map);
var map = new L.Map('map', {
  layers: [
    new L.TileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
    })
  ],
  center: [0, 0],
  zoom: 1
});

function addIsoChrone(e) {
  var location = {
    'lat': e.latlng.lat,
    'lon': e.latlng.lng
  };

  var options = {
    autosetbounds: true,
    idAjaxStatus: 'status',
    locations: location,
    maxLatAperture: 10000,
    costing: 'pedestrian',
    api_key: document.getElementById('mapzenapi').value,
    contours: [{
      'time': 15,
      'color': 'ff0000'
    }, {
      'time': 30,
      'color': '00ff00'
    }, {
      'time': 60,
      'color': '0000ff'
    }]
  }

  new L.GeoJSON.Ajax.MapzenIsochrone(options).addTo(map);
}

function addClick() {
  map.on('click', addIsoChrone);
}

function addMultiple() {
  var isolayer = new L.GeoJSON.Ajax({
    urlGeoJSON: 'capitals.json',
    autosetbounds: true,
    idAjaxStatus: 'ajax-status',
  });

  var options = {
    idAjaxStatus: 'ajax-status',
    baselayer: isolayer,
    costing: 'auto',
    api_key: document.getElementById('mapzenapi').value,
    contours: [{
      'time': 15,
      'color': 'ff0000'
    }, {
      'time': 30,
      'color': '00ff00'
    }, {
      'time': 60,
      'color': '0000ff'
    }]
  };

  var isolayer = new L.GeoJSON.Ajax.MapzenIsochroneGroup(options); //.addTo(map);
  isolayer.addTo(map);
}

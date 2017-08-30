var map = new L.Map('map');
map.setView([39.74,-93.47], 3);
// Baselayer
new L.TileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// OSM overpass layer
var staticfile = new L.GeoJSON.Ajax({
    // US State Capitals
    urlGeoJSON: 'https://gist.githubusercontent.com/mcwhittemore/1f81416ff74dd64decc6/raw/f34bddb3bf276a32b073ba79d0dd625a5735eedc/usa-state-capitals.geojson',
    
    
	idAjaxStatus: 'ajax-status', // HTML id element owning the loading status display
  static: true

	
}).addTo(map);


//map.fitBounds(staticfile.getBounds());

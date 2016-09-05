map = new L.Map('map', {
	center: new L.LatLng(46.8, 2),
	zoom: 6,
	layers: [
		// Baselayer
		new L.TileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
		}),

		// Europe mountain points of interest
		new L.GeoJSON.Ajax.WRIpoi({
			idAjaxStatus: 'ajax-status'
		}),

		// French mountain limits
		new L.GeoJSON.Ajax.WRImassifs()
	]
});

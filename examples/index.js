var wri = new L.GeoJSON.Ajax.WRIpoi({ // Europe mountain points of interest
		idAjaxStatus: 'ajax-status'
	}),
	massifs = new L.GeoJSON.Ajax.WRImassifs(), // French mountain limits

	map = new L.Map('map', {
		center: new L.LatLng(46.8, 2),
		zoom: 6,
		layers: [
			// Baselayer
			new L.TileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { // Available on http & https
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
			}),
			wri,
			massifs
		]
	});

var chem = new L.GeoJSON.Ajax({
	urlGeoJSON: '//chemineur.fr/ext/Dominique92/GeoBB/gis.php',
	argsGeoJSON: {
		site: 'chemineur,camptocamp,pyrenees-refuges,refuges.info',
		poi: '3,8,16,20,23,28,30,40,44,58,62,64'
	},
	bbox: true,

	style: function(feature) { // Icons display style
		return {
			iconUrl: feature.properties.icone,
			iconAnchor: [8, 28]
		};
	}
}).addTo(map);

// Controle secondaire pour les couches vectorielles
var lc2 = new L.Control.Layers.argsGeoJSON(
	chem,
	{
		'Chemineur': {l: chem, p: 'site', v: 'chemineur'},
		'Camptocamp': {l: chem, p: 'site', v: 'camptocamp'},
		'Pyrenees-refuges': {l: chem, p: 'site', v: 'pyrenees-refuges'},
		'Refuges.info': {l: chem, p: 'site', v: 'refuges.info'},
		'Refuges': {l: chem, p: 'poi', v: '3'},
		'Abris': {l: chem, p: 'poi', v: '8'},
		'Inutilisable': {l: chem, p: 'poi', v: '16'},
		'Alimentation': {l: chem, p: 'poi', v: '20'},
		'Montagnes': {l: chem, p: 'poi', v: '23'},
		'Voies ferrées': {l: chem, p: 'poi', v: '28'},
		'Ferroviaire': {l: chem, p: 'poi', v: '30'},
		'Transport': {l: chem, p: 'poi', v: '40'},
		'Tourisme': {l: chem, p: 'poi', v: '44'},
		'Trace GPX': {l: chem, p: 'poi', v: '64'},
		'Naval': {l: chem, p: 'poi', v: '58'},
		'Diaporamas': {l: chem, p: 'poi', v: '62'}
	}
).addTo(map);

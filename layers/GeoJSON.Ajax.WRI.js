/*
 * Copyright (c) 2016 Dominique Cavailhez
 * https://github.com/Dominique92
 * Supported both on Leaflet V0.7 & V1.0
 *
 * geoJSON layers to access www.refuges.info geographic flows
 */

// Europe mountain points of interest
L.GeoJSON.Ajax.WRIpoi = L.GeoJSON.Ajax.extend({
	options: {
		urlGeoJSON: 'http://www.refuges.info/api/bbox',
		argsGeoJSON: {
			type_points: 'all'
		},
		bbox: true,
		style: function(feature) {
			return {
				url: feature.properties.lien,
				iconUrl: 'http://www.refuges.info/images/icones/' + feature.properties.type.icone + '.png',
				iconAnchor: [8, 8],
				remanent: true,
				title: feature.properties.nom,
				popupAnchor: [0, -0],
				degroup: 12 // Spread the icons when the cursor hover on a busy area.
			};
		}
	}
});

// French mountain limits
L.GeoJSON.Ajax.WRImassifs = L.GeoJSON.Ajax.extend({
	options: {
		urlGeoJSON: 'http://www.refuges.info/api/polygones',
		argsGeoJSON: {
			type_polygon: 1
		},
		bbox: true,
		style: function(feature) {
			return {
				title: feature.properties.nom,
				popupAnchor: [-1, -4],
				url: feature.properties.lien,
				color: feature.properties.couleur,
				weight: 2
			};
		}
	}
});

// OSM overpass layer
L.GeoJSON.Ajax.OSMoverpass = L.GeoJSON.Ajax.extend({
	options: {
		urlGeoJSON: 'http://overpass-api.de/api/interpreter',
		maxLatAperture: 0.5, // (Latitude degrees) The layer will only be displayed if it's zooms to less than this latitude aperture degrees.

		// Url args calculation
		argsGeoJSON: function(layer) {
			var bounds = layer._map.getBounds(),
				req =
`[out:json][timeout:25];
(
	node["tourism"~"hotel|camp_site"]({{bbox}});
	way["tourism"~"hotel|camp_site"]({{bbox}});
	node["shop"~"supermarket|convenience"]({{bbox}});
	way["shop"~"supermarket|convenience"]({{bbox}});
);
out 100 center;
>;`;
			layer.options.disabled = bounds._northEast.lng - bounds._southWest.lng > layer.options.maxLatAperture;
			return {
				data: req.replace(/{{bbox}}/g, bounds._southWest.lat + ',' + bounds._southWest.lng + ',' + bounds._northEast.lat + ',' + bounds._northEast.lng)
			};
		},
		bbox: true,

		// Convert received data in geoJson format
		tradJson: function(data) {
			var geo = [];
			for (e in data.elements) {
				var d = data.elements[e],
					t = d.tags,
					iconUrl =
						d.tags.tourism == 'hotel' ? 'hotel' :
						d.tags.tourism == 'camp_site' ? 'camping' :
						d.tags.shop == 'convenience' ? 'ravitaillement' :
						d.tags.shop == 'supermarket' ? 'ravitaillement' :
						null,
					adresses = [
						t['addr:housenumber'],
						t['addr:street'],
						t['addr:postcode'],
						t['addr:city']
					],
					popup = [
						t.name ? '<b>' + t.name + (t.stars ? ' ' + '*'.repeat(t.stars) : '') + '</b>' : '',
						t.tourism == 'hotel' ? 'Hôtel' + (t.rooms ? ' ' + t.rooms + ' chambres' : '') : '',
						t.tourism == 'camp_site' ? 'Camping ' + (t.place ? t.place + ' places' : '') : '',
						t.shop == 'convenience' ? 'Alimentation' : '',
						t.shop == 'supermarket' ? 'Supermarch&egrave;' : '',
						t['contact:phone'], t['phone'],
						t.email ? '<a href="mailto:' + t.email + '">' + t.email + '</a>' : '',
						t['addr:street'] ? adresses.join(' ') : '',
						t.website ? '<a href="' + (t.website.search('http') ? 'http://' : '') + t.website + '">' + t.website + '</a>' : '',
						'<a class="popup-copyright" href="http://www.openstreetmap.org/' + (d.center ? 'way' : 'node') + '/' + d.id + '">&copy;</a>'
					];
				if (d.center) // Cas des éléments décrits par leurs contours
					Object.assign(d, d.center);

				if (d.lon && d.lat && iconUrl)
					geo.push({
						type: 'Feature',
						id: d.id,
						properties: {
							iconUrl: 'http://dom.refuges.info/images/icones/' + iconUrl + '.png',
							title: t.name,
							popup: '<p>' + popup.join('</p><p>') + '</p>'
						},
						geometry: {
							type: 'Point',
							coordinates: [d.lon, d.lat]
						}
					});
			}
			return geo;
		},
		style: {
			iconAnchor: [8, 8],
			popupAnchor: [-1, -9],
			degroup: 12
		}
	}
});
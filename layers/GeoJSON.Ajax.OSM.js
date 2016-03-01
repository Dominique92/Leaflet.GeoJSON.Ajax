/*
 * Copyright (c) 2016 Dominique Cavailhez
 * https://github.com/Dominique92
 * Supported both on Leaflet V0.7 & V1.0
 *
 * Ajax layers to access OpenStreetMap Overpass API http://wiki.openstreetmap.org/wiki/Overpass_API
 * Based on L.GeoJSON and L.GeoJSON.Ajax
 * With the great initial push from https://github.com/sletuffe
 */

L.GeoJSON.Ajax.OSM = L.GeoJSON.Ajax.extend({
	options: {
		urlGeoJSON: 'http://overpass-api.de/api/interpreter',
		bbox: true,
		maxLatAperture: 0.25, // (Latitude degrees) The layer will only be displayed if it's zooms to less than this latitude aperture degrees.
		timeout: 25, // Server timeout (seconds)
		services: {}, // Request data formating
		icons: {}, // Icons name translation
		language: {}, // label word translation

		// Url args calculation
		argsGeoJSON: function() {
			// Select services using html form
			// <input type="checkbox" name="osm-categories[]" value="shop~supermarket|convenience" />
			var st = document.getElementsByName('osm-categories[]');
			if (st.length) {
				this.options.services = {};
				for (var e = 0; e < st.length; e++)
					if (st[e].checked) {
						var val = st[e].value.split('~');
						if (typeof this.options.services[val[0]] == 'undefined')
							this.options.services[val[0]] = val[1];
						else
							this.options.services[val[0]] += '|' + val[1];
					}
			}

			// No selection ?
			this.options.disabled = !Object.keys(this.options.services).length;

			// Build the request
			var r = '[out:json][timeout:' + this.options.timeout + '];(\n',
				b = this._map.getBounds(),
				bbox = b._southWest.lat + ',' + b._southWest.lng + ',' + b._northEast.lat + ',' + b._northEast.lng;
			for (var s in this.options.services) {
				var x = '["' + s + '"~"' + this.options.services[s] + '"](' + bbox + ');\n';
				r += 'node' + x + 'way' + x;
			}
			return {
				data: r + ');out center;>;'
			};
		},

		// Convert received data in geoJson format
		tradJson: function(data) {
			if (data.remark)
				this.elAjaxStatus.className = 'ajax-zoom';

			var geoJson = []; // Prepare geoJson object for Leaflet.GeoJSON display
			for (var e in data.elements) {
				var d = data.elements[e],
					t = d.tags,
					type = '',
					icon = null;

				// Find the right icon using services & icon options
				for (s in this.options.services)
					if (typeof t[s] == 'string' &&
						this.options.services[s].search(t[s]) != -1) {
						type = t[s];
						icon = this.options.icons[t[s]] || t[s];
					}
					// Label text calculation
				var adresses = [
						t['addr:housenumber'],
						t['addr:street'],
						t['addr:postcode'],
						t['addr:city']
					],
					language = this.options.language,
					title = [
						type,
						t.stars ? '*'.repeat(t.stars) : '',
						t.rooms ? t.rooms + ' rooms' : '',
						t.place ? t.place + ' places' : '',
						t.capacity ? t.capacity + ' places' : '',
						'<a href="http://www.openstreetmap.org/' + (d.center ? 'way' : 'node') + '/' + d.id + '" target="_blank">&copy;</a>'
					]
					.join(' ')
					.replace( // Word translation if necessary
						new RegExp(Object.keys(language).join('|'), 'gi'),
						function(m) {
							return language[m.toLowerCase()];
						}
					),
					popup = [
						t.name ? '<b>' + t.name + '</b>' : '',
						title.charAt(0).toUpperCase() + title.substr(1), // Uppercase the first letter
						t.ele ? t.ele + ' m' : '',
						t['contact:phone'] ? '<a href="tel:'+t['contact:phone'].replace(/[^0-9\+]+/ig, '')+'">'+t['contact:phone']+'</a>' : '',
						t['phone'] ? '<a href="tel:'+t['phone'].replace(/[^0-9\+]+/ig, '')+'">'+t['phone']+'</a>' : '',
						t.email ? '<a href="mailto:' + t.email + '">' + t.email + '</a>' : '',
						t['addr:street'] ? adresses.join(' ') : '',
						t.website ? '<a href="' + (t.website.search('http') ? 'http://' : '') + t.website + '" target="_blank">' + t.website + '</a>' : ''
					];

				if (d.center) // When item has a geometry, we need to get the center
					Object.assign(d, d.center);

				if (type && d.lon && d.lat)
					geoJson.push({
						type: 'Feature',
						id: d.id,
						properties: {
							icon: icon,
							title: '<p>' + popup.join('</p><p>') + '</p>'
						},
						geometry: {
							type: 'Point',
							coordinates: [d.lon, d.lat]
						}
					});
			}
			return geoJson;
		}
	},

	error429: function() { // Too many requests or request timed out
		this.elAjaxStatus.className = 'ajax-zoom';
	},

	error504: function() { // Gateway request timed out
		this.elAjaxStatus.className = 'ajax-zoom';
	}
});
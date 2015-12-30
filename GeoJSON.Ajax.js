/*
 * Copyright (c) 2014 Dominique Cavailhez
 * Display remote layers with geoJSON format
 *
 * geoJSON Spécifications: http://geojson.org/geojson-spec.html
 * With the great help of https://github.com/LeOSW42
 */

L.GeoJSON.Ajax = L.GeoJSON.extend({
	ajaxRequest: null,

	initialize: function(urlGeoJSON, options) {
		if (urlGeoJSON)
			options.urlGeoJSON = urlGeoJSON;

		// L.GeoJSON init with blank content as we will get it later.
		L.GeoJSON.prototype.initialize.call(this, null, options);
	},

	onAdd: function(map) {
		L.GeoJSON.prototype.onAdd.call(this, map);

		// If BBOX, reload the geoJSON from the server each time the map moves/zoom.
		if (this.options.bbox)
			map.on('moveend', this.reload, this);

		// Anyway, we need to load it at the beginning.
		this.reload();
	},

	reload: function() {
		// Prepare the BBOX url options.
		if (this.options.bbox && this._map) {
			var bounds = this._map.getBounds(),
				minll = bounds.getSouthWest(),
				maxll = bounds.getNorthEast();
			this.options.argsGeoJSON['bbox'] = minll.lng + ',' + minll.lat + ',' + maxll.lng + ',' + maxll.lat;
		}

		// We prepare the Request object
		if (!this.ajaxRequest) { // Only once.
			if (window.XMLHttpRequest)
				this.ajaxRequest = new XMLHttpRequest();
			else if (window.ActiveXObject)
				this.ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP');
			else {
				alert("Your browser doesn't support AJAX requests.");
				exit;
			}
			this.ajaxRequest.context = this; // Reference the layer object for further usage.
		}

		// Process AJAX response.
		this.ajaxRequest.onreadystatechange = function(e) {
			if (e.target.readyState < 4) // Still in process
				return;
			if (e.target.status == 200)
				e.target.context.redraw(e.target.responseText);
			else
				alert('ajaxRequest error status = ' + e.target.status + ' calling ' + this.options.urlGeoJSON);
		}
		this.ajaxRequest.open('GET', this.options.proxy + this.options.urlGeoJSON + L.Util.getParamString(this.options.argsGeoJSON), true);
		this.ajaxRequest.send(null);
	},

	redraw: function(geojson) {
		// Empty the layer.
		for (l in this._layers)
			if (this._map)
				this._map.removeLayer(this._layers[l]);

		// Redraw new features.
		try {
			eval('this.addData([' + geojson + '])');
		} catch (e) {
			if (e instanceof SyntaxError)
				alert('Json syntax error on ' + this.options.urlGeoJSON + this.args + ' :\n' + geojson);
		}

		// Reference the geojson layer & the initial position of each of his sublayers (for too close markers degrouping).
		for (i in this._layers)
			L.extend(this._layers[i], {
				_geojson: this,
				_ll_init: this._layers[i]._latlng
			});
	},

	options: {
		proxy: '', // If needed by the GeoJSON server / This can be avoided if the GeoJSON server delivers: header("Access-Control-Allow-Origin: *");
		urlGeoJSON: null, // GeoJSON server URL.
		argsGeoJSON: {}, // GeoJSON server args.

		// Develop each feature:
		onEachFeature: function(feature, layer) {

			// Marker icon
			if (this.icon) {
				var icon = this.icon;
				if (typeof icon === 'function')
					icon = icon(feature);

				layer.setIcon(L.icon({
					iconUrl: icon.url,
					iconSize: [icon.size, icon.size],
					iconAnchor: [icon.size / 2, icon.size / 2],
					popupAnchor: [icon.size / 2, 0]
				}));
			}

			layer.on('mouseover mousemove', function(e) {
				// Too close markers degrouping.
				if (this._geojson &&
					this._geojson.options.degroup && // nb de pixels.
					this._latlng.equals(this._ll_init) // Only once.
				) {
					var xysi = this._map.latLngToLayerPoint(this._ll_init), // XY point overflown.
						dm = this._geojson.options.degroup;
					for (p in this._geojson._layers) {
						var point = this._geojson._layers[p]; // The other points.
						if (point._leaflet_id != this._leaflet_id) {
							var xypi = this._map.latLngToLayerPoint(point._ll_init), // XY other point.
								dp = xypi.distanceTo(xysi); // Distance to the p point p overflown.
							if (!dp) { // If the 2 points are too close, we shift right one // TODO: if 3 points are too close !
								xypi.x += dm;
								point.setLatLng(this._map.layerPointToLatLng(xypi));
							} else
								point.setLatLng(
									dp > dm ? point._ll_init // If it's far, we bring it at it initial position.
									: [ // If not, we add to the existing shift.
										this._ll_init.lat + (point._ll_init.lat - this._ll_init.lat) * dm / dp,
										this._ll_init.lng + (point._ll_init.lng - this._ll_init.lng) * dm / dp
									]
								);
						}
					}
				}

				// Hover label.
				new L.Rrose({
						offset: new L.Point(-1, -3), // Avoid to cover the marker with the popup.
						closeButton: false,
						autoPan: false
					})
					.setContent(feature.properties.nom) // TODO: This would be better to use 'name' but we need to modify also www.refuges.info
					.setLatLng(e.latlng)
					.openOn(this._map);
			});

			if (typeof this.hover == 'function')
				// Action during the overflown.
				layer.on('mouseover', function(e) {
					e.target._options.hover(e.target, 'in');
				});

			layer.on('mouseout', function(e) {
				// Remove the popup at the end of the overflown.
				if (this._map)
					this._map.closePopup();

				// Action at the overflown end
				if (typeof e.target._options == 'object' &&
					typeof e.target._options.hover == 'function')
					e.target._options.hover(e.target, 'out');
			});

			// If the feature has an url porperty:
			if (typeof this.url == 'function') {
				var url = this.url(layer);
				layer.on('click', function(e) { // Navigate the the url when we click the marker.
					if (e.originalEvent.shiftKey || e.originalEvent.ctrlKey) // Shift + Click open the url in a new window. //TODO: doesn't work on FF
						window.open(url);
					else
						document.location.href = url;
				});
			}
		}
	}
});
/*
 * Copyright (c) 2014 Dominique Cavailhez
 * https://github.com/Dominique92
 * Supported both on Leaflet V0.7 & V1.0
 *
 * Display remote layers with geoJSON format
 *
 * geoJSON Spécifications: http://geojson.org/geojson-spec.html
 * With the great initial push from https://github.com/LeOSW42
 */

L.GeoJSON.Ajax = L.GeoJSON.Style.extend({
	ajaxRequest: null,

	options: {
		proxy: '', // If needed by the GeoJSON server / This can be avoided if the GeoJSON server delivers: header('Access-Control-Allow-Origin: *');
		urlRoot: '', // Prefix to all urls used in this layer.
		urlGeoJSON: null, // GeoJSON server URL.
		argsGeoJSON: {} // GeoJSON server args.
	},

	initialize: function(urlGeoJSON, options) {
		if (typeof urlGeoJSON == 'string')
			this.options.urlGeoJSON = urlGeoJSON;
		else
			options = options || urlGeoJSON; // Simplified call, with no urlGeoJSON

		// Prepare the Request object
		if (window.XMLHttpRequest)
			this.ajaxRequest = new XMLHttpRequest();
		else if (window.ActiveXObject)
			this.ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP');
		else {
			alert('Your browser doesn\'t support AJAX requests.');
			exit;
		}
		this.ajaxRequest.context = this; // Reference the layer object for further usage.
		this.ajaxRequest.onreadystatechange = this._onreadystatechange; // Action when receiving data

		// L.GeoJSON init with blank content as we will get it later.
		L.GeoJSON.prototype.initialize.call(this, null, options);
	},

	onAdd: function(map) {
		L.GeoJSON.prototype.onAdd.call(this, map);

		this.reload(); // Load it at the beginning.

		if (this.options.bbox) // Replay if the map moves
			this._map.on('moveend', this.reload, this);
	},

	// Build the final url request to send to the server
	getUrl: function() {
		var argsGeoJSON = typeof this.options.argsGeoJSON == 'function'
			? this.options.argsGeoJSON.call(this, this)
			: this.options.argsGeoJSON;

		// Add bbox param if necessary
		if (this.options.bbox)
			argsGeoJSON.bbox = this._map.getBounds().toBBoxString();

		return this.options.proxy + this.options.urlRoot + this.options.urlGeoJSON + L.Util.getParamString(argsGeoJSON);
	},

	reload: function() {
		// Prepare the request arguments
		// Send the request
		this.ajaxRequest.open(
			'GET',
			this.getUrl(),
			true
		);

		if (this.options.disabled)
			this.redraw(); // If temporary disabled, just erase the data
		else
			this.ajaxRequest.send(null);

	},

	// Action when receiving data
	_onreadystatechange: function(e) {
		if (e.target.readyState < 4) // Still in progress
		;
		else if (e.target.status == 200)
			e.target.context.redraw(e.target.responseText);
		else if (typeof e.target.context['error'+e.target.status] == 'function')
			e.target.context['error'+e.target.status].call (e.target.context);
		else if (e.target.status)
			alert('ajaxRequest error status = ' + e.target.status + ' calling ' + e.target.context.getUrl());
	},

	redraw: function(json) {
		// Empty the layer.
		for (l in this._layers)
			if (this._map)
				this._map.removeLayer(this._layers[l]);
		this._layers = [];

		if (json) {
			try {
				var js = JSON.parse(json); // Get json data
			} catch (e) {
				if (e instanceof SyntaxError)
					alert('Json syntax error on ' + this.getUrl() + ' :\n' + json);
				return;
			}
			// Perform a special calculation if necessary (used for OSM overpass)
			if (typeof this.options.tradJson == 'function')
				js = this.options.tradJson.call(this, js);

			// Add it to the layer
			this.addData(js);
		}
	}
});
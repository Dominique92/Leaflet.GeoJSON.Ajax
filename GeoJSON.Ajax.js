/*
 * Copyright (c) 2014 Dominique Cavailhez
 * Display remote layers with geoJSON format
 *
 * geoJSON Sp�cifications: http://geojson.org/geojson-spec.html
 * With the great help of https://github.com/LeOSW42
 */

L.GeoJSON.Ajax = L.GeoJSON.extend({
	ajaxRequest: null,

	initialize: function(urlGeoJSON, options) {
		if (urlGeoJSON)
			options.urlGeoJSON = urlGeoJSON;
		// On initialise L.GeoJSON mais sans contenu puisqu'on ne l'obtiendra que plus tard par AJAX
		L.GeoJSON.prototype.initialize.call(this, null, options);
	},

	onAdd: function(map) {
		L.GeoJSON.prototype.onAdd.call(this, map);

		// Quand on bouge une carte avec bbox, il faut recharger le geoJSON � chaque fois
		if (this.options.bbox)
			map.on('moveend', this.reload, this);

		// De toute fa�on, il faut charger au d�but
		this.reload();
	},

	reload: function(argsGeoJSON) {
		L.Util.extend(this.options.argsGeoJSON, argsGeoJSON); // On change �ventuellement quelque chose

		// On pr�pare l'adresse � t�l�charger, avec la bbox.
		if (this.options.bbox && this._map) { // Les quatres angles de la vue courante (bbox � t�l�charger)
			var bounds = this._map.getBounds();
			if (bounds) {
				var minll = bounds.getSouthWest();
				var maxll = bounds.getNorthEast();
				this.options.argsGeoJSON['bbox'] = minll.lng + ',' + minll.lat + ',' + maxll.lng + ',' + maxll.lat;
			}
		}
		var args = '';
		if (this.options.argsGeoJSON)
			for (a in this.options.argsGeoJSON)
				if (this.options.argsGeoJSON[a])
					args += (args ? '&' : '?') + a + '=' + this.options.argsGeoJSON[a];

		// On pr�pare (une fois) l'objet request
		if (!this.ajaxRequest) {
			if (window.XMLHttpRequest)
				this.ajaxRequest = new XMLHttpRequest();
			else if (window.ActiveXObject)
				this.ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP');
			else {
				alert('Ce navigateur ne supporte pas les requettes AJAX.');
				exit;
			}
			this.ajaxRequest.context = this; // On m�morise le contexte
		}

		// On envoie la requete AJAX
		this.ajaxRequest.onreadystatechange = function(e) {
			if (e.target.readyState == 4 && // Si AJAX � bien retourn� ce que l'on attendait
				e.target.status == 200)
				e.target.context.redraw(e.target.responseText);
		}
		this.ajaxRequest.open('GET', this.options.proxy + this.options.urlGeoJSON + args, true);
		this.ajaxRequest.send(null);
	},

	redraw: function(geojson) {
		// On vide la couche
		for (l in this._layers)
			if (this._map)
				this._map.removeLayer(this._layers[l]);

		// On recharge les nouveaux features
		try {
			eval('this.addData([' + geojson + '])');
		} catch (e) {
			if (e instanceof SyntaxError) {
				alert('Error on ' + this.options.urlGeoJSON + ' : ' + geojson);
			}
		}
	},

	options: {
		proxy: '', // Eventuel proxy du lien du flux GeoJSON
		urlGeoJSON: null, // Lien du flux GeoJSON
		argsGeoJSON: {}, // Eventuels arguments du lien du flux GeoJSON

		// On initialise quelques comportements suivant les propri�t�s
		onEachFeature: function(feature, layer) {

			// Ic�ne de marqueur
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

			// Etiquette au survol
			layer.on('mouseover mousemove', function(e) {
				var hover_bubble = new L.Rrose({
						offset: new L.Point(-1, -3), // Evite que le curseur se retrouve sur le popup
						closeButton: false,
						autoPan: false
					})
					.setContent(feature.properties.nom)
					.setLatLng(e.latlng)
					.openOn(e.target._map);
			});
			layer.on('mouseout', function(e) {
				if (e.target._map)
					e.target._map.closePopup()
			});

			// Si le feature retourn� par la requette ajax a une propri�t� url:
			if (typeof this.url == 'function') {
				var url = this.url(feature);
				if (url)
					layer.on('click', function(e) { // Va sur la page quand on clique sur le marqueur
						if (e.originalEvent.shiftKey || e.originalEvent.ctrlKey) // Shift + Click lance le lien dans une nouvelle fen�tre
							window.open(url);
						else
							document.location.href = url;
					});
			}
		}
	}
});
Leaflet.GeoJSON.Ajax
====================

Leaflet extension for remote GeoJSON layers (Markers, Polylines, Polygons, ...) using AJAX.
Get the list of features from a remote <URL> & display it into the map with related & parametrables markers, lines & polygons.

It depends on [Leaflet.Rrose](https://github.com/erictheise/rrose).

DEMO
----
[See a DEMO](http://dominique92.github.io/MyLeaflet/github.com/Dominique92/Leaflet.GeoJSON.Ajax/)

Usage
-----

* Add ``stylesheets/leaflet.rrose.css`` and ``javascripts/rrose-src.js``

### For a geoJson remote URL:
Create a L.GeoJSON.Ajax instance & add it to the map.

```javascript
...
	new L.GeoJSON.Ajax(<URL>, <OPTIONS>)
...
```

### <URL> returns the features in a [geoJson format](http://geojson.org/geojson-spec.html)
```javascript
...
	{
		"type": "FeatureCollection",
		"features": [
		{
			"type": "Feature",
			"id": 3386,
			"properties":
				{"id":3386,"id_gps":89436,"nom":"Pas de l'Oeille","coord":{"long":"5.85426","lat":"45.30931","alt":2026},"type":{"id":3,"valeur":"point de passage","icone":"point-de-passage"},"places":{"nom":"","valeur":0},"etat":{"id":null,"valeur":""},"date":{"derniere_modif":"2011-09-17 00:00:00"},"coms":{"nb":0}},
			"geometry": {
				"type": "Point",
				"coordinates": [
					5.85426,
					45.30931
				]
			}
		}
		]
	}
...
```

### <OPTIONS>:

**argsGeoJSON** : (optional) : list of "<args>: <value>" to be added to the <URL>
```javascript
...
	{
		type_points: 'all'
	},
...
```

**icon** : string or function returning a screen : url to an image file hat will represent the feature on the map.

**url** : string or function returning a screen (optional) : url to be accessed when clicking the marker.

**bbox** : true | false (default: false) : get only features in a rectangular area.

**degroup** : integer (optional) spread on the map markers too close to be separately accessed when the mouse flies over the group.

### FULL EXAMPLE:
```javascript
...
	new L.GeoJSON.Ajax(
		'http://www.refuges.info/api/bbox', {
			argsGeoJSON: {
				type_points: 'all'
			},
			icon: function(feature) {
				return {
					url: 'http://www.refuges.info/images/icones/' + feature.properties.type.icone + '.png'
				}
			},
			url: function(feature) {
				return 'http://www.refuges.info/point/' + feature.properties.id;
			},
			bbox: true,
			degroup: 12
		}
	).addTo(map);
...
```

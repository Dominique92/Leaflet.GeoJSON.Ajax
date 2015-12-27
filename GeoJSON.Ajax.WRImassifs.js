/*
 * Copyright (c) 2016 Dominique Cavailhez
 * www.refuges.info geoJSON points of interest layer
 */

L.GeoJSON.Ajax.WRImassifs = L.GeoJSON.Ajax.extend({

	initialize: function() {
		L.GeoJSON.Ajax.prototype.initialize.call(this,
			'http://www.refuges.info/api/polygones', {
				argsGeoJSON: {
					type_polygon: 1
				},
				url: function(feature) {
					return feature.properties.lien;
				},
				style: function(feature) {
					return {
						color: feature.properties.couleur,
						weight: 2,
						opacity: 0.5
					}
				}
			}
		);
	}
});

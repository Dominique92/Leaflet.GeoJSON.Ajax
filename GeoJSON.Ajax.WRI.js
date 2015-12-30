/*
 * Copyright (c) 2016 Dominique Cavailhez
 * geoJSON from www.refuges.info
 */

// Europe muntain points of interest
L.GeoJSON.Ajax.WRIpoi = L.GeoJSON.Ajax.extend({

	initialize: function() {
		L.GeoJSON.Ajax.prototype.initialize.call(this,
			'http://www.refuges.info/api/bbox', {
				argsGeoJSON: {
					type_points: 'all',
				},
				degroup: 12,
				bbox: true,
				url: function(target) {
					return 'http://www.refuges.info/point/' + target.feature.properties.id;
				},
				icon: function(feature) {
					return {
						url: 'http://www.refuges.info/images/icones/' + feature.properties.type.icone + '.png',
						size: 16
					}
				}
			}
		);
	}
});

// French mountain limits
L.GeoJSON.Ajax.WRImassifs = L.GeoJSON.Ajax.extend({

	initialize: function() {
		L.GeoJSON.Ajax.prototype.initialize.call(this,
			'http://www.refuges.info/api/polygones', {
				argsGeoJSON: {
					type_polygon: 1
				},
				url: function(target) {
					return target.feature.properties.lien;
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

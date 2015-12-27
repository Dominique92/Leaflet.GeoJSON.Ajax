/*
 * Copyright (c) 2016 Dominique Cavailhez
 * www.refuges.info geoJSON points of interest layer
 */

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

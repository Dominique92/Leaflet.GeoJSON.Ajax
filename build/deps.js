var deps = {
	Core: {
		src: [
			'GeoJSON.Ajax.js',
			'GeoJSON.Ajax.WRIpoi.js',
			'GeoJSON.Ajax.WRImassifs.js'
		],
		desc: 'GeoJSON on Ajax layers.'
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}
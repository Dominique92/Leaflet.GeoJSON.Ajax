// Stub for V1.+ changes
L.Control.Layers.argsGeoJSON = L.Control.Layers.extend({
	initialize: function (jsonLayer) {
		L.Control.Layers.prototype.initialize.call(this, {}, {'chemineur.fr': jsonLayer});
	}
});

/**
 * Copyright (c) 2017 Reinier Battenberg
 *
 * Layer to dynamically load  a group of Mapzen Isochrones from a GeoJSON baselayer with multiple points.
 *
 * IsoChrone introduction: https://mapzen.com/blog/introducing-isochrone-service/
 *
 * Mapzen IsoChrone API: https://mapzen.com/documentation/mobility/isochrone/api-reference/
 *
 **/

L.GeoJSON.Ajax.MapzenIsochroneGroup = L.LayerGroup.extend({
  options: {
    maxLatAperture: 0.25, // (Latitude degrees) The layer will only be displayed if it's zooms to less than this latitude aperture degrees.
    costing: 'auto',
    api_key: '', // Mapzen API Key
    costing: 'auto', // @see https://mapzen.com/documentation/mobility/turn-by-turn/api-reference/#costing-models
    contours: [{
      'time': 60,
      'color': '0000ff'
    }],
    style: function (feature) {
      return {
        color: feature.properties.color,
      };
    },

  },

  initialize: function (options) {

    // Merge the options with the defaults
    L.setOptions(this, options);

    L.LayerGroup.prototype.initialize.call(this, null, this.options);
  },


  /**
   * Adds this map to the map and makes sure that for every dot added to this layer
   * an Isochrone layer is added.
   *
   * @param  {L.Map} map
   */
  onAdd: function (map) {

    if ((this.options.baselayer instanceof L.GeoJSON) || (this.options.baselayer instanceof L.GeoJSON.Ajax)) {
      this.options.baselayer.options.onEachFeature = this._onAddFeature;
      this.options.baselayer.options.IsoChroneGroup = this;
      this.options.baselayer.addTo(map);
    }
  },

  _onAddFeature: function (feature, layer) {
    // 'this' is the options on the baselayer
    if (feature.loaded) {
      console.log("isochrones already loaded");
      return;
    }
    var loptions = {};
    loptions.urlGeoJSON = '//matrix.mapzen.com/isochrone';
    loptions.bbox = false;
    loptions.api_key = this.IsoChroneGroup.options.api_key;
    loptions.countours = this.IsoChroneGroup.options.contours;
    loptions.costing = this.IsoChroneGroup.options.costing;
    loptions.maxLatAperture = this.IsoChroneGroup.options.maxLatAperture;
    loptions.idAjaxStatus = this.IsoChroneGroup.options.idAjaxStatus;

    if (this.IsoChroneGroup.options.style) {
      loptions.style = this.IsoChroneGroup.options.style;
    }

    var geom = feature.geometry.coordinates;
    var location = {
      'lon': geom[0],
      'lat': geom[1]
    };
    loptions.locations = location;
    loptions.IsoChroneGroup = this.IsoChroneGroup;
    var mylayer = new L.GeoJSON.Ajax.MapzenIsochrone(loptions);
    this.IsoChroneGroup.addLayer(mylayer);
    feature.loaded = true;

    this.IsoChroneGroup._map.on('moveend', this.IsoChroneGroup.reload, mylayer);
  },

  reload: function (map) {
    // 'this' is the MapzenIsochrone class
    // Only reload if there are visible dots
    if (this.getVisibleLocations()) {
      this.reload();
      // And once the visible dots have been loaded, never reload again
      this.options.IsoChroneGroup._map.off('moveend', this.options.IsoChroneGroup.reload, this);
    }
  }
});

/**
 * Copyright (c) 2017 Reinier Battenberg
 *
 * Layer to dynamically load the results of 1 call to the Mapzen Isochrone API.
 *
 * IsoChrone introduction: https://mapzen.com/blog/introducing-isochrone-service/
 *
 * Mapzen IsoChrone API: https://mapzen.com/documentation/mobility/isochrone/api-reference/
 *
 **/


L.GeoJSON.Ajax.MapzenIsochrone = L.GeoJSON.Ajax.extend({
  options: {
    urlGeoJSON: '//matrix.mapzen.com/isochrone',
    bbox: false,
    maxLatAperture: 0.25, // (Latitude degrees) The layer will only be displayed if it's zooms to less than this latitude aperture degrees.
    timeout: 25, // Server timeout (seconds)
    costing: 'auto',
    api_key: '', // Mapzen API Key
    polygons: true,
    costing: 'auto', // @see https://mapzen.com/documentation/mobility/turn-by-turn/api-reference/#costing-models
    contours: [{
      'time': 60,
      'color': '0000ff'
    }],
    loaded: false, // We only want to load isochrones once
    // Url args calculation
    argsGeoJSON: function (me) {
      if (this.options.loaded) {
        return false;
      }
      options = me.options;
      var locations = false;
      if (typeof options.locations.eachLayer === 'function') {
        locations = [];
        options.locations.eachLayer(function (layer) {
          locations.push(layer.latlng);
        });

        var me = this;

        function loadmore(feature, layer) {
          var loptions = me.options;
          loptions.locations = [feature.latlng];
          me.addLayer(new L.GeoJSON.Ajax.MapzenIsochrones(loptions));
        }
        me.options.locations.onEachFeature = loadmore;
        return false;

      } else {
        var locations = me.getVisibleLocations();
        if (!locations) {
          return false;
        }
      }

      var params = {
        // If options.locations is an array, use that, if its an object, put the object in an array (it is 1 location)
        'locations': locations,
        'costing': (typeof options.costing === 'String') ? options.costing : this.options.costing,
        'contours': (typeof options.contours === 'object') ? options.contours : this.options.contours,
      };
      var json = JSON.stringify(params);
      var result = {
        api_key: this.options.api_key,
        id: this._leaflet_id,
        polygons: this.options.polygons,
        'json': json
      };
      return result;
    },
    style: function (feature) {
      this.options.loaded = true;
      return {
        color: feature.properties.color,
      };
    },

  },

  initialize: function (urlGeoJSON, options) {
    if (typeof urlGeoJSON == 'string')
      this.options.urlGeoJSON = urlGeoJSON;
    else
      options = options || urlGeoJSON; // Simplified call, with no urlGeoJSON

    L.setOptions(this, options);

    L.GeoJSON.Ajax.prototype.initialize.call(this, null, this.options);
  },

  reload: function () {
    var locations = this.getVisibleLocations();
    if (locations && !this.options.loaded) {
      L.GeoJSON.Ajax.prototype.reload.call(this);
    }
  },

  /**
   * getVisibleLocations - We only want to call the api when it is really necessary. Here we do that calculation.
   *
   */
  getVisibleLocations() {
    var bbox = this._map.getBounds();
    var options = this.options;
    var alllocations = (Array.isArray(options.locations)) ? options.locations : (typeof options.locations ===
      'object') ? [this.options.locations] : false;
    var locations = [];
    var result = false;
    if (!(bbox._northEast.lng - bbox._southWest.lng > this.options.maxLatAperture)) {
      if (alllocations) {
        for (var i = 0; i < alllocations.length; i++) {
          var point = new L.LatLng(alllocations[i].lat, alllocations[i].lon);
          var contain = bbox.contains(point);
          if (contain) {
            locations.push(alllocations[i]);
            result = locations;
          }
        }
      }
    }
    return result;
  },

  error429: function () { // Too many requests or request timed out
    this.elAjaxStatus.className = 'ajax-zoom';
  },

  error504: function () { // Gateway request timed out
    this.elAjaxStatus.className = 'ajax-zoom';
  }
});

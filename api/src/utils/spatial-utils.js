'use strict';

/**
 * This file contains various utility functions for working with spatial data.
 */

const Wkx = require('wkx');
const epsg = require('epsg');
const reproject = require('reproject');

/**
 * Converts interestParcels wkt geometry data into an array of ESPG:3005 data used by leaflet.
 *
 * @param {*} geo element of interestParcels array
 * @returns [{coordinates: [], type: string}] array of ESPG:3005 objects of the form: {coordinates: [], type: string}
 */
exports.getGeometryArray = function(geo) {
  if (!geo || !geo.wktGeometry) {
    return [];
  }

  return this.convertGeoJSONToEPSG3005(this.convertWKTToGeoJson(geo.wktGeometry));
};

/**
 * Converts wkt geometry data to an array of GeoJson format polygons.
 *
 * Note on type GeometryCollection: A GeometryCollection is the type when specifying a super-set of distinct polygons.
 * But this application currently only supports polygons and stores them as separate Features (see models/features.js).
 * So this function parses out the GeometryCollection sub-polygons rather than returning a single GeometryCollection
 * object that has multiple sub-polygon elements.
 *
 * Extra: See https://geojson.org/ for GeoJson specification.
 *
 * @param {*} geo element of interestParcels
 * @returns [{coordinates: [], type: string}] array of geoJSON objects of the form: {coordinates: [], type: string}
 */
exports.convertWKTToGeoJson = function(wktGeometry) {
  if (!wktGeometry) {
    return [];
  }

  const geoJSONArray = [];

  // convert to wkt to geojson
  const geoJSON = Wkx.Geometry.parse(wktGeometry).toGeoJSON();

  if (geoJSON.type === 'GeometryCollection') {
    // parse out GeometryCollection sub-polygons.
    geoJSON.geometries.forEach(element => {
      geoJSONArray.push(element);
    });
  } else {
    geoJSONArray.push(geoJSON);
  }

  return geoJSONArray;
};

/**
 * Converts an array of GeoJson format objects to an array of EPSG:3005 format objects usable by leaflet.
 *
 * @param [{coordinates: [], type: string}] array of geoJson format objects of the form: {coordinates: [], type: string}
 * @returns [{coordinates: [], type: string}] array of EPSG:3005 format objects of the form: {coordinates: [], type: string}
 */
exports.convertGeoJSONToEPSG3005 = function(geoJSONArray) {
  if (!geoJSONArray) {
    return [];
  }

  const leafletFormatArray = [];

  geoJSONArray.forEach(element => {
    // Convert for use in leaflet coords.
    leafletFormatArray.push(reproject.toWgs84(element, 'EPSG:3005', epsg));
  });

  return leafletFormatArray;
};

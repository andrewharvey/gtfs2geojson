var fs = require('fs');
var csv = require("fast-csv");
var assert = require("assert");


var gtfs2geojson = {
    /**
     * Parse GTFS shapes.txt data given as a string or readable stream and return a GeoJSON FeatureCollection
     * of features with LineString geometries.
     *
     * @param {string|fs.ReadStream} gtfs csv or readable stream content of shapes.txt
     * @param {function} callback callback function with the geojson featurecollection as the first argument
     */
    lines: function(gtfs, callback) {
        var shape_id = null;
        var coordinates = [];
        var shape_pt_sequence = null;
        var shape_ids_seen = {}

        var features = [];

        var parser;
        if (gtfs instanceof fs.ReadStream) {
            parser = csv.fromStream(gtfs, {headers: true});
        }else{
            parser = csv.fromString(gtfs, {headers: true});
        }

        parser
            .on("data", function(data){
                if (data.shape_id != shape_id) {
                    // new shape
                    assert.ok(!(data.shape_id in shape_ids_seen), 'shape_id out of order: ' + data.shape_id);
                    shape_ids_seen[data.shape_id] = true;

                    // commit the previous shape to features, if this isn't the first call
                    if (shape_id !== null) {
                        features.push({
                            type: 'Feature',
                            id: shape_id,
                            properties: null,
                            geometry: {
                                type: 'LineString',
                                coordinates: coordinates
                            }
                        });
                    }

                    // reset shape variables
                    shape_id = data.shape_id;
                    shape_pt_sequence = null;
                    coordinates = [];
                }

                assert.ok(shape_pt_sequence === null || data.shape_pt_sequence > shape_pt_sequence, 'shape_pt_sequence out of order: shape_id=' + data.shape_id + ' shape_pt_sequence=' + data.shape_pt_sequence);
                shape_pt_sequence = parseInt(data.shape_pt_sequence);

                coordinates.push([parseFloat(data.shape_pt_lon), parseFloat(data.shape_pt_lat)]);
            })
            .on("end", function(){
                callback({
                    type: 'FeatureCollection',
                    features: features
                });
            });
    },

    /**
     * Parse GTFS stops.txt data given as a string or readable stream and return a GeoJSON FeatureCollection
     * of features with Point geometries.
     *
     * @param {string|fs.ReadStream} gtfs csv or readable stream content of stops.txt
     * @param {function} callback callback function with the geojson featurecollection as the first argument
     *
     */

    stops: function(gtfs, callback) {
        var parser;
        if (gtfs instanceof fs.ReadStream) {
            parser = csv.fromStream(gtfs, {headers: true});
        }else{
            parser = csv.fromString(gtfs, {headers: true});
        }

        var stops = [];
        parser
            .on("data", function(data){
                stops.push(data);
            })
            .on("end", function(){
                callback({
                    type: 'FeatureCollection',
                    features: Object.keys(stops).map(function(id) {
                        var feature = {
                            type: 'Feature',
                            id: stops[id].stop_id,
                            properties: {
                                stop_name: stops[id].stop_name,
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: [
                                    parseFloat(stops[id].stop_lon),
                                    parseFloat(stops[id].stop_lat)
                                ]
                            }
                        };
                        if ('stop_code' in stops[id]) {
                            feature.properties.stop_code = stops[id].stop_code;
                        }
                        if ('location_type' in stops[id]) {
                            feature.properties.location_type = stops[id].location_type ? 1 : 0;
                        }
                        if ('parent_station' in stops[id]) {
                            feature.properties.parent_station = stops[id].parent_station;
                        }
                        if ('stop_timezone' in stops[id]) {
                            feature.properties.stop_timezone = stops[id].stop_timezone;
                        }
                        if ('wheelchair_boarding' in stops[id]) {
                            feature.properties.wheelchair_boarding = parseInt(stops[id].wheelchair_boarding || 0);
                        }
                        if ('platform_code' in stops[id]) {
                            feature.properties.platform_code = parseInt(stops[id].platform_code || 0);
                        }

                        return feature;
                    })
                });
            });
    }
};

module.exports = gtfs2geojson;

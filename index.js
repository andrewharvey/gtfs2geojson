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
     * @param {boolean} [assumeOrdered] If true the shapes.txt is assumed to be ordered by shape_id and
     *     shape_pt_sequence as this reduces memory usage and processing time. However since the GTFS spec
     *     doesn't mandate this ordering, the default is false. If assumeOrdered is true but an out of order
     *     line is found, an Error will be thrown.
     */
    lines: function(gtfs, callback, assumeOrdered) {
        // variables for assumeOrdered is true
        var shape_id = null;
        var coordinates = [];
        var shape_pt_sequence = null;
        var shape_ids_seen = {}

        var features = [];

        // variables for assumeOrdered is false
        var csvData = [];

        var parser;
        if (gtfs instanceof fs.ReadStream) {
            parser = csv.fromStream(gtfs, {headers: true});
        }else{
            parser = csv.fromString(gtfs, {headers: true});
        }

        parser
            .on("data", function(data){
                if (assumeOrdered) {
                    if (data.shape_id != shape_id) {
                        // new shape
                        assert.ok(!(data.shape_id in shape_ids_seen), 'shape_id out of order: ' + data.shape_id);
                        shape_ids_seen[data.shape_id] = true;

                        // commit the previous shape to features, if this isn't the first call
                        if (shape_id !== null) {
                            features.push({
                                type: 'Feature',
                                id: shape_id,
                                properties: {
                                    shape_id: shape_id
                                },
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
                }else{
                    csvData.push(data);
                }
            })
            .on("end", function(){
                if (assumeOrdered) {
                    callback({
                        type: 'FeatureCollection',
                        features: features
                    });
                }else{
                    var shapes = csvData.reduce(function(memo, row) {
                        memo[row.shape_id] = (memo[row.shape_id] || []).concat(row);
                        return memo;
                    }, {});
                    callback({
                        type: 'FeatureCollection',
                        features: Object.keys(shapes).map(function(id) {
                            return {
                                type: 'Feature',
                                id: id,
                                properties: {
                                    shape_id: shape_id
                                },
                                geometry: {
                                    type: 'LineString',
                                    coordinates: shapes[id].sort(function(a, b) {
                                        return +a.shape_pt_sequence - b.shape_pt_sequence;
                                    }).map(function(coord) {
                                        return [
                                            parseFloat(coord.shape_pt_lon),
                                            parseFloat(coord.shape_pt_lat)
                                        ];
                                    })
                                }
                            };
                        })
                    });
                }
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
                                stop_id: stops[id].stop_id,
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

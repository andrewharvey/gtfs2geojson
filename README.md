# gtfs2geojson

Convert [GTFS](https://developers.google.com/transit/gtfs/?hl=en) data into
[GeoJSON](http://geojson.org/).

    npm install --save gtfs2geojson

## Command Line

    gtfs2geojson [path-to-gtfs-directory]

The `shapes.txt` and `stops.txt` files need to be in the directory you specify, or if none is
specified the current directory is assumed.

`shapes.geojson` and `stops.geojson` will also be created in this directory.

## API


`lines(gtfs, callback)`

Parse GTFS `shapes.txt` data given as a string or readable stream and invokes callback with
a GeoJSON FeatureCollection of features with LineString geometries.

`stops(gtfs, callback)`

Parse GTFS `stops.txt` data given as a string or readable stream and invokes callback with
a GeoJSON FeatureCollection of features with Point geometries.

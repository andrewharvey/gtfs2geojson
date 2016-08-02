# gtfs2geojson

[![CircleCI](https://circleci.com/gh/tmcw/gtfs2geojson/tree/master.svg?style=svg)](https://circleci.com/gh/tmcw/gtfs2geojson/tree/master)<Paste>

Convert [GTFS](https://developers.google.com/transit/gtfs/?hl=en) data into
[GeoJSON](http://geojson.org/).

    npm install --save gtfs2geojson

## Command Line

    gtfs2geojson [--shapes-assume-ordered] [--output output_path] [source_path]

The `shapes.txt` and `stops.txt` files need to be in the `source_path` directory you
specify, or if none is specified the current directory is assumed. If `--output` is not
specified the `shapes.geojson` and `stops.geojson` will be created in the `source_path`
directory.

If `--shapes-assume-ordered` is provided the `shapes.txt` is assumed to be ordered by
`shape_id` and `shape_pt_sequence` as this reduces memory usage and processing time.
However since the GTFS spec doesn't mandate this ordering, the default is to not assume
any ordering.


## API


`lines(gtfs, callback, assumeOrdered)`

Parse GTFS `shapes.txt` data given as a string or readable stream and invokes callback with
a GeoJSON FeatureCollection of features with LineString geometries. If `assumeOrdered` is
true, the GTFS `shapes.txt` is assumed to be ordered by `shape_id` and `shape_pt_sequence`.
However since the GTFS spec doesn't mandate this ordering, the default is false.

`stops(gtfs, callback)`

Parse GTFS `stops.txt` data given as a string or readable stream and invokes callback with
a GeoJSON FeatureCollection of features with Point geometries.

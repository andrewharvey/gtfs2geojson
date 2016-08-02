var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var gtfs2geojson = require('../');

test('#lines', function(t) {
  gtfs2geojson.lines(
    fs.readFileSync(path.join(__dirname, 'fixtures/sample.input'), 'utf8'), function (result) {
      if (process.env.UPDATE) {
        fs.writeFileSync(path.join(__dirname, 'fixtures/sample.output.geojson'),
          JSON.stringify(result, null, 2));
      }

      t.deepEqual(result, JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/sample.output.geojson'))));
      t.end();
    });
});

test('#stops', function(t) {
  gtfs2geojson.stops(
    fs.readFileSync(path.join(__dirname, 'fixtures/stops.input'), 'utf8'), function (result) {
      if (process.env.UPDATE) {
        fs.writeFileSync(path.join(__dirname, 'fixtures/stops.output.geojson'),
          JSON.stringify(result, null, 2));
      }

      t.deepEqual(result, JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/stops.output.geojson'))));
      t.end();
    });
});

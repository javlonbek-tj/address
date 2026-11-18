import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseBoundaryFile } from './parseBoundaryFile';

const square = [
  [
    [68.7, 40.5],
    [68.71, 40.5],
    [68.71, 40.51],
    [68.7, 40.51],
    [68.7, 40.5],
  ],
];

const geojsonFile = (data: unknown, name = 'boundary.geojson') =>
  new File([JSON.stringify(data)], name);

test('keeps a WGS84 polygon feature as Polygon', async () => {
  const result = await parseBoundaryFile(
    geojsonFile({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: square } }),
  );
  assert.deepEqual(result, { type: 'Polygon', coordinates: square });
});

test('merges several polygon features into a MultiPolygon', async () => {
  const result = await parseBoundaryFile(
    geojsonFile({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: square } },
        { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [square] } },
        { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [68.7, 40.5] } },
      ],
    }),
  );
  assert.equal(result.type, 'MultiPolygon');
  assert.equal(result.coordinates.length, 2);
});

test('converts EPSG:3857 coordinates to WGS84', async () => {
  const mercator = square.map((ring) =>
    ring.map(([lng, lat]) => [
      (lng * 20037508.34) / 180,
      (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) * (20037508.34 / 180),
    ]),
  );
  const result = await parseBoundaryFile(
    geojsonFile({ type: 'Polygon', coordinates: mercator }, 'boundary.json'),
  );
  const [lng, lat] = (result.coordinates as number[][][])[0][0];
  assert.ok(Math.abs(lng - 68.7) < 1e-6);
  assert.ok(Math.abs(lat - 40.5) < 1e-6);
});

test('rejects files without polygons', async () => {
  await assert.rejects(
    parseBoundaryFile(geojsonFile({ type: 'Point', coordinates: [68.7, 40.5] })),
    /poligon topilmadi/,
  );
});

test('rejects unsupported file types', async () => {
  await assert.rejects(parseBoundaryFile(new File(['x'], 'boundary.kml')), /Faqat/);
});

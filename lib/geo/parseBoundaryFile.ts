import type {
  Feature,
  FeatureCollection,
  Geometry,
  GeoJSON,
  MultiPolygon,
  Polygon,
  Position,
} from 'geojson';
import { toWgs84 } from '@turf/turf';

export type BoundaryGeometry = Polygon | MultiPolygon;

export async function parseBoundaryFile(file: File): Promise<BoundaryGeometry> {
  const name = file.name.toLowerCase();
  let collections: FeatureCollection[];

  if (name.endsWith('.zip')) {
    const { default: shp } = await import('shpjs');
    const result = await shp(await file.arrayBuffer());
    collections = Array.isArray(result) ? result : [result];
  } else if (name.endsWith('.geojson') || name.endsWith('.json')) {
    collections = [toFeatureCollection(JSON.parse(await file.text()))];
  } else {
    throw new Error("Faqat .geojson, .json yoki SHP (.zip) fayl yuklang");
  }

  const polygons = collections
    .map((collection) => (isProjected(collection) ? toWgs84(collection) : collection))
    .flatMap((collection) => collection.features)
    .flatMap((feature) => (feature.geometry ? extractPolygons(feature.geometry) : []));

  if (polygons.length === 0) {
    throw new Error('Faylda poligon topilmadi');
  }

  return polygons.length === 1
    ? { type: 'Polygon', coordinates: polygons[0] }
    : { type: 'MultiPolygon', coordinates: polygons };
}

function toFeatureCollection(json: GeoJSON): FeatureCollection {
  if (json.type === 'FeatureCollection') return json;
  if (json.type === 'Feature') return { type: 'FeatureCollection', features: [json] };
  const feature: Feature = { type: 'Feature', geometry: json, properties: {} };
  return { type: 'FeatureCollection', features: [feature] };
}

// UzKad and many SHP exports use EPSG:3857 (metres); anything outside lon/lat range is treated as such.
function isProjected(collection: FeatureCollection): boolean {
  const position = firstPosition(collection);
  return !!position && (Math.abs(position[0]) > 180 || Math.abs(position[1]) > 90);
}

function firstPosition(collection: FeatureCollection): Position | undefined {
  for (const feature of collection.features) {
    const polygon = feature.geometry && extractPolygons(feature.geometry)[0];
    if (polygon?.[0]?.[0]) return polygon[0][0];
  }
}

function extractPolygons(geometry: Geometry): Position[][][] {
  switch (geometry.type) {
    case 'Polygon':
      return [geometry.coordinates];
    case 'MultiPolygon':
      return geometry.coordinates;
    case 'GeometryCollection':
      return geometry.geometries.flatMap(extractPolygons);
    default:
      return [];
  }
}

declare module 'shpjs' {
  import type { FeatureCollection } from 'geojson';

  type ShpResult = FeatureCollection & { fileName?: string };

  export default function shp(
    input: ArrayBuffer | string,
  ): Promise<ShpResult | ShpResult[]>;
}

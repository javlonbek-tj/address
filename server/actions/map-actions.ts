'use server';

import { getDistricts } from '../data/districts';

export async function fetchDistricts(regionId: string) {
  try {
    return await getDistricts(regionId);
  } catch (error) {
    console.error(`Error fetching districts for region ${regionId}:`, error);
    return [];
  }
}

import { Bhojanalaya } from '../types';

export const brajBhojanalayas: Bhojanalaya[] = [];

export function getAllBhojanalayas(): Bhojanalaya[] {
  return brajBhojanalayas;
}

export function getBhojanalayaBySlug(slug: string): Bhojanalaya | undefined {
  return brajBhojanalayas.find((b) => b.slug.toLowerCase() === slug.toLowerCase() || b.id.toLowerCase() === slug.toLowerCase());
}

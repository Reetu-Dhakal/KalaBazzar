import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  generateUniqueSlug,
  generateSKU,
  generateOrderNumber,
  slugify,
  createPaginationMeta,
  formatCurrency,
  truncate,
  getInitials,
} from '../utils/helpers';

describe('helpers', () => {
  it('generateSlug produces a url-safe slug', () => {
    expect(generateSlug('Hand-Painted Mandala Plate!')).toBe('hand-painted-mandala-plate');
    expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    expect(generateSlug('Thangka & Painting')).toBe('thangka-painting');
  });

  it('slugify transliterates accented characters', () => {
    expect(slugify('Café Art')).toBe('cafe-art');
    expect(slugify('Zürich')).toBe('zurich');
  });

  it('generateUniqueSlug appends a counter when slug exists', async () => {
    const taken = new Set(['pottery', 'pottery-1']);
    const slug = await generateUniqueSlug('pottery', s => Promise.resolve(taken.has(s)));
    expect(slug).toBe('pottery-2');
  });

  it('generateOrderNumber is unique and prefixed', () => {
    const one = generateOrderNumber();
    const two = generateOrderNumber();
    expect(one).toMatch(/^KB-/);
    expect(one).not.toBe(two);
  });

  it('generateSKU includes the category prefix', () => {
    expect(generateSKU('Khukuri', 'Weapons')).toMatch(/^WEA-/);
    expect(generateSKU('Khukuri')).toMatch(/^PRD-/);
  });

  it('createPaginationMeta computes pagination fields', () => {
    expect(createPaginationMeta(1, 20, 100)).toMatchObject({
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrev: false,
    });
    expect(createPaginationMeta(5, 20, 100)).toMatchObject({ hasNext: false });
  });

  it('formatCurrency formats NPR amounts', () => {
    expect(formatCurrency(150)).toContain('150');
    expect(formatCurrency(5000)).toContain('5,000');
  });

  it('truncate shortens long strings', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('a much longer sentence', 8)).toBe('a much l...');
  });

  it('getInitials returns up to two initials', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('John')).toBe('J');
  });
});
import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeBookmarks, addBookmark, loescheBookmark } from '../src/core/bookmarks.js'

test('Bookmark speichern und laden je Liste', () => {
  localStorage.removeItem('er_bookmarks')
  addBookmark('artikel', 'Preise & Marge', ['sku', 'vk', 'ek', 'marge'])
  const bm = ladeBookmarks('artikel')
  assert.equal(bm.length, 1)
  assert.equal(bm[0].name, 'Preise & Marge')
  assert.deepEqual(bm[0].sichtbar, ['sku', 'vk', 'ek', 'marge'])
  assert.ok(bm[0].id)
})

test('Bookmarks sind je Liste getrennt', () => {
  localStorage.removeItem('er_bookmarks')
  addBookmark('artikel', 'A', ['sku'])
  addBookmark('auftrag', 'B', ['auftrag'])
  assert.equal(ladeBookmarks('artikel').length, 1)
  assert.equal(ladeBookmarks('auftrag').length, 1)
})

test('Bookmark löschen', () => {
  localStorage.removeItem('er_bookmarks')
  addBookmark('artikel', 'X', ['sku'])
  const id = ladeBookmarks('artikel')[0].id
  loescheBookmark('artikel', id)
  assert.equal(ladeBookmarks('artikel').length, 0)
})

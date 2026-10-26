// Deploy base path. Empty on the root of a domain (modaza.com.br); "/modaza" on a GitHub Pages
// project site (talys-marques.github.io/modaza/). Set with the BASE_PATH env var at build time.

export const BASE = `/${(process.env.BASE_PATH ?? '').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');

/** Prefixes a root-relative path ("/produtos/") with the base; other URLs pass through. */
export const url = (path) => (path.startsWith('/') && !path.startsWith('//') ? BASE + path.slice(1) : path);

/** Inverse of url(): the path relative to the site root, as written in the data files. */
export const stripBase = (path) => (BASE !== '/' && path.startsWith(BASE) ? path.slice(BASE.length - 1) : path);

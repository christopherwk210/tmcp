import { protocol } from 'electron';
import { join, extname } from 'path';
import { readFile } from 'fs';
import { URL } from 'url';

// Go up one directory four times: Out of src, lib, hybrid-electron, then node_modules
const pathEscape = '../';

export function createApplicationProtocol(relativePath = pathEscape) {
  if (protocol.isProtocolHandled('app')) return;

  const scheme = 'app';
  const applicationMimeTypes: Record<string, string> = {
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.svgz': 'image/svg+xml',
    '.json': 'application/json',
    '.wasm': 'application/wasm'
  };

  protocol.handle(scheme, request => {
    return new Promise(resolve => {
      let pathName = new URL(request.url).pathname;
      pathName = decodeURI(pathName);
  
      readFile(join(__dirname, relativePath, pathName), (error, data) => {
        if (error) console.error(`Failed to read ${pathName} on ${scheme} protocol`, error);
        const extension = extname(pathName).toLowerCase();
        const mimeType = applicationMimeTypes[extension] || '';
        resolve(new Response(data, { headers: { 'Content-Type': mimeType } }));
      });
    })
  });
}
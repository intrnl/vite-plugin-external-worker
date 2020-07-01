let SUFFIX_WORKER = '?worker=external';
let SUFFIX_SHAREDWORKER = '?sharedworker=external';

function generateRuntimeCode ({ url, type = 'Worker' }) {
  return `
    export let url = ${url};

    export default function init () {
      return new ${type}(url, { type: 'module' });
    }
  `;
}

function serverPlugin ({ app }) {
  app.use((ctx, next) => {
    let { url, path: filename } = ctx;

    if (url.endsWith(SUFFIX_WORKER) || url.endsWith(SUFFIX_SHAREDWORKER)) {
      ctx.type = 'js';
      ctx.body = generateRuntimeCode({
        url: JSON.stringify(filename),
        type: url.endsWith(SUFFIX_SHAREDWORKER)
          ? 'SharedWorker'
          : 'Worker',
      });

      return;
    }

    return next();
  });
}

let rollupPlugin = {
  name: 'vite-plugin:external-worker',
  async resolveId (id, importer) {
    let scheme;
    let filename;

    if (!id) return;

    if (id.endsWith(SUFFIX_WORKER)) {
      scheme = SUFFIX_WORKER;
      filename = id.slice(0, id.length - SUFFIX_WORKER.length);
    } else if (id.endsWith(SUFFIX_SHAREDWORKER)) {
      scheme = SUFFIX_SHAREDWORKER;
      filename = id.slice(0, id.length - SUFFIX_SHAREDWORKER.length);
    } else {
      return;
    }

    let resolved = (await this.resolve(filename, importer)).id;
    if (!resolved) throw new Error(`Cannot find module ${filename}`);

    return resolved + scheme;
  },
  load (id) {
    if (id.endsWith(SUFFIX_WORKER) || id.endsWith(SUFFIX_SHAREDWORKER)) {
      let ref = this.emitFile({
        type: 'chunk',
        id: id.slice(0, id.length - (
          id.endsWith(SUFFIX_SHAREDWORKER)
            ? SUFFIX_SHAREDWORKER.length
            : SUFFIX_WORKER.length
        )),
      });

      return generateRuntimeCode({
        url: `import.meta.ROLLUP_FILE_URL_${ref}`,
        type: id.endsWith(SUFFIX_SHAREDWORKER)
          ? 'SharedWorker'
          : 'Worker',
      });
    }
  },
};

module.exports = function externalWorkerPlugin () {
  return {
    configureServer: serverPlugin,
    rollupInputOptions: {
      plugins: [
        rollupPlugin,
      ],
    },
  };
};

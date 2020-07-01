# vite-plugin-external-worker

[Vite](https://github.com/vitejs/vite) plugin that allows for non-inline
bundling of web workers, allowing for code splitting between main entrypoint
and the worker.

[See here for details](https://bundlers.tooling.report/code-splitting/between-workers/)

## Setup

- Install it with your package manager of choice
  - [npm](https://npmjs.com/get-npm): `npm i -D vite-plugin-external-worker`
  - [pnpm](https://pnpm.js.org/en/installation): `pnpm i -D vite-plugin-external-worker`
  - [yarn](https://classic.yarnpkg.com/en/docs/install/) `yarn add -D vite-plugin-external-worker`
- Add it into your `vite.config.js` file  
  ```js
  import worker from 'vite-plugin-external-worker';

  export default {
    plugins: [
      worker(),
    ],
  };
  ```
- Import workers with the `?worker=external` suffix

## TypeScript

TypeScript might complain about importing workers with the suffix, but you can
fix that by adding the below type declarations,

```ts
declare module '*?worker=external' {
  export default function (): Worker;
  export let url: string;
}

declare module '*?sharedworker=external' {
  export default function (): SharedWorker;
  export let url: string;
}
```

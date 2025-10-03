import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['lib/index.ts'],
    outDir: 'ts-built',
    format: ['esm'],
    target: 'node20',
    splitting: false,
    clean: true,
    dts: true
});

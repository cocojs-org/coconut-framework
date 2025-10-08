import path from 'node:path';
import { rollup } from 'rollup';
import process from 'node:process';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';

export const build = async () => {
  const result = await rollup({
    input: path.join(process.cwd(), './src/lib.ts'),
    plugins: [
      typescript({
        compilerOptions: {
          target: 'ESNext',
          lib: ['dom', 'esnext'],
          declaration: true,
          declarationDir: './dist/types',
          jsx: 'preserve',
          resolveJsonModule: true,
          plugins: [
            {
              transform: '@cocojs/type-extractor',
              transformProgram: true,
            },
          ],
        },
      }),
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        plugins: [
          [
            require.resolve('@babel/plugin-proposal-decorators'),
            { version: '2023-11' },
          ],
          [
            require.resolve('@babel/plugin-transform-react-jsx', {
              paths: [path.resolve(__dirname, '..', '../node_modules')],
            }),
            {
              runtime: 'automatic',
              importSource: 'coco-mvc',
            },
          ],
        ],
      }),
    ],
  });
  await result.write({
    file: path.join(process.cwd(), './dist/bundle.esm.js'),
    format: 'es',
  });
};

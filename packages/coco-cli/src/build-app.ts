import * as path from 'path';
import webpack from 'webpack';
import { fork } from 'child_process';

const runWebpack = async () => {
  const { default: config } = await import(
    path.resolve(__dirname, '../build-config/webpack.config.js')
  );
  return webpack(config, (err, stats) => {
    console.log(
      stats.toString({
        chunks: false, // 使构建过程更静默无输出
        colors: true, // 在控制台展示颜色
      })
    );
  });
};

async function buildDotCoco() {
  return new Promise(function (resolve, reject) {
    const buildDotCocoProcess = fork(
      path.join(__dirname, './build-dot-coco-process/index.js'),
      ['run-as-process']
    );
    buildDotCocoProcess.on('exit', (code) => reject());
    buildDotCocoProcess.on('message', (msg) => {
      if (msg === 'build-success') {
        resolve(true);
        buildDotCocoProcess.kill();
      }
    });
    buildDotCocoProcess.send('build-once');
  });
}

async function buildApp() {
  await buildDotCoco();
  await runWebpack();
}

export default buildApp;

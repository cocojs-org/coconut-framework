import { fork, spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { resolveCli } from './util/resolve';
import process from 'node:process';

const startWebpackDevServer = () => {
  const devServer = resolveCli('webpack-dev-server');
  const webpackConfigPath = path.resolve(
    __dirname,
    '../build-config/webpack.config.js'
  );
  return spawn(devServer, ['--config', webpackConfigPath], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
};

async function devApp() {
  const watchProcess = fork(
    path.join(__dirname, './build-dot-coco-process/index.js'),
    ['build-and-watch']
  );
  let webpackDevProcess: ChildProcess;
  watchProcess.on('message', (msg) => {
    switch (msg) {
      case 'prepare-success': {
        webpackDevProcess = startWebpackDevServer();
        webpackDevProcess.on('exit', () => {
          if (watchProcess) {
            watchProcess.kill();
          }
          process.exit(0);
        });
        break;
      }
      default: {
        console.info(msg);
        break;
      }
    }
  });
  watchProcess.on('exit', () => {
    if (webpackDevProcess) {
      webpackDevProcess.kill();
    }
    process.exit(0);
  });
  process.on('exit', () => {
    if (watchProcess) {
      watchProcess.kill();
    }
    if (webpackDevProcess) {
      webpackDevProcess.kill();
    }
  });
  process.on('uncaughtException', () => {
    if (watchProcess) {
      watchProcess.kill();
    }
    if (webpackDevProcess) {
      webpackDevProcess.kill(); // 显式杀死子进程
    }
  });

  watchProcess.send('start');
}

export default devApp;

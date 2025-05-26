import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import process from 'node:process';

const startWebpackDevServer = () => {
  return fork(path.join(__dirname, './webpack-process/index.js'), [
    'run-as-process',
  ]);
};

async function devApp() {
  const buildDotCocoProcess = fork(
    path.join(__dirname, './build-dot-coco-process/index.js'),
    ['run-as-process']
  );
  let webpackDevProcess: ChildProcess;
  buildDotCocoProcess.on('message', (msg) => {
    switch (msg) {
      case 'build-success': {
        webpackDevProcess = startWebpackDevServer();
        webpackDevProcess.on('exit', () => {
          if (buildDotCocoProcess) {
            buildDotCocoProcess.kill();
          }
          process.exit(0);
        });
        webpackDevProcess.send('start-server');
        break;
      }
      default: {
        console.info(`收到来自buildDotCocoProcess未知的消息：${msg}`);
        break;
      }
    }
  });
  buildDotCocoProcess.on('exit', () => {
    if (webpackDevProcess) {
      webpackDevProcess.kill();
    }
    process.exit(0);
  });
  process.on('exit', () => {
    if (buildDotCocoProcess) {
      buildDotCocoProcess.kill();
    }
    if (webpackDevProcess) {
      webpackDevProcess.kill();
    }
  });
  process.on('uncaughtException', () => {
    if (buildDotCocoProcess) {
      buildDotCocoProcess.kill();
    }
    if (webpackDevProcess) {
      webpackDevProcess.kill(); // 显式杀死子进程
    }
  });

  buildDotCocoProcess.send('build-and-watch');
}

export default devApp;

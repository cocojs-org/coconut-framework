import * as path from 'path';
import { fork } from 'child_process';

const runWebpack = async () => {
  return new Promise((resolve, reject) => {
    const webpackProcess = fork(
      path.join(__dirname, './webpack-process/index.js'),
      ['run-as-process']
    );
    webpackProcess.on('exit', (code) => reject());
    webpackProcess.on('message', (msg) => {
      if (msg === 'build-success') {
        resolve(true);
        webpackProcess.kill();
      }
    });
    webpackProcess.send('build-once');
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

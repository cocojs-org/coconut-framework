import process from 'node:process';
import WebpackBuilder from './webpack-builder';

function startListening(builder: WebpackBuilder) {
  process.on('exit', async () => {
    await builder.stopServer();
  });

  process.on('message', async (msg) => {
    switch (msg) {
      case 'build-once': {
        await builder.build();
        process.send('build-success');
        break;
      }
      case 'start-server': {
        await builder.startServer();
        break;
      }
    }
  });
}

function startAsProcess() {
  const secondArgv = process.argv[2];
  if (secondArgv === 'run-as-process') {
    const builder = new WebpackBuilder();
    startListening(builder);
  }
}

startAsProcess();

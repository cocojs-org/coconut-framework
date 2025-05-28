import process from 'node:process';
import DotCocoBuilder from './dot-coco-builder';

function startListening(builder: DotCocoBuilder) {
  let watching = false;
  process.on('message', (msg) => {
    switch (msg) {
      case 'build-once': {
        builder.build();
        process.send('build-success');
        break;
      }
      case 'build-and-watch': {
        builder.build();
        process.send('init-build-success');
        watching = true;
        builder.startWatch();
        break;
      }
      default: {
        process.send(`dot coco process rcv msg:[${msg}]`);
        break;
      }
    }
  });

  async function handleTerminate() {
    if (watching) {
      await builder.stopWatch();
      watching = false;
    }
    process.exit(0);
  }
  process.on('SIGTERM', handleTerminate);
  process.on('SIGINT', handleTerminate);
}

function startAsProcess() {
  const secondArgv = process.argv[2];
  if (secondArgv === 'run-as-process') {
    const builder = new DotCocoBuilder();
    startListening(builder);
  }
}

startAsProcess();

export default DotCocoBuilder;

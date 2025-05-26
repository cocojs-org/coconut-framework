import process from 'node:process';
import DotCocoBuilder from './dot-coco-builder';

function startListening(builder: DotCocoBuilder) {
  process.on('message', (msg) => {
    switch (msg) {
      case 'build-once': {
        builder.build();
        process.send('build-success');
        builder.startWatch();
        break;
      }
      case 'build-and-watch': {
        builder.build();
        process.send('build-success');
        break;
      }
    }
  });
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

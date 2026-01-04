import process from 'node:process';
import DotCocoBuilder, { Event } from './dot-coco-builder';

function startListening(builder: DotCocoBuilder) {
    process.on('message', async (msg) => {
        switch (msg) {
            case 'build-once': {
                await builder.buildOnce();
                process.send('build-success');
                break;
            }
            case 'build-and-watch': {
                builder.addEventListener((e: Event) => {
                    if (e === Event.InitBuildFinished) {
                        process.send('init-build-success');
                    }
                });
                builder.buildAndWatch();
                break;
            }
            default: {
                process.send(`dot coco process rcv msg:[${msg}]`);
                break;
            }
        }
    });

    async function handleTerminate() {
        await builder.stopWatch();
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

import process from 'node:process';
import WebpackBuilder from './webpack-builder';

function startListening(builder: WebpackBuilder) {
    let terminating = false;

    process.on('exit', async () => {
        await builder.stopServer();
    });

    process.on('message', async (msg) => {
        switch (msg) {
            case 'build-once': {
                await builder.build();
                if (terminating) {
                    return;
                }
                process.send('build-success');
                break;
            }
            case 'start-server': {
                if (terminating) {
                    return;
                }
                await builder.startServer();
                break;
            }
            default: {
                process.send(`webpack process rcv msg:[${msg}]`);
                break;
            }
        }
    });

    async function handleTerminate() {
        terminating = true;
        await builder.stopServer();
        process.exit(0);
    }
    process.on('SIGTERM', handleTerminate);
    process.on('SIGINT', handleTerminate);
}

function startAsProcess() {
    const secondArgv = process.argv[2];
    if (secondArgv === 'run-as-process') {
        const builder = new WebpackBuilder();
        startListening(builder);
    }
}

startAsProcess();

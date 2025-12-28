import { type ChildProcess, fork } from 'child_process';
import path from 'path';
import process from 'node:process';

class WorkFlow {
    private webpackProcess: ChildProcess;
    private buildDotCocoProcess: ChildProcess;
    private processingTask: Promise<void>;
    private resolve: Function;
    private reject: Function;

    constructor() {
        this.init();
    }

    private init() {
        process.on('exit', () => {
            this.terminate();
        });
    }

    public forkAll() {
        this.webpackProcess = this.startProcess(path.join(__dirname, './webpack-process/index.js'));
        this.webpackProcess.on('message', this.webpackMessageCb.bind(this));
        this.buildDotCocoProcess = this.startProcess(path.join(__dirname, './build-dot-coco-process/index.js'));
        this.buildDotCocoProcess.on('message', this.buildDotCocoMessageCb.bind(this));
    }

    private startProcess(entry: string) {
        const cp = fork(entry, ['run-as-process']);
        cp.on('exit', (code) => {
            this.terminate();
        });
        return cp;
    }

    private buildDotCocoMessageCb(msg: string) {
        switch (msg) {
            case 'build-success':
                if (!this.webpackProcess.killed) {
                    this.webpackProcess.send('build-once');
                }
                break;
            case 'init-build-success':
                if (!this.webpackProcess.killed) {
                    this.webpackProcess.send('start-server');
                }
                break;
            default:
                console.info('rcv msg from buildDotCoco process', msg);
                break;
        }
    }

    private webpackMessageCb(msg: string) {
        switch (msg) {
            case 'build-success':
                this.resolve?.();
                break;
            default:
                console.info('rcv msg from webpack process', msg);
                break;
        }
    }

    public async build() {
        return await this.run('build-once');
    }

    public async dev() {
        return await this.run('build-and-watch');
    }

    private async run(task: string) {
        if (this.processingTask) {
            throw new Error('已经存在一个任务');
        }
        this.buildDotCocoProcess.send(task);
        this.processingTask = new Promise<void>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        return this.processingTask;
    }

    public terminate() {
        if (this.webpackProcess && !this.webpackProcess.killed) {
            this.webpackProcess.kill();
        }
        if (this.buildDotCocoProcess && !this.buildDotCocoProcess.killed) {
            this.buildDotCocoProcess.kill();
        }
    }
}

export default WorkFlow;

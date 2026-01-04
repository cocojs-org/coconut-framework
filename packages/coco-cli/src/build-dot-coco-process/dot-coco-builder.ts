/**
 * 负责生成src/.coco文件夹及内部一切文件，目前有2个文件：
 * * 入口文件 src/.coco/index.tsx
 * * 运行时配置文件 src/.coco/application.json
 */
import genIndexTsx from './gen-index-tsx';
import mergeProperties from './merge-properties';
import Project from '../util/project';
import path from 'node:path';
import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import fs from 'fs';
import { scanOneFile, ScanResult } from './scanner';
import { defaultPropertiesName, propertiesFileName } from '../util/env';
import { debounce } from '../util/debounce';

export enum Event {
    InitBuildFinished, // 第一次构建成功
}

const debouncedGenIndexTsx = debounce(genIndexTsx);
const debouncedMergeProperties = debounce(mergeProperties);

class DotCocoBuilder {
    static ignoredSrcFileExt = ['.js', '.jsx', '.css', '.less', '.sass', '.scss', '.json', '.node'];

    status: 'constructed' | 'running' = null;
    isWatch: boolean = null;
    project: Project;
    iocComponents: ScanResult;
    cmd: 'dev' | 'build' = null;
    srcWatcher: FSWatcher;
    srcWatcherReadyTriggered: boolean;
    propertiesWatcher: FSWatcher;
    propertiesWatcherReadyTriggered: boolean;

    stopPromise: Promise<void>;
    stopPromiseResolved: () => void;
    stopPromiseRejected: () => void;
    trigger: (event: Event) => void;

    private reset() {
        this.status = 'constructed';
        this.isWatch = null;
        this.iocComponents = [];
        this.cmd = null;
        this.srcWatcher = null;
        this.srcWatcherReadyTriggered = false;
        this.propertiesWatcher = null;
        this.propertiesWatcherReadyTriggered = false;
        this.stopPromise = null;
        this.stopPromiseResolved = null;
        this.stopPromiseRejected = null;
        this.trigger = null;
    }

    /**
     * 目前仅支持单体应用，为了单元测试，可以传入子应用相对项目根的路径
     * @param monorepoPath
     */
    constructor(monorepoPath: string = '.') {
        this.reset();
        this.project = new Project(monorepoPath);
        this.ensureEmptyDotCocoFolder(this.project);
    }

    private ensureEmptyDotCocoFolder = (project: Project) => {
        if (fs.existsSync(project.dotCocoAbsPath)) {
            fs.rmSync(project.dotCocoAbsPath, { recursive: true });
        }
        fs.mkdirSync(project.dotCocoAbsPath);
    };

    isTsTsxFile = (path: string) => {
        return path.endsWith('.ts') || path.endsWith('.tsx');
    };

    handleAddFile = (filePath: string) => {
        if (this.isTsTsxFile(filePath)) {
            const scanRlt = scanOneFile(this.project.genFullPath(filePath));
            if (scanRlt !== null) {
                if (!this.iocComponents.find((i) => i.filePath === scanRlt.filePath)) {
                    // 新增一个组件
                    this.iocComponents.push(scanRlt);
                    debouncedGenIndexTsx(this.project, this.iocComponents);
                } else {
                    // ignore
                }
            }
        }
    };

    handleDeleteFile = (filePath: string) => {
        if (this.isTsTsxFile(filePath)) {
            const fullPath = this.project.genFullPath(filePath);
            const index = this.iocComponents.findIndex((i) => i.filePath === fullPath);
            if (index > 0) {
                this.iocComponents.splice(index, 1);
                debouncedGenIndexTsx(this.project, this.iocComponents);
            }
        }
    };

    private tryEmitInitialBuildFinished = () => {
        if (this.srcWatcherReadyTriggered && this.propertiesWatcherReadyTriggered) {
            // 因为生成文件都是在debounce函数中执行的，所以等待genIndexTsx执行后再通知初次构建成功。
            // 这里使用使用简单的做法，真正严谨就是同步的，不过暂时不需要。
            setTimeout(() => this.trigger?.(Event.InitBuildFinished), 1000);
            if (!this.isWatch) {
                setTimeout(this.stopWatch, 1000);
            }
        }
    };

    /**
     * 所描 src 下所有的 ts tsx 文件
     * 排除.coco文件夹
     * 目前不会校验page组件是否在/src/page文件夹下的，后续有必要的话添加。
     */
    watchSrc = () => {
        this.srcWatcher = chokidar.watch(this.project.srcAbsPath, {
            ignored: (absPath, stats) => {
                if (absPath === this.project.dotCocoAbsPath) {
                    // 忽略.coco文件夹
                    return true;
                }
                if (DotCocoBuilder.ignoredSrcFileExt.find((ext) => absPath.endsWith(ext))) {
                    // 忽略非 ts tsx 文件
                    return true;
                }
                return false;
            },
            ignoreInitial: false,
            cwd: this.project.srcAbsPath,
        });
        this.srcWatcher.on('add', this.handleAddFile);
        this.srcWatcher.on('change', this.handleAddFile);
        this.srcWatcher.on('unlink', this.handleDeleteFile);
        this.srcWatcher.on('ready', () => {
            this.srcWatcherReadyTriggered = true;
            this.tryEmitInitialBuildFinished();
        });
        this.srcWatcher.on('error', (error) => {
            process.send(`src error ${error}`);
        });
    };

    watchProperties = () => {
        this.propertiesWatcher = chokidar.watch(this.project.propertiesAbsPath, {
            ignored: (absPath, stats) => {
                const filename = path.relative(this.project.propertiesAbsPath, absPath);
                return (
                    absPath !== this.project.propertiesAbsPath &&
                    filename !== defaultPropertiesName &&
                    filename !== propertiesFileName(this.cmd)
                );
            },
            ignoreInitial: false,
            cwd: this.project.propertiesAbsPath,
        });
        this.propertiesWatcher.on('add', () => debouncedMergeProperties(this.project, this.cmd));
        this.propertiesWatcher.on('change', () => debouncedMergeProperties(this.project, this.cmd));
        this.propertiesWatcher.on('unlink', () => debouncedMergeProperties(this.project, this.cmd));
        this.propertiesWatcher.on('ready', () => {
            this.propertiesWatcherReadyTriggered = true;
            this.tryEmitInitialBuildFinished();
        });
        this.propertiesWatcher.on('error', (error) => {
            process.send(`properties error ${error}`);
        });
    };

    public addEventListener(listener: (e: Event) => void) {
        if (this.trigger) {
            throw new Error('目前只需要支持一个listener');
        }
        this.trigger = listener;
    }

    /**
     * 开始构建
     * @param watch 是否启用 watch。否在ready事件之后终止；是：需要手动调用stopWatch停止
     */
    private start = async (watch: boolean) => {
        if (this.status !== 'constructed') {
            return this.stopPromise;
        }
        this.status = 'running';
        this.isWatch = !!watch;
        this.stopPromise = new Promise<void>((resolve, reject) => {
            this.stopPromiseResolved = resolve;
            this.stopPromiseRejected = reject;
        });
        this.watchSrc();
        this.watchProperties();
        return this.stopPromise;
    };

    stopWatch = async () => {
        if (this.status !== 'running') {
            return;
        }
        if (this.srcWatcher) {
            await this.srcWatcher.close();
            this.srcWatcher = null;
        }
        if (this.propertiesWatcher) {
            await this.propertiesWatcher.close();
            this.propertiesWatcher = null;
        }
        this.stopPromiseResolved();
        this.reset();
    };

    public buildOnce = async () => {
        return this.start(false);
    };

    public buildAndWatch = () => {
        return this.start(true);
    };
}

export default DotCocoBuilder;

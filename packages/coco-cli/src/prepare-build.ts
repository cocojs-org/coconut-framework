import genIndexTsx from './gen-index-tsx';
import mergeProperties from './merge-properties';
import { validateConstructor } from './validate-constructor';
import Project from './project';
import path from 'node:path';
import process from 'node:process';
import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import fs from 'fs';
import { scanOneFile, scan, scanPathConfig, ScanResult } from './scanner';
import { defaultPropertiesName, propertiesFileName } from './util/env';

class Watcher {
  project: Project;
  iocComponents: ScanResult;
  cmd: 'dev' | 'build';
  srcWatcher: FSWatcher;
  propertiesWatcher: FSWatcher;

  /**
   * 目前仅支持单体应用，为了单元测试，可以传入子应用相对项目根的路径
   * @param monorepoPath
   */
  constructor(monorepoPath: string = '.') {
    this.project = new Project(monorepoPath);
    this.iocComponents = scan(this.project);
  }

  ensureEmptyDotCocoFolder = (project: Project) => {
    if (fs.existsSync(project.dotCocoAbsPath)) {
      fs.rmSync(project.dotCocoAbsPath, { recursive: true });
    }
    fs.mkdirSync(project.dotCocoAbsPath);
  };

  /**
   * 完成构建前的准备工作
   */
  doPrepareWork = () => {
    this.ensureEmptyDotCocoFolder(this.project);
    validateConstructor(this.project);
    mergeProperties(this.project, this.cmd);
    genIndexTsx(this.project, this.iocComponents);
  };

  startListen = () => {
    process.on('message', (msg) => {
      switch (msg) {
        case 'start': {
          this.doPrepareWork();
          process.send('prepare-success');
          this.startWatch();
          break;
        }
      }
    });
  };

  isTsTsxFile = (path: string) => {
    return path.endsWith('.ts') || path.endsWith('.tsx');
  };

  handleAddFile = (filePath: string) => {
    if (this.isTsTsxFile(filePath)) {
      const { dir, ext } = path.parse(filePath);
      const match = scanPathConfig.find((item) => {
        return dir.startsWith(item.path) && item.fileExt === ext;
      });
      if (!match) {
        return;
      }
      const scanRlt = scanOneFile(
        this.project.genFullPath(filePath),
        match.decorator
      );
      if (scanRlt !== null) {
        if (!this.iocComponents.find((i) => i.filePath === scanRlt.filePath)) {
          // 新增一个组件
          this.iocComponents.push(scanRlt);
          genIndexTsx(this.project, this.iocComponents);
        } else {
          // ignore
        }
      }
    }
  };

  handleDeleteFile = (filePath: string) => {
    if (this.isTsTsxFile(filePath)) {
      const fullPath = this.project.genFullPath(filePath);
      const index = this.iocComponents.findIndex(
        (i) => i.filePath === fullPath
      );
      if (index > 0) {
        this.iocComponents.splice(index, 1);
        genIndexTsx(this.project, this.iocComponents);
      }
    }
  };

  watchSrc = () => {
    this.srcWatcher = chokidar.watch(this.project.srcAbsPath, {
      ignored: (absPath, stats) => {
        // 忽略.coco文件夹
        const srcPath = path.relative(this.project.srcAbsPath, absPath);
        return srcPath.startsWith('.coco');
      },
      ignoreInitial: true,
      cwd: this.project.srcAbsPath,
    });
    this.srcWatcher.on('add', this.handleAddFile);
    this.srcWatcher.on('change', this.handleAddFile);
    this.srcWatcher.on('unlink', this.handleDeleteFile);
  };

  watchProperties = () => {
    this.propertiesWatcher = chokidar.watch(this.project.propertiesAbsPath, {
      ignored: (absPath, stats) => {
        const filename = path.relative(this.project.propertiesAbsPath, absPath);
        if (
          absPath === this.project.propertiesAbsPath ||
          filename === defaultPropertiesName ||
          filename === propertiesFileName(this.cmd)
        ) {
          return false;
        }
        return true;
      },
      ignoreInitial: true,
      cwd: this.project.srcAbsPath,
    });
    this.propertiesWatcher.on('add', () =>
      mergeProperties(this.project, this.cmd)
    );
    this.propertiesWatcher.on('change', () =>
      mergeProperties(this.project, this.cmd)
    );
    this.propertiesWatcher.on('unlink', () =>
      mergeProperties(this.project, this.cmd)
    );
  };

  startWatch = () => {
    this.watchSrc();
    this.watchProperties();
  };
}

function build(ifWatch: boolean) {
  const watcher = new Watcher();
  watcher.cmd = ifWatch ? 'dev' : 'build';
  if (ifWatch) {
    watcher.startListen();
  } else {
    watcher.doPrepareWork();
    process.exit(0);
  }
}

function startAsProcess() {
  const secondArgv = process.argv[2];
  if (secondArgv === 'build-and-watch' || secondArgv === 'build-once') {
    build(secondArgv === 'build-and-watch');
  }
}

startAsProcess();

export default Watcher;

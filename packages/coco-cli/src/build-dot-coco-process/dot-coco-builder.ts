/**
 * 负责生成src/.coco文件夹及内部一切文件，目前有2个文件：
 * * 入口文件 src/.coco/index.tsx
 * * 运行时配置文件 src/.coco/application.json
 */
import genIndexTsx from './gen-index-tsx';
import mergeProperties from './merge-properties';
import { validateConstructor } from './validate-constructor';
import Project from '../util/project';
import path from 'node:path';
import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import fs from 'fs';
import { scanOneFile, scan, scanPathConfig, ScanResult } from './scanner';
import { defaultPropertiesName, propertiesFileName } from '../util/env';

class DotCocoBuilder {
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
  public build = () => {
    this.ensureEmptyDotCocoFolder(this.project);
    validateConstructor(this.project);
    mergeProperties(this.project, this.cmd);
    genIndexTsx(this.project, this.iocComponents);
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

export default DotCocoBuilder;

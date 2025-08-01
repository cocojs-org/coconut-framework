import * as process from 'node:process';
import * as path from 'node:path';

/**
 * 返回每个单独项目相对于process.cwd的路径
 * @param _dirname 项目的位置，一般来说测试文件中的__dirname，同时也是package.json的目录
 */
export function pkgPath(_dirname) {
  return path.relative(process.cwd(), _dirname);
}

/**
 * 返回.coco/index.ts字符串。都是固定的
 */
export const cocoIdxStr = './src/.coco/index';
export const cocoIdxAppJson = './src/.coco/application.json';
export const cocoIdxFolder = './src/.coco';

import fs from 'fs';
import path from 'path';
import { propertiesFileName, defaultPropertiesName } from '../util/env';
import Project from '../util/project';

function readFile(filepath: string) {
  let content = '{}';
  if (fs.existsSync(filepath)) {
    content = fs.readFileSync(filepath, 'utf8');
  }
  return content;
}

function merge(project: Project, cmd: string) {
  const defaultConfigStr = readFile(
    path.join(project.absPath, `properties/${defaultPropertiesName}`)
  );
  const envConfigStr = readFile(
    path.join(project.absPath, `properties/${propertiesFileName(cmd)}`)
  );
  let defaultConfig = {};
  try {
    defaultConfig = JSON.parse(defaultConfigStr);
  } catch (error) {
    // 写了一半的配置文件
  }
  let envConfig = {};
  try {
    envConfig = JSON.parse(envConfigStr);
  } catch (error) {
    // 写了一半的配置文件
  }
  const config = merge2properties(defaultConfig, envConfig);
  const filePath = path.join(project.absPath, 'src/.coco/application.json');
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), {
    encoding: 'utf-8',
  });
}

// 从前往后依次合并配置对象
function merge2properties(...configs: any[]): Record<string, any> {
  if (configs.length === 0) {
    return {};
  }

  return configs.reduce((prev, currentConfig) => {
    return doMerge(prev, currentConfig);
  });
}

function doMerge(config1: any, config2: any) {
  const type1 = typeof config1;
  const type2 = typeof config2;
  if (type1 !== type2) {
    return config2;
  } else if (
    type2 === 'string' ||
    type2 === 'boolean' ||
    type2 === 'number' ||
    config2 === null ||
    Array.isArray(config2)
  ) {
    return config2;
  }
  const keys2 = Object.keys(config2);
  const merged = { ...config1 };
  for (const key of keys2) {
    merged[key] = doMerge(config1[key], config2[key]);
  }
  return merged;
}

export default merge;

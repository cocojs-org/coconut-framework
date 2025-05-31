import process from 'node:process';

const cmdDefaultEnvMap = {
  dev: 'dev',
  build: 'prod',
};

const defaultPropertiesName = 'application.json';
/**
 * 综合NODE_ENV和命令得到运行时配置文件名
 * 如果有NODE_ENV，则返回
 * 如果没有，则考虑dev和build默认设定
 */
const propertiesFileName = (cmd: string) => {
  const env = process.env.NODE_ENV || cmdDefaultEnvMap[cmd] || '';
  return env ? `application.${env}.json` : defaultPropertiesName;
};

const defaultConfigName = 'config.js';
/**
 * 得到构建配置的名称
 */
const configFileName = (cmd: string) => {
  const env = process.env.NODE_ENV || cmdDefaultEnvMap[cmd] || '';
  return env ? `config.${env}.js` : defaultConfigName;
};

export {
  propertiesFileName,
  defaultPropertiesName,
  configFileName,
  defaultConfigName,
};

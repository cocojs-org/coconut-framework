import devApp from './dev-app';
import buildApp from './build-app';
import { build as buildLib } from './build-lib';

/**
 * 应用项目命令
 * coco app build 构建
 * coco app dev 开发
 */
function execAppCmd(action: string) {
    switch (action) {
        case 'build': {
            buildApp();
            break;
        }
        case 'dev': {
            devApp();
            break;
        }
        default: {
            console.log(`Unknown app action: ${action}`);
            break;
        }
    }
}

/**
 * 组件库项目命令
 * coco lib build 构建
 */
function execLibCmd(action: string) {
    switch (action) {
        case 'build': {
            buildLib();
            break;
        }
        case 'dev': {
            devApp();
            break;
        }
        default: {
            console.log(`Unknown lib action: ${action}`);
            break;
        }
    }
}

function cli(command: string, domain: string, rest: string[]) {
    const [action] = rest;
    switch (domain) {
        case 'app': {
            execAppCmd(action);
            break;
        }
        case 'lib': {
            execLibCmd(action);
            break;
        }
        default: {
            console.log(`Unknown domain: ${domain}`);
            break;
        }
    }
}
import { _test_helper } from './__tests__';

export { cli, _test_helper };

/**
 * 扫描获取所有ioc组件
 */
import * as fs from 'fs';
import * as path from 'path';
import Project from '../util/project';
import { numberToLetter } from '../util/number-2-letter';

enum PATH_TYPE {
    FOLDER,
    FILE,
}
let number = 0;
const RE_DEFAULT_EXPORT = /export\s+default\s+(\w+);?\s?/;

export type ScanResult = { className: string; filePath: string }[];

export function scanOneFile(filePath: string, decorator: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(decorator) && RE_DEFAULT_EXPORT.test(content)) {
        // todo 需要校验export出来的class名称和注解的是否一致
        // const className = RE_DEFAULT_EXPORT.exec(content)[1];
        return { className: numberToLetter(number++), filePath };
    }
    return null;
}

function doScan(type: PATH_TYPE, _path: string, fileExt: string, decorator: string) {
    const result: ScanResult = [];
    if (!fs.existsSync(_path)) {
        return result;
    }
    if (type === PATH_TYPE.FOLDER) {
        const files = fs.readdirSync(_path);
        for (const file of files) {
            const filePath = path.join(_path, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                const find = doScan(PATH_TYPE.FOLDER, filePath, fileExt, decorator);
                if (find.length) {
                    result.push(...find);
                }
            } else if (stat.isFile() && path.extname(filePath) === fileExt) {
                const r = scanOneFile(filePath, decorator);
                if (r) {
                    result.push(r);
                }
            }
        }
    } else if (type === PATH_TYPE.FILE) {
        const r = scanOneFile(_path, decorator);
        if (r) {
            result.push(r);
        }
    }
    return result;
}

export const scanPathConfig = [
    {
        // 配置项
        type: PATH_TYPE.FOLDER,
        path: Project.CONFIG_DIR,
        fileExt: '.ts',
        decorator: '@configuration',
    },
    {
        // 布局
        type: PATH_TYPE.FOLDER,
        path: Project.LAYOUT_DIR,
        fileExt: '.tsx',
        decorator: '@layout',
    },
    {
        // 页面
        type: PATH_TYPE.FOLDER,
        path: Project.PAGE_DIR,
        fileExt: '.tsx',
        decorator: '@page',
    },
    {
        // 控制器
        type: PATH_TYPE.FOLDER,
        path: Project.Flow_DIR,
        fileExt: '.ts',
        decorator: '@flow',
    },
    {
        // 通用组件
        type: PATH_TYPE.FOLDER,
        path: Project.COMPONENTS_DIR,
        fileExt: '.ts',
        decorator: '@component',
    },
    {
        // 接口
        type: PATH_TYPE.FOLDER,
        path: Project.API_DIR,
        fileExt: '.ts',
        decorator: '@api',
    },
    {
        // 视图
        type: PATH_TYPE.FOLDER,
        path: Project.VIEW_DIR,
        fileExt: '.tsx',
        decorator: '@view',
    },
    {
        // 全局数据
        type: PATH_TYPE.FOLDER,
        path: Project.GLOBAL_DATA_DIR,
        fileExt: '.ts',
        decorator: '@globalData',
    },
    {
        // 全局状态
        type: PATH_TYPE.FOLDER,
        path: Project.STORE_DIR,
        fileExt: '.ts',
        decorator: '@store',
    },
    {
        // 入口文件
        type: PATH_TYPE.FILE,
        path: Project.APPLICATION,
        fileExt: '.ts',
        decorator: '@webApplication',
    },
];

export const scan = (project: Project): ScanResult => {
    return scanPathConfig.reduce((prev, curr) => {
        prev.push(...doScan(curr.type, project.genFullPath(curr.path), curr.fileExt, curr.decorator));
        return prev;
    }, []);
};

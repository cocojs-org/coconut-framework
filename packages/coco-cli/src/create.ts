const jsonfile = require('jsonfile');
const glob = require('glob');
const ejs = require('ejs');
import prompts from 'prompts';
import path from 'path';
import fse from 'fs-extra';

async function create(type: 'app' | 'lib') {
  let userCancelled = false;
  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message:
          '项目名称（在当前目录下新建文件夹，且设置package.json的name）？',
      },
      {
        type: 'text',
        name: 'author',
        message: '作者（package.json的author）？',
      },
      {
        type: (projectName: string) => {
          const targetDir = path.resolve(process.cwd(), projectName);
          return fse.pathExistsSync(targetDir) ? 'confirm' : null;
        },
        name: 'deleteExistFolder',
        message: (projectName: string) => {
          return `当前目录下已经存在${projectName}，确定【删除${projectName}】并继续？`;
        },
        initial: true,
      },
    ],
    {
      onCancel: () => {
        userCancelled = true;
      },
    }
  );

  if (userCancelled) {
    return;
  }
  const { projectName, author, deleteExistFolder } = response;
  const targetDir = path.resolve(process.cwd(), projectName);
  if (deleteExistFolder === false) {
    return;
  } else if (deleteExistFolder) {
    fse.removeSync(targetDir);
  }

  const folder = type === 'app' ? 'app' : type === 'lib' ? 'lib' : '';
  if (!folder) {
    console.error('指定的模版目录不应该为空，', type);
    return;
  }
  const tempFolderPath = path.resolve(__dirname, '..', `template-${folder}`);
  if (!fse.pathExistsSync(tempFolderPath)) {
    console.error('模版目录不存在', tempFolderPath, type);
    return;
  }
  // 复制非ejs文件
  const noEjsFiles = glob.sync(`${tempFolderPath}/**/*`, {
    ignore: '**/*.ejs',
    nodir: true,
  });
  for (const file of noEjsFiles) {
    const targetPath = path.join(
      targetDir,
      path.relative(tempFolderPath, file)
    );
    fse.copySync(file, targetPath);
  }

  // 生成package.json
  const packageJsonEjs = path.resolve(tempFolderPath, 'package.json.ejs');
  const cliPackageJson = jsonfile.readFileSync(
    path.resolve(__dirname, '..', 'package.json')
  );
  // 目前coco-mvc和coco-cli的版本号保持一致
  const version = cliPackageJson.version;
  const transformerVersion =
    cliPackageJson.devDependencies['@cocojs/typescript-transformer'];
  const renderedContent = await ejs.renderFile(packageJsonEjs, {
    name: projectName,
    author,
    version,
    transformerVersion,
  });
  await fse.outputFileSync(
    path.join(targetDir, 'package.json'),
    renderedContent
  );
}

export const createApp = () => create('app');
export const createLib = () => create('lib');

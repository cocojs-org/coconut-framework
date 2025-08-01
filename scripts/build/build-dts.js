const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const process = require('node:process');
const { Extractor, ExtractorConfig, ExtractorResult } = require('@microsoft/api-extractor');

const isTest = process.env.NODE_ENV === 'test';

function buildDtsTmp(packageName) {
  const packagesDir = path.join(process.cwd(), 'packages', packageName);
  if (!fs.existsSync(packagesDir)) {
    throw new Error(`packages directory[${packageName}] does not exist!`);
  }
  cp.execSync(`tsc --build packages/${packageName}`);
}

function runApiExtractor(packageName, mainEntryPointFilePath) {
  const packageDir = path.join(process.cwd(), 'packages', packageName);
  const config = ExtractorConfig.prepare({
    configObject: {
      "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
      "mainEntryPointFilePath": path.join(packageDir, mainEntryPointFilePath),
      "projectFolder": packageDir,
      "dtsRollup": {
        "enabled": true,
        "untrimmedFilePath": path.join(packageDir, "./dist/index.d.ts"),
      },
      "apiReport": { "enabled": false },
      "docModel": { "enabled": false },
      "tsdocMetadata": { "enabled": false },
      "compiler": {
        // 指向你的 tsconfig.json 路径（根据实际项目调整）
        "tsconfigFilePath": path.join(packageDir, "./tsconfig.json")
      }
    },
    packageJsonFullPath: path.join(packageDir, 'package.json'),
  });

  // 2. 执行 API 提取
  const extractorResult = Extractor.invoke(config, {
    localBuild: true,
    showDiagnostics: true,
  });

  // 3. 处理结果
  if (extractorResult.succeeded) {
    console.log(`API Extractor completed successfully`);
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
      ` and ${extractorResult.warningCount} warnings`
    );
  }
}

const cocoMvcDts = [
  {
    packageName: 'shared',
    mainEntryPointFilePath: './dts-tmp/index.d.ts'
  },
  {
    packageName: 'react',
    mainEntryPointFilePath: './dts-tmp/index.d.ts'
  },
  {
    packageName: 'react-reconciler',
    mainEntryPointFilePath: './dts-tmp/src/index.d.ts'
  },
  {
    packageName: 'react-dom',
    mainEntryPointFilePath: './dts-tmp/src/index.d.ts'
  },
  {
    packageName: 'coco-ioc-container',
    mainEntryPointFilePath: './dts-tmp/index.d.ts'
  },
  {
    packageName: 'coco-reactive',
    mainEntryPointFilePath: './dts-tmp/index.d.ts'
  },
  {
    packageName: 'coco-render',
    mainEntryPointFilePath: './dts-tmp/index.d.ts'
  },
  {
    packageName: 'coco-router',
    mainEntryPointFilePath: './dts-tmp/index.d.ts'
  },
  {
    packageName: 'coco-mvc',
    mainEntryPointFilePath: isTest ? './dts-tmp/test.d.ts' : './dts-tmp/index.d.ts'
  }
]

const cliDts = [
  {
    packageName: 'coco-cli',
    mainEntryPointFilePath: './dts-tmp/index.d.ts'
  }
]

function doBuild(t) {
  buildDtsTmp(t.packageName);
  runApiExtractor(t.packageName, t.mainEntryPointFilePath);
}
function build() {
  cocoMvcDts.forEach(doBuild)
  cliDts.forEach(doBuild)
}

build();

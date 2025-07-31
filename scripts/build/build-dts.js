const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const process = require('node:process');
const { Extractor, ExtractorConfig, ExtractorResult } = require('@microsoft/api-extractor');

function buildDtsTmp(packageName) {
  const packagesDir = path.join(process.cwd(), 'packages', packageName);
  if (!fs.existsSync(packagesDir)) {
    throw new Error(`packages directory[${packageName}] does not exist!`);
  }
  cp.execSync(`tsc --build packages/${packageName}`);
}

function runApiExtractor(packageName, mainEntryPointName) {
  const packageDir = path.join(process.cwd(), 'packages', packageName);
  const config = ExtractorConfig.prepare({
    configObject: {
      "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
      "mainEntryPointFilePath": path.join(packageDir, `./dts-tmp/${mainEntryPointName}`),
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
    mainEntryPointName: 'index.d.ts'
  },
  {
    packageName: 'react',
    mainEntryPointName: 'index.d.ts'
  },
  {
    packageName: 'react-reconciler',
    mainEntryPointName: 'src/index.d.ts'
  },
  {
    packageName: 'react-dom',
    mainEntryPointName: 'src/index.d.ts'
  },
  {
    packageName: 'coco-ioc-container',
    mainEntryPointName: 'index.d.ts'
  },
  {
    packageName: 'coco-reactive',
    mainEntryPointName: 'index.d.ts'
  },
  {
    packageName: 'coco-render',
    mainEntryPointName: 'index.d.ts'
  },
  {
    packageName: 'coco-router',
    mainEntryPointName: 'index.d.ts'
  },
  {
    packageName: 'coco-mvc',
    mainEntryPointName: 'index.d.ts'
  }
]

const cliDts = [
  {
    packageName: 'coco-cli',
    mainEntryPointName: 'index.d.ts'
  }
]

function doBuild(t) {
  buildDtsTmp(t.packageName);
  runApiExtractor(t.packageName, t.mainEntryPointName);
}
function build() {
  cocoMvcDts.forEach(doBuild)
  cliDts.forEach(doBuild)
}

build();

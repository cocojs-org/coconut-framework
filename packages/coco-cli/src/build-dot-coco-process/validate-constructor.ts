import Project from '../util/project';
import { scan } from './scanner';
import fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isExpressionStatement, isCallExpression } from '@babel/types';

export function validateConstructor(project: Project) {
  // 1. 扫描所有ioc组件
  const iocComponents = scan(project);
  // 2. 生成.coco文件
  const importStatements = iocComponents.map(({ className, filePath }) => {
    return filePath;
  });
  for (const filePath of importStatements) {
    validate(filePath);
  }
}

function validate(filePath: string) {
  const inputCode = fs.readFileSync(filePath, 'utf-8');

  const ast = parse(inputCode, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
  });

  traverse.default(ast, {
    ClassDeclaration(path) {
      const body = path.node.body.body;
      body.forEach((method) => {
        if (method.kind === 'constructor') {
          const statements = method.body.body;
          statements.forEach((statement) => {
            if (
              isExpressionStatement(statement) &&
              isCallExpression(statement.expression)
            ) {
              if (statement.expression.callee.type === 'Super') {
                return;
              }
              let fnName;
              if (statement.expression.callee.type === 'MemberExpression') {
                // todo fix it
                // @ts-ignore
                fnName = statement.expression.callee.property.name;
              } else if (statement.expression.callee.type === 'Identifier') {
                fnName = statement.expression.callee.name;
              } else {
                console.warn('未知函数调用类型', statement.expression.callee);
                fnName = JSON.stringify(statement.expression.callee);
              }
              throw new Error(`不允许在构造函数内执行函数调用【${fnName}】。`);
            }
          });
        }
      });
    },
  });
}

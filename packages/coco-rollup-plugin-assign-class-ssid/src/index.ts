import { Plugin } from 'rollup';
import { parse } from '@babel/parser';
import MagicString from 'magic-string';
import type {
    Node,
    ClassDeclaration,
    ClassExpression,
    ClassProperty,
    ClassBody,
    Identifier
} from '@babel/types';

// 定义 Class Visitor 的类型
type ClassVisitor = (node: ClassDeclaration | ClassExpression) => void;

const ssidKeyName = '$$id';

/**
 * 递归遍历 AST 查找 Class 节点
 * @param ast - 当前要遍历的节点或节点数组
 * @param visitor - 找到 Class 节点时调用的回调函数
 */
function findClasses(ast: Node | Node[] | undefined, visitor: ClassVisitor): void {
    if (ast === undefined || ast === null) {
        return;
    }

    // 1. 处理节点数组 (如 Program body)
    if (Array.isArray(ast)) {
        ast.forEach(node => findClasses(node, visitor));
        return;
    }

    // 2. 处理单个对象节点
    if (typeof ast === 'object' && ast.type) {
        const node = ast as Node;

        // 找到目标节点：ClassDeclaration 或 ClassExpression
        if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
            visitor(node as ClassDeclaration | ClassExpression);
        }

        // 递归遍历所有子属性（避免遍历 start/end 等元数据）
        for (const key in node) {
            // 排除元数据属性
            if (key !== 'range' && key !== 'start' && key !== 'end' && key !== 'loc' && key !== 'type') {
                const prop = (node as any)[key];

                // 递归查找子节点或子节点数组
                if (prop && (typeof prop === 'object' || Array.isArray(prop))) {
                    findClasses(prop as Node | Node[], visitor);
                }
            }
        }
    }
}


export default function addStaticIdPlugin(): Plugin {
    return {
        name: 'rollup-plugin-assign-class-ssid',

        transform(code: string, id: string) {
            // 1. 过滤：只处理 TypeScript 文件
            if (!/\.(ts|tsx)$/.test(id)) {
                return null;
            }
            const s = new MagicString(code);

            // 2. 解析：启用 TypeScript 和现代装饰器语法
            const ast = parse(code, {
                sourceType: 'module',
                plugins: [
                    'decorators',
                ]
            });
             let modified = false;
             // 3. 遍历和修改逻辑
            findClasses(ast.program.body, (node) => {
                const hasDecorators = node.decorators && node.decorators.length > 0;
                 // 必须有装饰器且必须有名称 (id)
                if (hasDecorators && node.id) {
                    const className = node.id.name;
                    const classBody = node.body as ClassBody; // 确定类型为 ClassBody
                     // 🚨 修复点：添加类型守卫检查 classBody.start 是否为有效数字
                    if (typeof classBody.start !== 'number' || classBody.start < 0) {
                        // 如果起始位置丢失或无效，我们无法安全地插入代码，应跳过
                        this.warn(`[add-static-id] Skipping class in ${id}: ClassBody start position is missing.`);
                        return;
                    }
                     const alreadyExists = classBody.body.some(
                        el => {
                            // 必须是 ClassProperty 且 key 是 Identifier
                            if (el.type === 'ClassProperty' && el.key.type === 'Identifier') {
                                const prop = el as ClassProperty;
                                const key = prop.key as Identifier;
                                 if (!prop.static || key.name !== ssidKeyName) {
                                    return false;
                                }
                                const value = prop.value;
                                if (value!.type !== 'StringLiteral') {
                                    this.error(
                                        `想要为类${className}自定义"${ssidKeyName}"，值必须是字符串字面量`
                                    );
                                }
                                if (!value!.value! || value!.value.trim() === '') {
                                    this.error(
                                        `想要为类${className}自定义"${ssidKeyName}"，值不能是空字符串`
                                    );
                                }
                                return true;
                            }
                            return false;
                        }
                    );
                     if (alreadyExists) {
                        // 已经存在就是用户显式指定
                        return;
                    }
                     // 插入的代码
                    const staticPropCode = `static ${ssidKeyName} = '${className}';\n`;

                    // 插入点：ClassBody 的起始大括号 { 之后 (+1)
                    // Babel AST 节点上的 start 属性是标准字段
                    const insertionPoint = classBody.start + 1;
                    s.appendLeft(insertionPoint, staticPropCode);
                    modified = true;
                }
            });

            if (modified) {
                return {
                    code: s.toString(),
                    map: s.generateMap({ source: id, hires: true })
                };
            }

            return null;
        },
    };
}
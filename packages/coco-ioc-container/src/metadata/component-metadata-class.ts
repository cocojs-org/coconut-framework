/**
 * 组件元数据类
 * 装饰器表达式在运行时都会一一实例化成元数据实例，元数据实例是由元数据类实例化得到
 * 组件元数据类是一种特殊的元数据类，装饰了组件元数据类对应装饰器的类都是 ioc 组件了
 * 组件元数据类有如下条件：
 * 1. Component自身就是
 * 2. 有且仅有一个组件元数据类对应的装饰器的元数据类也是，以此类推
 * 举例：
 * class Component extends Metadata {}  是，因为本身就是
 *
 * @component()
 * class View extends Metadata {}  是，因为@component 对应的元数据类是组件元数据类
 *
 * @view()
 * class Page extends Metadata {}   是，因为@view对应的元数据类是组件元数据类
 *
 * @view()
 * @component()
 * class Hello extends Metadata {}  不是，因为@view和@component对应的元数据类都是组件元数据类，大于 1 个
 */
import { Metadata } from '../index.ts';
import type { MetaMetadata } from './metadata-repository.ts';
import Component from '../decorator/metadata/component.ts';
import { createDiagnose, type Diagnose, DiagnoseCode } from 'shared';
import { className2DecoratorName } from '../share/util.ts';

class ComponentMetadataClass {
    isComponent = new Map<Class<Metadata>, boolean>();

    destructor() {
        this.isComponent.clear();
    }

    isComponentMetadata(MetadataClass: Class<Metadata>): boolean {
        return this.isComponent.has(MetadataClass) ? this.isComponent.get(MetadataClass) : false;
    }

    /**
     * 校验元数据类的组件类，过滤掉所有非法的组件元数据信息
     * @param metadataListMap 元数据类的元数据信息
     * @returns 诊断信息
     */
    validateMetadata(metadataListMap: Map<Class<Metadata>, MetaMetadata>): Diagnose[] {
        // Step 1: 反向树：元数据类到被装饰器的元数据类的映射关系
        const decorateTree = new Map<Class<Metadata>, Set<Class<Metadata>>>();
        for (const [cls, { classMetadata }] of metadataListMap.entries()) {
            decorateTree.set(cls, new Set());
            for (const child of classMetadata) {
                if (decorateTree.has(child.constructor as Class<Metadata>)) {
                    decorateTree.get(child.constructor as Class<Metadata>).add(cls);
                } else {
                    decorateTree.set(child.constructor as Class<Metadata>, new Set([cls]));
                }
            }
        }

        const componentDecoratorSet = new Map<Class<Metadata>, Set<Class<Metadata>>>(); // 组件装饰器的数量
        for (const cls of metadataListMap.keys()) {
            componentDecoratorSet.set(cls, new Set());
        }

        // Step 2: BFS 从 Component 向上动态传播
        const queue: Class<Metadata>[] = [Component];
        const visited = new Set<Class<Metadata>>([Component]);

        while (queue.length > 0) {
            const current = queue.shift()!;

            // 遍历所有被装饰器的元数据类，将自己添加为被装饰器类的组件装饰器
            const beDecoratedClasses = decorateTree.get(current) || new Set<Class<Metadata>>();
            for (const beDecoratedClass of beDecoratedClasses) {
                // 忽略自己装饰自己的情况（decorateSelf），因为这不算是组件装饰器
                if (beDecoratedClass === current) {
                    // 避免自引用导致的无限循环
                    if (!visited.has(beDecoratedClass)) {
                        visited.add(beDecoratedClass);
                        queue.push(beDecoratedClass);
                    }
                    continue;
                }
                const set = componentDecoratorSet.get(beDecoratedClass)!;
                set.add(current);
                // 避免自引用导致的无限循环
                if (!visited.has(beDecoratedClass)) {
                    visited.add(beDecoratedClass);
                    queue.push(beDecoratedClass);
                }
            }
        }

        const diagnoseList: Diagnose[] = [];

        // 核心算法：判断哪些类是组件类
        // 如果一个类的依赖中有且仅有一个组件类，那么它也是组件类
        const isComponent = new Map<Class<Metadata>, boolean>();

        // 构建反向图：哪些类依赖我（用于 BFS 传播）
        const reverseGraph = new Map<Class<Metadata>, Set<Class<Metadata>>>();
        for (const [cls, dependencies] of componentDecoratorSet.entries()) {
            reverseGraph.set(cls, new Set());
            for (const dep of dependencies) {
                // 忽略自引用，避免构造出自环
                if (dep === cls) continue;
                if (!reverseGraph.has(dep)) {
                    reverseGraph.set(dep, new Set());
                }
                reverseGraph.get(dep)!.add(cls);
            }
        }

        // 从 Component 开始 BFS
        const componentQueue: Class<Metadata>[] = [Component];
        isComponent.set(Component, true);

        while (componentQueue.length > 0) {
            const current = componentQueue.shift()!;

            // 获取所有依赖 current 的类
            const dependents = reverseGraph.get(current) || new Set();

            for (const dependent of dependents) {
                // 只处理还未确定为组件类的类
                if (isComponent.has(dependent)) continue;

                // 统计 dependent 的依赖中有多少个组件类
                const dependencies = componentDecoratorSet.get(dependent)!;
                let componentCount = 0;

                for (const dep of dependencies) {
                    // 忽略自引用，避免自身成为唯一"组件依赖"
                    if (dep === dependent) continue;
                    if (isComponent.has(dep) && isComponent.get(dep)) {
                        componentCount++;
                    }
                }

                // 如果依赖中有且仅有一个组件类，则也是组件类
                if (componentCount === 1) {
                    isComponent.set(dependent, true);
                    componentQueue.push(dependent);
                }
            }
        }

        // Step 3: 检测循环依赖并标记所有循环中的类为非组件类
        // 构建完整的依赖图（从原始数据），包括可能的组件装饰器，而不仅仅是已确定的组件类
        const fullDependencyGraph = new Map<Class<Metadata>, Set<Class<Metadata>>>();
        for (const [cls] of metadataListMap.entries()) {
            fullDependencyGraph.set(cls, new Set());
        }

        // 从 metadataListMap 构建完整的依赖关系（只考虑可能的组件装饰器）
        for (const [cls, { classMetadata }] of metadataListMap.entries()) {
            const dependencies = fullDependencyGraph.get(cls)!;
            for (const metadata of classMetadata) {
                const depCls = metadata.constructor as Class<Metadata>;
                // 忽略自己装饰自己
                if (depCls === cls) continue;
                // 如果这个依赖是一个组件装饰器（包括 Component 本身，或已经被确定为组件类的），添加到依赖中
                if (depCls === Component || isComponent.has(depCls)) {
                    dependencies.add(depCls);
                } else if (componentDecoratorSet.has(depCls)) {
                    // 即使还没确定是组件类，但如果有组件装饰器依赖，也算作潜在的依赖
                    dependencies.add(depCls);
                }
            }
        }

        const cycles = this.detectCycles(fullDependencyGraph);
        for (const cycle of cycles) {
            for (const cls of cycle) {
                isComponent.set(cls, false);
            }
        }

        // 应用结果：遍历所有类，标记最终状态
        for (const [cls] of metadataListMap.entries()) {
            const finalIsComponent = isComponent.get(cls) || false;
            this.isComponent.set(cls, finalIsComponent);

            // 检查是否有多个组件装饰器（从 componentDecoratorSet 和实际的 classMetadata 中查找）
            const allComponentDecorators = new Set<Class<Metadata>>(); // 所有组件装饰器（包括不合法的）
            const validComponentDecorators = new Set<Class<Metadata>>(); // 合法的组件装饰器（对应的元数据类是组件类）
            const { classMetadata } = metadataListMap.get(cls)!;

            // 首先，从 componentDecoratorSet 中获取已经确定的组件装饰器
            const set = componentDecoratorSet.get(cls)!;
            for (const depCls of set) {
                allComponentDecorators.add(depCls);
                // 只添加合法的组件装饰器（对应的元数据类必须是组件类）
                if (depCls === Component || (isComponent.has(depCls) && isComponent.get(depCls))) {
                    validComponentDecorators.add(depCls);
                }
            }

            // 然后，从实际的 classMetadata 中查找可能的组件装饰器（可能还没有被 componentDecoratorSet 收录）
            for (const metadata of classMetadata) {
                const depCls = metadata.constructor as Class<Metadata>;
                // 忽略自己装饰自己
                if (depCls === cls) continue;
                // 如果还没有在 allComponentDecorators 中，检查是否是组件装饰器
                if (!allComponentDecorators.has(depCls)) {
                    if (depCls === Component) {
                        allComponentDecorators.add(Component);
                        validComponentDecorators.add(Component);
                    } else if (isComponent.has(depCls) && isComponent.get(depCls)) {
                        // 如果依赖的类是组件类，则是合法的组件装饰器
                        allComponentDecorators.add(depCls);
                        validComponentDecorators.add(depCls);
                    } else if (componentDecoratorSet.has(depCls) && componentDecoratorSet.get(depCls)!.size > 0) {
                        // 如果依赖的类有组件装饰器但本身不是组件类，也算作潜在的组件装饰器（但不合法）
                        allComponentDecorators.add(depCls);
                    }
                }
            }

            // 如果有多个组件装饰器，需要报告错误
            if (allComponentDecorators.size > 1) {
                // 从后向前删除多个类元数据
                for (let idx = classMetadata.length - 1; idx >= 0; idx--) {
                    const metadata = classMetadata[idx];
                    if (allComponentDecorators.has(metadata.constructor as Class<Metadata>)) {
                        classMetadata.splice(idx, 1);
                    }
                }

                // 对装饰器名称进行排序，以确保输出顺序一致
                const ids = Array.from(allComponentDecorators)
                    .map((cls) => className2DecoratorName(cls.name))
                    .sort()
                    .join(', ');
                diagnoseList.push(createDiagnose(DiagnoseCode.CO10024, cls.name, ids));

                // 只有在合法的组件装饰器数量 > 1 时，才标记为非组件类
                // 如果合法的组件装饰器数量 == 1，即使总共有多个组件装饰器，类仍然是组件类
                if (validComponentDecorators.size > 1) {
                    isComponent.set(cls, false);
                    this.isComponent.set(cls, false);
                }
            }
        }

        return diagnoseList;
    }

    /**
     * 检测组件装饰器依赖图中的循环
     * @param componentDecoratorSet 组件装饰器依赖图
     * @returns 所有循环的集合，每个循环是一个 Set<Class<Metadata>>
     */
    private detectCycles(componentDecoratorSet: Map<Class<Metadata>, Set<Class<Metadata>>>): Set<Class<Metadata>>[] {
        const cycles: Set<Class<Metadata>>[] = [];
        const visited = new Set<Class<Metadata>>();
        const recStack = new Set<Class<Metadata>>();
        const inCycle = new Set<Class<Metadata>>();

        // DFS 检测循环
        const dfs = (node: Class<Metadata>, path: Class<Metadata>[]): void => {
            visited.add(node);
            recStack.add(node);

            const dependencies = componentDecoratorSet.get(node) || new Set();
            for (const dep of dependencies) {
                // 忽略自引用
                if (dep === node) continue;

                if (!visited.has(dep)) {
                    dfs(dep, [...path, dep]);
                } else if (recStack.has(dep)) {
                    // 发现循环：从 dep 到当前路径上的所有节点都是循环的一部分
                    const cycleStart = path.indexOf(dep);
                    if (cycleStart !== -1) {
                        const cycle = new Set<Class<Metadata>>(path.slice(cycleStart).concat([node, dep]));
                        // 将循环中的所有节点加入 inCycle
                        for (const cls of cycle) {
                            inCycle.add(cls);
                        }
                        cycles.push(cycle);
                    }
                }
            }

            recStack.delete(node);
        };

        // 对所有节点进行 DFS
        for (const cls of componentDecoratorSet.keys()) {
            if (!visited.has(cls)) {
                dfs(cls, [cls]);
            }
        }

        // 返回所有在循环中的节点的集合
        if (inCycle.size > 0) {
            return [inCycle];
        }
        return [];
    }
}

export default ComponentMetadataClass;

import { type Metadata } from '../index.ts';
import type { MetaMetadata } from './class-metadata.ts';
import Component from '../decorator/metadata/component.ts';
import { createDiagnose, type Diagnose, DiagnoseCode } from 'shared';
import { className2DecoratorName } from '../share/util.ts';

class ComponentDecorMetadata {
    isComponent = new Map<Class<Metadata>, boolean>();

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

        while (queue.length > 0) {
            const current = queue.shift()!;

            // 遍历所有父类（即 subClazzList 包含 current 的类）
            const beDecoratedClasses = decorateTree.get(current) || new Set<Class<Metadata>>();
            for (const beDecoratedClass of beDecoratedClasses) {
                // 累加：parent 多了一个组件子类
                const set = componentDecoratorSet.get(beDecoratedClass)!;
                set.add(current);
                queue.push(beDecoratedClass);
            }
        }

        const diagnoseList: Diagnose[] = [];
        for (const [cls, set] of componentDecoratorSet.entries()) {
            if (cls === Component) {
                // Component是没有 set 的，但需要特殊处理
                this.isComponent.set(cls, true);
            } else if (set.size === 1) {
                this.isComponent.set(cls, true);
            } else {
                // 从后向前删除多个类元数据
                const { classMetadata } = metadataListMap.get(cls);
                for (let idx = classMetadata.length - 1; idx >= 0; idx--) {
                    const metadata = classMetadata[idx];
                    if (set.has(metadata.constructor as Class<Metadata>)) {
                        classMetadata.splice(idx, 1);
                    }
                }
                this.isComponent.set(cls, false);
                if (set.size > 1) {
                    const ids = Array.from(set)
                        .map((cls) => className2DecoratorName(cls.name))
                        .join(', ');
                    diagnoseList.push(createDiagnose(DiagnoseCode.CO10024, cls.name, ids));
                }
            }
        }
        return diagnoseList;
    }
}

export default ComponentDecorMetadata;

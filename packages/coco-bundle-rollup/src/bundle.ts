import { OutputOptions, rollup, type RollupOptions } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import cocoMvcPlugin, { PluginOption } from './coco-mvc-plugin';

interface IOption {
    useGenerate?: boolean; // 使用bundle.generate生成output
    disableJsx?: boolean; // 不用jsx插件，确保待编译的源文件中没有jsx
}

function customBuild( option : IOption = {}) {
    const { useGenerate } = option;
    async function build(rollupOption: RollupOptions, pluginOption: PluginOption) {
        const { input, output, plugins } = rollupOption;
        const rollupBuild = await rollup({
            input: input,
            plugins: [
                ...Array.isArray(plugins) ? plugins : [],
                resolve({
                    extensions: ['.ts', '.tsx', '.js', '.jsx']
                }),
                cocoMvcPlugin(pluginOption),
                babel({
                    extensions: ['.ts', '.tsx'],
                    plugins: [
                        [require.resolve('@babel/plugin-proposal-decorators'), { version: '2023-11' }],
                        [
                            require.resolve('@babel/plugin-transform-react-jsx'),
                            {
                                runtime: 'automatic',
                                importSource: '@cocojs/mvc',
                            },
                        ],
                    ],
                }),
            ],
            external: [
                /**
                 * 当打包成库时
                 * @cocojs/mvc是作为peer dependency
                 * @cocojs/mvc及其打头的依赖都作为外部依赖
                 */
                /^@cocojs\/mvc(\/.*)?$/
            ],
        });

        const outputIsArray = Array.isArray(output);
        const outputList = outputIsArray ? output : [output];
        const rollupOutput = [];
        for (const out of outputList) {
            const result = useGenerate ? await rollupBuild.generate(out as OutputOptions) : await rollupBuild.write(out as OutputOptions);
            rollupOutput.push(result);
        }
        return { rollupBuild, rollupOutput: outputIsArray ? rollupOutput : rollupOutput[0] };
    }

    return build;
}

const bundle = customBuild();

export { customBuild }
export default bundle;

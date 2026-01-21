import path from 'node:path';
import { OutputOptions, rollup, type RollupOptions } from 'rollup';
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
                cocoMvcPlugin(pluginOption),
                babel({
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                    plugins: [
                        [require.resolve('@babel/plugin-proposal-decorators'), { version: '2023-11' }],
                        [
                            require.resolve('@babel/plugin-transform-react-jsx', {
                                paths: [path.resolve(__dirname, '..', '../node_modules')],
                            }),
                            {
                                runtime: 'automatic',
                                importSource: '@cocojs/mvc',
                            },
                        ],
                    ],
                }),
            ],
        });

        const rollupOutput = useGenerate ? await rollupBuild.generate(output as OutputOptions) : await rollupBuild.write(output as OutputOptions);
        return { rollupBuild, rollupOutput };
    }

    return build;
}

const bundle = customBuild();

export { customBuild }
export default bundle;

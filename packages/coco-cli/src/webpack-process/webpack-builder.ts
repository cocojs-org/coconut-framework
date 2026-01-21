import bundle, { startDev } from '@cocojs/bundle-webpack';
import getWebpackConfig from './get-webpack-config';

class WebpackBuilder {
    // server: WebpackDevServer;
    stopDev: () => Promise<void>;

    public async build() {
        const config = await getWebpackConfig('build');
        await bundle(config);
    }

    public async startServer() {
        if (this.stopDev) {
            console.warn('已经启动了一个 dev 服务了。')
            return;
        }
        const config = await getWebpackConfig('dev');
        this.stopDev = startDev(config);
    }

    public async stopServer() {
        if (this.stopDev) {
            await this.stopDev();
            this.stopDev = null;
        } else {
            // 并没有其他启动服务，不需要停止
        }
    }
}

export default WebpackBuilder;

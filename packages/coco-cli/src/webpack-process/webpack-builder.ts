import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import getWebpackConfig from './get-webpack-config';

class WebpackBuilder {
  server: WebpackDevServer;

  public async build() {
    return new Promise<void>(async (resolve, reject) => {
      const config = await getWebpackConfig('build');
      const compiler = Webpack(config);
      compiler.run((err, stats) => {
        console.log(
          stats.toString({
            chunks: false, // 使构建过程更静默无输出
            colors: true, // 在控制台展示颜色
          })
        );
        if (stats.hasErrors()) {
          reject(err);
        } else {
          resolve();
        }
        compiler.close((err) => {});
      });
    });
  }

  public async startServer() {
    const { devServer, ...config } = await getWebpackConfig('dev');
    const compiler = Webpack(config);
    const devServerOptions = { ...devServer, open: true };
    this.server = new WebpackDevServer(devServerOptions, compiler);
    await this.server.start();
  }

  public async stopServer() {
    if (this.server) {
      await this.server.stop();
      this.server = null;
    }
  }
}

export default WebpackBuilder;

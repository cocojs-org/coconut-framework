module.exports = function debugAfterTsLoader(source) {
    const resourcePath = this.resourcePath;

    // 只打印你关心的文件，避免刷屏（可选）
    if (resourcePath.includes('src/index')) {
        console.log('======== debug-after-ts-loader ========');
        console.log('FILE:', resourcePath);
        console.log('-------- SOURCE START --------');
        console.log(source);
        console.log('-------- SOURCE END ----------');
    }

    return source;
};

const buildGeneralLib = require("./build-by-rollup");
const buildCocoLib = require("./build-by-bundle-rollup");

async function buildAll () {
    await buildGeneralLib();
    await buildCocoLib();
}

buildAll();

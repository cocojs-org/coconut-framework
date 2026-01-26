const buildTools = require("./rollup-builder");
const buildCoco = require("./coco-builder");

async function buildAll () {
    await buildTools();
    await buildCoco();
}

buildAll();

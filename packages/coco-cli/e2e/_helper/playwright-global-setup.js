import { execSync } from 'node:child_process';
import path from 'node:path';

function setup() {
    const rootDir = path.join(__dirname, '../../../..');
    execSync(`pnpm run build`, { stdio: 'inherit', cwd: rootDir });
    const cliDir = path.join(rootDir, 'packages/coco-cli');
    execSync(`pnpm pack`, { stdio: 'inherit', cwd: cliDir });
    const mvcDir = path.join(rootDir, 'packages/coco-mvc');
    execSync(`pnpm pack`, { stdio: 'inherit', cwd: mvcDir });
}

export default setup;

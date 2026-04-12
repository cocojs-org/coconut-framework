import { test, expect } from '@playwright/test';
import { prepareLib, readLibDistFile } from './_helper/exec-test.ts'

test.describe('单一库项目-没有样式', () => {
    const projectFolder = 'lib-basic-no-style';

    test.beforeAll(async () => {
        prepareLib(projectFolder);
    })

    test.afterEach(async () => {})

    test('配置了prefix可以生效', async ({ page }) => {
        const distContent = readLibDistFile(projectFolder);
        expect(distContent).toContain('CocoButton');
    });
})

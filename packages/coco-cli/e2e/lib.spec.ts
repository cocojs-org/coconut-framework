import { test, expect } from '@playwright/test';
import { prepareLib, startLibDevServe } from './_helper/exec-test.ts';

test.describe('引用工具库', () => {
    const projectFolder = 'lib';
    let res;

    test.beforeAll(async () => {
        prepareLib(projectFolder);
        res = await startLibDevServe(projectFolder);
        if (!res.url) {
            throw new Error('启用服务失败，没有找到url');
        }
    })

    test.afterEach(async () => {
        await res?.stopServe();
    })

    test('使用lib中的视图组件并渲染', async ({ page }) => {
        await page.goto(`${res.url}/button`);

        await expect(page.locator('div#btn')).toContainText('default');
    });
})

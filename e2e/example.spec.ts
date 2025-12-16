import { test, expect } from '@playwright/test';
import { startServeApp, stopServeApp } from './_helper/exec-test'

test.describe('应用测试', () => {
    let res;
    test.beforeEach(async () => {
        res = await startServeApp();
        if (!res.url) {
            throw new Error('启用服务失败，没有找到url');
        }
    })

    test.afterEach(async () => {
        await stopServeApp(res);
    })

    test('能够渲染简单文字', async ({ page }) => {
        await page.goto(res.url);

        await expect(page.getByText('hello cocojs')).toHaveText('hello cocojs');
    });
})

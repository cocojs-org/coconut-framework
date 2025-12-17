import { test, expect } from '@playwright/test';
import { startServeApp, stopServeApp } from './_helper/exec-test'

test.describe('单一应用项目-无样式', () => {
    const projectFolder = 'app-basic-no-style';
    let res;
    test.beforeEach(async () => {
        res = await startServeApp(projectFolder);
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

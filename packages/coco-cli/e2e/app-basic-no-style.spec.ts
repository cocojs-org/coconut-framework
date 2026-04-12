import { test, expect } from '@playwright/test';
import { prepareApp, startServeApp, stopServeApp } from './_helper/exec-test.ts';

test.describe('单一应用项目-无样式', () => {
    const projectFolder = 'app-basic-no-style';
    let res;
    test.beforeAll(async () => {
        prepareApp(projectFolder);
        res = await startServeApp(projectFolder);
        if (!res.url) {
            throw new Error('启用服务失败，没有找到url');
        }
    })

    test.afterAll(async () => {
        await stopServeApp(res);
    })

    test('能够渲染简单文字', async ({ page }) => {
        await page.goto(res.url);

        await expect(page.getByText('hello cocojs')).toHaveText('hello cocojs');
    });

    test('@reactive功能正常', async ({ page }) => {
        await page.goto(`${res.url}/reactive`);

        await expect(page.locator('span')).toContainText('counter: 0');
        await page.click('button#add');
        await expect(page.locator('span')).toContainText('counter: 1');
    });

    test('@bind功能正常', async ({ page }) => {
        const logs = [];
        page.on('console', (msg) => {
            logs.push(msg.text()); // 将控制台文本存入数组
        });

        await page.goto(`${res.url}/bind`);

        await expect(page.locator('span')).toContainText('counter: 0');
        await page.click('button#add');
        await expect(page.locator('span')).toContainText('counter: 1');
        expect(logs).toContain('this is undefined in unbind function.');
    });
})

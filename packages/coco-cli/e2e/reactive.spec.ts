import { test, expect } from '@playwright/test';
import { prepareApp, startServeApp } from './_helper/exec-test.ts';

test.describe('响应式', () => {
    const projectFolder = 'reactive';
    let res;
    test.beforeAll(async () => {
        prepareApp(projectFolder);
        res = await startServeApp(projectFolder);
        if (!res.url) {
            throw new Error('启用服务失败，没有找到url');
        }
    })

    test.afterAll(async () => {
        await res?.stopServe();
    })

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

    test('@store功能正常', async ({ page }) => {
        await page.goto(`${res.url}/store`);

        await expect(page.locator('span')).toContainText('theme: light');
        await page.click('button#dark');
        await expect(page.locator('span')).toContainText('theme: dark');
        await page.click('button#light');
        await expect(page.locator('span')).toContainText('theme: light');
    });
})

import { test, expect } from '@playwright/test';
import { prepareApp, startServeApp } from './_helper/exec-test.ts';

test.describe('路由', () => {
    const projectFolder = 'router';
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

    test('简单页面跳转', async ({ page }) => {
        await page.goto(`${res.url}/a`);

        await expect(page.locator('span')).toContainText('a page');
        await page.click('button');
        await expect(page.locator('span')).toContainText('b page');
        await page.click('button');
        await expect(page.locator('span')).toContainText('a page');
    });

    test('修改动态路由，页面重新渲染', async ({ page }) => {
        await page.goto(`${res.url}/user/zhangsan`);
        await expect(page.locator('span#userId')).toContainText('zhangsan');

        await page.goto(`${res.url}/user/lisi`);
        await expect(page.locator('span#userId')).toContainText('lisi');

        await page.click('button#wangwu');
        await expect(page.locator('span#userId')).toContainText('wangwu');
    })
})

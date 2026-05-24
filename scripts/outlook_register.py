"""
Outlook 邮箱注册自动化脚本 (Playwright + CDP)

使用方法:
1. 确保 Chrome 浏览器已在运行，且开启了 CDP 调试端口 (默认 localhost:29229)
2. 安装依赖: pip install playwright
3. 运行: python outlook_register.py --email "yourname" --password "YourPassword1!"

注意:
- Outlook 注册不需要手机验证
- 需要通过 "Press and hold" CAPTCHA (需人工或自动长按)
"""

import argparse
import asyncio
import sys
from playwright.async_api import async_playwright


async def register_outlook_account(
    email_prefix: str,
    password: str,
    first_name: str = "David",
    last_name: str = "Carter",
    birth_month: str = "2",  # February
    birth_day: str = "15",
    birth_year: str = "1990",
    country: str = "United States",
    cdp_url: str = "http://localhost:29229",
):
    """
    自动执行 Outlook 邮箱注册流程

    Args:
        email_prefix: 邮箱名 (不含 @outlook.com)
        password: 密码 (至少8位,包含大小写字母和数字)
        first_name: 名
        last_name: 姓
        birth_month: 出生月份数字 (1-12)
        birth_day: 出生日
        birth_year: 出生年份
        country: 国家/地区
        cdp_url: Chrome DevTools Protocol 端口地址
    """
    async with async_playwright() as p:
        print(f"[INFO] 正在连接到 Chrome CDP: {cdp_url}")
        browser = await p.chromium.connect_over_cdp(cdp_url)

        context = browser.contexts[0]
        page = context.pages[0] if context.pages else await context.new_page()

        # Step 1: 导航到注册页面
        print("[Step 1/5] 导航到 Outlook 注册页面...")
        await page.goto("https://signup.live.com/")
        await page.wait_for_load_state("networkidle")

        # Step 2: 输入邮箱名
        print(f"[Step 2/5] 输入邮箱: {email_prefix}@outlook.com")
        email_input = page.locator('input[type="email"]')
        await email_input.fill(f"{email_prefix}")
        await page.click('button:has-text("Next")')
        await asyncio.sleep(2)

        # Step 3: 设置密码
        print("[Step 3/5] 设置密码...")
        password_input = page.locator('input[type="password"]')
        await password_input.fill(password)
        await page.click('button:has-text("Next")')
        await asyncio.sleep(2)

        # Step 4: 填写个人信息 (国家+生日)
        print(f"[Step 4/5] 填写个人信息: {country}, {birth_year}-{birth_month}-{birth_day}")
        # 注: 具体选择器可能因页面版本而异
        # 国家下拉框
        country_select = page.locator('select#Country')
        if await country_select.count() > 0:
            await country_select.select_option(label=country)

        # 生日
        month_select = page.locator('select#BirthMonth')
        if await month_select.count() > 0:
            await month_select.select_option(value=birth_month)

        day_select = page.locator('select#BirthDay')
        if await day_select.count() > 0:
            await day_select.select_option(value=birth_day)

        year_input = page.locator('input#BirthYear')
        if await year_input.count() > 0:
            await year_input.fill(birth_year)

        await page.click('button:has-text("Next")')
        await asyncio.sleep(2)

        # Step 5: 填写姓名
        print(f"[Step 5/5] 填写姓名: {first_name} {last_name}")
        first_input = page.locator('input[name="firstNameInput"]')
        if await first_input.count() > 0:
            await first_input.fill(first_name)

        last_input = page.locator('input[name="lastNameInput"]')
        if await last_input.count() > 0:
            await last_input.fill(last_name)

        await page.click('button:has-text("Next")')
        await asyncio.sleep(2)

        # CAPTCHA: "Press and hold" 按钮
        print("")
        print("=" * 60)
        print("[CAPTCHA] 需要完成 'Press and hold' 人机验证")
        print("=" * 60)
        print("请长按页面上的按钮完成验证...")
        print("(等待最长 2 分钟)")
        print("")

        # 等待离开验证页面
        try:
            await page.wait_for_url(
                "**/mail/**",
                timeout=120000  # 2 minutes
            )
            print("[完成] Outlook 邮箱注册成功!")
            print(f"   邮箱: {email_prefix}@outlook.com")
            return True
        except Exception:
            # 检查是否已经在邮箱页面
            if "outlook.live.com/mail" in page.url:
                print("[完成] Outlook 邮箱注册成功!")
                print(f"   邮箱: {email_prefix}@outlook.com")
                return True
            else:
                print("[INFO] 请手动完成 CAPTCHA 验证")
                return False


def main():
    parser = argparse.ArgumentParser(
        description="Outlook 邮箱注册自动化脚本"
    )
    parser.add_argument("--email", required=True, help="邮箱名 (不含 @outlook.com)")
    parser.add_argument("--password", required=True, help="密码")
    parser.add_argument("--first-name", default="David", help="名")
    parser.add_argument("--last-name", default="Carter", help="姓")
    parser.add_argument("--birth-month", default="2", help="出生月份(数字)")
    parser.add_argument("--birth-day", default="15", help="出生日")
    parser.add_argument("--birth-year", default="1990", help="出生年份")
    parser.add_argument("--country", default="United States", help="国家")
    parser.add_argument("--cdp-url", default="http://localhost:29229",
                       help="Chrome DevTools Protocol URL")

    args = parser.parse_args()

    success = asyncio.run(register_outlook_account(
        email_prefix=args.email,
        password=args.password,
        first_name=args.first_name,
        last_name=args.last_name,
        birth_month=args.birth_month,
        birth_day=args.birth_day,
        birth_year=args.birth_year,
        country=args.country,
        cdp_url=args.cdp_url,
    ))

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

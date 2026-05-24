/**
 * Google 账号自动注册脚本
 *
 * 自动完成 Google 注册的前 4 个步骤（姓名、生日性别、用户名、密码），
 * 在 QR 码验证步骤暂停等待用户手动扫码完成验证，
 * 验证通过后继续完成剩余步骤（恢复邮箱、服务条款）。
 *
 * 用法:
 *   node scripts/google-signup.mjs                    # 有界面模式
 *   HEADLESS=true node scripts/google-signup.mjs      # 无界面模式
 */

import { chromium } from "playwright";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// 配置
// ---------------------------------------------------------------------------

function loadConfig() {
  const configPath = resolve(PROJECT_ROOT, "config.json");
  if (!existsSync(configPath)) {
    console.error("❌ 未找到 config.json，请先复制 config.example.json 并填写信息：");
    console.error("   cp config.example.json config.json");
    process.exit(1);
  }
  return JSON.parse(readFileSync(configPath, "utf-8"));
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

async function waitForNavigation(page, urlFragment, timeout = 30000) {
  await page.waitForURL(`**/${urlFragment}**`, { timeout });
}

async function clickDropdownOption(page, dropdownSelector, optionText) {
  await page.click(dropdownSelector);
  await page.waitForTimeout(500);
  const option = page.locator(`li`).filter({ hasText: optionText }).first();
  await option.click();
  await page.waitForTimeout(300);
}

function log(step, message) {
  const timestamp = new Date().toLocaleTimeString("zh-CN");
  console.log(`[${timestamp}] 步骤 ${step}: ${message}`);
}

// ---------------------------------------------------------------------------
// 注册步骤
// ---------------------------------------------------------------------------

/**
 * 步骤 1: 输入姓名
 * URL: /signup/name
 */
async function stepName(page, config) {
  log(1, "输入姓名...");
  await waitForNavigation(page, "signup/name");

  await page.fill('input[name="firstName"]', config.firstName);
  if (config.lastName) {
    await page.fill('input[name="lastName"]', config.lastName);
  }

  await page.click('button:has-text("Next")');
  log(1, `✓ 姓名已填写: ${config.firstName} ${config.lastName || ""}`);
}

/**
 * 步骤 2: 选择生日和性别
 * URL: /signup/birthdaygender
 */
async function stepBirthdayGender(page, config) {
  log(2, "填写生日和性别...");
  await waitForNavigation(page, "signup/birthdaygender");

  // 选择月份
  await clickDropdownOption(
    page,
    'div[aria-expanded="false"]:near(input[name="day"])',
    config.birthday.month
  );

  // 填写日期
  await page.fill('input[name="day"]', config.birthday.day);

  // 填写年份
  await page.fill('input[name="year"]', config.birthday.year);

  // 选择性别
  const genderDropdowns = page.locator('div[aria-expanded="false"]');
  const genderDropdown = genderDropdowns.last();
  await genderDropdown.click();
  await page.waitForTimeout(500);
  await page.locator("li").filter({ hasText: config.gender }).first().click();
  await page.waitForTimeout(300);

  await page.click('button:has-text("Next")');
  log(2, `✓ 生日: ${config.birthday.month} ${config.birthday.day}, ${config.birthday.year} | 性别: ${config.gender}`);
}

/**
 * 步骤 3: 选择用户名
 * URL: /signup/username
 */
async function stepUsername(page, config) {
  log(3, "设置用户名...");
  await waitForNavigation(page, "signup/username");

  await page.fill('input[name="Username"]', config.username);
  await page.click('button:has-text("Next")');
  log(3, `✓ 用户名: ${config.username}@gmail.com`);
}

/**
 * 步骤 4: 设置密码
 * URL: /signup/password
 */
async function stepPassword(page, config) {
  log(4, "设置密码...");
  await waitForNavigation(page, "signup/password");

  await page.fill('input[name="Passwd"]', config.password);
  await page.fill('input[name="PasswdAgain"]', config.password);
  await page.click('button:has-text("Next")');
  log(4, "✓ 密码已设置");
}

/**
 * 步骤 5: 手机/QR 码验证（需要手动操作）
 * URL: /signup/mophoneverification
 */
async function stepVerification(page) {
  log(5, "⚠️  到达手机验证步骤 - 需要手动操作！");
  console.log("");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  请用手机扫描屏幕上的 QR 码完成验证                           ║");
  console.log("║                                                              ║");
  console.log("║  1. 打开手机相机 App                                          ║");
  console.log("║  2. 扫描屏幕上的 QR 码                                        ║");
  console.log("║  3. 按照手机上的提示完成验证                                    ║");
  console.log("║  4. 验证完成后脚本将自动继续                                    ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("");

  // 等待验证完成 - 当页面 URL 不再包含 mophoneverification 时表示验证通过
  await page.waitForURL(
    (url) => !url.pathname.includes("mophoneverification"),
    { timeout: 600000 } // 10 分钟超时
  );

  log(5, "✓ 手机验证已完成！");
}

/**
 * 步骤 6: 添加恢复邮箱（可选步骤，如果出现的话）
 */
async function stepRecoveryEmail(page) {
  const currentUrl = page.url();

  if (currentUrl.includes("recoveryemail") || currentUrl.includes("recovery")) {
    log(6, "跳过恢复邮箱...");
    // 尝试点击 "Skip" 按钮
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipButton.click();
      log(6, "✓ 已跳过恢复邮箱");
    }
  }
}

/**
 * 步骤 7: 同意服务条款
 */
async function stepTerms(page) {
  const currentUrl = page.url();

  if (currentUrl.includes("tos") || currentUrl.includes("terms")) {
    log(7, "同意服务条款...");
    const agreeButton = page.locator('button:has-text("I agree")');
    if (await agreeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await agreeButton.click();
      log(7, "✓ 已同意服务条款");
    }
  }
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  const config = loadConfig();
  const headless = process.env.HEADLESS === "true";

  console.log("🚀 开始 Google 账号注册流程...");
  console.log(`📌 模式: ${headless ? "无界面" : "有界面"}`);
  console.log("");

  const browser = await chromium.launch({
    headless,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    locale: "en-US",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    // 导航到注册页面
    log(0, "打开 Google 注册页面...");
    await page.goto("https://accounts.google.com/signup", {
      waitUntil: "networkidle",
    });

    // 执行注册步骤
    await stepName(page, config);
    await stepBirthdayGender(page, config);
    await stepUsername(page, config);
    await stepPassword(page, config);

    // 检查是否需要手机验证
    const currentUrl = page.url();
    if (currentUrl.includes("mophoneverification") || currentUrl.includes("phoneverification")) {
      await stepVerification(page);
    }

    // 后续可选步骤
    await stepRecoveryEmail(page);
    await stepTerms(page);

    console.log("");
    console.log("🎉 注册流程完成！");
    console.log(`📧 邮箱地址: ${config.username}@gmail.com`);

    // 等待一会让用户看到结果
    await page.waitForTimeout(5000);
  } catch (error) {
    console.error("");
    console.error("❌ 注册过程中出错:", error.message);

    // 保存错误截图
    const screenshotPath = resolve(PROJECT_ROOT, "screenshots", "error.png");
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    console.error(`📸 错误截图已保存: ${screenshotPath}`);
  } finally {
    await browser.close();
  }
}

main();

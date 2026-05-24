# Google 账号注册流程详细文档

> 本文档记录了 2026 年 5 月实测的 Google 账号注册完整流程，供未来复用参考。

---

## 流程总览

```
注册入口 → 输入姓名 → 填写生日/性别 → 选择用户名 → 设置密码 → 手机验证(QR码) → 恢复邮箱(可选) → 同意条款 → 完成
```

---

## 步骤 1: 输入姓名

- **URL**: `https://accounts.google.com/lifecycle/steps/signup/name`
- **页面标题**: "Create a Google Account"
- **副标题**: "Enter your name"

### 表单字段

| 字段 | HTML name | 类型 | 必填 | 说明 |
|------|-----------|------|------|------|
| 名字 | `firstName` | text | 是 | First name |
| 姓氏 | `lastName` | text | 否 | Last name (optional) |

### 操作

1. 填写 `firstName` 输入框
2. （可选）填写 `lastName` 输入框
3. 点击 **"Next"** 按钮

### Playwright 选择器

```javascript
await page.fill('input[name="firstName"]', '名字');
await page.fill('input[name="lastName"]', '姓氏');
await page.click('button:has-text("Next")');
```

---

## 步骤 2: 填写生日和性别

- **URL**: `https://accounts.google.com/lifecycle/steps/signup/birthdaygender`
- **页面标题**: "Basic information"
- **副标题**: "Enter your birthday and gender"

### 表单字段

| 字段 | HTML name/类型 | 类型 | 必填 | 说明 |
|------|---------------|------|------|------|
| 月份 | 下拉菜单 | dropdown | 是 | January - December |
| 日期 | `day` | tel | 是 | 1-31 |
| 年份 | `year` | tel | 是 | 4位数字 |
| 性别 | 下拉菜单 | dropdown | 是 | Female / Male / Rather not say / Custom |

### 操作

1. 点击 **Month** 下拉菜单，选择月份
2. 在 **Day** 输入框填写日期
3. 在 **Year** 输入框填写年份
4. 点击 **Gender** 下拉菜单，选择性别
5. 点击 **"Next"** 按钮

### 特殊说明

- 月份和性别是自定义下拉菜单（非标准 `<select>`），需要先点击展开再选择选项
- 下拉选项使用 `<li>` 元素，带有 `aria-selected` 属性
- 日期和年份使用 `type="tel"` 输入框

### Playwright 选择器

```javascript
// 月份下拉菜单
await page.click('div[aria-expanded="false"]'); // 第一个下拉菜单
await page.locator('li').filter({ hasText: 'January' }).click();

// 日期和年份
await page.fill('input[name="day"]', '15');
await page.fill('input[name="year"]', '1990');

// 性别下拉菜单
const genderDropdowns = page.locator('div[aria-expanded="false"]');
await genderDropdowns.last().click();
await page.locator('li').filter({ hasText: 'Rather not say' }).click();

await page.click('button:has-text("Next")');
```

---

## 步骤 3: 选择用户名

- **URL**: `https://accounts.google.com/lifecycle/steps/signup/username`
- **页面标题**: "How you'll sign in"
- **副标题**: "Create a Gmail address for signing in to your Google Account"

### 表单字段

| 字段 | HTML name | 类型 | 必填 | 说明 |
|------|-----------|------|------|------|
| 用户名 | `Username` | text | 是 | 用户名@gmail.com |

### 操作

1. 在 **Username** 输入框填写用户名
2. 点击 **"Next"** 按钮
3. 如果用户名已被占用，Google 会显示错误并可能建议其他用户名

### 额外选项

- 页面上有 **"Use your existing email"** 按钮，可以用已有邮箱注册（而非创建新 Gmail）

### 输入规则

- 可以使用字母、数字和英文句号（`.`）
- 长度 6-30 个字符
- 不区分大小写

### Playwright 选择器

```javascript
await page.fill('input[name="Username"]', 'desired.username');
await page.click('button:has-text("Next")');
```

---

## 步骤 4: 设置密码

- **URL**: `https://accounts.google.com/lifecycle/steps/signup/password`
- **页面标题**: "Create a strong password"
- **副标题**: "Create a strong password with a mix of letters, numbers and symbols"

### 表单字段

| 字段 | HTML name | 类型 | 必填 | 说明 |
|------|-----------|------|------|------|
| 密码 | `Passwd` | password | 是 | 至少8个字符 |
| 确认密码 | `PasswdAgain` | password | 是 | 需要与密码一致 |

### 操作

1. 在 **Password** 输入框设置密码
2. 在 **Confirm** 输入框确认密码
3. （可选）勾选 "Show password" 查看密码
4. 点击 **"Next"** 按钮

### 密码要求

- 至少 8 个字符
- 建议混合使用字母、数字和符号

### Playwright 选择器

```javascript
await page.fill('input[name="Passwd"]', 'YourPassword123!');
await page.fill('input[name="PasswdAgain"]', 'YourPassword123!');
await page.click('button:has-text("Next")');
```

---

## 步骤 5: 验证

验证方式取决于注册时使用的设备模式：

### 方式 A: SMS 短信验证（移动模式 — 推荐）

- **URL**: `https://accounts.google.com/devicephoneverification/consent`
- **页面标题**: "Verify your phone number"
- **触发条件**: 使用移动设备（或 Playwright `devices["Pixel 7"]` 模拟）注册

#### 页面内容

> "Google needs to verify your device or phone number for security reasons."
> "Your phone will open an SMS message with a code you need to send to verify your phone."

- 显示 **"Send SMS"** 按钮
- 点击后需要接收 SMS 验证码
- 可使用虚拟号码服务（sms-activate.org、5sim.net 等）接收验证码

#### Playwright 选择器

```javascript
// 等待 SMS 验证完成
await page.waitForURL(
  (url) => !url.pathname.includes('phoneverification') &&
           !url.pathname.includes('devicephoneverification'),
  { timeout: 600000 }
);
```

### 方式 B: QR 码扫描验证（桌面模式）

- **URL**: `https://accounts.google.com/lifecycle/steps/signup/mophoneverification/initial`
  或 `https://accounts.google.com/lifecycle/steps/signup/crossflowverification/initial`
- **页面标题**: "Verify some info before creating an account"
- **触发条件**: 使用桌面浏览器注册

#### 页面内容

> "Google needs to verify some info about your device or phone number before you can continue."

- 显示 QR 码图片
- 需要手机扫描验证
- 完成后 URL 自动跳转

#### Playwright 选择器

```javascript
// 等待 QR 码验证完成
await page.waitForURL(
  (url) => !url.pathname.includes('mophoneverification') &&
           !url.pathname.includes('crossflowverification'),
  { timeout: 600000 }
);
```

### 如何切换验证方式

在 Playwright 中使用移动设备模拟即可获得 SMS 验证：

```javascript
import { chromium, devices } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices['Pixel 7'],
  locale: 'en-US',
});
```

---

## 步骤 6: 恢复邮箱（可选）

- 某些情况下会出现添加恢复邮箱的页面
- 可以选择 **"Skip"** 跳过

---

## 步骤 7: 同意服务条款

- 阅读 Google 服务条款和隐私政策
- 点击 **"I agree"** 按钮

---

## 可能遇到的问题

### 1. 用户名已被占用
- Google 会提示 "That username is taken. Try another."
- 会建议可用的用户名

### 2. 验证方式变化
- Google 可能根据 IP、设备信息等更改验证方式
- 可能出现短信验证码、语音验证等不同方式
- 从某些地区访问可能直接跳过验证

### 3. 被识别为自动化
- Google 可能检测到 Playwright 自动化
- 建议使用 `--disable-blink-features=AutomationControlled` 参数
- 设置合理的 User-Agent

---

## 技术备注

### URL 参数

注册流程中的关键 URL 参数：
- `TL`: 会话令牌
- `dsh`: 设备安全哈希
- `flowEntry`: 入口类型（`SignUp`）
- `flowName`: 流程名称（`GlifWebSignIn`）
- `continue`: 注册完成后跳转地址

### 页面结构

- 使用 Google 自定义 Web Components（`<c-wiz>`）
- 表单字段使用标准 `<input>` 但包裹在自定义组件中
- 下拉菜单为自定义实现（非 `<select>`），使用 `<ul>/<li>` 结构
- 按钮通过 `aria-expanded` 属性控制下拉展开状态

---

*最后更新: 2026-05-24*

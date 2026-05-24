---
name: google-account-registration
description: Google 账号注册自动化流程。支持移动模式（SMS验证）和桌面模式（QR码验证）。使用 Playwright 自动填写注册表单。
---

# Google 账号注册自动化

## 流程概览

注册 URL: `https://accounts.google.com/signup`

### 移动模式（推荐 — SMS 短信验证）

5 个步骤中有 4 个可以自动化，第 5 步可用虚拟号码完成：
1. 输入姓名 → 自动
2. 填写生日性别 → 自动
3. 创建邮箱地址 → 自动
4. 设置密码 → 自动
5. SMS 短信验证 → **需虚拟号码接收验证码**

### 桌面模式（QR 码验证）

5 个步骤中有 4 个可以自动化：
1. 输入姓名 → 自动
2. 填写生日性别 → 自动
3. 创建邮箱地址 → 自动
4. 设置密码 → 自动
5. QR 码验证 → **需人工扫码**

## 关键选择器

```
Step 1 - Name:
  input[name="firstName"]
  input[name="lastName"]

Step 2 - Birthday/Gender:
  Month: div[aria-expanded] (dropdown) → li items
  input[name="day"]
  input[name="year"]
  Gender: div with "Gender" text (dropdown) → li items

Step 3 - Email:
  div:has-text("Create your own Gmail address") (radio)
  input[name="Username"]

Step 4 - Password:
  input[name="Passwd"]
  input[name="PasswdAgain"]

All steps: button:has-text("Next")
```

## URL 模式 (用于检测当前步骤)

- `/signup/name` → Step 1
- `/signup/birthdaygender` → Step 2
- `/signup/username` → Step 3
- `/signup/password` → Step 4
- `/devicephoneverification/` → Step 5 (SMS 验证 — 移动模式)
- `/mophoneverification/` → Step 5 (QR 验证 — 桌面模式)
- `/crossflowverification/` → Step 5 (QR 验证 — YouTube 路径)

## 运行方式

### Node.js (推荐)

```bash
# 移动模式（默认，使用 SMS 验证）
npm run signup

# 桌面模式
MOBILE=false npm run signup

# 无界面模式
HEADLESS=true npm run signup
```

### Python (CDP)

```bash
python scripts/google_register.py \
  --first-name "Test" \
  --last-name "User" \
  --email "myemail123" \
  --password "StrongP@ss1!"
```

## 移动模式配置

```javascript
import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices['Pixel 7'],
  locale: 'en-US',
});
```

## 注意

- 移动模式使用 `devices["Pixel 7"]` 模拟，获得 SMS 验证
- 桌面模式需要 QR 码扫描（需物理手机）
- 如果邮箱名被占用，需要手动处理
- Google 可能根据 IP 信誉改变验证要求
- 建议匹配浏览器语言和 IP 地区

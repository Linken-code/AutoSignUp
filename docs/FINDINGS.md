# 探索发现与结论

## 日期: 2026-05-24

---

## 核心发现

### 发现 1：移动设备模拟可绕过 QR 码验证（关键！）

使用 Playwright 的 `devices["Pixel 7"]` 模拟移动设备注册时，Google 提供的是 **SMS 短信验证**，而非 QR 码扫描。

| 注册方式 | 验证类型 | 验证 URL | 可自动化 |
|----------|----------|----------|---------|
| 桌面浏览器 | QR 码扫描 | `/mophoneverification` | 需物理手机 |
| 移动设备模拟 | SMS 短信 | `/devicephoneverification/consent` | 可用虚拟号码 |

**验证代码：**
```javascript
import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices['Pixel 7'],
  locale: 'en-US',
});
// 此后注册到验证步骤时会得到 SMS 验证而非 QR 码
```

### 发现 2：所有桌面路径都需要 QR 码

| 路径 | 邮箱验证 | 手机/QR验证 | 结论 |
|------|---------|------------|------|
| 标准路径 (新Gmail) | 无 | 需要 QR 码 | 桌面无法绕过 |
| "Use existing email" 路径 | 邮箱验证码 | 仍需 QR 码 | 桌面无法绕过 |
| YouTube 注册路径 | 无 | 需要 QR 码 | 桌面无法绕过 |
| 隐身模式 | 无 | 需要 QR 码 | 桌面无法绕过 |
| **移动模式 (Pixel 7)** | **无** | **SMS 短信** | **可用虚拟号码** |

### 发现 3：触发严格验证的因素

根据调研（来源：Octo Browser Blog、IPFoxy、Multilogin）：

**高风险因素（容易触发 QR 码）：**
- 数据中心 IP / VPN / 被标记的公共 IP
- 同一设备或网络短时间内多次注册
- 浏览器语言与 IP 地区不匹配
- 无浏览历史和 cookies 的干净环境
- 虚拟机或自动化工具特征被检测

**低风险因素（可能跳过验证）：**
- 移动设备或移动设备模拟
- 居民 IP（非数据中心）
- 与 IP 地区匹配的浏览器语言
- 有正常浏览历史的浏览器
- 首次在该设备注册

### 发现 4：Outlook 邮箱注册不需要手机验证

Outlook 注册完全不需要手机号码。

| 步骤 | 内容 | 验证方式 |
|------|------|---------|
| 1 | 选择邮箱名 | 无 |
| 2 | 创建密码 | 无 |
| 3 | 填写国家+生日 | 无 |
| 4 | 填写姓名 | 无 |
| 5 | 人机验证 | "Press and hold" 按钮 (无需手机) |

---

## "Use existing email" 路径详细流程

```
Step 1: 输入姓名 (First name + Last name)
Step 2: 生日/性别 (Month/Day/Year + Gender)
Step 3: 选择邮箱 → 点击 "Use your existing email"
Step 3b: 输入已有邮箱地址 (如 xxx@outlook.com)
Step 4: 邮箱验证码 (Google 发送验证码到该邮箱)
Step 5: 创建密码
Step 6: QR 码手机验证 (桌面模式仍然出现！)
```

---

## 已验证的工作方式

1. **移动设备模拟注册**: 获得 SMS 验证（可用虚拟号码）
2. **Outlook 邮箱注册**: 完全可自动化，无需手机
3. **Google 注册前4步**: 可自动化（姓名、生日、用户名、密码）
4. **Google 邮箱验证码步骤**: 可自动化（配合 Outlook 获取验证码）

---

## 技术细节

### Node.js 脚本 (推荐)

- 文件: `scripts/google-signup.mjs`
- 依赖: `playwright ^1.52.0`
- 默认使用移动模式（`devices["Pixel 7"]`）
- 支持 `MOBILE=false` 切换到桌面模式
- 支持 `HEADLESS=true` 无界面运行

### Chrome CDP 连接 (Python)

- 端口: `localhost:29229`
- 方式: `playwright.chromium.connect_over_cdp()`
- 支持: 多标签页操作

### 验证页面 URL 模式

- SMS 验证（移动模式）: `/devicephoneverification/consent`
- QR 码验证（桌面模式）: `/signup/mophoneverification/initial`
- QR 码验证（YouTube 路径）: `/signup/crossflowverification/initial`

### Outlook 注册 URL

- 入口: `https://signup.live.com/`
- 注册完成后跳转: `https://outlook.live.com/mail/`

---

## 推荐的下一步

1. **获取虚拟号码** → 配合移动模式脚本完成 Google 注册
2. **虚拟号码服务**: sms-activate.org / 5sim.net / onlinesim.io
3. **如虚拟号码失败** → 联系 Google 无障碍支持或请人协助扫码

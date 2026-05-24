# Google 账号注册流程文档

> 此文档记录了 Google 账号注册的完整流程，供无障碍辅助工具复用。
> 最后更新: 2026-05-24

---

## 注册入口 URL

```
https://accounts.google.com/signup
```

---

## 流程步骤总览

| 步骤 | 页面标题 | URL 关键字 | 是否可自动化 |
|------|---------|-----------|------------|
| 1 | Create a Google Account | `/signup/name` | ✅ 是 |
| 2 | Basic information | `/signup/birthdaygender` | ✅ 是 |
| 3 | Create an email address | `/signup/username` | ✅ 是 |
| 4 | Create a strong password | `/signup/password` | ✅ 是 |
| 5 | Verify some info | `/mophoneverification/initial` | ❌ 需人工 |
| 6 | 添加恢复信息 (可选) | `/recovery` | ✅ 可跳过 |
| 7 | 同意条款 | `/tos` | ✅ 是 |

---

## 详细步骤

### Step 1: 输入姓名

**URL**: `accounts.google.com/lifecycle/steps/signup/name`

**页面标题**: "Create a Google Account"

**表单字段**:
| 字段 | name 属性 | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| First name | `firstName` | text | 是 | 名 |
| Last name | `lastName` | text | 否 | 姓 (可选) |

**操作**:
1. 填写 First name 输入框
2. (可选) 填写 Last name 输入框
3. 点击 "Next" 按钮

**选择器**:
```javascript
// 名
await page.fill('input[name="firstName"]', '名');
// 姓
await page.fill('input[name="lastName"]', '姓');
// 下一步
await page.click('button:has-text("Next")');
```

---

### Step 2: 基本信息 (生日和性别)

**URL**: `accounts.google.com/lifecycle/steps/signup/birthdaygender`

**页面标题**: "Basic information"

**表单字段**:
| 字段 | name/类型 | 输入方式 | 说明 |
|------|----------|---------|------|
| Month | 下拉选择框 | 点击展开，选择月份 | January-December |
| Day | `day` (tel) | 直接输入数字 | 1-31 |
| Year | `year` (tel) | 直接输入数字 | 如 1990 |
| Gender | 下拉选择框 | 点击展开，选择选项 | 见下方选项 |

**Gender 选项**:
- Female (女)
- Male (男)
- Rather not say (不愿透露)
- Custom (自定义)

**操作**:
1. 点击 Month 下拉框 → 选择月份
2. 在 Day 输入框输入日期
3. 在 Year 输入框输入年份
4. 点击 Gender 下拉框 → 选择性别
5. 点击 "Next" 按钮

**选择器**:
```javascript
// 月份 - 点击下拉框
await page.locator('div[aria-expanded="false"]').first.click();
await page.click('li:has-text("January")');
// 日期
await page.fill('input[name="day"]', '15');
// 年份
await page.fill('input[name="year"]', '1990');
// 性别 - 点击下拉框
await page.locator('div:has-text("Gender")[aria-expanded="false"]').click();
await page.click('li:has-text("Rather not say")');
// 下一步
await page.click('button:has-text("Next")');
```

---

### Step 3: 创建邮箱地址

**URL**: `accounts.google.com/lifecycle/steps/signup/username`

**页面标题**: "Create an email address"

**页面选项**:
1. **推荐邮箱** - Google 自动生成的建议 (单选按钮)
2. **Create your own Gmail address** - 自定义邮箱名 (单选按钮 + 输入框)
3. **Use your existing email** - 使用已有邮箱 (按钮链接)

**自定义邮箱字段**:
| 字段 | name 属性 | 类型 | 说明 |
|------|----------|------|------|
| Username | `Username` | text | 邮箱名 (不含 @gmail.com) |

**规则**: 可以使用字母、数字和句点(.)

**操作**:
1. 点击 "Create your own Gmail address" 单选按钮
2. 在出现的输入框中输入想要的用户名
3. 点击 "Next" 按钮

**选择器**:
```javascript
// 选择自定义邮箱
await page.click('div:has-text("Create your own Gmail address")');
// 输入用户名
await page.fill('input[name="Username"]', 'my.custom.email');
// 下一步
await page.click('button:has-text("Next")');
```

**注意**: 如果用户名已被占用，页面会显示错误提示，需要换一个名字。

---

### Step 4: 创建密码

**URL**: `accounts.google.com/lifecycle/steps/signup/password`

**页面标题**: "Create a strong password"

**表单字段**:
| 字段 | name 属性 | 类型 | 说明 |
|------|----------|------|------|
| Password | `Passwd` | password | 密码 |
| Confirm | `PasswdAgain` | password | 确认密码 |

**密码要求**:
- 混合使用字母、数字和符号
- 至少 8 个字符

**操作**:
1. 在 Password 输入框输入密码
2. 在 Confirm 输入框再次输入密码
3. (可选) 勾选 "Show password" 查看密码
4. 点击 "Next" 按钮

**选择器**:
```javascript
// 密码
await page.fill('input[name="Passwd"]', 'MyStr0ngP@ss!');
// 确认密码
await page.fill('input[name="PasswdAgain"]', 'MyStr0ngP@ss!');
// 下一步
await page.click('button:has-text("Next")');
```

---

### Step 5: 验证身份 (⚠️ 需人工操作)

**URL**: `accounts.google.com/lifecycle/steps/signup/mophoneverification/initial`

**页面标题**: "Verify some info before creating an account"

**验证方式**: 扫描 QR 码

**操作**:
1. 打开手机相机 App
2. 对准屏幕上的 QR 码进行扫描
3. 点击弹出的链接
4. 在手机上完成验证步骤
5. 验证完成后返回电脑端，页面会自动跳转

**重要说明**:
- 此步骤 **无法自动化**，必须由用户手动完成
- 扫描 QR 码不会将手机号与新账号关联
- 这是 Google 防止机器人注册的安全措施
- 验证完成后脚本会自动继续后续步骤

---

### Step 6: 添加恢复信息 (可选)

验证完成后，Google 可能会要求添加恢复邮箱或手机号。
通常有 "Skip" 按钮可以跳过此步骤。

---

### Step 7: 同意服务条款

最后一步是同意 Google 的服务条款和隐私政策。
点击 "I agree" 按钮即可完成注册。

---

## 自动化脚本使用方法

### 安装依赖

```bash
pip install playwright
playwright install chromium
```

### 运行脚本

```bash
python google_register.py \
  --first-name "名" \
  --last-name "姓" \
  --email "想要的邮箱名" \
  --password "强密码" \
  --birth-month "January" \
  --birth-day "15" \
  --birth-year "1990" \
  --gender "Rather not say"
```

### 参数说明

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `--first-name` | 是 | - | 名 |
| `--last-name` | 否 | "" | 姓 |
| `--email` | 是 | - | Gmail 用户名 |
| `--password` | 是 | - | 密码 |
| `--birth-month` | 否 | January | 出生月份(英文) |
| `--birth-day` | 否 | 15 | 出生日 |
| `--birth-year` | 否 | 1990 | 出生年份 |
| `--gender` | 否 | Rather not say | 性别 |
| `--cdp-url` | 否 | http://localhost:29229 | Chrome CDP 地址 |

---

## 注意事项

1. **QR 码验证是唯一需要人工干预的步骤** - 脚本会在此步骤暂停等待
2. **密码建议**: 使用至少 8 位，包含大小写字母、数字和特殊符号
3. **邮箱名冲突**: 如果选择的邮箱名已被使用，需要换一个
4. **网络环境**: 确保可以正常访问 Google 服务
5. **Chrome CDP**: 需要 Chrome 浏览器开启远程调试端口

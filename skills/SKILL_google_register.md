---
name: google-account-registration
description: Google 账号注册自动化流程。使用 Playwright 通过 CDP 连接 Chrome 浏览器，自动填写注册表单，在 QR 验证步骤暂停等待人工操作。
---

# Google 账号注册自动化

## 流程概览

注册 URL: `https://accounts.google.com/signup`

5 个步骤中有 4 个可以自动化:
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
- `/mophoneverification/` → Step 5 (验证)

## 运行方式

```bash
python google_register.py \
  --first-name "Test" \
  --last-name "User" \
  --email "myemail123" \
  --password "StrongP@ss1!"
```

## 注意

- Chrome 需要在 `localhost:29229` 暴露 CDP 端口
- QR 验证步骤脚本会暂停最多 5 分钟等待
- 如果邮箱名被占用，需要手动处理错误

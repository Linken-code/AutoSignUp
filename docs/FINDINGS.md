# 探索发现与结论

## 日期: 2026-05-24

---

## 核心发现

### Google 注册 - 所有路径都需要手机验证

| 路径 | 邮箱验证 | 手机/QR验证 | 结论 |
|------|---------|------------|------|
| 标准路径 (新Gmail) | 无 | ✅ 需要 | ❌ 无法无手机注册 |
| "Use existing email" 路径 | ✅ 邮箱验证码 | ✅ 仍需要 | ❌ 无法无手机注册 |

### "Use existing email" 路径详细流程

```
Step 1: 输入姓名 (First name + Last name)
Step 2: 生日/性别 (Month/Day/Year + Gender)
Step 3: 选择邮箱 → 点击 "Use your existing email"
Step 3b: 输入已有邮箱地址 (如 xxx@outlook.com)
Step 4: 邮箱验证码 (Google 发送验证码到该邮箱)
Step 5: 创建密码
Step 6: ❌ QR 码手机验证 (仍然出现！)
```

### Outlook 注册 - 无需手机验证

| 步骤 | 内容 | 验证方式 |
|------|------|---------|
| 1 | 选择邮箱名 | 无 |
| 2 | 创建密码 | 无 |
| 3 | 填写国家+生日 | 无 |
| 4 | 填写姓名 | 无 |
| 5 | 人机验证 | "Press and hold" 按钮 (无需手机) |

**结论: Outlook 注册完全不需要手机号码。**

---

## 已验证的工作方式

1. **Outlook 邮箱注册**: 完全可自动化，无需手机
2. **Google 注册前4步**: 可自动化
3. **Google 邮箱验证码步骤**: 可自动化（切换到Outlook获取验证码）
4. **Google QR码验证**: 无法自动化，必须有物理手机

---

## 技术细节

### Chrome CDP 连接
- 端口: `localhost:29229`
- 方式: `playwright.chromium.connect_over_cdp()`
- 支持: 多标签页操作（可在标签页间切换获取验证码）

### Google 验证页面 URL 模式
- 验证页: `/signup/mophoneverification/initial`
- 此页面出现条件: 所有注册路径在密码设置之后

### Outlook 注册 URL
- 入口: `https://signup.live.com/`
- 注册完成后自动跳转到: `https://outlook.live.com/mail/`

---

## 待探索方向

1. **通过 Google 服务入口注册** (YouTube, Google Maps 等)
2. **通过 Google Workspace/Education** 注册
3. **不同地区/语言** 的注册流程差异
4. **移动端浏览器** 模拟注册
5. **Google 无障碍支持** 提供的替代验证方式

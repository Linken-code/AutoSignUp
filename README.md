# AutoSignUp - Google 账号自动注册工具

## 项目说明

本项目记录并自动化 Google 账号注册流程，专为无法使用鼠标/键盘的用户设计。  
提供 **Python (Playwright CDP)** 和 **Node.js (Playwright)** 两种实现。

## 当前状态

| 步骤 | 状态 | 说明 |
|------|------|------|
| 1. 输入姓名 | 已自动化 | First name + Last name |
| 2. 生日/性别 | 已自动化 | Month/Day/Year + Gender |
| 3. 邮箱选择 | 已自动化 | 支持新Gmail / 已有邮箱 |
| 4. 设置密码 | 已自动化 | Password + Confirm |
| 5. QR码验证 | 无法绕过 | **需要物理手机扫码** |

## 重要发现

### "Use existing email" 路径测试结果

- **路径**: 注册时选择 "Use your existing email" 而非创建新 Gmail
- **验证方式**: 邮箱验证码（发送到已有邮箱）
- **结果**: 邮箱验证码通过后，**仍需要 QR 码手机验证**
- **结论**: 两条路径都无法绕过手机验证

### 测试过的注册路径

1. **标准路径 (新Gmail)**: 姓名 → 生日 → 创建Gmail → 密码 → QR验证
2. **已有邮箱路径**: 姓名 → 生日 → 输入已有邮箱 → 邮箱验证码 → 密码 → QR验证

---

## 注册流程概览

| 步骤 | 页面 | 内容 | 自动化 |
|------|------|------|--------|
| 1 | `/signup/name` | 输入姓名（First name, Last name） | 可自动 |
| 2 | `/signup/birthdaygender` | 选择生日和性别 | 可自动 |
| 3 | `/signup/username` | 选择用户名（`xxx@gmail.com`） | 可自动 |
| 4 | `/signup/password` | 设置密码和确认密码 | 可自动 |
| 5 | `/signup/mophoneverification` | 手机 QR 码验证 | **需手动** |
| 6 | （验证后）| 添加恢复邮箱（可选） | 可自动 |
| 7 | （验证后）| 同意服务条款 | 可自动 |

---

## 文件结构

```
AutoSignUp/
├── README.md                         # 本文件
├── package.json                      # Node.js 依赖
├── config.example.json               # Node.js 脚本配置示例
├── docs/
│   ├── GOOGLE_注册流程文档.md         # 完整注册流程文档
│   ├── FINDINGS.md                   # 探索发现和结论
│   └── registration-flow.md          # 详细流程文档（含选择器和URL信息）
├── scripts/
│   ├── google_register.py            # Python 注册自动化脚本 (CDP)
│   ├── outlook_register.py           # Outlook 注册自动化脚本 (辅助)
│   └── google-signup.mjs             # Node.js Playwright 注册脚本
├── skills/
│   └── SKILL_google_register.md      # 技能文档供复用
└── accounts/
    └── ACCOUNTS.md                   # 已创建的测试账号信息
```

---

## 使用方法

### 方式一: Python 脚本 (通过 CDP 连接已打开的 Chrome)

```bash
pip install playwright
python scripts/google_register.py \
  --first-name "David" \
  --last-name "Carter" \
  --email "your.existing.email@outlook.com" \
  --password "YourStrongPassword" \
  --use-existing-email
```

### 方式二: Node.js 脚本 (独立启动浏览器)

```bash
# 安装依赖
npm install
npx playwright install chromium

# 配置信息
cp config.example.json config.json
# 编辑 config.json 填写你的信息

# 运行（有界面模式，推荐）
npm run signup

# 运行（无界面模式）
npm run signup:headless
```

### 手动验证步骤

两种脚本到达 QR 码验证页面时都会暂停等待：
- 用手机扫描屏幕上的 QR 码
- 完成手机端验证步骤
- 回到电脑，脚本会自动继续

---

## 注意事项

- Google 可能会根据 IP 地址、浏览器指纹等因素改变验证要求
- 请勿将 `config.json` 提交到版本控制（已在 `.gitignore` 中排除）
- 本工具仅供个人辅助使用，请遵守 Google 服务条款

## 待解决问题

- [ ] QR 码验证需要物理手机，无法自动化
- [ ] 需要探索 Google 无障碍支持渠道
- [ ] 需要调查是否有 Google API 可以创建账号而无需 QR 验证

## 建议的下一步

1. **联系 Google 无障碍支持**: https://support.google.com/accounts/troubleshooter/2402620
2. **请他人协助扫码**: QR码扫码不会绑定手机号到新账号
3. **考虑 Google Workspace**: 企业版可能有不同的验证流程

## License

MIT

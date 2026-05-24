# AutoSignUp - Google 账号自动注册工具

## 项目说明

本项目记录并自动化 Google 账号注册流程，专为无法使用鼠标/键盘的用户设计。

## 当前状态

| 步骤 | 状态 | 说明 |
|------|------|------|
| 1. 输入姓名 | ✅ 已自动化 | First name + Last name |
| 2. 生日/性别 | ✅ 已自动化 | Month/Day/Year + Gender |
| 3. 邮箱选择 | ✅ 已自动化 | 支持新Gmail / 已有邮箱 |
| 4. 设置密码 | ✅ 已自动化 | Password + Confirm |
| 5. QR码验证 | ❌ 无法绕过 | **需要物理手机扫码** |

## 重要发现

### "Use existing email" 路径测试结果

- **路径**: 注册时选择 "Use your existing email" 而非创建新 Gmail
- **验证方式**: 邮箱验证码（发送到已有邮箱）
- **结果**: 邮箱验证码通过后，**仍需要 QR 码手机验证**
- **结论**: 两条路径都无法绕过手机验证

### 测试过的注册路径

1. **标准路径 (新Gmail)**: 姓名 → 生日 → 创建Gmail → 密码 → QR验证
2. **已有邮箱路径**: 姓名 → 生日 → 输入已有邮箱 → 邮箱验证码 → 密码 → QR验证

## 文件结构

```
├── README.md                    # 本文件
├── docs/
│   ├── GOOGLE_注册流程文档.md    # 完整注册流程文档
│   └── FINDINGS.md              # 探索发现和结论
├── scripts/
│   ├── google_register.py       # Google 注册自动化脚本
│   └── outlook_register.py      # Outlook 注册自动化脚本 (辅助)
├── skills/
│   └── SKILL_google_register.md # 技能文档供复用
└── accounts/
    └── ACCOUNTS.md              # 已创建的测试账号信息
```

## 使用方法

### 前提条件
- Chrome 浏览器已打开（CDP 调试端口 29229）
- Python 3 + playwright 已安装

### 运行 Google 注册脚本
```bash
pip install playwright
python scripts/google_register.py \
  --first-name "David" \
  --last-name "Carter" \
  --email "your.existing.email@outlook.com" \
  --password "YourStrongPassword" \
  --use-existing-email
```

脚本会自动完成前4步，在第5步（QR验证）暂停等待人工扫码。

## 待解决问题

- [ ] QR 码验证需要物理手机，无法自动化
- [ ] 需要探索 Google 无障碍支持渠道
- [ ] 需要调查是否有 Google API 可以创建账号而无需 QR 验证

## 建议的下一步

1. **联系 Google 无障碍支持**: https://support.google.com/accounts/troubleshooter/2402620
2. **请他人协助扫码**: QR码扫码不会绑定手机号到新账号
3. **考虑 Google Workspace**: 企业版可能有不同的验证流程

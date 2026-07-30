# cnwafunew（简体中文 · 国内站）

> 先读 [`../AGENTS.md`](../AGENTS.md)，再读本文。冲突时以根文档为准。

## 1. 身份

| 项 | 值 |
|----|-----|
| 目录 | `cnwafunew/`（仅本地文件夹名） |
| 域名 | https://wafulock.cn/ |
| `html lang` | `zh-CN` |
| `og:locale` | `zh_CN` |
| 角色 | **国内站**，**不是**国际主站（国际主站 = `Enwafu` / wafuen.com） |
| 品牌 title 后缀 | 常见 `\| 华府智能 WAFU` |

## 2. 与外文站的核心差异（必守）

### 2.1 分享（文章底 `.wafu-share-section`）

| 按钮 | 行为 | 要点 |
|------|------|------|
| 微博 | 分享当前页 | `service.weibo.com/share/...`，url/title 用 **wafulock.cn** |
| 微信 | 复制链接 | `button.wafu-share-copy` + `js/article-share.js` |
| 抖音 | 官方页 | `https://v.douyin.com/0wUlMqC9nM4/` |
| B站 | 官方空间 | `https://space.bilibili.com/3546585736677604` |
| 小红书 / 知乎 | 搜品牌 | 关键词 `WAFU智能锁`（URL 编码） |

**禁止**：Twitter、Facebook、`share-round`、`wafuen.com` 出现在分享/canonical/Schema（语言切换导航里的外链除外）。

### 2.2 客服与脚本

- `float-kefu`：微信二维码为主，不是 WhatsApp。
- 有 `#wechat` 时引入 `js/wechat-footer.js`（通常在 `all.js` 前）。
- 文章页需要复制链接时引入 `js/article-share.js`。
- 本站独有上述脚本；不要假设外文站也有。

### 2.3 SEO / 域名

- canonical / og / 分享 / 微博 url：**一律** `https://wafulock.cn/...`
- 不要把国际站 `x-default` 改成简体中文站；`x-default` 属于英文国际主站策略。

## 3. 联系表单（发信）

- 路径：**EmailJS 浏览器直连**（与国际站同一套 public key / service / template）。
- 表单 `#contactForm`；必填姓名/公司 + 电话；勿改字段 id。
- `contact-form.js` 失败提示目前可能仍是**英文**，备用邮箱 `wafutechnology@outlook.com`（与页脚国内邮箱并存时，以现页为准）。
- 国内网络偶发拦 `api.emailjs.com` → 用户看到发送失败；排障见根 `AGENTS.md` §8。
- 存在 `functions/api/contact.js`，当前前端默认不走 API。

## 4. 编码

- UTF-8 **无 BOM**（历史 BOM 已按仓库策略清理；写回时禁止再加 BOM）。
- 简体中文正文对编码错误极敏感：写文件必须用无 BOM UTF-8 API。
- 保留 `<meta charset="UTF-8">`。

## 5. 扫描与忽略

- 本目录有 [`.cursorignore`](./.cursorignore)：图片/视频/zip/pdf/`node_modules` 等被忽略。
- 不要为了「确认配图」去扫整个 `images/`；路径按现有文章惯例引用即可。

## 6. 改文章时最小检查

- [ ] 无 Twitter/Facebook/wa.me
- [ ] 微博分享域名 = wafulock.cn
- [ ] `article-share.js` / `wechat-footer.js` 按需存在
- [ ] 无 BOM；简体中文标题可读
- [ ] 站内链无 `.html`

## 7. 延伸阅读

- 国内六按钮细表：`../.cursor/article-page-reusable-playbook.md` §5.3
- 根总则分享对照：`../AGENTS.md` §3

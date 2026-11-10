# llapi.org SEO 提交流程指南

## 📋 总览

| 步骤 | 平台 | 操作 | 预计耗时 |
|------|------|------|----------|
| 1 | Google Search Console | 添加站点 → 验证所有权 → 提交 sitemap | 15 分钟 |
| 2 | Bing Webmaster Tools | 添加站点 → 验证 → 提交 sitemap | 10 分钟 |
| 3 | 百度站长平台 | 添加站点 → 验证 → 提交链接 | 15 分钟 |
| 4 | 后续维护 | 监控爬取错误、提交新页面 | 每周 5 分钟 |

---

## 1️⃣ Google Search Console

### 1.1 添加站点

1. 打开 https://search.google.com/search-console
2. 登录 Google 账号
3. 选择 **「网址前缀」**（URL prefix）
4. 输入：`https://llapi.org`
5. 点击「继续」

### 1.2 验证所有权（推荐 DNS 方式，最稳定）

1. 在验证页面选择 **「DNS 记录」** 方式
2. 复制给出的 TXT 记录值（形如 `google-site-verification=xxx`）
3. 登录你的域名管理后台（阿里云 / DNSPod / Cloudflare 等）
4. 在 llapi.org 的 DNS 解析中添加一条 **TXT 记录**：
   - 主机记录：`@` 或留空
   - 记录类型：`TXT`
   - 记录值：上一步复制的值
5. 回到 Search Console，点击「验证」

> ⏳ DNS 生效通常 1-10 分钟，最慢可能需要 24 小时。

### 1.3 提交 sitemap

1. 验证通过后，进入 Search Console 首页
2. 左侧菜单 → **「Sitemaps」**
3. 在「输入 sitemap URL」处填写：`sitemap.xml`
4. 点击「提交」

### 1.4 检查效果

- 提交后等待 1-3 天，Search Console 会显示爬取状态
- 左侧「效果」→ 查看搜索展示量、点击量、排名
- 左侧「URL 检查」→ 可手动请求 Google 爬取单个页面（如 `https://llapi.org/claude-code.html`）

---

## 2️⃣ Bing Webmaster Tools

### 2.1 添加站点

1. 打开 https://www.bing.com/webmasters (或 https://www.bing.com/webmasters/about)
2. 用 Microsoft 账号登录
3. 点击 **「Add a site」**
4. 输入：`https://llapi.org`
5. 点击「Add」

### 2.2 验证所有权

Bing 支持三种验证方式：

#### 方式 A：导入 Google Search Console 验证（推荐，最快）
1. 在验证页面选择 **「Import from Google Search Console」**
2. 授权 Bing 读取你的 GSC 数据
3. 验证即时完成

#### 方式 B：DNS 验证
与 Google 的流程一样，添加一条 TXT 记录。

#### 方式 C：HTML meta 标签
复制 `<meta>` 标签，放到 `index.html` 的 `<head>` 中，重新上传。

### 2.3 提交 sitemap

1. 验证通过后，进入 Bing Webmaster Tools 首页
2. 左侧 **「Sitemaps」**
3. 填写：`https://llapi.org/sitemap.xml`
4. 点击「Submit」

> Bing 还会自动读取 robots.txt 中的 Sitemap 声明，所以只要 robots.txt 已上传，Bing 也会自动发现 sitemap。

---

## 3️⃣ 百度站长平台（重要：国内搜索）

### 3.1 添加站点

1. 打开 https://ziyuan.baidu.com/
2. 用百度账号登录
3. 点击 **「站点管理」→「添加站点」**
4. 输入：`https://llapi.org`
5. 选择站点类别：**「互联网服务」→「开发者服务」** 或类似

### 3.2 验证所有权

百度支持三种验证方式：

#### 推荐方式：文件验证
1. 下载百度提供的验证文件（如 `baidu_verify_xxx.html`）
2. 上传到 **灵链home 目录**（与 `index.html` 同级）
3. 点击「完成验证」

#### 方式二：HTML 标签验证
1. 复制百度给的 `<meta name="baidu-site-verification" content="xxx">`
2. 放到 `index.html` 的 `<head>` 中（紧接在 `<meta charset="utf-8">` 之后）
3. 重新上传，点击「完成验证」

### 3.3 提交链接

百度对纯静态 HTML 页面支持良好，有几种提交方式：

#### 方式 A：手动提交（推荐，起初用）
1. 左侧 **「普通收录」→「资源提交」→「手动提交」**
2. 逐条输入新页面 URL（统一使用带 .html 的标准地址）：
   - `https://llapi.org/claude-code.html`
   - `https://llapi.org/codex-setup.html`
   - `https://llapi.org/openai-compatible.html`
   - `https://llapi.org/api-proxy.html`
3. 点击「提交」

#### 方式 B：sitemap 提交（自动）
1. 左侧 **「普通收录」→「资源提交」→「sitemap」**
2. 填写：`https://llapi.org/sitemap.xml`
3. 点击「提交」

> 百度对 sitemap 的更新频率不如 Google 敏感，但提交了总比不提交好。

#### 方式 C：API 推送（适合持续更新）
与百度站长平台对接 API 接口，每次新增页面时自动推送。适合后续增加博客时使用，初期可先用手动提交。

---

## 4️⃣ 后续维护建议

### 4.1 发现新页面后立即提交

每次新增落地页或博客文章后：

```
Google:  Search Console → URL 检查 → 输入 URL → 请求索引
Bing:    Webmaster Tools → URL Inspection → 输入 URL → 请求索引
百度:    站长平台 → 普通收录 → 手动提交
```

### 4.2 定期检查爬取错误

| 平台 | 检查位置 | 关注点 |
|------|---------|--------|
| Google | Search Console → 页面索引 | 404、软 404、被屏蔽的页面 |
| Bing | Webmaster Tools → Index | 抓取错误、URL 阻塞 |
| 百度 | 站长平台 → 抓取诊断 | 抓取失败、DNS 解析错误 |

### 4.3 更新 sitemap

每次新增页面时，更新 `sitemap.xml` 中的 `<url>` 记录，然后重新上传。

### 4.4 内容更新频率

- **落地页**（claude-code 等）：内容稳定，每月检查一次模型名/价格即可
- **博客计划**：建议每周至少 1 篇，持续向搜索引擎证明网站活跃度

---

## 5️⃣ 常见问题

### Q: 提交后多久能看到搜索排名？

A: 通常 1-4 周开始有展示。新站（域名不足 6 个月）会有「沙盒期」，排名逐渐上升是正常的。

### Q: 百度不收录怎么办？

A: 几个常见原因：
- 网站未备案或备案信息不符（检查工信部备案号是否在页面底部）
- 内容质量不足（检查是否有足够原创内容）
- 站点层级过深（确保每个落地页到首页不超过 3 次点击）
- 确认 `robots.txt` 没有错误地禁止百度蜘蛛

### Q: 多个页面内容相似会被判重复内容吗？

A: 这 4 个落地页各自聚焦不同关键词（Claude Code、Codex、OpenAI 兼容、中转站），内容不同，不会互相竞争。但注意不要在页内大量重复相同段落。

### Q: 需要向 Google 和百度都提交吗？

A: 如果你主要面向国内用户，**百度是必须的**；如果需要海外开发者流量，**Google 也是必须的**。两个都做成本最低，建议都做。

---

## 6️⃣ 快速检查清单

```
□ 落地页已上传到网站根目录 (4 个 .html 文件)
□ sitemap.xml 已上传
□ robots.txt 已上传
□ Nginx rewrite 配置已生效（访问 /claude-code 会 301 到 .html）
□ Google Search Console 已验证 + 提交 sitemap
□ Bing Webmaster Tools 已验证 + 提交 sitemap
□ 百度站长平台已验证 + 提交链接
□ 用「URL 检查」手动请求 Google 索引首页
□ 用浏览器访问 https://llapi.org/claude-code.html 确认页面正常
```
# 主页动画与统计配置

## 首次启用

推送主页代码前确认接受当前预览。主页的打字标题与小狐狸 GIF 不需要访问令牌；贡献贪吃蛇和双栏统计需要在 GitHub Actions 首次生成产物后才能显示，不会自动借用别人的统计图。

1. 打开 [个人访问令牌设置](https://github.com/settings/tokens)，创建 **classic** 令牌：

   1. 进入 `Tokens (classic)` 页面，选择 `Generate new token (classic)`。
   2. 不勾选任何 scope。
   3. 生成后复制令牌。

2. 不需要 `repo`、`public_repo`、`read:org` 或 `gist`。基础统计、语言分布和立体日历只读取公开资料，不访问私有仓库。
3. 建议设置过期时间（例如 90 天或 1 年）。到期后统计任务会因令牌失效而失败，需要重新创建并更新 Secret；选择不过期则需自行评估保管风险。
4. 打开 [仓库 Actions Secret 设置](https://github.com/Fish-under-sea/Fish-under-sea/settings/secrets/actions)，把 `METRICS_TOKEN` 更新为 classic 令牌的值。
5. 在 [Actions](https://github.com/Fish-under-sea/Fish-under-sea/actions) 页面手动运行 `Generate profile metrics`（贡献动画已生成，无需重跑）。
6. 确认 `output` 分支中出现 `metrics.left.svg` 和 `metrics.right.svg`。

令牌只填入 GitHub 的 Secret 输入框，不发到聊天里，不保存到仓库文件。参考 [Metrics 官方配置文档](https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/documentation/setup/action.md)。

### 必须使用 classic 令牌

**已实测：fine-grained 令牌不可用。** 首次运行（Metrics v3.34.0）在第一步即失败，日志输出：

```text
GitHub token format  │ fine-grained
Error: It seems you're trying to use a fine-grained personal access token.
These are currently unsupported as GitHub does not support them (yet?) for
GraphQL API authentication. Use a classic token instead.
```

这与 [issue #1292](https://github.com/lowlighter/metrics/issues/1292) 仍为 open 一致：工具自身按令牌前缀识别格式并主动拒绝，与 GitHub 是否放开 GraphQL 认证无关。因此不要使用 fine-grained 令牌，也不必尝试为其追加权限。

classic 令牌无 scope 即可满足当前配置。产物提交始终使用 GitHub 自动提供的 `GITHUB_TOKEN`，与读取令牌无关。

## 权限与数据范围

`METRICS_TOKEN` 只读取公开资料。产物写入使用 GitHub 每次运行自动提供的 `GITHUB_TOKEN`，写权限只授予生成任务中的 `contents`，无需另建写入令牌。

贡献数量以 GitHub 公开展示的贡献记录为准。如果用户在个人设置中开启了「显示私有贡献」，公开图表可能包含匿名汇总数量，但此配置不会请求私有仓库名称、代码或提交内容。

两个工作流共享 `profile-artifacts` 并发组，按顺序写入产物。贪吃蛇工作流先取回已有输出，再合并新图，不删除双栏统计。发布采用增量提交，不强制推送。

每天北京时间 08:00 生成贡献动画，08:30 生成统计；GitHub 的定时调度可能延迟。统计图附带实际生成时间，失败时保留上一次产物。缺少 Secret 时统计任务明确失败，不用空图片覆盖已有数据。

## 动画与主题

打字标题沿用 `readme-typing-svg`，使用 `Inconsolata` 字体，适配 `Fish-under-sea` 和个人开发者身份。普通模式循环打字；窄屏使用较短标题，避免把长句缩成小字。

小狐狸使用 [innng 原 GIF](https://raw.githubusercontent.com/innng/innng/master/assets/kyubey.gif)。已核实它有 6 帧，原图尺寸为 391 × 200，展示尺寸为 78 × 40。

减少动态效果模式显示静态标题和 GIF 首帧，贡献区域切换为用户真实贡献网格的静态快照，不依赖统计 Secret。GIF 原始授权未声明，其静态回退与用户提供的人物图也不纳入仓库 MIT 许可。素材来源、尺寸与内容哈希见 [素材记录](../assets/manifest.json)。

## 本地检查

无需安装主页运行依赖。在仓库根目录运行：

```powershell
node --test --test-isolation=none tests/profile.test.mjs
git diff --check
```

验收测试覆盖中英文身份、打字配置、原 GIF 来源、减少动态效果回退、图片格式、真实项目链接、产物账号、工作流保留行为及素材来源记录。

本地浏览器预览不能代替线上工作流验证。本次贡献动画已使用官方工具从用户的真实贡献记录本地生成；双栏统计尚未首次生成，预览明确标记为占位。不能把别人的图片、示意数字或布局占位图称为用户真实数据。

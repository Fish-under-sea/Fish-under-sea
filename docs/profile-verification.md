# 融合主页本地验收记录

日期：2026-10-10

## 已完成

- 中英文主页均使用个人开发者身份，移除原个人简介中的学校、年级与班级。
- 保留参考案例的两行打字标题、浅灰等宽简介、原 GIF 和紧凑徽章布局。
- 用户人物图保持 8:5 比例；原始图片哈希与加工前一致，没有修改原图。
- 已通过官方 `Platane/snk` 工具从 `Fish-under-sea` 的真实贡献记录生成明暗两套贡献动画。
- 两个 GitHub Actions 工作流的 YAML 结构解析通过，统计读取和产物写入令牌分离。
- 16 条 Node.js 验收测试通过，`git diff --check` 通过。
- 浏览器完成 9 组检查：桌面明暗主题、375 像素明暗主题、320/414 像素窄屏、768 像素平板、减少动态效果及英文手机版。页面级横向溢出和破图均为 0。
- 打字标题与贪吃蛇通过实际像素变化检查；GIF 通过 8 组真实截图变化检查。Canvas 对 GIF 返回首帧，因此没有将 Canvas 不变误判为动画失效。
- 减少动态效果的贡献回退图通过绿色像素检查。已修复通用图像转换器不支持原 SVG CSS、把回退图渲染成黑色方格的问题。
- 所有仓库内素材的长度与 SHA-256 哈希均与来源记录一致。

## 首次线上运行

已推送到 `main`（`39d7911..1769fa0`），两个工作流按 `push` 触发：

| 工作流 | 结果 | 说明 |
|--------|------|------|
| Generate contribution snake | ✅ 成功 | 6 个步骤全部通过，`output` 分支已生成明暗两套贡献动画 |
| Generate profile metrics | ❌ 失败 | 第一步即失败，未产出统计图 |

失败根因（Metrics v3.34.0 日志原文）：

```text
GitHub token format  │ fine-grained
Error: It seems you're trying to use a fine-grained personal access token.
These are currently unsupported as GitHub does not support them (yet?) for
GraphQL API authentication. Use a classic token instead.
```

**修正此前的判断：** 我先前依据 GitHub 放开了 fine-grained 令牌认证 GraphQL，判断该组合「理论上可行、只是官方未背书」。实测证明这是错的——Metrics 自身按令牌格式主动拒绝，与 GitHub 侧是否支持无关，其 [issue #1292](https://github.com/lowlighter/metrics/issues/1292) 仍为 open。必须改用 classic 无 scope 令牌，工作流无需改动。

## 尚未验证

双栏统计尚未成功生成。需要在 `METRICS_TOKEN` 中换成 classic 令牌并重跑 `Generate profile metrics`；在此之前，线上主页的统计区域是缺失图片，离线预览中标注为占位。

统计图首次成功生成后，还需确认其实际渲染尺寸与加载时的布局偏移。设计检测器提示外部响应式图片缺少固定高度：统计图高度随真实数据变化，GitHub README 不支持通用响应式 CSS。本轮没有用猜测的高度拉伸图表，也不宣称检测器全绿。

检测器的双换行和中点排版提示属于用户明确要求保留的参考样式，没有改成另一种设计。

## 发布前操作

在 GitHub 仓库设置中配置只读取公开资料的 `METRICS_TOKEN` Secret。用户确认当前预览后，再提交、推送并运行两类工作流。具体权限与操作见 [主页生成配置](profile-setup.md)。令牌不得发到聊天中。

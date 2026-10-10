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

**修正此前的判断：** 我先前依据 GitHub 放开了 fine-grained 令牌认证 GraphQL，判断该组合「理论上可行、只是官方未背书」。实测证明这是错的——Metrics 自身按令牌格式主动拒绝，与 GitHub 侧是否支持无关，其 [issue #1292](https://github.com/lowlighter/metrics/issues/1292) 仍为 open。

改用 classic 无 scope 令牌后，手动运行 `Generate profile metrics`（run 38063366077）成功，两个统计步骤均通过。工作流本身无需修改。

## 线上最终验证

`output` 分支四份产物全部生成并可访问：

| 产物 | 大小 | 状态 |
|------|------|------|
| `github-contribution-grid-snake.svg` | 34,844 字节 | 200 |
| `github-contribution-grid-snake-dark.svg` | 34,844 字节 | 200 |
| `metrics.left.svg` | 71,173 字节 | 200 |
| `metrics.right.svg` | 170,601 字节 | 200 |

使用真实浏览器打开 `github.com/Fish-under-sea` 验证：

- 桌面明暗主题与 375 像素手机端，8 张图片全部加载成功，破图 0，页面级横向溢出 0。
- 首屏包含打字标题、浅灰等宽简介、小狐狸 GIF、用户人物图与紧凑徽章。
- 贡献贪吃蛇渲染宽度 846 像素；统计图实测自然尺寸 480 × 335 与 480 × 388，均按容器自适应。
- 页面文本已无学校、年级与班级信息。
- 贡献动画使用 CSS `@keyframes`（51 个关键帧、3 条 animation 声明），不是静态图。

## 剩余说明

统计图高度随真实数据变化，设计检测器提示外部响应式图片缺少固定高度。GitHub README 不支持通用响应式 CSS，本轮没有用猜测的高度拉伸图表，也不宣称检测器全绿；实测加载时无页面级横向溢出。

检测器的双换行和中点排版提示属于用户明确要求保留的参考样式，没有改成另一种设计。

两个工作流每天北京时间 08:00 与 08:30 自动运行。统计令牌设置了过期时间时，到期后需要重新创建并更新 `METRICS_TOKEN`。

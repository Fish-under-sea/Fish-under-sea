import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '';
const profiles = ['README.md', 'README.en.md'];
const fox = 'https://raw.githubusercontent.com/innng/innng/master/assets/kyubey.gif';
const output = 'https://raw.githubusercontent.com/Fish-under-sea/Fish-under-sea/output/';

for (const profile of profiles) {
  test(`${profile}: 使用个人开发者身份并移除学生资料`, () => {
    const content = read(profile);
    assert.match(content, profile === 'README.md' ? /个人开发者/ : /personal developer/i);
    assert.doesNotMatch(content, /深圳城市职业学院|创新实验班|25 级|Shenzhen City Polytechnic|\b(?:a student|student at|student in)\b|Experimental Class/i);
  });

  test(`${profile}: 保留真实打字动画而非静态标题`, () => {
    const content = read(profile);
    const title = content.match(/https:\/\/readme-typing-svg\.demolab\.com[^"\s]+/g) ?? [];
    assert.ok(title.length >= 2, '需要明暗主题打字标题');
    for (const source of title) {
      const url = new URL(source.replaceAll('&amp;', '&'));
      assert.equal(url.searchParams.get('font'), 'Inconsolata');
      assert.match(url.searchParams.get('lines'), /Fish-under-sea/);
      assert.doesNotMatch(url.searchParams.get('lines'), /I'm Ing/);
      assert.equal(url.searchParams.get('repeat'), 'true');
    }
    assert.match(content, /<pre>[\s\S]*?<\/pre>/);
  });

  test(`${profile}: 保留同一小狐狸 GIF 并提供减少动态效果的回退`, () => {
    const content = read(profile);
    assert.ok(content.includes(fox), '需要引用原案例 GIF');
    assert.match(content, /prefers-reduced-motion: reduce/);
    assert.match(content, /assets\/kyubey-still\.png/);
    assert.match(content, /height="40"/);
  });

  test(`${profile}: 使用用户人物图和真实项目链接`, () => {
    const content = read(profile);
    assert.match(content, /assets\/profile\.jpg/);
    assert.doesNotMatch(content, /assets\/banner\.jpg/);
    for (const project of ['dsh-fish', 'WinTunerPro', 'MnemoTranscode']) {
      assert.ok(content.includes(`https://github.com/Fish-under-sea/${project}`));
    }
    assert.match(content, /1661715118@qq\.com/);
    assert.match(content, /<details>/);
    assert.ok(content.includes(profile === 'README.md' ? 'README.en.md' : 'README.md'));
  });

  test(`${profile}: 贡献动画与双栏统计均指向自己的账号`, () => {
    const content = read(profile);
    for (const artifact of ['github-contribution-grid-snake.svg', 'github-contribution-grid-snake-dark.svg', 'metrics.left.svg', 'metrics.right.svg']) {
      assert.ok(content.includes(`${output}${artifact}`), `缺少 ${artifact}`);
    }
    assert.match(content, /width="50%"/);
    assert.doesNotMatch(content, /raw\.githubusercontent\.com\/elysia395|username=elysia395/);
  });
}

test('减少动态效果的贡献回退不依赖统计首次生成', () => {
  for (const profile of profiles) {
    assert.match(read(profile), /prefers-reduced-motion: reduce\)" srcset="\.\/assets\/contributions-still\.png"/);
  }
  assert.ok(existsSync(join(root, 'assets/contributions-still.png')));
});

test('首屏人物图与标题并排且不重叠', () => {
  for (const profile of profiles) {
    const content = read(profile);
    const image = content.match(/<img src="\.\/assets\/profile\.jpg(\?v=[0-9a-f]+)?" width="(\d+)%" align="right"/);
    assert.ok(image, '人物图应使用百分比宽度并靠右浮动，与参考案例一致');
    const imagePct = Number(image[2]);
    assert.ok(imagePct >= 20 && imagePct <= 30, `人物图 ${imagePct}% 应落在参考案例的 25% 附近`);

    // 人物图为竖图（比例 < 1），浮动高度足以覆盖标题、简介、小狐狸与徽章
    const manifest = JSON.parse(read('assets/manifest.json'));
    const entry = manifest.assets.find(a => a.path === 'assets/profile.jpg');
    assert.ok(entry && entry.width < entry.height, '人物图应为竖图，使浮动覆盖整个首屏左栏');

    const title = content.match(/readme-typing-svg[\s\S]*?width="(\d+)%" alt="Hello hello/);
    assert.ok(title, '需要桌面标题的展示宽度');
    const titlePct = Number(title[1]);

    // GitHub 给右浮动图片加 20px 左内边距；按最窄正文栏 632px 计算剩余可用宽度
    const narrowArticle = 632;
    const reserved = (imagePct / 100) * narrowArticle + 20;
    const titleWidth = (titlePct / 100) * narrowArticle;
    assert.ok(titleWidth <= narrowArticle - reserved, `标题 ${titlePct}% 放不进剩余 ${Math.round(narrowArticle - reserved)}px，会被挤到图片下方`);
    assert.doesNotMatch(content, /<table>\s*<tr>\s*<td[^>]*>\s*<picture>/, '首屏不应使用带边框的表格分栏');
  }
});

test('首屏徽章墙使用用户真实技术栈且放在小狐狸区块之后', () => {
  // 用户实际使用的技术（来自技术栈表格）→ skillicons 图标 ID
  // 不含参考图里的 Rust/Axum/STM32/Qt/PyTorch/WebGL/OpenCV 等非本人技术
  const stack = { Python: 'py', TypeScript: 'ts', JavaScript: 'js', 'C++': 'cpp', React: 'react', Vite: 'vite', Electron: 'electron', FastAPI: 'fastapi', Flask: 'flask', TensorFlow: 'tensorflow' };
  for (const profile of profiles) {
    const content = read(profile);
    // 技术栈徽章区应在小狐狸之后、header 结束之前
    const foxIndex = content.indexOf('kyubey.gif');
    const stackIndex = content.indexOf('skillicons.dev/icons?i=');
    assert.ok(stackIndex > foxIndex, '技术栈徽章墙应位于小狐狸之后');
    assert.ok(stackIndex < content.indexOf('</div>'), '技术栈徽章墙应在首屏容器内');

    const stackParam = content.slice(stackIndex).match(/icons\?i=([a-z0-9,]+)/);
    assert.ok(stackParam, '缺少 skillicons 图标参数');
    const used = stackParam[1].split(',');
    for (const [name, id] of Object.entries(stack)) {
      assert.ok(used.includes(id), `技术栈徽章缺少 ${name}（图标 ID：${id}）`);
    }
    for (const notMine of ['rust', 'axum', 'stm32', 'qt', 'pytorch', 'webgl', 'opencv']) {
      assert.ok(!used.includes(notMine), `不应包含非本人技术栈的 ${notMine}`);
    }
  }
});

test('人物图和动画静态回退素材存在且没有伪造文件格式', () => {
  assert.ok(existsSync(join(root, 'assets/profile.jpg')), '缺少人物图');
  const jpeg = readFileSync(join(root, 'assets/profile.jpg'));
  assert.deepEqual([...jpeg.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.ok(existsSync(join(root, 'assets/kyubey-still.png')), '缺少 GIF 静态回退');
  const png = readFileSync(join(root, 'assets/kyubey-still.png'));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.match(read('assets/title-static.svg'), /Fish-under-sea/);
});

test('贡献动画工作流支持定时和手动生成并保留统计产物', () => {
  const workflow = read('.github/workflows/snake.yml');
  assert.ok(workflow.length > 0, '缺少贡献动画工作流');
  for (const pattern of [/workflow_dispatch:/, /schedule:/, /github\.repository_owner/, /palette=github-dark/, /git archive FETCH_HEAD/, /keep_history: true/, /target_branch: output/, /cancel-in-progress: false/]) {
    assert.match(workflow, pattern);
  }
  assert.doesNotMatch(workflow, /pull_request_target:|METRICS_TOKEN/);
});

test('统计工作流分离读取与写入权限并按顺序生成双栏', () => {
  const workflow = read('.github/workflows/metrics.yml');
  assert.ok(workflow.length > 0, '缺少统计工作流');
  for (const pattern of [/workflow_dispatch:/, /schedule:/, /secrets\.METRICS_TOKEN/, /committer_token: \$\{\{ secrets\.GITHUB_TOKEN \}\}/, /committer_branch: output/, /metrics\.left\.svg/, /metrics\.right\.svg/, /plugin_isocalendar: yes/, /plugin_languages: yes/, /Asia\/Shanghai/, /cancel-in-progress: false/, /HAS_METRICS_TOKEN/]) {
    assert.match(workflow, pattern);
  }
  assert.doesNotMatch(workflow, /pull_request_target:|metrics-left:\s*\n\s*runs-on:|github_pat_|ghp_[A-Za-z0-9]+/);
});

test('素材来源记录包含授权状态和内容哈希', () => {
  const manifest = read('assets/manifest.json');
  assert.ok(manifest, '缺少素材来源记录');
  const assets = JSON.parse(manifest).assets;
  assert.ok(assets.length >= 3);
  for (const asset of assets) {
    for (const field of ['path', 'kind', 'channel', 'size', 'license', 'createdAt', 'contentHash']) {
      assert.ok(asset[field] !== undefined && asset[field] !== '', `缺少素材字段 ${field}`);
    }
    assert.match(asset.contentHash, /^sha256:[a-f0-9]{64}$/);
  }
});

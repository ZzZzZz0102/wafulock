import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mdPath = path.join(root, '..', '.cursor', 'Invisible lock-ODM-development-guide.md');
const templatePath = path.join(root, 'resource', 'b2b-smart-lock-oem-whitepaper.html');
const outPath = path.join(root, 'resource', 'invisible-lock-odm-development-guide.html');

const md = fs.readFileSync(mdPath, 'utf8');
const lines = md.split(/\r?\n/);

function linkify(text) {
  return text.replace(/\[([^\]]+)\]\((\.\/[^)]+)\)/g, '<a href="$2">$1</a>');
}

function figure(src, alt, caption) {
  const ext = src.endsWith('.png') ? 'png' : 'webp';
  return `<figure class="wafu-image-box">
            <img src="${src}" alt="${alt}" class="wafu-image" loading="lazy" decoding="async" width="1200" height="675">
            <figcaption class="wafu-image-caption">${caption}</figcaption>
          </figure>`;
}

const h2Ids = {
  '执行摘要': 'executive-summary',
  '引言：破解ODM依赖症的系统重构': 'introduction',
  '第一部分：需求定义与硬件架构的系统化思维': 'part-1',
  '第二部分：PCB布局与固件架构的双轮驱动': 'part-2',
  '第三部分：可靠性验证的量化指标体系': 'part-3',
  '第四部分：品牌方与ODM伙伴的协同进化': 'part-4',
  '总结：系统化ODM的价值闭环与投资回报': 'summary',
};

let html = [];
let skip = false;
let inAppendixList = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  if (line.startsWith('# ')) continue;
  if (line === '## SEO') break;
  if (line.startsWith('详见附录')) {
    html.push('<p>详见附录：战略工具与决策模型</p>');
    continue;
  }
  if (line.startsWith('## ')) {
    inAppendixList = false;
    const title = line.slice(3);
    if (title.startsWith('附录')) {
      html.push(`<h2 class="wafu-heading-2" id="appendix">${title}</h2>`);
      continue;
    }
    const id = h2Ids[title] || '';
    html.push(`<h2 class="wafu-heading-2"${id ? ` id="${id}"` : ''}>${title}</h2>`);
    if (title === '执行摘要') {
      // TOC after first section content - we'll inject TOC before introduction
    }
    continue;
  }
  if (line.startsWith('### ')) {
    inAppendixList = false;
    const title = line.slice(4);
    let id = '';
    if (title.startsWith('4.2')) id = ' id="section-4-2"';
    html.push(`<h3 class="wafu-heading-3"${id}>${title}</h3>`);
    continue;
  }
  if (line.startsWith('注：以下战略工具图')) {
    html.push(`<p>${linkify(line)}</p>`);
    inAppendixList = true;
    continue;
  }
  if (inAppendixList && line.startsWith('- **')) {
    continue; // skip list, figures below
  }
  if (line.startsWith('- **title**') || line.startsWith('- **description**') || line.startsWith('- **keywords**')) continue;

  html.push(`<p>${linkify(line)}</p>`);

  // Insert images after specific sections
  const lastH3 = [...html].reverse().find((h) => h.includes('wafu-heading-3'));
  const lastH2 = [...html].reverse().find((h) => h.includes('wafu-heading-2'));

  if (lastH3 && lastH3.includes('1.3 前瞻性设计') && !html.some((h) => h.includes('b2b-modular-lock-exploded'))) {
    html.push(figure('../images/webp/articles/b2b-modular-lock-exploded.webp', '模块化锁体爆炸示意——硬件预留与前瞻设计', '图：模块化锁体结构示意（前瞻设计预留）'));
  }
  if (lastH3 && lastH3.includes('3.2 环境适应性') && !html.some((h) => h.includes('b2b-ip67-salt-spray'))) {
    html.push(figure('../images/webp/articles/b2b-ip67-salt-spray-test.webp', '环境可靠性测试示意——盐雾与温湿度冲击', '图：环境适应性测试示意'));
  }
  if (lastH3 && lastH3.includes('4.2 全球化市场') && !html.some((h) => h.includes('odm-overseas-certification-gradient'))) {
    html.push(figure('../images/webp/articles/odm-overseas-certification-gradient.png', '出海认证梯度与成本对比——东南亚、澳新、北美欧洲三梯队', '图3：出海认证梯度与成本对比图'));
  }
}

// Appendix figures
html.push(figure('../images/webp/articles/odm-white-label-vs-system-rebuild-compare.png', '外观贴牌与系统重构八维对比表', '表1：外观贴牌与系统重构的维度对比'));
html.push(figure('../images/webp/articles/odm-system-lifecycle-flowchart.png', '系统化ODM开发全生命周期12个关键节点流程图', '图1：系统化ODM开发全生命周期流程图'));
html.push(figure('../images/webp/articles/odm-roi-investment-model.png', '投资回报ROI模型——前期投入、运营成本与技术红利三阶段曲线', '图2：投资回报（ROI）模型示意图'));
html.push(figure('../images/webp/articles/odm-compute-power-consumption-tradeoff.png', '算力与待机功耗权衡对比表', '表2：算力-功耗权衡对比表'));

// ROI before summary if not already
const summaryIdx = html.findIndex((h) => h.includes('id="summary"'));
if (summaryIdx > 0 && !html.slice(0, summaryIdx).some((h) => h.includes('odm-roi-investment-model'))) {
  html.splice(summaryIdx, 0, figure('../images/webp/articles/odm-roi-investment-model.png', '投资回报ROI模型示意图', '图2：投资回报（ROI）模型示意图'));
}

const toc = `<nav class="wafu-toc" aria-label="目录">
            <h2 class="wafu-heading-2">目录</h2>
            <ol class="wafu-list wafu-ordered-list">
              <li class="wafu-list-item"><a href="#executive-summary">执行摘要</a></li>
              <li class="wafu-list-item"><a href="#introduction">引言：破解ODM依赖症的系统重构</a></li>
              <li class="wafu-list-item"><a href="#part-1">第一部分：需求定义与硬件架构</a></li>
              <li class="wafu-list-item"><a href="#part-2">第二部分：PCB布局与固件架构</a></li>
              <li class="wafu-list-item"><a href="#part-3">第三部分：可靠性验证</a></li>
              <li class="wafu-list-item"><a href="#part-4">第四部分：品牌方与ODM协同进化</a></li>
              <li class="wafu-list-item"><a href="#summary">总结与投资回报</a></li>
              <li class="wafu-list-item"><a href="#appendix">附录：战略工具与决策模型</a></li>
            </ol>
          </nav>`;

const introIdx = html.findIndex((h) => h.includes('id="introduction"'));
if (introIdx > 0) html.splice(introIdx, 0, toc);

const editorNote = `<p class="wafu-editor-note">本文由华府智能技术中心整理，面向品牌方、OEM/ODM 采购团队与系统集成商。WAFU 智能锁成立于 2013 年，专注 B2B 智能锁解决方案，通过 ISO 9001:2015 质量管理体系认证，CE/FCC/RoHS 全球合规。转载引用请注明来源。</p>`;

const bodyInner = editorNote + '\n' + html.join('\n');

const cta = `<div class="wafu-tech-summary">
                        <h3 class="wafu-summary-title">下一步行动</h3>
                        <p><strong>准备推进 ODM 系统重构？</strong> <a href="../contact">联系 WAFU B2B 项目团队</a>，获取联合实验室合作方案、认证前置评估与样品报价。亦可参阅 <a href="./b2b-smart-lock-oem-whitepaper">OEM/ODM 采购白皮书</a> 与 <a href="./smart-lock-factory-audit-guide">智能锁验厂指南</a>。</p>
                      </div>
                      <figure class="wafu-image-box">
                        <img src="../images/webp/019/001.webp" alt="WF-019 隐形遥控锁产品实拍" class="wafu-image" loading="lazy" decoding="async" width="1200" height="675">
                        <figcaption class="wafu-image-caption">WF-019 隐形遥控锁——B2B ODM 定制参考平台</figcaption>
                      </figure>`;

const appendixIdx = html.findIndex((h) => h.includes('id="appendix"'));
// CTA before appendix in final body
let bodyParts = editorNote + '\n' + html.join('\n');
if (appendixIdx >= 0) {
  const before = html.slice(0, appendixIdx).join('\n');
  const after = html.slice(appendixIdx).join('\n');
  bodyParts = editorNote + '\n' + before + '\n' + cta + '\n' + after;
} else {
  bodyParts += '\n' + cta;
}

const slug = 'invisible-lock-odm-development-guide';
const title = '隐形锁ODM系统重构指南 | 华府智能 WAFU';
const desc = '从外观贴牌到系统级工程重构：联合实验室、认证前置与数据闭环，帮助品牌方降低全生命周期成本、提升出海竞争力。';
const keywords = '隐形锁ODM, 系统重构, 智能锁贴牌, 联合实验室, 出海认证, 低功耗设计, EMC设计, 可靠性验证, OEM合作, 华府智能';
const date = '2026-07-15';
const canonical = `https://wafulock.cn/resource/${slug}`;
const ogTitleEnc = encodeURIComponent(title);
const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(canonical)}&title=${ogTitleEnc}`;

let template = fs.readFileSync(templatePath, 'utf8');

// Replace head SEO
template = template
  .replace(/<title>[^<]+<\/title>/, `<title>${title}</title>`)
  .replace(/content="智能锁OEM白皮书[^"]*"/g, (m, i) => i === 0 ? `content="${keywords}"` : m)
  .replace(/<meta name="keywords" content="[^"]+"/, `<meta name="keywords" content="${keywords}"`)
  .replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="${desc}"`)
  .replace(/b2b-smart-lock-oem-whitepaper/g, slug)
  .replace(/2026-06-15/g, date)
  .replace(/"articleSection":"技术文章"/, '"articleSection":"B2B 采购与技术"')
  .replace(/"keywords":\["B2B smart lock"[^\]]+\]/, `"keywords":["隐形锁ODM","系统重构","联合实验室","出海认证","可靠性验证"]`)
  .replace(/"headline":"[^"]+"/, `"headline":"${title}"`)
  .replace(/"description":"面向 B2B[^"]+"/, `"description":"${desc}"`);

template = template.replace(
  /<span class="breadcrumb-current"[^>]*>[^<]+<\/span>/,
  '<span class="breadcrumb-current" aria-current="page">隐形锁ODM系统重构指南</span>'
);

const articleBlock = `                <header class="wafu-article-header">
                    <h1 class="wafu-article-title">隐形锁ODM定制化：从外观贴牌到系统级工程重构</h1>
                    <div class="wafu-article-meta">
                        <time datetime="${date}">2026年7月15日</time>
                        <span class="wafu-article-author">华府智能技术中心</span>
                        <span class="wafu-article-tags">
                            <em class="wafu-tag">隐形锁 ODM</em>
                            <em class="wafu-tag">系统重构</em>
                            <em class="wafu-tag">出海认证</em>
                        </span>
                    </div>
                </header>

                <div class="wafu-article-body">
${bodyParts}
                </div>`;

template = template.replace(
  /<header class="wafu-article-header">[\s\S]*?<\/div>\s*<\/header>\s*<div class="wafu-article-body">[\s\S]*?<\/div>\s*<\/div>\s*<footer class="wafu-article-footer">/,
  articleBlock + '\n\n                <footer class="wafu-article-footer">'
);

// Share section
template = template.replace(
  /href="https:\/\/service\.weibo\.com\/share\/share\.php\?url=[^"]+"/,
  `href="${weiboUrl}"`
);

// Tags
template = template.replace(
  /<nav class="wafu-tag-list">[\s\S]*?<\/nav>/,
  `<nav class="wafu-tag-list">
                            <span class="wafu-tag-item">隐形锁 ODM</span>
                            <span class="wafu-tag-item">系统重构</span>
                            <span class="wafu-tag-item">出海认证</span>
                            <span class="wafu-tag-item">联合实验室</span>
                            <span class="wafu-tag-item">低功耗</span>
                            <span class="wafu-tag-item">可靠性验证</span>
                        </nav>`
);

// prev/next
template = template.replace(
  /<nav class="wafu-article-nav">[\s\S]*?<\/nav>/,
  `<nav class="wafu-article-nav">
                        <a class="wafu-nav-prev" href="./invisible-supply-chain"><span class="wafu-nav-arrow">❮</span><div class="wafu-nav-content"><span class="wafu-nav-label">上一篇</span><span class="wafu-nav-text">隐形锁供应链指南</span></div></a>
                        <a class="wafu-nav-next" href="./b2b-smart-lock-oem-whitepaper"><div class="wafu-nav-content"><span class="wafu-nav-text">白皮书：隐蔽式智能锁B2B采购｜OEM/ODM制造合作</span><span class="wafu-nav-label">下一篇</span></div><span class="wafu-nav-arrow">❯</span></a>
                    </nav>`
);

// topic cluster - procurement series
template = template.replace(
  /<section class="wafu-topic-cluster wafu-topic-cluster--sidebar" aria-label="采购验厂系列">[\s\S]*?<\/section>/,
  `<section class="wafu-topic-cluster wafu-topic-cluster--sidebar" aria-label="采购验厂系列">
                    <h4 class="wafu-side-title">采购验厂系列</h4>
                    <nav aria-label="采购验厂系列">
                        <ul class="wafu-topic-cluster-list wafu-topic-cluster-list--sidebar">
                            <li class="wafu-topic-cluster-item is-current" aria-current="page">
                                <span class="wafu-topic-cluster-role">ODM</span>
                                <span class="wafu-topic-cluster-title">系统重构指南</span>
                            </li>
                            <li class="wafu-topic-cluster-item">
                                <span class="wafu-topic-cluster-role">验厂</span>
                                <a href="./smart-lock-factory-audit-guide" class="wafu-topic-cluster-link">智能锁验厂指南</a>
                            </li>
                            <li class="wafu-topic-cluster-item">
                                <span class="wafu-topic-cluster-role">白皮书</span>
                                <a href="./b2b-smart-lock-oem-whitepaper" class="wafu-topic-cluster-link">OEM/ODM 采购白皮书</a>
                            </li>
                            <li class="wafu-topic-cluster-item">
                                <span class="wafu-topic-cluster-role">供应链</span>
                                <a href="./invisible-supply-chain" class="wafu-topic-cluster-link">隐形锁供应链指南</a>
                            </li>
                            <li class="wafu-topic-cluster-item">
                                <span class="wafu-topic-cluster-role">品控</span>
                                <a href="./technology-seven" class="wafu-topic-cluster-link">OEM/ODM 全流程品控</a>
                            </li>
                        </ul>
                    </nav>
                </section>`
);

// Remove second topic cluster (B2B compatibility) - or keep? Plan says only procurement cluster. I'll remove the compatibility cluster to avoid confusion.
template = template.replace(
  /<section class="wafu-topic-cluster wafu-topic-cluster--sidebar" aria-label="B2B 兼容性系列">[\s\S]*?<\/section>\s*/,
  ''
);

// Related articles
template = template.replace(
  /<ul class="wafu-related-list">[\s\S]*?<\/ul>/,
  `<ul class="wafu-related-list">
                        <li class="wafu-related-item">
                            <a class="wafu-related-link" href="./smart-lock-factory-audit-guide">采购智能锁千万别只比价格：外贸买家技术评估指南</a>
                            <time class="wafu-related-date">2026年7月11日</time>
                        </li>
                        <li class="wafu-related-item">
                            <a class="wafu-related-link" href="./b2b-smart-lock-oem-whitepaper">白皮书：隐蔽式智能锁B2B采购｜OEM/ODM制造合作</a>
                            <time class="wafu-related-date">2026年6月15日</time>
                        </li>
                        <li class="wafu-related-item">
                            <a class="wafu-related-link" href="./invisible-supply-chain">隐形锁供应链指南</a>
                            <time class="wafu-related-date">2026年6月20日</time>
                        </li>
                        <li class="wafu-related-item">
                            <a class="wafu-related-link" href="./technology-seven">OEM/ODM 全流程品控</a>
                            <time class="wafu-related-date">2025年12月8日</time>
                        </li>
                        <li class="wafu-related-item">
                            <a class="wafu-related-link" href="./technology-twenty">如何选择隐形锁制造商</a>
                            <time class="wafu-related-date">2026年4月15日</time>
                        </li>
                    </ul>`
);

fs.writeFileSync(outPath, template, 'utf8');
console.log('Written:', outPath);

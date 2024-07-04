document.addEventListener('DOMContentLoaded', () => {
  const { markmap } = window;
  const options = {};
  const transformer = new markmap.Transformer();
  const svg = document.querySelector(".markmap > svg");
  const mm = markmap.Markmap.create(svg, options);
  const updateThreshold = 25; // 默认字长变化阈值
  const codeUpdateThreshold = 100; // 处于代码块中时更新字符数量触发渲染的阈值
  let lastContent = '';
  let contentLength = 0;
  let inCodeBlock = false;  // 标记是否处于代码块内
  let lastUpdateTime = 0;   // 上次更新时间
  const updateInterval = 3000; // 更新间隔（毫秒）

  function removeBackticks(markdown_content) {
    if (markdown_content.startsWith('```')) {
      markdown_content = markdown_content.split('\n').slice(1).join('\n');
    }
    if (markdown_content.startsWith('```') && markdown_content.endsWith('```')) {
      markdown_content = markdown_content.split('\n').slice(1, -1).join('\n');
    }
    return markdown_content;
  }

  function updateCodeBlockStatus(markdown_content) {
    markdown_content = removeBackticks(markdown_content);
    const lines = markdown_content.split('\n');
    let localInCodeBlock = false;
    for (let line of lines) {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
      }
      if (inCodeBlock) {
        localInCodeBlock = true;
      }
    }
    inCodeBlock = localInCodeBlock;
  }

  function render(markdown_content) {
    markdown_content = removeBackticks(markdown_content);
    const { root } = transformer.transform(markdown_content);
    mm.setData(root);
    mm.fit();
  }

  chrome.storage.local.get('mindmapContent', (data) => {
    const content = data.mindmapContent || '';
    document.getElementById('mindmap-content').textContent = content;
    lastContent = content;
    contentLength = content.length;
    updateCodeBlockStatus(content); // 初始化代码块状态
    render(content);
    document.querySelector('.loading').style.display = 'none';
    lastUpdateTime = Date.now(); // 初始化最后更新时间
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateContent") {
      const newContent = message.content;
      document.getElementById('mindmap-content').textContent = newContent;

      updateCodeBlockStatus(newContent); // 更新代码块状态

      let charUpdateThreshold = inCodeBlock ? codeUpdateThreshold : updateThreshold;

      const currentTime = Date.now();
      if (Math.abs(newContent.length - contentLength) >= charUpdateThreshold || (currentTime - lastUpdateTime) > updateInterval) {
        render(newContent);
        lastContent = newContent;
        contentLength = newContent.length;
        lastUpdateTime = currentTime; // 更新最后更新时间
      }
      document.querySelector('.loading').style.display = 'none';
    }
  });
});

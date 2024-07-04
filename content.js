function extractArticleContent() {
  let article = document.querySelector('article');
  if (!article) {
    article = document.body;
  }
  return article.innerText;
}

function callLLM(content) {
  const apiKey = 'sk-xxx';  // Replace with your actual API key
  const apiUrl = 'https://api.deepseek.com/chat/completions';

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-coder',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `作为一名专业的文档编辑专家，您需要具备以下技能和完成以下任务：
        1、熟悉Markdown语法： 您应熟练掌握Markdown语言，能够高效地编写和格式化文档。
        2、深入理解参考文章： 在开始撰写之前，请仔细阅读并全面理解用户提供的参考版本文章。确保您对文章的主题、结构和关键信息有清晰的理解。
        3、撰写Markdown格式报告： 根据您的专业视角，撰写一份结构清晰、层次分明的Markdown格式文章报告。
        你写的报告应该满足以下要求：
        1、使用多级结构： 灵活使用markdown的多级标题和多级子节点来组织内容，确保文档结构美观且易于导航。
        2、学会取舍内容： 剔除与文章主题无关的多余文字、无效内容，忽略你认为对读者不太重要的信息内容，但要保留关键部分的细节，确保内容的清晰性、重要性。
        3、代码和示例的适当保留： 根据写作的需要，适当保留具体的代码片段或示例，以增强文章的实用性和可读性，如果其内容过长，也可以按需取舍细节。
        4、关键信息的突出： 确保报告中的关键信息和知识点被清晰地呈现，使读者能够快速抓住文章的核心内容。
        5、灵活处理节点格式：如果节点内容包含代码或数学公式、图片、链接等，你需要使用正确的语法格式将该节点范围包裹。
        6、思维大纲结构：你需要根据自己对参考文章所述内容的独特理解和思考，使用合适的节点标题名称，以生成清晰正确的思维树。
        7、正确理解参考文章：在你的输出报告中，避免错误混淆原文中的概念、关系和逻辑，确保严格正确表述原文观点。
        8、思维树形式：只使用节点形式表达内容，不要使用任何正文形态。
        9、忽略不必要的内容： 不要在报告中包含任何无关的、多余的、不重要的内容，确保报告内容清晰易读，特别是一些网页头部和尾部的文字。
        注意，直接给出输出的报告内容，不要在输出内容前后追加多余的话语。
        
        参考格式：
        # 一级标题
        
        ## 二级标题
        - 节点内容1
        
        - 节点内容2
        
        - 节点内容3
        
        ## 二级标题
        - 节点内容1
        
        - 节点内容2
          - 子节点内容1
        
          - 子节点内容2
        ...
        
        以下是用户给定的参考文章：
        :\n\n${content}\n\n以上是用户给定的参考文章。
        作为一名专业的文档编辑专家，您需要具备以下技能和完成以下任务：
        1、熟悉Markdown语法： 您应熟练掌握Markdown语言，能够高效地编写和格式化文档。
        2、深入理解参考文章： 在开始撰写之前，请仔细阅读并全面理解用户提供的参考版本文章。确保您对文章的主题、结构和关键信息有清晰的理解。
        3、撰写Markdown格式报告： 根据您的专业视角，撰写一份结构清晰、层次分明的Markdown格式文章报告。
        你写的报告应该满足以下要求：
        1、使用多级结构： 灵活使用markdown的多级标题和多级子节点来组织内容，确保文档结构美观且易于导航。
        2、学会取舍内容： 剔除与文章主题无关的多余文字、无效内容，忽略你认为对读者不太重要的信息内容，但要保留关键部分的细节，确保内容的清晰性、重要性。
        3、代码和示例的适当保留： 根据写作的需要，适当保留具体的代码片段或示例，以增强文章的实用性和可读性，如果其内容过长，也可以按需取舍细节。
        4、关键信息的突出： 确保报告中的关键信息和知识点被清晰地呈现，使读者能够快速抓住文章的核心内容。
        5、灵活处理节点格式：如果节点内容包含代码或数学公式、图片、链接等，你需要使用正确的语法格式将该节点范围包裹。
        6、思维大纲结构：你需要根据自己对参考文章所述内容的独特理解和思考，使用合适的节点标题名称，以生成清晰正确的思维树。
        7、正确理解参考文章：在你的输出报告中，避免错误混淆原文中的概念、关系和逻辑，确保严格正确表述原文观点。
        8、思维树形式：只使用节点形式表达内容，不要使用任何正文形态。
        注意，直接给出输出的报告内容，不要在输出内容前后追加多余的话语。
        ` }
      ],
      stream: true
    })
  }).then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let text = '';

    function readStream() {
      reader.read().then(({ done, value }) => {
        if (done) {
          chrome.runtime.sendMessage({ action: "updateMindmap", content: text });
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.slice(6);  // Remove 'data: ' prefix
            if (jsonString !== '[DONE]') {
              try {
                const json = JSON.parse(jsonString);
                const deltaContent = json.choices[0].delta.content;
                text += deltaContent;
                chrome.runtime.sendMessage({ action: "updateMindmap", content: text });
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }

        readStream();
      });
    }

    readStream();
  }).catch(err => {
    console.error('Error calling DeepSeek API:', err);
  });
}

const content = extractArticleContent();
chrome.runtime.sendMessage({ action: "openMindmap" });
callLLM(content);

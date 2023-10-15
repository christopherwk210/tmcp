const remote = require('@electron/remote');
const fsp = remote.require('fs/promises');
const path = remote.require('path');

const jsonPath = path.join(remote.app.getPath('userData'), 'gm-docs-index.json');

const useFunctionsOnly = tmcp.addSetting({
  type: 'boolean',
  text: 'Only show functions',
  help: 'Hide all other results from the GM documentation',
  value: false
});

let docs = { keys: [] };

const existingData = await fsp.readFile(jsonPath, { encoding: 'utf-8' }).catch(() => null);
if (existingData) docs = JSON.parse(existingData);

const fetchedDocs = await new Promise(resolve => {
  fetch('https://raw.githubusercontent.com/christopherwk210/gm-bot/master/static/docs-index.json')
  .then(res => res.json())
  .then(data => resolve(data))
  .catch(() => {
    console.error('GM Docs: failed to fetch documentation');
    resolve({ keys: [] });
  });
});

if (fetchedDocs.keys.length) {
  docs = fetchedDocs;
  await fsp.writeFile(jsonPath, JSON.stringify(docs));
}

for (const key of docs.keys) {
  if (key.topics.length !== 1) continue;

  const topic = key.topics[0];
  const title = key.name === topic.name ? (topic.syntax || key.name) : `${key.name} - ${topic.name}`;
  const blurb = topic.blurb;
  const url = 'https://manual.yoyogames.com/' + topic.url;

  let displayContent = `#### ${title}\n`;
  if (blurb) displayContent += `${blurb}\n\n`;
  if (topic.args && topic.args.length) {
    displayContent += `| Argument | Description |\n`;
    displayContent += `| -------- | ----------- |\n`;
    for (const arg of topic.args) {
      displayContent += `| ${arg.argument} | ${arg.description} |\n`;
    }
    displayContent += `\n`;
  }

  tmcp.addItem({
    text: title,
    action: () => require('electron').shell.openExternal(url),
    display: { type: 'markdown', content: displayContent }
  });
}

tmcp.onResult(result => {
  if (useFunctionsOnly()) {
    return result.text.endsWith(')');
  } else {
    return true;
  }
});
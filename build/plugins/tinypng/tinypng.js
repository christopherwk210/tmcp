const apiKey = tmcp.addSetting({
  type: 'string',
  text: 'TinyPNG API Key',
  help: 'Required, get one from tinypng.com',
  value: ''
});

const remote = require('@electron/remote');
const fsp = remote.require('fs/promises');
const path = remote.require('path');
const tinify = remote.require(path.join(__dirname, 'node_modules', 'tinify'));

const htmlPath = path.join(__dirname, 'tinypng.html');
const htmlContents = await fsp.readFile(htmlPath, 'utf-8');

tmcp.addItem({
  text: 'TinyPNG',
  action: () => {},
  display: { type: 'html', content: htmlContents },
  keepOpen: true
});

window.tinyPngState = {
  queue: []
};

window.handleFiles = files => {
  tinify.key = apiKey();

  for (const file of files) {
    const filePath = file.path;
    addQueueItem(filePath);

    const source = tinify.fromFile(filePath);
    source.toFile(`${filePath}.tiny`, async (err, res) => {
      if (err) {
        const status = err.status || 0;

        if (status === 401 || status === 429) {
          return removeQueueItem(filePath, 'Error: Verify your API key and account limit.');
        } else if (status >= 400 && status <= 499) {
          return removeQueueItem(filePath, 'Error: Source image invalid.');
        } else if (status >= 500 && status <= 599) {
          return removeQueueItem(filePath, 'Error: Temporary issue with the Tinify API server.');
        } else {
          return removeQueueItem(filePath, 'An unknown error occurred.');
        }
      } else { 
        try {
          await remote.shell.trashItem(filePath);
          await fsp.rename(`${filePath}.tiny`, filePath);
        } catch (e) {
          return removeQueueItem(filePath, 'Done, but failed to delete original file.');
        }
      }

      removeQueueItem(filePath);
    });
  }
};

function createQueueItem(filePath) {
  const item = document.createElement('div');
  item.classList.add('tinypng-image');
  item.dataset.file = filePath;

  const status = document.createElement('span');
  status.innerText = 'Processing...';
  item.appendChild(status);

  const fileName = document.createElement('span');
  fileName.innerText = filePath;
  item.appendChild(fileName);

  item.addEventListener('click', () => {
    remote.shell.showItemInFolder(filePath);
  });

  return item;
}

function addQueueItem(filePath) {
  const list = document.getElementById('tinypng-images');
  const item = createQueueItem(filePath);
  if (list) list.appendChild(item);

  window.tinyPngState.queue.push({
    filePath,
    element: item
  });
}

function removeQueueItem(filePath, status = 'Done!') {
  const existingElement = window.tinyPngState.queue.find(f => f.filePath === filePath);
  if (existingElement && existingElement.element) {
    const statusSpan = existingElement.element.querySelector('span:first-child');
    statusSpan.innerText = status;
  }

  window.tinyPngState.queue = window.tinyPngState.queue.filter(f => f.filePath !== filePath);
}

tmcp.onDisplay(() => {
  const list = document.getElementById('tinypng-images');

  if (list) {
    window.tinyPngState.queue.forEach(item => {
      list.appendChild(item.element);
    });
  }
});
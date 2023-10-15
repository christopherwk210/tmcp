const remote = require('@electron/remote');
const fs = remote.require('fs');
const fsp = remote.require('fs/promises');
const path = remote.require('path');

const appDataPath = remote.app.getPath('appData');
const gmPath = path.join(appDataPath, 'GameMakerStudio2');

if (!fs.existsSync(gmPath)) {
  console.log('GM Recent Projects: Could not find GameMakerStudio2 folder in AppData!')
  return;
}

const recentsPaths = [];

const contents = await fsp.readdir(gmPath);
for (const n of contents) {
  const itemPath = path.join(gmPath, n);
  const itemStat = await fsp.stat(itemPath);
  if (itemStat.isDirectory()) {
    const recentsPath = path.join(itemPath, 'recent_projects');
    if (fs.existsSync(recentsPath)) {
      recentsPaths.push(recentsPath);
    }
  }
}

let recentProjectsData = [];

await loadRecents();

tmcp.onShow(() => loadRecents());
tmcp.onQuery((query, addItem) => {
  for (const recent of recentProjectsData) {
    if (recent.projectFile.toLowerCase().includes(query.toLowerCase())) {
      const buttonHandler = `require('@electron/remote').shell.showItemInFolder('${recent.projectPath.replace(/\\/g, '\\\\')}')`;

      addItem({
        text: recent.projectFile,
        action: () => require('electron').shell.openExternal(recent.projectPath),
        display: {
          type: 'html',
          content: `
          <h3 style="margin-top: 0">${recent.projectFile}</h3>
          <div class="path-box">${recent.projectPath}</div>
          <button onclick="${buttonHandler}">Open project folder</button>
          `
        }
      });
    }
  }
});

async function loadRecents() {
  const recents = [];
  
  for (const recentsPath of recentsPaths) {
    const contents = await fsp.readFile(recentsPath, 'utf8');
    const lines = contents.split('\n');
    for (const line of lines) {
      if (line.trim() !== '') {
        const projectPath = line.trim();
        const projectFile = path.basename(projectPath);
        if (!recents.find(r => r.projectPath === projectPath)) {
          recents.push({
            projectPath,
            projectFile
          });
        }
      }
    }
  }

  recentProjectsData = recents;
}
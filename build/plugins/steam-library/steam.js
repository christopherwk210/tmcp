const remote = require('@electron/remote');
const child_process = remote.require('child_process');
const fsp = remote.require('fs/promises');
const path = remote.require('path');
const regedit = remote.require(path.join(__dirname, 'node_modules', 'regedit')).promisified;

const htmlPath = path.join(__dirname, 'steam.html');
const htmlContents = await fsp.readFile(htmlPath, 'utf-8');

// These are the two registry paths that the Steam install path could be found at
const paths = [
  'HKLM\\SOFTWARE\\Valve\\Steam',
  'HKLM\\SOFTWARE\\Wow6432Node\\Valve\\Steam'
];

// Get the Steam install path from the registry
const regresults = await regedit.list(paths);

let steamInstallPath = '';
Object.keys(regresults).forEach((regPath) => {
  const regResult = regresults[regPath];
  if (!regResult.exists || !regResult.values || !regResult.values.InstallPath) return;

  steamInstallPath = regResult.values.InstallPath.value;
});

if (!steamInstallPath) {
  console.log('Steam Library: Steam not found!');
  return;
}

const libraryCachePath = path.join(steamInstallPath, 'appcache', 'librarycache');

// This file points to all the Steam library folders where games are installed
const libraryFoldersPath = path.join(steamInstallPath, 'config', 'libraryfolders.vdf');

let games = [];
games = await loadGames();

async function loadGames() {
  console.time('🎮 Steam Library: Loading games');

  // Extract the library paths from the libraryfolders.vdf file
  const libraryFolders = await fsp.readFile(libraryFoldersPath, 'utf8');
  
  const pathRegex = /"path"\s+"(.+)"/g;
  
  const libraryPaths = [];
  let match;
  while ((match = pathRegex.exec(libraryFolders)) !== null) {
    const libraryPath = match[1];
    libraryPaths.push(libraryPath);
  }

  const games = [];

  return new Promise(resolve => {
    let libraryPathsLoaded = 0;

    libraryPaths.forEach(async (libraryPath) => {
      const steamAppsPath = path.join(libraryPath, 'steamapps');
      const steamApps = await fsp.readdir(steamAppsPath);
  
      // Get all the .acf files in the steamapps folder
      const acfRegex = /appmanifest_\d+\.acf/;
      const acfFiles = steamApps.filter((file) => acfRegex.test(file));

      let acfFilesLoaded = 0;
      let acfFilesTotal = acfFiles.length;

      function markComplete() {
        acfFilesLoaded++;
        if (acfFilesLoaded >= acfFilesTotal) {
          libraryPathsLoaded++;
          if (libraryPathsLoaded === libraryPaths.length) {
            console.timeEnd('🎮 Steam Library: Loading games');
            resolve(games);
          }
        }
      }
  
      acfFiles.forEach(async (acfFile) => {
        const acfPath = path.join(steamAppsPath, acfFile);
        const acf = await fsp.readFile(acfPath, 'utf8');
  
        // Extract the appid and install path from the .acf file
        let name = /"name"\s+"(.+)"/.exec(acf);
  
        if (!name || !name[1]) return;
        if ([
          'Steamworks Common Redistributables',
          'SteamVR'
        ].includes(name[1])) {
          markComplete();
          return;
        }
        name = name[1];
  
        const appidMatch = /"appid"\s+"(\d+)"/.exec(acf);
        const installDirMatch = /"installdir"\s+"(.+)"/.exec(acf);
        const sizeMatch = /"SizeOnDisk"\s+"(.+)"/.exec(acf);
        const launcherPathMatch = /"LauncherPath"\s+"(.+)"/.exec(acf);
  
        if (!appidMatch || !installDirMatch || !launcherPathMatch || !sizeMatch) return;
  
        const appid = appidMatch[1];
        const installDir = installDirMatch[1];
        const fullPath = path.join(steamAppsPath, 'common', installDir);
        const launcherPath = launcherPathMatch[1];
        const size = sizeMatch[1];
  
        const iconPath = path.join(libraryCachePath, `${appid}_icon.jpg`);
        const heroPath = path.join(libraryCachePath, `${appid}_library_hero.jpg`);
        const logoPath = path.join(libraryCachePath, `${appid}_logo.png`);

        const iconExists = await fsp.access(iconPath).then(() => true).catch(() => false);
        const heroExists = await fsp.access(heroPath).then(() => true).catch(() => false);
        const logoExists = await fsp.access(logoPath).then(() => true).catch(() => false);
  
        // Add the game to the list
        const game = {
          name,
          appid,
          size,
          fullPath,
          iconPath: iconExists ? iconPath : null,
          heroPath: heroExists ? heroPath : null,
          logoPath: logoExists ? logoPath : null,
          launchCommand: `"${launcherPath}" steam://rungameid/${appid}`,
        };
  
        games.push(game);

        markComplete();
      });
    });
  });
}

tmcp.onQuery((query, addItem) => {
  for (const game of games) {
    if (game.name.toLowerCase().includes(query.toLowerCase())) {
      // convert size from bytes to gigs
      const size = Math.round(game.size / 1000000000 * 100) / 100;

      const templatedHtml = htmlContents
        .replace(/\$hero/g, game.heroPath.replace(/\\/g, '/'))
        .replace(/\$logo/g, game.logoPath.replace(/\\/g, '/'))
        .replace(/\$icon/g, game.iconPath.replace(/\\/g, '/'))
        .replace(/\$name/g, game.name)
        .replace(/\$size/g, size)
        .replace(/\$appid/g, game.appid)

      addItem({
        text: game.name,
        action: () => child_process.exec(game.launchCommand, { detached: true }),
        display: { type: 'html', content: templatedHtml },
        icon: game.iconPath
      });
    }
  }
});

tmcp.addSettingButton({
  text: 'Reload library',
  help: `If you've made changes to your Steam library, you'll need to click this to reload it.`,
  action: async () => {
    games = await loadGames();
  }
});

window.steamLaunchGame = gameName => {
  const game = games.find(game => game.name === gameName);
  if (!game) return;
  child_process.exec(game.launchCommand, { detached: true })
};

window.steamBrowse = gameName => {
  const game = games.find(game => game.name === gameName);
  if (!game) return;
  remote.shell.openPath(game.fullPath);
};
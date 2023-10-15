const fsp = require('fs/promises');
const path = require('path');

const buildFilesPath = path.join(__dirname, 'build');
const publishPath = path.join(__dirname, 'publish');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  afterAllArtifactBuild: async () => {
    const outDir = path.join(__dirname, 'bin');
  
    const winUnpacked = path.join(outDir, 'win-unpacked');
    const binary = path.join(path.join(__dirname, 'bin'), 'tmcp.exe');
    
    await fsp.rm(publishPath, { recursive: true, force: true });
    await fsp.mkdir(publishPath, { recursive: true });
    await fsp.cp(buildFilesPath, winUnpacked, { recursive: true });
    await fsp.cp(buildFilesPath, publishPath, { recursive: true });
    await fsp.copyFile(binary, path.join(`${publishPath}`, 'tmcp.exe'));
  },
  asar: true,
  appId: 'topheranselmo.tmcp',
  productName: `Topher's Modular Command Palette`,
  icon: 'media/tmcp.ico',
  directories: {
    output: 'bin'
  },
  files: [
    'package.json',
    {
      from: 'dist',
      to: './'
    },
    {
      from: 'dist_electron',
      to: 'dist_electron'
    }
  ],
  win: {
    artifactName: 'tmcp.${ext}',
    target: [
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    executableName: 'tmcp'
  },
  extraFiles: [
    {
      from: 'media',
      to: 'media'
    }
  ]
};

module.exports = config;
<img src="./media/tmcp_logo.svg" width="128" height="128" />

# Topher's Modular Command Palette

Topher's Modular Command Palette (TMCP) is a plugin-powered desktop command palette. It's basically a fancy search box that gives you instant results. The goal of this software is to provide a convenient and fast way to access information and tools, and to be extensible. The core application isn't useful on its own. All of the useful functionality is provided via plugins. Some included plugins:

- **Steam Library**: Search your installed games, launch them, see their install size, and browse their local files
- **TinyPNG**: Quickly and lossessly compress images on your computer
- **GM Docs**: Instant keyword search results from the GameMaker documentation
- **GM Recent Projects**: Search recent GameMaker projects, open them, and see their file locations

## Development

Requires Node >=16.7.0.

1. Clone the project
2. Run `npm install` in the project directory
3. Use `npm start` to run in development mode
4. Use `npm run build` to make a binary

The final executable will be built into the `./publish` directory, along with the included plugins and themes.
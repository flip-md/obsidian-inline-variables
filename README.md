# Obsidian Inline Variables

This is a plugin for [Obsidian](https://obsidian.md) that allows the setting, referring, and rendering of inline-variables in real-time:

![Obsidian Inline Variables demo](assets/inline-variables.gif?raw=true)

Obsidian Inline Variables follows a simple concept:

- variables are set via `Definitions`, which by default look like `{key:"value"}`, but the enclosing characters can be modified in the settings. On preview and export, `{key:"value"}` would be just displayed as `value`
- variables are referred to via `Placeholders`. Just type `{key}`, which the plugin will automatically expand to `{key:"value"}` (enclosing characters can be modified), and on preview and export would be rendered as `value`.

- variables can be used almost everywhere, including document links (at least in preview).
  Obsidian Inline Variables works with other plugins, such as Templater.

## Future plans

- [ ] Set and read variables from frontmatter
- [ ] Autosuggest placeholders
- [ ] Multiline support (lists)

## Manual Installation

- Download the latest `main.js` & `manifest.json` from releases.
- Create a new folder named `inline-variables` inside your `VaultFolder/.obsidian/plugins` directory
- Place downloaded files into the `inline-variables` folder
- Reload plugins and activate the `Inline Variables` plugin

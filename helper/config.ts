import VariablePlugin from "../main";

interface PluginSettings {
  [index: string]: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  startString: "{",
  endString: "}",
  valueEncapsulationString: '"',
  separatorDefinition: "::",
  separatorPlaceholder: ":",
};

export default class Config {
  private static instance: Config;
  private plugin: VariablePlugin;
  private settings: PluginSettings;

  private constructor() {}

  private async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.plugin.loadData()
    );
  }

  public async saveSettings() {
    await this.plugin.saveData(this.settings);
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }

    return Config.instance;
  }

  public initialize(plugin: VariablePlugin) {
    this.plugin = plugin;
    this.loadSettings();
  }

  public getSettings() {
    return this.settings;
  }
}

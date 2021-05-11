import VariablePlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import Config from "./config";
import Definition from "./variables/definition";
import NewPlaceholder from "./variables/newPlaceholder";
import Placeholder from "./variables/placeholder";

const INTERFACE_STRINGS = [
  {
    key: "startString",
    name: "Start String",
    desc: "Marks the start of a variable, cannot be empty",
  },
  {
    key: "endString",
    name: "End String",
    desc: "Marks the end of a variable, cannot be empty",
  },
  {
    key: "valueEncapsulationString",
    name: "Value encapsulation",
    desc: "Encapsulates the value a variable should hold, can be empty",
  },
  {
    key: "separatorDefinition",
    name: "Separator between key and value in a definition",
    desc:
      "Separates key and value when defining a variable, cannot be empty or the same as placeholder separator",
  },

  {
    key: "separatorPlaceholder",
    name: "Separator between key and value in a placeholder",
    desc:
      "Separates key and value when defining a placeholder, cannot be empty or the same as definition separator",
  },
];

export default class ConfigUI extends PluginSettingTab {
  plugin: VariablePlugin;
  config: Config;
  warning: HTMLElement;

  constructor(app: App, plugin: VariablePlugin, config: Config) {
    super(app, plugin);
    this.plugin = plugin;
    this.config = config;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Inline Variable settings" });

    INTERFACE_STRINGS.forEach((interfaceString) => {
      new Setting(containerEl)
        .setName(interfaceString.name)
        .setDesc(interfaceString.desc)
        .addText((text) =>
          text
            .setValue(this.config.getSettings()[interfaceString.key])
            .onChange(async (value) => {
              this.config.getSettings()[interfaceString.key] = value;
              await this.config.saveSettings();
              this.render(containerEl);
            })
        );
    });

    this.warning = containerEl.createEl("h2", {
      text: "",
    });
    this.warning.style.color = "red";
    this.warning.hidden = true;

    containerEl.createEl("h2", { text: "Preview" });

    this.render(containerEl, false);
  }
  render(containerEl: HTMLElement, update: boolean = true): void {
    let config = Config.getInstance().getSettings();
    console.log(config);
    let warningText = "";
    if (config.startString == "") {
      warningText += "Start string cannot be empty. ";
    }
    if (config.endString == "") {
      warningText += "End string cannot be empty. ";
    }
    if (config.separatorDefinition == "") {
      warningText += "Definition separator cannot be empty. ";
    }
    if (config.separatorPlaceholder == "") {
      warningText += "Placeholder definition cannot be empty. ";
    }
    if (config.separatorPlaceholder == config.separatorDefinition) {
      warningText +=
        "Placeholder definition cannot be the same as the definition separator. ";
    }
    this.warning.textContent = warningText;
    this.warning.hidden = warningText.length == 0;
    if (update) {
      containerEl.childNodes[containerEl.childNodes.length - 1].remove();
      containerEl.childNodes[containerEl.childNodes.length - 1].remove();
      containerEl.childNodes[containerEl.childNodes.length - 1].remove();
    }

    new Setting(containerEl)
      .setName("Definition")
      .setDesc(
        "Will be rendered to 'value' on preview or export, defines placeholder autocompletion"
      )
      .addText((text) =>
        text.setValue(new Definition("key").createTemplate("value"))
      )
      .setDisabled(true);

    new Setting(containerEl)
      .setName("New Placeholder")
      .setDesc("Will be autocompleted to Placeholder with value")
      .addText((text) =>
        text.setValue(new NewPlaceholder("key").createTemplate())
      )
      .setDisabled(true);

    new Setting(containerEl)
      .setName("Placeholder with value")
      .setDesc("Will be rendered to 'value' on preview or export")
      .addText((text) =>
        text.setValue(new Placeholder("key").createTemplate("value"))
      )
      .setDisabled(true);
  }
}

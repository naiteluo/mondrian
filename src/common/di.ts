import { IMondrianPlugin } from "../plugin/plugin";

export interface IModuleConfig {
  name: string;
  plugins: {
    [key: string]: IMondrianPlugin;
  };
}

interface Constructable {
  new (...args: any[]): any;
}

interface PluginConstructor {
  new (...args: any[]): IMondrianPlugin;
}

interface IModule {
  pluginConstructors: {
    [key: string]: PluginConstructor;
  };
}

type ModuleName = string;
type ConstructorName = string;

class ModulePluginPool {}

export function Module(
  config: IModuleConfig
): <T extends Constructable>(target: T) => T {
  return function (target) {
    return class extends target implements IModule {
      constructor(...args: any[]) {
        super(...args);
      }
      pluginConstructors: {};
    };
  };
}

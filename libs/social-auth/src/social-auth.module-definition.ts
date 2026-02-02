import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ConfigOptions } from './config/config.options';
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigOptions>().build();

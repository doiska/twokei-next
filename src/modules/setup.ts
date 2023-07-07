// Unless explicitly defined, set NODE_ENV as development:
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from '@sapphire/framework';

import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import { inspect } from 'util';
import { join } from 'path';
import * as colorette from 'colorette';
import { setup, type ArrayString } from '@skyra/env-utilities';

process.env.NODE_ENV ??= 'development';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

const rootDir = join(__dirname, '..', '..');
const srcDir = join(rootDir, 'src');

// Read env var
setup({ path: join(srcDir, '.env') });

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

declare module '@skyra/env-utilities' {
  interface Env {
    OWNERS: ArrayString;
  }
}

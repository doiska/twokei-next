// Unless explicitly defined, set NODE_ENV as development:
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';

import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from '@sapphire/framework';

import { type ArrayString, setup } from '@skyra/env-utilities';

import { join } from 'path';
import { inspect } from 'util';

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

declare module '@skyra/env-utilities' {
  interface Env {
    OWNERS: ArrayString
  }
}

/* eslint no-console: 0 */
require('dotenv').config({
  path: '.env.development',
});

const chalk = require('chalk');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('close', () => {
  console.log('\nBye bye!');
  process.exit(1);
});

// Ensure necessary environment variables exist
const requireEnvVars = (vars) => {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length) {
    console.error(chalk.red(`Missing environment variables: ${missing.join(', ')}`));
    process.exit(1);
  }
};

requireEnvVars(['CONTENTFUL_SPACE_ID', 'CONTENTFUL_MANAGEMENT_TOKEN']);

rl.question('Enter export directory: ', (exportDir) => {
  console.log(chalk.green('\nExporting contentful json to:', exportDir));
  execSync(`contentful space export --space-id ${process.env.CONTENTFUL_SPACE_ID} --management-token ${process.env.CONTENTFUL_MANAGEMENT_TOKEN} --export-dir ${exportDir} --skip-roles true --skip-webhooks true`);

  console.log(chalk.green('Done!'));
  process.exit(0);
});

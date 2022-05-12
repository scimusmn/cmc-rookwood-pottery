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

rl.question('Enter path to contentful json: ', (jsonPath) => {
  console.log(`\nThis will populate Space ${chalk.green(process.env.CONTENTFUL_SPACE_ID)} with content from ${chalk.green(jsonPath)}. Continue?`);
  rl.question('[Y/N]? ', (answerYesNo) => {
    if (answerYesNo.toLowerCase().includes('y')) {
      console.log(chalk.green('\nPopulating space...'));
      execSync(`contentful space import --content-file ${jsonPath} --space-id ${process.env.CONTENTFUL_SPACE_ID} --management-token ${process.env.CONTENTFUL_MANAGEMENT_TOKEN}`);

      console.log(chalk.green('Done!'));
      process.exit(0);
    } else {
      console.log('\nOkay, please start over.');
      process.exit(1);
    }
  });
});

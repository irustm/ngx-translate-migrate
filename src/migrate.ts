import * as minimist from "minimist";
import * as chalk from "chalk";
import { existsSync, writeFile, mkdirSync } from "fs";
import { ProjectSymbols } from "ngast";

import { resourceResolver } from "./utils/resource";
import * as findPipes from './findpipes';
import { CliConfig } from './models/models';

const error = message => {
  console.error(chalk.default.bgRed.white(message));
};
const info = (message, count1?, count2?) => {
  console.log(
    chalk.default.green(message) +
      ` ${count1 ? chalk.default.blue(count1) : ""}` +
      ` ${count2 ? "/ " + chalk.default.yellowBright(count2) : ""}`
  );
};

export function migrate() {
  const config = getCliConfig();
  console.log("Parsing...");
  let parseError: any = null;
  const projectSymbols = new ProjectSymbols(
    config.projectPath,
    resourceResolver,
    e => (parseError = e)
  );
  let allDirectives = projectSymbols.getDirectives();
  if (!parseError) {
    allDirectives = allDirectives.filter(
      el => el.symbol.filePath.indexOf("node_modules") === -1
    );
    findPipes.findPipes(allDirectives, config);
  } else {
    error(parseError);
  }
}


function validateArgs(args: any, attrs: string[], error: Function) {
  attrs.forEach(attr => {
    if (!args[attr] || args[attr].trim().length === 0) {
      error(`Connot find --${attr} argument`);
      process.exit(1);
    }
  });
}

function getCliConfig(): CliConfig {
  const args: any = minimist(process.argv.slice(2));
  validateArgs(args, ['f'], error);
  let projectPath = args.p;
  const filePath = args.f;

  if (!projectPath) {
    projectPath = "./tsconfig.json";
  }
  if (!existsSync(projectPath)) {
    error(`Cannot find tsconfig at ${projectPath}`);
    process.exit(1);
  }
  if (!existsSync(filePath)) {
    error(`Cannot find filePath at ${filePath}.`);
    process.exit(1);
  }
  return {
    projectPath,
    filePath
  }
}

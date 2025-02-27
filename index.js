#!/usr/bin/env node

import { Interpreter } from "./interpreter.js";
import { runCode, defaultCode } from "./runner.js";
import fs from "node:fs";
import chalk from "chalk";
import { Command } from "commander";

const program = new Command();

program
  .name("mon-langage")
  .description("Interpréteur pour le langage personnalisé")
  .version("1.0.0")
  .argument("[fichier]", "Fichier source à exécuter")
  .option("-i, --interactive", "Mode interactif (REPL)")
  .parse(process.argv);

const options = program.opts();
const fichier = program.args[0];

if (fichier) {
  console.log(chalk.blue(`Exécution du fichier: ${fichier}`));

  try {
    const code = fs.readFileSync(fichier, "utf8");
    runCode(code);
  } catch (error) {
    console.error(
      chalk.red(
        `Erreur lors de la lecture du fichier ${fichier}: ${error.message}`,
      ),
    );
    process.exit(1);
  }
} else if (options.interactive) {
  console.log(chalk.blue("Mode interactif - Appuyez sur Ctrl+C pour quitter"));
  console.log(chalk.blue("Commandes disponibles:"));
  console.log(chalk.yellow("  executer - Exécute le code saisi"));
  console.log(chalk.yellow("  effacer  - Efface le code en mémoire"));
  console.log(chalk.yellow("  afficher - Affiche le code en mémoire"));
  console.log(chalk.blue("Tapez votre code ligne par ligne:"));

  let code = "";
  const interpreter = new Interpreter();

  process.stdin.on("data", (data) => {
    const ligne = data.toString().trim();

    if (ligne === "executer") {
      console.log(chalk.gray("-----------------------------------"));
      try {
        const output = interpreter.run(code);
        for (const line of output) {
          console.log(chalk.green(line));
        }
        console.log(chalk.gray("-----------------------------------"));
        console.log(chalk.blue("Exécution terminée"));
      } catch (error) {
        console.log(chalk.gray("-----------------------------------"));
        console.log(chalk.red(`Erreur: ${error.message}`));
      }
      code = "";
    } else if (ligne === "effacer") {
      code = "";
      console.log(chalk.yellow("Code effacé"));
    } else if (ligne === "afficher") {
      console.log(chalk.gray("-----------------------------------"));
      console.log(chalk.yellow("Code actuel:"));
      console.log(code);
      console.log(chalk.gray("-----------------------------------"));
    } else {
      code += ligne + "\n";
    }
  });
} else {
  console.log(chalk.blue("Exécution du code par défaut:"));
  runCode(defaultCode);
}

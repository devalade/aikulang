#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import chalk from 'chalk';
import { execute } from './index.js';

const program = new Command();

program
    .name('aiku')
    .description('Interpréteur pour le langage Aiku')
    .version('1.0.0');

program
    .argument('[file]', 'Fichier .aiku à exécuter')
    .option('-r, --repl', 'Démarrer le mode REPL')
    .action(async (file, options) => {
        if (file) {
            try {
                const code = readFileSync(file, 'utf-8');
                execute(code);
            } catch (error) {
                console.error(chalk.red(`Erreur lors de la lecture du fichier: ${error.message}`));
                process.exit(1);
            }
        } else if (options.repl) {
            console.log(chalk.blue('Bienvenue dans le REPL Aiku! (Tapez "quitter" pour sortir)'));
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: chalk.green('aiku> ')
            });

            rl.prompt();

            rl.on('line', (line) => {
                const input = line.trim();

                if (input.toLowerCase() === 'quitter') {
                    rl.close();
                    return;
                }

                try {
                    const result = execute(input);
                    if (result !== undefined) {
                        console.log(result);
                    }
                } catch (error) {
                    console.error(chalk.red(`Erreur: ${error.message}`));
                }

                rl.prompt();
            });

            rl.on('close', () => {
                console.log(chalk.blue('\nAu revoir!'));
                process.exit(0);
            });
        } else {
            program.help();
        }
    });

program.parse();
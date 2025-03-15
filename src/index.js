import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';

export function execute(code) {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter();
    return interpreter.interpret(ast);
}

// Example usage:
if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('executes a simple program', () => {
        const code = `
            variable x = 5
            variable y = 3
            variable resultat = x + y
            afficher(resultat)
        `;

        const consoleSpy = vi.spyOn(console, 'log');
        execute(code);
        expect(consoleSpy).toHaveBeenCalledWith(8);
        consoleSpy.mockRestore();
    });
}
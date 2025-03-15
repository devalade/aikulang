import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Interpreter } from '../src/interpreter';
import { Parser } from '../src/parser';
import { Lexer } from '../src/lexer';

describe('Interpreter', () => {
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log');
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    function interpret(code) {
        const lexer = new Lexer(code);
        const parser = new Parser(lexer.tokenize());
        const interpreter = new Interpreter();
        return interpreter.interpret(parser.parse());
    }

    it('should interpret variable declarations', () => {
        const code = `
            variable nom = "Aladé"
            afficher(nom)
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith('Aladé');
    });

    it('should interpret list operations', () => {
        const code = `
            variable fruits = liste("pomme", "banane")
            afficher(fruits[0])
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith('pomme');
    });

    it('should interpret function declarations and calls', () => {
        const code = `
            fonction saluer(nom)
                afficher("Bonjour " + nom + "!")
            fin
            saluer("Aladé")
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith('Bonjour Aladé!');
    });

    it('should interpret conditional statements', () => {
        const code = `
            variable total = 150
            si total > 100 alors
                afficher("Réduction")
            sinon
                afficher("Pas de réduction")
            fin
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith('Réduction');
    });

    it('should interpret loops', () => {
        const code = `
            variable fruits = liste("pomme", "banane")
            pour fruit dans fruits faire
                afficher(fruit)
            fin
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith('pomme');
        expect(consoleSpy).toHaveBeenCalledWith('banane');
    });

    it('should handle arithmetic operations', () => {
        const code = `
            variable a = 5
            variable b = 3
            variable resultat = a + b
            afficher(resultat)
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith(8);
    });

    it('should handle nested function calls', () => {
        const code = `
            fonction double(x)
                retourner x * 2
            fin
            fonction additionner(a, b)
                retourner a + b
            fin
            variable resultat = additionner(double(2), double(3))
            afficher(resultat)
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith(10);
    });

    it('should handle nested lists', () => {
        const code = `
            variable stock = liste(
                liste("pomme", 10, 0.50),
                liste("banane", 15, 0.30)
            )
            afficher(stock[0][1])
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith(10);
    });

    it('should handle string concatenation', () => {
        const code = `
            variable prenom = "Aladé"
            variable message = "Bonjour " + prenom + "!"
            afficher(message)
        `;
        interpret(code);
        expect(consoleSpy).toHaveBeenCalledWith('Bonjour Aladé!');
    });

    it('should throw error for undefined variables', () => {
        expect(() => {
            interpret('afficher(nonexistent)');
        }).toThrow('Variable "nonexistent" is not defined');
    });

    it('should throw error for invalid function calls', () => {
        const code = `
            variable nonexistent = 42
            nonexistent()
        `;
        expect(() => {
            interpret(code);
        }).toThrow('42 is not a function');
    });
});
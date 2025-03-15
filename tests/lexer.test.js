import { describe, it, expect } from 'vitest';
import { Lexer, TokenType } from '../src/lexer';

describe('Lexer', () => {
    it('should tokenize variable declaration', () => {
        const input = 'variable nom = "Aladé"';
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();

        expect(tokens).toEqual([
            { type: TokenType.VARIABLE, value: 'variable' },
            { type: TokenType.IDENTIFIER, value: 'nom' },
            { type: TokenType.EQUALS, value: '=' },
            { type: TokenType.STRING, value: 'Aladé' },
        ]);
    });

    it('should tokenize list declaration', () => {
        const input = 'variable fruits = liste("pomme", "banane")';
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();

        expect(tokens).toEqual([
            { type: TokenType.VARIABLE, value: 'variable' },
            { type: TokenType.IDENTIFIER, value: 'fruits' },
            { type: TokenType.EQUALS, value: '=' },
            { type: TokenType.LISTE, value: 'liste' },
            { type: TokenType.LEFT_PAREN, value: '(' },
            { type: TokenType.STRING, value: 'pomme' },
            { type: TokenType.COMMA, value: ',' },
            { type: TokenType.STRING, value: 'banane' },
            { type: TokenType.RIGHT_PAREN, value: ')' },
        ]);
    });

    it('should tokenize function declaration', () => {
        const input = `fonction saluer(nom)
            afficher("Bonjour " + nom + "!")
        fin`;
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();

        expect(tokens).toEqual([
            { type: TokenType.FONCTION, value: 'fonction' },
            { type: TokenType.IDENTIFIER, value: 'saluer' },
            { type: TokenType.LEFT_PAREN, value: '(' },
            { type: TokenType.IDENTIFIER, value: 'nom' },
            { type: TokenType.RIGHT_PAREN, value: ')' },
            { type: TokenType.IDENTIFIER, value: 'afficher' },
            { type: TokenType.LEFT_PAREN, value: '(' },
            { type: TokenType.STRING, value: 'Bonjour ' },
            { type: TokenType.PLUS, value: '+' },
            { type: TokenType.IDENTIFIER, value: 'nom' },
            { type: TokenType.PLUS, value: '+' },
            { type: TokenType.STRING, value: '!' },
            { type: TokenType.RIGHT_PAREN, value: ')' },
            { type: TokenType.FIN, value: 'fin' },
        ]);
    });

    it('should tokenize conditional statements', () => {
        const input = `si total > 100 alors
            afficher("Réduction")
        sinon
            afficher("Pas de réduction")
        fin`;
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();

        expect(tokens).toEqual([
            { type: TokenType.SI, value: 'si' },
            { type: TokenType.IDENTIFIER, value: 'total' },
            { type: TokenType.GT, value: '>' },
            { type: TokenType.NUMBER, value: 100 },
            { type: TokenType.ALORS, value: 'alors' },
            { type: TokenType.IDENTIFIER, value: 'afficher' },
            { type: TokenType.LEFT_PAREN, value: '(' },
            { type: TokenType.STRING, value: 'Réduction' },
            { type: TokenType.RIGHT_PAREN, value: ')' },
            { type: TokenType.SINON, value: 'sinon' },
            { type: TokenType.IDENTIFIER, value: 'afficher' },
            { type: TokenType.LEFT_PAREN, value: '(' },
            { type: TokenType.STRING, value: 'Pas de réduction' },
            { type: TokenType.RIGHT_PAREN, value: ')' },
            { type: TokenType.FIN, value: 'fin' },
        ]);
    });

    it('should tokenize loops', () => {
        const input = `pour fruit dans fruits faire
            afficher(fruit)
        fin`;
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();

        expect(tokens).toEqual([
            { type: TokenType.POUR, value: 'pour' },
            { type: TokenType.IDENTIFIER, value: 'fruit' },
            { type: TokenType.DANS, value: 'dans' },
            { type: TokenType.IDENTIFIER, value: 'fruits' },
            { type: TokenType.FAIRE, value: 'faire' },
            { type: TokenType.IDENTIFIER, value: 'afficher' },
            { type: TokenType.LEFT_PAREN, value: '(' },
            { type: TokenType.IDENTIFIER, value: 'fruit' },
            { type: TokenType.RIGHT_PAREN, value: ')' },
            { type: TokenType.FIN, value: 'fin' },
        ]);
    });
});
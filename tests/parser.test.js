import { describe, it, expect } from 'vitest';
import { Parser } from '../src/parser';
import { Lexer } from '../src/lexer';

describe('Parser', () => {
    it('should parse variable declaration', () => {
        const input = 'variable nom = "Aladé"';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer.tokenize());
        const ast = parser.parse();

        expect(ast).toEqual({
            type: 'Program',
            body: [{
                type: 'VariableDeclaration',
                name: 'nom',
                value: {
                    type: 'StringLiteral',
                    value: 'Aladé'
                }
            }]
        });
    });

    it('should parse list declaration', () => {
        const input = 'variable fruits = liste("pomme", "banane")';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer.tokenize());
        const ast = parser.parse();

        expect(ast).toEqual({
            type: 'Program',
            body: [{
                type: 'VariableDeclaration',
                name: 'fruits',
                value: {
                    type: 'ListExpression',
                    elements: [
                        { type: 'StringLiteral', value: 'pomme' },
                        { type: 'StringLiteral', value: 'banane' }
                    ]
                }
            }]
        });
    });

    it('should parse function declaration', () => {
        const input = `fonction saluer(nom)
            afficher("Bonjour " + nom + "!")
        fin`;
        const lexer = new Lexer(input);
        const parser = new Parser(lexer.tokenize());
        const ast = parser.parse();

        expect(ast).toEqual({
            type: 'Program',
            body: [{
                type: 'FunctionDeclaration',
                name: 'saluer',
                params: ['nom'],
                body: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: 'afficher',
                        arguments: [{
                            type: 'BinaryExpression',
                            operator: '+',
                            left: {
                                type: 'BinaryExpression',
                                operator: '+',
                                left: { type: 'StringLiteral', value: 'Bonjour ' },
                                right: { type: 'Identifier', name: 'nom' }
                            },
                            right: { type: 'StringLiteral', value: '!' }
                        }]
                    }
                }]
            }]
        });
    });

    it('should parse conditional statements', () => {
        const input = `si total > 100 alors
            afficher("Réduction")
        sinon
            afficher("Pas de réduction")
        fin`;
        const lexer = new Lexer(input);
        const parser = new Parser(lexer.tokenize());
        const ast = parser.parse();

        expect(ast).toEqual({
            type: 'Program',
            body: [{
                type: 'IfStatement',
                test: {
                    type: 'BinaryExpression',
                    operator: '>',
                    left: { type: 'Identifier', name: 'total' },
                    right: { type: 'NumericLiteral', value: 100 }
                },
                consequent: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: 'afficher',
                        arguments: [{ type: 'StringLiteral', value: 'Réduction' }]
                    }
                }],
                alternate: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: 'afficher',
                        arguments: [{ type: 'StringLiteral', value: 'Pas de réduction' }]
                    }
                }]
            }]
        });
    });

    it('should parse loops', () => {
        const input = `pour fruit dans fruits faire
            afficher(fruit)
        fin`;
        const lexer = new Lexer(input);
        const parser = new Parser(lexer.tokenize());
        const ast = parser.parse();

        expect(ast).toEqual({
            type: 'Program',
            body: [{
                type: 'ForInStatement',
                variable: 'fruit',
                iterable: {
                    type: 'Identifier',
                    name: 'fruits'
                },
                body: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: 'afficher',
                        arguments: [{ type: 'Identifier', name: 'fruit' }]
                    }
                }]
            }]
        });
    });
});
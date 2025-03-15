import { TokenType } from './lexer.js';

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    isAtEnd() {
        return this.current >= this.tokens.length;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw new Error(message);
    }

    parse() {
        const statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return { type: 'Program', body: statements };
    }

    statement() {
        if (this.match(TokenType.VARIABLE)) return this.variableDeclaration();
        if (this.match(TokenType.FONCTION)) return this.functionDeclaration();
        if (this.match(TokenType.SI)) return this.ifStatement();
        if (this.match(TokenType.POUR)) return this.forStatement();
        if (this.match(TokenType.RETOURNER)) return this.returnStatement();
        return this.expressionStatement();
    }

    variableDeclaration() {
        const name = this.consume(TokenType.IDENTIFIER, 'Expected variable name.').value;
        this.consume(TokenType.EQUALS, 'Expected "=" after variable name.');
        const value = this.expression();
        return {
            type: 'VariableDeclaration',
            name,
            value
        };
    }

    functionDeclaration() {
        const name = this.consume(TokenType.IDENTIFIER, 'Expected function name.').value;
        this.consume(TokenType.LEFT_PAREN, 'Expected "(" after function name.');

        const params = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                params.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name.').value);
            } while (this.match(TokenType.COMMA));
        }

        this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after parameters.');

        const body = [];
        while (!this.check(TokenType.FIN) && !this.isAtEnd()) {
            body.push(this.statement());
        }

        this.consume(TokenType.FIN, 'Expected "fin" after function body.');

        return {
            type: 'FunctionDeclaration',
            name,
            params,
            body
        };
    }

    ifStatement() {
        const test = this.expression();
        this.consume(TokenType.ALORS, 'Expected "alors" after condition.');

        const consequent = [];
        while (!this.check(TokenType.SINON) && !this.check(TokenType.FIN) && !this.isAtEnd()) {
            consequent.push(this.statement());
        }

        let alternate = [];
        if (this.match(TokenType.SINON)) {
            while (!this.check(TokenType.FIN) && !this.isAtEnd()) {
                alternate.push(this.statement());
            }
        }

        this.consume(TokenType.FIN, 'Expected "fin" after if statement.');

        return {
            type: 'IfStatement',
            test,
            consequent,
            alternate
        };
    }

    forStatement() {
        const variable = this.consume(TokenType.IDENTIFIER, 'Expected loop variable name.').value;
        this.consume(TokenType.DANS, 'Expected "dans" after loop variable.');
        const iterable = this.expression();
        this.consume(TokenType.FAIRE, 'Expected "faire" after iterable expression.');

        const body = [];
        while (!this.check(TokenType.FIN) && !this.isAtEnd()) {
            body.push(this.statement());
        }

        this.consume(TokenType.FIN, 'Expected "fin" after loop body.');

        return {
            type: 'ForInStatement',
            variable,
            iterable,
            body
        };
    }

    returnStatement() {
        const value = this.expression();
        return {
            type: 'ReturnStatement',
            value
        };
    }

    expressionStatement() {
        const expr = this.expression();
        return {
            type: 'ExpressionStatement',
            expression: expr
        };
    }

    expression() {
        return this.comparison();
    }

    comparison() {
        let expr = this.additive();

        while (this.match(TokenType.GT, TokenType.LT, TokenType.GTE, TokenType.LTE, TokenType.EQUALS_EQUALS)) {
            const operator = this.previous().value;
            const right = this.additive();
            expr = {
                type: 'BinaryExpression',
                operator,
                left: expr,
                right
            };
        }

        return expr;
    }

    additive() {
        let expr = this.multiplicative();

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value;
            const right = this.multiplicative();
            expr = {
                type: 'BinaryExpression',
                operator,
                left: expr,
                right
            };
        }

        return expr;
    }

    multiplicative() {
        let expr = this.primary();

        while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE)) {
            const operator = this.previous().value;
            const right = this.primary();
            expr = {
                type: 'BinaryExpression',
                operator,
                left: expr,
                right
            };
        }

        return expr;
    }

    primary() {
        if (this.match(TokenType.NUMBER)) {
            return { type: 'NumericLiteral', value: parseFloat(this.previous().value) };
        }

        if (this.match(TokenType.STRING)) {
            return { type: 'StringLiteral', value: this.previous().value };
        }

        if (this.match(TokenType.LISTE)) {
            this.consume(TokenType.LEFT_PAREN, 'Expected "(" after "liste".');
            const elements = [];
            if (!this.check(TokenType.RIGHT_PAREN)) {
                do {
                    elements.push(this.expression());
                } while (this.match(TokenType.COMMA));
            }
            this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after arguments.');
            return {
                type: 'ListExpression',
                elements: elements
            };
        }

        if (this.match(TokenType.IDENTIFIER)) {
            const name = this.previous().value;

            // Function call
            if (this.match(TokenType.LEFT_PAREN)) {
                const args = [];
                if (!this.check(TokenType.RIGHT_PAREN)) {
                    do {
                        args.push(this.expression());
                    } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after arguments.');
                return {
                    type: 'CallExpression',
                    callee: name,
                    arguments: args
                };
            }

            // List access with optional chaining
            let expr = { type: 'Identifier', name };
            while (this.match(TokenType.LEFT_BRACKET)) {
                const index = this.expression();
                this.consume(TokenType.RIGHT_BRACKET, 'Expected "]" after index.');
                expr = {
                    type: 'ListAccess',
                    object: expr,
                    index
                };
            }
            return expr;
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after expression.');
            return expr;
        }

        throw new Error(`Unexpected token: ${this.peek().type}`);
    }
}
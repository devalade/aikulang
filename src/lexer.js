export const TokenType = {
    // Keywords
    VARIABLE: 'VARIABLE',
    FONCTION: 'FONCTION',
    SI: 'SI',
    ALORS: 'ALORS',
    SINON: 'SINON',
    POUR: 'POUR',
    DANS: 'DANS',
    FAIRE: 'FAIRE',
    FIN: 'FIN',
    RETOURNER: 'RETOURNER',
    LISTE: 'LISTE',
    RIEN: 'RIEN',

    // Literals
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',

    // Operators and Punctuation
    EQUALS: 'EQUALS',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MULTIPLY: 'MULTIPLY',
    DIVIDE: 'DIVIDE',
    GT: 'GT',
    LT: 'LT',
    GTE: 'GTE',
    LTE: 'LTE',
    EQUALS_EQUALS: 'EQUALS_EQUALS',
    LEFT_PAREN: 'LEFT_PAREN',
    RIGHT_PAREN: 'RIGHT_PAREN',
    LEFT_BRACKET: 'LEFT_BRACKET',
    RIGHT_BRACKET: 'RIGHT_BRACKET',
    COMMA: 'COMMA',
};

const KEYWORDS = {
    'variable': TokenType.VARIABLE,
    'fonction': TokenType.FONCTION,
    'si': TokenType.SI,
    'alors': TokenType.ALORS,
    'sinon': TokenType.SINON,
    'pour': TokenType.POUR,
    'dans': TokenType.DANS,
    'faire': TokenType.FAIRE,
    'fin': TokenType.FIN,
    'retourner': TokenType.RETOURNER,
    'liste': TokenType.LISTE,
    'rien': TokenType.RIEN,
};

export class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.currentChar = this.input[0];
    }

    advance() {
        this.position++;
        this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
    }

    skipWhitespace() {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }

    isAlpha(char) {
        return /[a-zA-Z_]/.test(char);
    }

    isAlphaNumeric(char) {
        return /[a-zA-Z0-9_]/.test(char);
    }

    isDigit(char) {
        return /[0-9]/.test(char);
    }

    readIdentifier() {
        let result = '';
        while (this.currentChar && this.isAlphaNumeric(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }

    readNumber() {
        let result = '';
        let hasDecimal = false;

        while (this.currentChar && (this.isDigit(this.currentChar) || this.currentChar === '.')) {
            if (this.currentChar === '.') {
                if (hasDecimal) break;
                hasDecimal = true;
            }
            result += this.currentChar;
            this.advance();
        }

        return parseFloat(result);
    }

    readString() {
        const quote = this.currentChar;
        let result = '';
        this.advance(); // Skip opening quote

        while (this.currentChar && this.currentChar !== quote) {
            if (this.currentChar === '\\') {
                this.advance();
                switch (this.currentChar) {
                    case 'n': result += '\n'; break;
                    case 't': result += '\t'; break;
                    case 'r': result += '\r'; break;
                    default: result += this.currentChar;
                }
            } else {
                result += this.currentChar;
            }
            this.advance();
        }

        if (this.currentChar === quote) {
            this.advance(); // Skip closing quote
        } else {
            throw new Error('Unterminated string literal');
        }

        return result;
    }

    tokenize() {
        const tokens = [];

        while (this.currentChar) {
            if (/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }

            if (this.currentChar === '#') {
                while (this.currentChar && this.currentChar !== '\n') {
                    this.advance();
                }
                continue;
            }

            if (this.isAlpha(this.currentChar)) {
                const identifier = this.readIdentifier();
                const type = KEYWORDS[identifier.toLowerCase()] || TokenType.IDENTIFIER;
                tokens.push({ type, value: type === TokenType.IDENTIFIER ? identifier : identifier.toLowerCase() });
                continue;
            }

            if (this.isDigit(this.currentChar)) {
                tokens.push({ type: TokenType.NUMBER, value: this.readNumber() });
                continue;
            }

            if (this.currentChar === '"' || this.currentChar === "'") {
                tokens.push({ type: TokenType.STRING, value: this.readString() });
                continue;
            }

            switch (this.currentChar) {
                case '=':
                    this.advance();
                    if (this.currentChar === '=') {
                        this.advance();
                        tokens.push({ type: TokenType.EQUALS_EQUALS, value: '==' });
                    } else {
                        tokens.push({ type: TokenType.EQUALS, value: '=' });
                    }
                    break;
                case '+':
                    tokens.push({ type: TokenType.PLUS, value: '+' });
                    this.advance();
                    break;
                case '-':
                    tokens.push({ type: TokenType.MINUS, value: '-' });
                    this.advance();
                    break;
                case '*':
                    tokens.push({ type: TokenType.MULTIPLY, value: '*' });
                    this.advance();
                    break;
                case '/':
                    tokens.push({ type: TokenType.DIVIDE, value: '/' });
                    this.advance();
                    break;
                case '>':
                    this.advance();
                    if (this.currentChar === '=') {
                        this.advance();
                        tokens.push({ type: TokenType.GTE, value: '>=' });
                    } else {
                        tokens.push({ type: TokenType.GT, value: '>' });
                    }
                    break;
                case '<':
                    this.advance();
                    if (this.currentChar === '=') {
                        this.advance();
                        tokens.push({ type: TokenType.LTE, value: '<=' });
                    } else {
                        tokens.push({ type: TokenType.LT, value: '<' });
                    }
                    break;
                case '(':
                    tokens.push({ type: TokenType.LEFT_PAREN, value: '(' });
                    this.advance();
                    break;
                case ')':
                    tokens.push({ type: TokenType.RIGHT_PAREN, value: ')' });
                    this.advance();
                    break;
                case '[':
                    tokens.push({ type: TokenType.LEFT_BRACKET, value: '[' });
                    this.advance();
                    break;
                case ']':
                    tokens.push({ type: TokenType.RIGHT_BRACKET, value: ']' });
                    this.advance();
                    break;
                case ',':
                    tokens.push({ type: TokenType.COMMA, value: ',' });
                    this.advance();
                    break;
                default:
                    throw new Error(`Unexpected character: ${this.currentChar}`);
            }
        }

        return tokens;
    }
}
export class Environment {
    constructor(parent = null) {
        this.values = new Map();
        this.parent = parent;
    }

    define(name, value) {
        this.values.set(name, value);
    }

    assign(name, value) {
        if (this.values.has(name)) {
            this.values.set(name, value);
            return;
        }
        if (this.parent) {
            this.parent.assign(name, value);
            return;
        }
        throw new Error(`Variable "${name}" is not defined`);
    }

    get(name) {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Variable "${name}" is not defined`);
    }
}

export class Interpreter {
    constructor() {
        this.globals = new Environment();
        this.environment = this.globals;

        // Built-in functions
        this.globals.define('afficher', (...args) => console.log(...args));
        this.globals.define('liste', (...elements) => elements);
    }

    interpret(ast) {
        return this.evaluateNode(ast);
    }

    evaluateNode(node) {
        if (!node) return null;

        switch (node.type) {
            case 'Program':
                return this.evaluateProgram(node);
            case 'VariableDeclaration':
                return this.evaluateVariableDeclaration(node);
            case 'FunctionDeclaration':
                return this.evaluateFunctionDeclaration(node);
            case 'CallExpression':
                return this.evaluateFunctionCall(node);
            case 'BinaryExpression':
                return this.evaluateBinaryOperation(node);
            case 'Identifier':
                return this.evaluateIdentifier(node);
            case 'NumericLiteral':
                return node.value;
            case 'StringLiteral':
                return node.value;
            case 'ListExpression':
                return this.evaluateListExpression(node);
            case 'ListAccess':
                return this.evaluateListAccess(node);
            case 'ExpressionStatement':
                return this.evaluateNode(node.expression);
            case 'ReturnStatement':
                return this.evaluateNode(node.value);
            case 'IfStatement':
                return this.evaluateIfStatement(node);
            case 'ForInStatement':
                return this.evaluateForInStatement(node);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    evaluateProgram(node) {
        let result = null;
        for (const statement of node.body) {
            result = this.evaluateNode(statement);
        }
        return result;
    }

    evaluateVariableDeclaration(node) {
        const value = this.evaluateNode(node.value);
        this.environment.define(node.name, value);
        return value;
    }

    evaluateFunctionDeclaration(node) {
        const func = {
            params: node.params,
            body: node.body,
            env: this.environment
        };
        this.environment.define(node.name, func);
        return func;
    }

    evaluateFunctionCall(node) {
        const func = this.environment.get(node.callee);
        if (typeof func === 'function') {
            const args = node.arguments.map(arg => this.evaluateNode(arg));
            return func(...args);
        }

        if (!func || !func.params) {
            const value = this.evaluateNode({ type: 'Identifier', name: node.callee });
            throw new Error(`${value} is not a function`);
        }

        const newEnv = new Environment(func.env);
        const args = node.arguments.map(arg => this.evaluateNode(arg));

        // Set up function scope
        func.params.forEach((param, index) => {
            newEnv.define(param, args[index]);
        });

        const previousEnv = this.environment;
        this.environment = newEnv;

        let result = null;
        try {
            for (const statement of func.body) {
                result = this.evaluateNode(statement);
                if (statement.type === 'ReturnStatement') {
                    break;
                }
            }
        } finally {
            this.environment = previousEnv;
        }

        return result;
    }

    evaluateBinaryOperation(node) {
        const left = this.evaluateNode(node.left);
        const right = this.evaluateNode(node.right);

        switch (node.operator) {
            case '+':
                if (typeof left === 'string' || typeof right === 'string') {
                    return String(left) + String(right);
                }
                return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '>': return left > right;
            case '<': return left < right;
            case '>=': return left >= right;
            case '<=': return left <= right;
            case '==': return left === right;
            default:
                throw new Error(`Unknown operator: ${node.operator}`);
        }
    }

    evaluateIdentifier(node) {
        return this.environment.get(node.name);
    }

    evaluateIfStatement(node) {
        const test = this.evaluateNode(node.test);
        if (test) {
            for (const statement of node.consequent) {
                this.evaluateNode(statement);
            }
        } else if (node.alternate && node.alternate.length > 0) {
            for (const statement of node.alternate) {
                this.evaluateNode(statement);
            }
        }
    }

    evaluateForInStatement(node) {
        const iterable = this.evaluateNode(node.iterable);
        if (!Array.isArray(iterable)) {
            throw new Error('Can only iterate over lists');
        }

        const iterationEnv = new Environment(this.environment);
        const previousEnv = this.environment;
        this.environment = iterationEnv;

        try {
            for (const item of iterable) {
                iterationEnv.define(node.variable, item);
                for (const statement of node.body) {
                    this.evaluateNode(statement);
                }
            }
        } finally {
            this.environment = previousEnv;
        }
    }

    evaluateListExpression(node) {
        return node.elements.map(element => this.evaluateNode(element));
    }

    evaluateListAccess(node) {
        const list = this.evaluateNode(node.object);
        const index = this.evaluateNode(node.index);
        if (!Array.isArray(list)) {
            throw new Error('Cannot access index of non-list value');
        }
        if (index < 0 || index >= list.length) {
            throw new Error('List index out of bounds');
        }
        return list[index];
    }
}
// lexer-parser.js
// Module pour l'analyse lexicale et syntaxique du langage

import { createToken, Lexer, CstParser } from "chevrotain";

// Définition des tokens
const True = createToken({ name: "True", pattern: /vrai/ });
const False = createToken({ name: "False", pattern: /faux/ });
const Nil = createToken({ name: "Nil", pattern: /rien/ });
const Variable = createToken({ name: "Variable", pattern: /variable/ });
const Function = createToken({ name: "Function", pattern: /fonction/ });
const End = createToken({ name: "End", pattern: /fin/ });
const Return = createToken({ name: "Return", pattern: /retourner/ });
const If = createToken({ name: "If", pattern: /si/ });
const ElseIf = createToken({ name: "ElseIf", pattern: /sinon si/ });
const Else = createToken({ name: "Else", pattern: /sinon/ });
const Then = createToken({ name: "Then", pattern: /alors/ });
const For = createToken({ name: "For", pattern: /pour/ });
const In = createToken({ name: "In", pattern: /dans/ });
const Do = createToken({ name: "Do", pattern: /faire/ });
const Print = createToken({ name: "Print", pattern: /afficher/ });
const Add = createToken({ name: "Add", pattern: /ajouter/ });
const To = createToken({ name: "To", pattern: /à/ });
const List = createToken({ name: "List", pattern: /liste/ });
const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});
const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: /"[^"]*"/,
});
const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /\d+(\.\d+)?/,
});
const Plus = createToken({ name: "Plus", pattern: /\+/ });
const Minus = createToken({ name: "Minus", pattern: /-/ });
const Multiply = createToken({ name: "Multiply", pattern: /\*/ });
const Divide = createToken({ name: "Divide", pattern: /\// });
const Equals = createToken({ name: "Equals", pattern: /=/ });
const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });
const LBracket = createToken({ name: "LBracket", pattern: /\[/ });
const RBracket = createToken({ name: "RBracket", pattern: /\]/ });
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});
const Comment = createToken({
  name: "Comment",
  pattern: /#.*/,
  group: Lexer.SKIPPED,
});

// Définition de tous les tokens utilisés par le lexer
const allTokens = [
  WhiteSpace,
  Comment,
  True,
  False,
  Nil,
  Variable,
  Function,
  End,
  Return,
  If,
  ElseIf,
  Else,
  Then,
  For,
  In,
  Do,
  Print,
  Add,
  To,
  List,
  StringLiteral,
  NumberLiteral,
  Plus,
  Minus,
  Multiply,
  Divide,
  Equals,
  LParen,
  RParen,
  Comma,
  LBracket,
  RBracket,
  Identifier,
];

// Création du lexer
export const SimpleLexer = new Lexer(allTokens);

// Définition de la classe Parser
class SimpleParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  // Règle principale pour le programme
  program = this.RULE("program", () => {
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.variableDeclaration) },
        { ALT: () => this.SUBRULE(this.functionDeclaration) },
        { ALT: () => this.SUBRULE(this.statement) },
      ]);
    });
  });

  // Déclaration de variable
  variableDeclaration = this.RULE("variableDeclaration", () => {
    this.CONSUME(Variable);
    this.CONSUME(Identifier);
    this.CONSUME(Equals);
    this.SUBRULE(this.expression);
  });

  // Déclaration de fonction
  functionDeclaration = this.RULE("functionDeclaration", () => {
    this.CONSUME(Function);
    this.CONSUME(Identifier);
    this.CONSUME(LParen);
    this.OPTION(() => {
      this.SUBRULE(this.parameterList);
    });
    this.CONSUME(RParen);
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
    this.CONSUME(End);
  });

  // Liste de paramètres
  parameterList = this.RULE("parameterList", () => {
    this.CONSUME(Identifier);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.CONSUME2(Identifier);
    });
  });

  // Différents types d'instructions
  statement = this.RULE("statement", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.assignmentStatement) },
      { ALT: () => this.SUBRULE(this.ifStatement) },
      { ALT: () => this.SUBRULE(this.forStatement) },
      { ALT: () => this.SUBRULE(this.printStatement) },
      { ALT: () => this.SUBRULE(this.returnStatement) },
      { ALT: () => this.SUBRULE(this.addStatement) },
      { ALT: () => this.SUBRULE(this.functionCall) },
    ]);
  });

  // Instruction d'assignation
  assignmentStatement = this.RULE("assignmentStatement", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Identifier);
          this.CONSUME(Equals);
          this.SUBRULE(this.expression);
        },
      },
      {
        ALT: () => {
          this.CONSUME2(Identifier);
          this.CONSUME(LBracket);
          this.SUBRULE2(this.expression);
          this.CONSUME(RBracket);
          this.CONSUME2(Equals);
          this.SUBRULE3(this.expression);
        },
      },
    ]);
  });

  // Instruction if
  ifStatement = this.RULE("ifStatement", () => {
    this.CONSUME(If);
    this.SUBRULE(this.expression);
    this.CONSUME(Then);
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
    this.MANY1(() => {
      this.CONSUME(ElseIf);
      this.SUBRULE2(this.expression);
      this.CONSUME2(Then);
      this.MANY2(() => {
        this.SUBRULE2(this.statement);
      });
    });
    this.OPTION(() => {
      this.CONSUME(Else);
      this.MANY3(() => {
        this.SUBRULE3(this.statement);
      });
    });
    this.CONSUME(End);
  });

  // Instruction for
  forStatement = this.RULE("forStatement", () => {
    this.CONSUME(For);
    this.CONSUME(Identifier);
    this.CONSUME(In);
    this.SUBRULE(this.expression);
    this.CONSUME(Do);
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
    this.CONSUME(End);
  });

  // Instruction print
  printStatement = this.RULE("printStatement", () => {
    this.CONSUME(Print);
    this.SUBRULE(this.expression);
  });

  // Instruction return
  returnStatement = this.RULE("returnStatement", () => {
    this.CONSUME(Return);
    this.SUBRULE(this.expression);
  });

  // Instruction add
  addStatement = this.RULE("addStatement", () => {
    this.CONSUME(Add);
    this.SUBRULE(this.expression);
    this.CONSUME(To);
    this.CONSUME(Identifier);
  });

  // Appel de fonction
  functionCall = this.RULE("functionCall", () => {
    this.CONSUME(Identifier);
    this.CONSUME(LParen);
    this.OPTION(() => {
      this.SUBRULE(this.argumentList);
    });
    this.CONSUME(RParen);
  });

  // Liste d'arguments
  argumentList = this.RULE("argumentList", () => {
    this.SUBRULE(this.expression);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE2(this.expression);
    });
  });

  // Expression
  expression = this.RULE("expression", () => {
    this.SUBRULE(this.additionExpression);
  });

  // Addition et soustraction
  additionExpression = this.RULE("additionExpression", () => {
    this.SUBRULE(this.multiplicationExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Plus) },
        { ALT: () => this.CONSUME(Minus) },
      ]);
      this.SUBRULE2(this.multiplicationExpression);
    });
  });

  // Multiplication et division
  multiplicationExpression = this.RULE("multiplicationExpression", () => {
    this.SUBRULE(this.primaryExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Multiply) },
        { ALT: () => this.CONSUME(Divide) },
      ]);
      this.SUBRULE2(this.primaryExpression);
    });
  });

  // Expression primaire
  primaryExpression = this.RULE("primaryExpression", () => {
    this.OR([
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      { ALT: () => this.CONSUME(Nil) },
      { ALT: () => this.SUBRULE(this.listLiteral) },
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.SUBRULE(this.expression);
          this.CONSUME(RParen);
        },
      },
      { ALT: () => this.SUBRULE(this.functionCall) },
      {
        ALT: () => {
          this.CONSUME(Identifier);
          this.OPTION(() => {
            this.CONSUME(LBracket);
            this.SUBRULE2(this.expression);
            this.CONSUME(RBracket);
          });
        },
      },
    ]);
  });

  // Littéral liste
  listLiteral = this.RULE("listLiteral", () => {
    this.CONSUME(List);
    this.CONSUME(LParen);
    this.OPTION(() => {
      this.SUBRULE(this.argumentList);
    });
    this.CONSUME(RParen);
  });
}

// Création et export du parser
export const parser = new SimpleParser();

// Export de tous les tokens pour une utilisation externe
export const tokens = {
  True,
  False,
  Nil,
  Variable,
  Function,
  End,
  Return,
  If,
  ElseIf,
  Else,
  Then,
  For,
  In,
  Do,
  Print,
  Add,
  To,
  List,
  Identifier,
  StringLiteral,
  NumberLiteral,
  Plus,
  Minus,
  Multiply,
  Divide,
  Equals,
  LParen,
  RParen,
  Comma,
  LBracket,
  RBracket,
};

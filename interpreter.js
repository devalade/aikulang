/**
 * Implémentation de l'interpréteur pour le langage personnalisé
 */
export class Interpreter {
  constructor() {
    this.variables = new Map();
    this.functions = new Map();
    this.output = [];
    this.returnValue = undefined;
    this.inReturn = false;
  }

  /**
   * Exécute le programme
   * @param {string} code Le code source à exécuter
   * @returns {string[]} Sortie du programme
   */
  run(code) {
    try {
      // Réinitialiser l'état
      this.variables = new Map();
      this.functions = new Map();
      this.output = [];
      this.returnValue = undefined;
      this.inReturn = false;

      // Définir des fonctions natives
      this.defineFunctions();

      // Analyser et exécuter le code ligne par ligne
      const lines = code.split("\n");
      let lineIndex = 0;

      while (lineIndex < lines.length) {
        lineIndex = this.executeLine(lines, lineIndex);
        console.log(lineIndex);
      }

      return this.output;
    } catch (error) {
      this.output.push(`Erreur d'exécution: ${error.message}`);
      return this.output;
    }
  }

  /**
   * Définir des fonctions natives
   */
  defineFunctions() {
    // Fonction afficher
    this.functions.set("afficher", {
      native: true,
      execute: (args) => {
        const result = args.map((arg) => this.stringify(arg)).join("");
        this.output.push(result);
        return result;
      },
    });

    // Fonction liste
    this.functions.set("liste", {
      native: true,
      execute: (args) => {
        return args;
      },
    });

    this.functions.set("morceler", {
      native: true,
      execute: (args) => {
        if (args.length < 1) {
          throw new Error(
            "La fonction 'morceler' nécessite au moins un argument",
          );
        }

        const str = String(args[0]);
        let separator = "";

        // Si un séparateur est fourni en second argument, l'utiliser
        if (args.length > 1) {
          separator = String(args[1]);
        }

        // Diviser la chaîne selon le séparateur
        const result = separator === "" ? str.split("") : str.split(separator);

        return result;
      },
    });

    this.functions.set("trim", {
      native: true,
      execute: (args) => {
        if (args.length < 1) {
          throw new Error("La fonction 'trim' nécessite au moins un argument");
        }

        const str = String(args[0]);
        return str.trim();
      },
    });

    // Fonction isNumber - vérifie si une valeur est un nombre
    this.functions.set("estNombre", {
      native: true,
      execute: (args) => {
        if (args.length < 1) {
          throw new Error(
            "La fonction 'estNombre' nécessite au moins un argument",
          );
        }

        const value = args[0];
        return typeof value === "number" && !isNaN(value);
      },
    });

    // Fonction toString - convertit une valeur en chaîne de caractères
    this.functions.set("versTexte", {
      native: true,
      execute: (args) => {
        if (args.length < 1) {
          throw new Error(
            "La fonction 'versTexte' nécessite au moins un argument",
          );
        }

        return this.stringify(args[0]);
      },
    });

    // Fonction toNumber - convertit une valeur en nombre
    this.functions.set("versNombre", {
      native: true,
      execute: (args) => {
        if (args.length < 1) {
          throw new Error(
            "La fonction 'versNombre' nécessite au moins un argument",
          );
        }

        const value = args[0];

        if (typeof value === "number") {
          return value;
        }

        if (typeof value === "string") {
          const num = parseFloat(value);
          if (isNaN(num)) {
            throw new Error(`Impossible de convertir "${value}" en nombre`);
          }
          return num;
        }

        if (value === true) {
          return 1;
        }

        if (value === false || value === null) {
          return 0;
        }

        throw new Error(`Type non convertible en nombre: ${typeof value}`);
      },
    });
  }

  /**
   * Exécuter une ligne
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  executeLine(lines, currentLine) {
    try {
      if (currentLine >= lines.length) {
        return currentLine + 1;
      }

      const line = lines[currentLine].trim();

      if (line === "" || line.startsWith("#")) {
        return currentLine + 1;
      }

      if (line.startsWith("variable ")) {
        return this.handleVariableDeclaration(lines, currentLine);
      } else if (line.startsWith("fonction ")) {
        return this.handleFunctionDeclaration(lines, currentLine);
      } else if (line.startsWith("si ")) {
        return this.handleIfStatement(lines, currentLine);
      } else if (line.startsWith("pour ")) {
        return this.handleForLoop(lines, currentLine);
      } else if (line.startsWith("retourner ")) {
        return this.handleReturn(lines, currentLine);
      } else if (line.startsWith("afficher ")) {
        return this.handlePrint(lines, currentLine);
      } else if (line.startsWith("ajouter ")) {
        return this.handleAdd(lines, currentLine);
      } else if (line.includes(" = ")) {
        return this.handleAssignment(lines, currentLine);
      } else {
        // Probablement un appel de fonction
        try {
          this.evaluateExpression(line);
        } catch (error) {
          throw new Error(
            `Erreur à la ligne ${currentLine + 1}: ${error.message}`,
          );
        }
        return currentLine + 1;
      }
    } catch (error) {
      throw new Error(`Erreur à la ligne ${currentLine + 1}: ${error.message}`);
    }
  }

  /**
   * Gérer la déclaration de variable
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handleVariableDeclaration(lines, currentLine) {
    const line = lines[currentLine].trim();
    const parts = line
      .substring(9)
      .split("=")
      .map((p) => p.trim());
    const name = parts[0];
    const value = this.evaluateExpression(parts[1]);

    this.variables.set(name, value);
    return currentLine + 1;
  }

  /**
   * Gérer la déclaration de fonction
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handleFunctionDeclaration(lines, currentLine) {
    const line = lines[currentLine].trim();
    const nameMatch = line.match(/fonction\s+(\w+)/);
    const paramsMatch = line.match(/\((.*?)\)/);

    if (!nameMatch || !paramsMatch) {
      throw new Error(
        `Erreur de syntaxe dans la déclaration de fonction à la ligne ${currentLine + 1}`,
      );
    }

    const name = nameMatch[1];
    const params = paramsMatch[1]
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    // Trouver la fin de la fonction
    let endLine = currentLine + 1;
    let depth = 1;

    while (endLine < lines.length) {
      const currLine = lines[endLine].trim();

      if (currLine.startsWith("fonction ")) {
        depth++;
      } else if (currLine === "fin") {
        depth--;
        if (depth === 0) break;
      }

      endLine++;
    }

    if (depth !== 0) {
      throw new Error(`'fin' manquant pour la fonction ${name}`);
    }

    // Stocker la fonction
    this.functions.set(name, {
      params,
      body: lines.slice(currentLine + 1, endLine),
      native: false,
    });

    return endLine + 1;
  }

  /**
   * Gérer une instruction if
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handleIfStatement(lines, currentLine) {
    const line = lines[currentLine].trim();
    const conditionMatch = line.match(/si\s+(.*?)\s+alors/);

    if (!conditionMatch) {
      throw new Error(
        `Erreur de syntaxe dans l'instruction 'si' à la ligne ${currentLine + 1}`,
      );
    }

    const condition = this.evaluateExpression(conditionMatch[1]);

    // Trouver les blocs sinon si / sinon et fin
    let currentIndex = currentLine + 1;
    let depth = 1;
    let foundElseIf = false;
    let foundElse = false;
    let elseIfIndex = -1;
    let elseIndex = -1;
    let endIndex = -1;

    while (currentIndex < lines.length) {
      const currLine = lines[currentIndex].trim();

      if (currLine.startsWith("si ")) {
        depth++;
      } else if (currLine === "fin") {
        depth--;
        if (depth === 0) {
          endIndex = currentIndex;
          break;
        }
      } else if (
        depth === 1 &&
        currLine.startsWith("sinon si ") &&
        !foundElse
      ) {
        if (!foundElseIf) {
          elseIfIndex = currentIndex;
          foundElseIf = true;
        }
      } else if (depth === 1 && currLine === "sinon") {
        elseIndex = currentIndex;
        foundElse = true;
      }

      currentIndex++;
    }

    if (endIndex === -1) {
      throw new Error(
        `'fin' manquant pour l'instruction 'si' à la ligne ${currentLine + 1}`,
      );
    }

    if (condition) {
      // Exécuter le bloc if
      let ifBlockEnd = foundElseIf
        ? elseIfIndex
        : foundElse
          ? elseIndex
          : endIndex;
      let nextLine = currentLine + 1;

      while (nextLine < ifBlockEnd) {
        nextLine = this.executeLine(lines, nextLine);
        if (this.inReturn) return endIndex + 1;
      }

      return endIndex + 1;
    } else if (foundElseIf) {
      // Traiter le bloc sinon si
      return elseIfIndex;
    } else if (foundElse) {
      // Exécuter le bloc sinon
      let nextLine = elseIndex + 1;

      while (nextLine < endIndex) {
        nextLine = this.executeLine(lines, nextLine);
        if (this.inReturn) return endIndex + 1;
      }

      return endIndex + 1;
    } else {
      // Aucun bloc à exécuter
      return endIndex + 1;
    }
  }

  /**
   * Gérer une boucle for
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handleForLoop(lines, currentLine) {
    const line = lines[currentLine].trim();
    const match = line.match(/pour\s+(\w+)\s+dans\s+(.*?)\s+faire/);

    if (!match) {
      throw new Error(
        `Erreur de syntaxe dans la boucle 'pour' à la ligne ${currentLine + 1}`,
      );
    }

    const iterVar = match[1];
    const collection = this.evaluateExpression(match[2]);

    if (!Array.isArray(collection)) {
      throw new Error(
        `Impossible d'itérer sur un non-itérable à la ligne ${currentLine + 1}`,
      );
    }

    // Trouver la fin de la boucle
    let endLine = currentLine + 1;
    let depth = 1;

    while (endLine < lines.length) {
      const currLine = lines[endLine].trim();

      if (currLine.startsWith("pour ")) {
        depth++;
      } else if (currLine === "fin") {
        depth--;
        if (depth === 0) break;
      }

      endLine++;
    }

    if (depth !== 0) {
      throw new Error(
        `'fin' manquant pour la boucle à la ligne ${currentLine + 1}`,
      );
    }

    // Exécuter la boucle
    for (const item of collection) {
      this.variables.set(iterVar, item);

      let loopLine = currentLine + 1;
      while (loopLine < endLine) {
        loopLine = this.executeLine(lines, loopLine);
        if (this.inReturn) return endLine + 1;
      }
    }

    return endLine + 1;
  }

  /**
   * Gérer une instruction return
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handleReturn(lines, currentLine) {
    try {
      const line = lines[currentLine].trim();
      const value = this.evaluateExpression(line.substring(10));

      this.returnValue = value;
      this.inReturn = true;

      return currentLine + 1;
    } catch (error) {
      throw new Error(
        `Erreur lors du traitement de 'retourner' à la ligne ${currentLine + 1}: ${error.message}`,
      );
    }
  }

  /**
   * Gérer une instruction print
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handlePrint(lines, currentLine) {
    const line = lines[currentLine].trim();
    const expr = line.substring(9);

    const result = this.evaluateExpression(expr);
    this.output.push(this.stringify(result));

    return currentLine + 1;
  }

  /**
   * Gérer une instruction d'ajout
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handleAdd(lines, currentLine) {
    const line = lines[currentLine].trim();
    const match = line.match(/ajouter\s+(.*?)\s+à\s+(.*)/);

    if (!match) {
      throw new Error(
        `Erreur de syntaxe dans l'instruction 'ajouter' à la ligne ${currentLine + 1}`,
      );
    }

    const value = this.evaluateExpression(match[1]);
    const targetExpr = match[2];

    if (targetExpr.includes("[")) {
      // Ajout à un élément spécifique d'une liste
      const indexMatch = targetExpr.match(/(\w+)\[([^\]]+)\]/);
      if (indexMatch) {
        const listName = indexMatch[1];
        const index = this.evaluateExpression(indexMatch[2]);
        const list = this.variables.get(listName);

        if (Array.isArray(list) && index >= 0 && index < list.length) {
          if (Array.isArray(list[index])) {
            list[index].push(value);
          } else {
            throw new Error(
              `Impossible d'ajouter à un non-liste à l'index ${index} de ${listName}`,
            );
          }
        } else {
          throw new Error(`Index ${index} invalide pour la liste ${listName}`);
        }
      }
    } else {
      // Ajout à une liste
      const list = this.variables.get(targetExpr);

      if (Array.isArray(list)) {
        list.push(value);
      } else {
        throw new Error(`Impossible d'ajouter à un non-liste ${targetExpr}`);
      }
    }

    return currentLine + 1;
  }

  /**
   * Gérer une assignation
   * @param {string[]} lines Lignes de code
   * @param {number} currentLine Index de la ligne actuelle
   * @returns {number} Index de la prochaine ligne à exécuter
   */
  handleAssignment(lines, currentLine) {
    const line = lines[currentLine].trim();
    const parts = line.split("=").map((p) => p.trim());
    const leftSide = parts[0];
    const value = this.evaluateExpression(parts[1]);

    if (leftSide.includes("[")) {
      // Assignation à un élément de liste
      const match = leftSide.match(/(\w+)\[([^\]]+)\]/);
      if (match) {
        const listName = match[1];
        const index = this.evaluateExpression(match[2]);
        const list = this.variables.get(listName);

        if (Array.isArray(list) && index >= 0 && index < list.length) {
          list[index] = value;
        } else {
          throw new Error(`Index ${index} invalide pour la liste ${listName}`);
        }
      }
    } else {
      // Assignation simple
      this.variables.set(leftSide, value);
    }

    return currentLine + 1;
  }

  /**
   * Évaluer une expression
   * @param {string} expr Expression à évaluer
   * @returns {any} Valeur de l'expression
   */
  evaluateExpression(expr) {
    expr = expr.trim();

    if (expr === "rien") {
      return null;
    } else if (expr === "vrai") {
      return true;
    } else if (expr === "faux") {
      return false;
    } else if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    } else if (!isNaN(parseFloat(expr)) && isFinite(expr)) {
      return parseFloat(expr);
    } else if (expr.startsWith("liste(")) {
      return this.parseList(expr);
    } else if (expr.includes("[")) {
      // Accès à un élément de liste
      return this.accessListElement(expr);
    } else if (expr.includes("+")) {
      return this.handleAddition(expr);
    } else if (expr.includes("-") && !expr.includes("+")) {
      return this.handleSubtraction(expr);
    } else if (
      expr.includes("*") &&
      !expr.includes("+") &&
      !expr.includes("-")
    ) {
      return this.handleMultiplication(expr);
    } else if (
      expr.includes("/") &&
      !expr.includes("+") &&
      !expr.includes("-") &&
      !expr.includes("*")
    ) {
      return this.handleDivision(expr);
    } else if (
      expr.includes("=") &&
      !expr.includes("<") &&
      !expr.includes(">")
    ) {
      return this.handleEquality(expr);
    } else if (expr.includes("(") && !expr.startsWith("liste(")) {
      return this.callFunction(expr);
    } else {
      // Variable
      return this.variables.get(expr);
    }
  }

  /**
   * Parser une liste
   * @param {string} expr Expression de liste
   * @returns {Array} Liste parsée
   */
  parseList(expr) {
    const content = expr.substring(6, expr.length - 1).trim();

    if (content === "") {
      return [];
    }

    // Analyse des éléments de la liste
    const items = [];
    let start = 0;
    let parenCount = 0;
    let inString = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '"' && (i === 0 || content[i - 1] !== "\\")) {
        inString = !inString;
      } else if (!inString) {
        if (char === "(" || char === "[") {
          parenCount++;
        } else if (char === ")" || char === "]") {
          parenCount--;
        } else if (char === "," && parenCount === 0) {
          items.push(this.evaluateExpression(content.substring(start, i)));
          start = i + 1;
        }
      }
    }

    if (start < content.length) {
      items.push(this.evaluateExpression(content.substring(start)));
    }

    return items;
  }

  /**
   * Accéder à un élément de liste
   * @param {string} expr Expression d'accès à une liste
   * @returns {any} Élément de la liste
   */
  accessListElement(expr) {
    const match = expr.match(/(\w+)\[([^\]]+)\]/);

    if (!match) {
      throw new Error(`Syntaxe invalide pour l'accès à la liste: ${expr}`);
    }

    const listName = match[1];
    const index = this.evaluateExpression(match[2]);
    const list = this.variables.get(listName);

    if (Array.isArray(list) && index >= 0 && index < list.length) {
      return list[index];
    } else {
      throw new Error(`Index ${index} invalide pour la liste ${listName}`);
    }
  }

  /**
   * Gérer l'addition
   * @param {string} expr Expression d'addition
   * @returns {number|string} Résultat de l'addition
   */
  handleAddition(expr) {
    const parts = expr.split("+");
    let result = this.evaluateExpression(parts[0].trim());

    for (let i = 1; i < parts.length; i++) {
      const value = this.evaluateExpression(parts[i].trim());

      if (typeof result === "number" && typeof value === "number") {
        result += value;
      } else {
        result = String(result) + String(value);
      }
    }

    return result;
  }

  /**
   * Gérer la soustraction
   * @param {string} expr Expression de soustraction
   * @returns {number} Résultat de la soustraction
   */
  handleSubtraction(expr) {
    const parts = expr.split("-");
    let result = this.evaluateExpression(parts[0].trim());

    for (let i = 1; i < parts.length; i++) {
      const value = this.evaluateExpression(parts[i].trim());
      result -= value;
    }

    return result;
  }

  /**
   * Gérer la multiplication
   * @param {string} expr Expression de multiplication
   * @returns {number} Résultat de la multiplication
   */
  handleMultiplication(expr) {
    const parts = expr.split("*");
    let result = 1;

    for (const part of parts) {
      result *= this.evaluateExpression(part.trim());
    }

    return result;
  }

  /**
   * Gérer la division
   * @param {string} expr Expression de division
   * @returns {number} Résultat de la division
   */
  handleDivision(expr) {
    const parts = expr.split("/");
    let result = this.evaluateExpression(parts[0].trim());

    for (let i = 1; i < parts.length; i++) {
      const value = this.evaluateExpression(parts[i].trim());
      if (value === 0) {
        throw new Error("Division par zéro");
      }
      result /= value;
    }

    return result;
  }

  /**
   * Gérer l'égalité
   * @param {string} expr Expression d'égalité
   * @returns {boolean} Résultat de la comparaison
   */
  handleEquality(expr) {
    const parts = expr.split("=").map((p) => p.trim());
    const left = this.evaluateExpression(parts[0]);
    const right = this.evaluateExpression(parts[1]);

    return left === right;
  }

  /**
   * Appeler une fonction
   * @param {string} expr Expression d'appel de fonction
   * @returns {any} Résultat de l'appel de fonction
   */
  callFunction(expr) {
    const match = expr.match(/(\w+)\((.*)\)/);

    if (!match) {
      throw new Error(`Syntaxe invalide pour l'appel de fonction: ${expr}`);
    }

    const funcName = match[1];
    const argsString = match[2].trim();
    const args = [];

    if (argsString !== "") {
      let start = 0;
      let parenCount = 0;
      let inString = false;

      for (let i = 0; i < argsString.length; i++) {
        const char = argsString[i];

        if (char === '"' && (i === 0 || argsString[i - 1] !== "\\")) {
          inString = !inString;
        } else if (!inString) {
          if (char === "(" || char === "[") {
            parenCount++;
          } else if (char === ")" || char === "]") {
            parenCount--;
          } else if (char === "," && parenCount === 0) {
            args.push(this.evaluateExpression(argsString.substring(start, i)));
            start = i + 1;
          }
        }
      }

      if (start < argsString.length) {
        args.push(this.evaluateExpression(argsString.substring(start)));
      }
    }

    const func = this.functions.get(funcName);

    if (!func) {
      throw new Error(`Fonction ${funcName} non définie`);
    }

    if (func.native) {
      return func.execute(args);
    }

    // Sauvegarder les variables actuelles
    const savedVars = new Map(this.variables);

    // Définir les paramètres
    for (let i = 0; i < func.params.length; i++) {
      this.variables.set(func.params[i], args[i]);
    }

    // Réinitialiser le statut de retour
    this.inReturn = false;
    this.returnValue = undefined;

    // Exécuter le corps de la fonction
    let lineIndex = 0;
    while (lineIndex < func.body.length) {
      lineIndex = this.executeLine(func.body, lineIndex);
      if (this.inReturn) break;
    }

    // Restaurer les variables
    this.variables = savedVars;

    const result = this.returnValue;
    this.inReturn = false;
    this.returnValue = undefined;

    return result;
  }

  /**
   * Convertir une valeur en chaîne pour l'affichage
   * @param {any} value Valeur à convertir
   * @returns {string} Représentation en chaîne
   */
  stringify(value) {
    if (value === null) {
      return "rien";
    } else if (value === true) {
      return "vrai";
    } else if (value === false) {
      return "faux";
    } else if (Array.isArray(value)) {
      return "[" + value.map((v) => this.stringify(v)).join(", ") + "]";
    } else {
      return String(value);
    }
  }
}

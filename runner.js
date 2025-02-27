// runner.js
// Module pour l'exécution du code dans notre langage personnalisé

import { Interpreter } from "./interpreter.js";
import chalk from "chalk";

/**
 * Exécuter le code source
 * @param {string} code Code source à exécuter
 */
export function runCode(code) {
  console.log(chalk.blue("Exécution du programme:"));
  console.log(chalk.gray("-----------------------------------"));

  const interpreter = new Interpreter();

  try {
    const output = interpreter.run(code);

    // Afficher le résultat
    for (const line of output) {
      console.log(chalk.green(line));
    }

    console.log(chalk.gray("-----------------------------------"));
    console.log(chalk.blue("Exécution terminée"));
  } catch (error) {
    console.log(chalk.gray("-----------------------------------"));
    console.log(chalk.red(`Erreur: ${error.message}`));
  }
}

/**
 * Code d'exemple par défaut
 */
export const defaultCode = `
# Initialisation des stocks
variable stock = liste(
    liste("pomme", 10, 0.50),  # Nom, quantité, prix unitaire
    liste("banane", 15, 0.30),
    liste("orange", 8, 1.00)
)
variable panier = liste()  # Panier vide au départ
variable total = 0.0

# Fonction pour trouver un produit dans le stock
fonction trouver_produit(nom_produit)
    pour produit dans stock faire
        si produit[0] = nom_produit alors
            retourner produit
        fin
    fin
    retourner rien  # Si le produit n'est pas trouvé
fin

# Fonction pour ajouter un produit au panier
fonction ajouter_au_panier(nom_produit, quantité)
    variable produit = trouver_produit(nom_produit)
    si produit = rien alors
        afficher "Produit " + nom_produit + " non trouvé."
    sinon si produit[1] >= quantité alors
        ajouter liste(nom_produit, quantité, produit[2]) à panier
        produit[1] = produit[1] - quantité  # Réduit le stock
        afficher quantité + " " + nom_produit + "(s) ajouté(s) au panier."
    sinon
        afficher "Pas assez de stock pour " + nom_produit + "."
    fin
fin

# Fonction pour calculer le total du panier
fonction calculer_total()
    variable somme = 0.0
    pour article dans panier faire
        somme = somme + (article[1] * article[2])  # Quantité * Prix unitaire
    fin
    retourner somme
fin

# Programme principal
afficher "Bienvenue au magasin !"
ajouter_au_panier("pomme", 3)
ajouter_au_panier("banane", 2)
ajouter_au_panier("orange", 10)  # Pas assez en stock

# Afficher le contenu du panier
afficher "Contenu du panier :"
pour article dans panier faire
    afficher article[0] + " x" + article[1] + " à " + article[2] + "€ par unité"
fin

# Calcul et affichage du total
total = calculer_total()
afficher "Total à payer : " + total + "€"

# Afficher le stock restant
afficher "Stock restant :"
pour produit dans stock faire
    afficher produit[0] + " : " + produit[1] + " unité(s)"
fin
`;

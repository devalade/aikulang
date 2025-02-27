# Interpréteur AikuLang

Bienvenue dans le projet **Interpréteur AikuLang**, un outil permettant d'exécuter un langage de programmation simplifié en français appelé "AikuLang". Ce langage est conçu pour enseigner la programmation de manière intuitive aux francophones, avec une syntaxe claire et accessible.

## Description

L'interpréteur est écrit en JavaScript (Node.js) et permet de lire et d'exécuter des fichiers contenant du code AikuLang (extension `.fc`). Il prend en charge les fonctionnalités de base telles que :

- Déclaration de variables (`variable`)
- Affichage (`afficher`)
- Conditions (`si`, `sinon`, `sinon si`, `fin`)
- Boucles (`pour`, `tant que`, `fin`)
- Fonctions (à venir)

## Prérequis

Pour utiliser cet interpréteur, tu as besoin de :

- Node.js (version 14 ou supérieure)
- Un environnement de développement ou un terminal pour exécuter les scripts

## Installation

1. Clone ce dépôt sur ton ordinateur :

   ```bash
   git clone https://github.com/devalade/aikulang.git
   cd interpreteur-aikulang
   ```

2. Installe les dépendances (aucune bibliothèque externe n’est requise pour ce projet, car il utilise uniquement le module `fs` natif de Node.js).

3. Crée un fichier `.fc` (par exemple, `exemple.fc`) avec du code AikuLang, comme dans l'exemple ci-dessous.

## Exemple d'utilisation

### Exemple de fichier AikuLang (`exemple.fc`)

```aikulang
variable nom = "Marie"
variable âge = 20

afficher "Bonjour " + nom

si âge >= 18 alors
    afficher "Tu es majeur !"
sinon
    afficher "Tu es mineur."
fin

pour i de 1 à 3 faire
    afficher "Tour " + i
fin
```

### Exécution

Pour exécuter un fichier AikuLang, utilise la commande suivante dans le terminal :

```bash
node interpreteur.js exemple.aiku
```

Cela produira une sortie comme :

```
Bonjour Marie
Tu es majeur !
Tour 1
Tour 2
Tour 3
```

## Structure du projet

- `interpreteur.js` : Le fichier principal contenant l'interpréteur JavaScript.
- `exemple.fc` : Un exemple de fichier AikuLang pour tester l'interpréteur.
- `README.md` : Ce fichier, qui documente le projet.

## Contribution

Si tu veux contribuer à ce projet, n'hésite pas à :

- Signaler des bugs ou proposer des améliorations via les _Issues_ sur GitHub.
- Soumettre des _Pull Requests_ pour ajouter de nouvelles fonctionnalités (par exemple, la prise en charge des fonctions ou une meilleure gestion des erreurs).

## Licence

Ce projet est sous licence [MIT] (ou une autre licence de ton choix). Voir le fichier `LICENSE` pour plus de détails (si tu en crées un).

## Contact

Pour toute question, contacte-moi via [ton email] ou ouvre une _Issue_ sur ce dépôt GitHub.

---

Merci d'utiliser et de contribuer à AikuLang ! 🚀

---

```

```

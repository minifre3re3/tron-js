# 🎮 Tron — Jeu en JavaScript

Un jeu Tron multijoueur local développé en JavaScript vanilla avec HTML5 Canvas.

## 👥 Auteurs

- **BERRAI Rayane**

*Projet Programmation Web — 2025*

---

## 🕹️ Règles du jeu

- Chaque joueur contrôle un « ruban lumineux » qui laisse une trace derrière lui.
- Si un joueur touche un mur ou un ruban (le sien ou celui de l'adversaire), il perd la manche.
- Le premier à **3 manches gagnantes** remporte la partie.

---

## ⌨️ Touches par défaut

| Action        | Joueur 1 (Bleu) | Joueur 2 (Rouge) |
|---------------|-----------------|------------------|
| Gauche        | `Q`             | `O`              |
| Droite        | `D`             | `;`              |
| Haut          | `Z`             | `M`              |
| Bas           | `W`             | `K`              |
| **Saut**      | `Espace`        | `Entrée`         |

> 💡 Les touches sont **personnalisables** via le bouton « Configurer les touches ».

---

## ✨ Fonctionnalités

- 🎨 Affichage Canvas avec fond noir style Tron
- 🏆 Système de score (premier à 3 manches)
- 🦘 **Saut** : chaque joueur peut sauter par-dessus un obstacle une fois par manche
- ⚙️ Configuration des touches en jeu
- 🔄 Réinitialisation des scores

---

## 🚀 Lancement

Ouvrir simplement `main.html` dans un navigateur moderne (Chrome, Firefox, Edge…).

```
tron-js/
├── main.html   # Structure de la page
├── main.js     # Logique du jeu (classes Joueur, Jeu, GestionEntrees)
└── style.css   # Styles (thème sombre Tron)
```

Aucune dépendance externe requise.

const TAILLE_CELLULE = 10;
const COLONNES = 80;
const LIGNES = 59;
const LARGEUR = COLONNES * TAILLE_CELLULE;
const HAUTEUR = LIGNES * TAILLE_CELLULE;
const DUREE_TICK = 100; 

const DIRECTIONS = {
  GAUCHE: {x: -1, y: 0},
  DROITE: {x: 1, y: 0},
  HAUT:   {x: 0, y: -1},
  BAS:    {x: 0, y: 1}
};

class Joueur {
  constructor(nom, couleur, departX, departY, departDir) {
    this.nom = nom;
    this.couleur = couleur;
    this.initX = departX;
    this.initY = departY;
    this.initDir = departDir;
    
    this.reinitialiser();
    this.score = 0;
  }

  reinitialiser() {
    this.x = this.initX; 
    this.y = this.initY; 
    this.direction = this.initDir;
    this.fileAttente = [];
    this.trace = []; 
    this.enVie = true;
    this.sautDisponible = true; // [cite: 23]
    this._demandeSaut = false;
  }

  ajouterDirection(d) {
    const lastDir = this.fileAttente.length > 0 ? this.fileAttente[this.fileAttente.length-1] : this.direction;
    
    if (d.x === -lastDir.x && d.y === -lastDir.y) return;
    
    this.fileAttente.push(d);
  }

  prochaineDirection() {
    if (this.fileAttente.length === 0) return this.direction;
    this.direction = this.fileAttente.shift();
    return this.direction;
  }

  bouger(nouvelleX, nouvelleY, estSaut) {
    this.trace.push({x: this.x, y: this.y});
    
    if (estSaut) {
        const midX = (this.x + nouvelleX) / 2;
        const midY = (this.y + nouvelleY) / 2;
        this.trace.push({x: midX, y: midY});
        this.sautDisponible = false;
        this.sautDisponible = false; 
    }

    this.x = nouvelleX; 
    this.y = nouvelleY;
  }
}

class Jeu {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.grille = Array.from({length: COLONNES}, () => Array.from({length: LIGNES}, () => null));
    this.joueurs = [];
    this.enCours = false;
    this.idIntervalle = null;
    this.manchesPourGagner = 3; // [cite: 25]
    this.finDeMancheCallback = null;
  }

  ajouterJoueur(p) { this.joueurs.push(p); }

  reinitialiserGrille() {
    for(let i=0; i<COLONNES; i++) {
      for(let j=0; j<LIGNES; j++) {
        this.grille[i][j] = null;
      }
    }
  }

  demarrerManche() {
    this.reinitialiserGrille();
    this.joueurs.forEach(p => {
        p.reinitialiser();
        this.occuper(p.x, p.y, p);
    });
    
    this.enCours = true;
    this.dessiner();
  }

  dansLesLimites(x, y) {
    return x >= 0 && x < COLONNES && y >= 0 && y < LIGNES;
  }

  estCollision(x, y) {
    if (!this.dansLesLimites(x, y)) return true;
    return this.grille[x][y] !== null;
  }

  occuper(x, y, joueur) {
    if (this.dansLesLimites(x, y)) this.grille[x][y] = joueur;
  }

  boucle() {
    for (const p of this.joueurs) {
      if (!p.enVie) continue;

      const dir = p.prochaineDirection();
      const nextX = p.x + dir.x;
      const nextY = p.y + dir.y;

      let aBouge = false;

      if (p._demandeSaut && p.sautDisponible) {
        const landingX = nextX + dir.x;
        const landingY = nextY + dir.y;
        
        if (!this.estCollision(landingX, landingY)) {
          p.bouger(landingX, landingY, true);
          this.occuper(p.x, p.y, p); 
          this.occuper(nextX, nextY, p); 
          aBouge = true;
        }
        p._demandeSaut = false; 
      }

      if (!aBouge) {
        if (this.estCollision(nextX, nextY)) {
           p.enVie = false; 
           p.bouger(nextX, nextY, false);
           this.occuper(p.x, p.y, p);
        }
      }
    }

    const survivants = this.joueurs.filter(p => p.enVie);
    
    if (survivants.length < this.joueurs.length) {
      if (survivants.length <= 1) {
          
          let gagnant = null;
          if (survivants.length === 1) {
            gagnant = survivants[0];
            gagnant.score += 1;
          }

          this.enCours = false;
          if (typeof this.finDeMancheCallback === 'function') {
            this.finDeMancheCallback(gagnant ? gagnant.nom : null);
          }
      }
    }
    this.dessiner();
  }

  dessiner() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, LARGEUR, HAUTEUR);

    for (const p of this.joueurs) {
      ctx.fillStyle = p.couleur;
      p.trace.forEach(t => {
        ctx.fillRect(t.x * TAILLE_CELLULE, t.y * TAILLE_CELLULE, TAILLE_CELLULE, TAILLE_CELLULE);
      });

      const cx = p.x * TAILLE_CELLULE + TAILLE_CELLULE / 2;
      const cy = p.y * TAILLE_CELLULE + TAILLE_CELLULE / 2;
      
      let startAngle = 0;
      if (p.direction === DIRECTIONS.DROITE) startAngle = -Math.PI/2;
      else if (p.direction === DIRECTIONS.GAUCHE) startAngle = Math.PI/2;
      else if (p.direction === DIRECTIONS.HAUT) startAngle = Math.PI;
      else if (p.direction === DIRECTIONS.BAS) startAngle = 0;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, TAILLE_CELLULE/2, startAngle, startAngle + Math.PI);
      ctx.fillStyle = p.couleur;
      ctx.fill();
    }
  }
}

class GestionEntrees {
  constructor(j1, j2) {
    this.j1 = j1; 
    this.j2 = j2;
    this.mapTouches = {
      p1_left:'q', p1_down:'w', p1_right:'d', p1_up:'z', p1_jump:' ', // Space
      p2_left:'o', p2_down:'k', p2_right:';', p2_up:'m', p2_jump:'Enter'
    };
    this.ecouter();
  }

  definirMap(map) { Object.assign(this.mapTouches, map); }

  ecouter() {
    window.addEventListener('keydown', (ev) => {
      const k = ev.key.toLowerCase(); 
      const keyName = ev.key; 

      const m = this.mapTouches;
      
      const match = (mapped, eventKey) => mapped.toLowerCase() === eventKey.toLowerCase();

      if (match(m.p1_left, keyName)) { this.j1.ajouterDirection(DIRECTIONS.GAUCHE); ev.preventDefault(); }
      if (match(m.p1_right, keyName)){ this.j1.ajouterDirection(DIRECTIONS.DROITE); ev.preventDefault(); }
      if (match(m.p1_up, keyName))   { this.j1.ajouterDirection(DIRECTIONS.HAUT);   ev.preventDefault(); }
      if (match(m.p1_down, keyName)) { this.j1.ajouterDirection(DIRECTIONS.BAS);    ev.preventDefault(); }
      if (match(m.p1_jump, keyName) || (m.p1_jump === ' ' && ev.code === 'Space')) { 
          this.j1._demandeSaut = true; ev.preventDefault(); 
      }
      
      if (match(m.p2_left, keyName)) { this.j2.ajouterDirection(DIRECTIONS.GAUCHE); ev.preventDefault(); }
      if (match(m.p2_right, keyName)){ this.j2.ajouterDirection(DIRECTIONS.DROITE); ev.preventDefault(); }
      if (match(m.p2_up, keyName))   { this.j2.ajouterDirection(DIRECTIONS.HAUT);   ev.preventDefault(); }
      if (match(m.p2_down, keyName)) { this.j2.ajouterDirection(DIRECTIONS.BAS);    ev.preventDefault(); }
      if (match(m.p2_jump, keyName) || (m.p2_jump === 'Enter' && ev.code === 'Enter')) { 
          this.j2._demandeSaut = true; ev.preventDefault(); 
      }

    }, {passive: false});
  }
}

const canvas = document.getElementById('gameCanvas');
const jeu = new Jeu(canvas);

const p1 = new Joueur('Bleu', '#0000FF', 1, 28, DIRECTIONS.DROITE);
const p2 = new Joueur('Rouge', '#FF0000', 1, 30, DIRECTIONS.DROITE);

jeu.ajouterJoueur(p1); 
jeu.ajouterJoueur(p2);

const inputs = new GestionEntrees(p1, p2);

const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const btnStart = document.getElementById('btnStart');
const btnConfig = document.getElementById('btnConfig');
const btnReset = document.getElementById('btnReset');
const message = document.getElementById('message');
const dialog = document.getElementById('configDialog');

function majScores() { 
  score1.textContent = `Bleu: ${p1.score}`; 
  score2.textContent = `Rouge: ${p2.score}`; 
}

jeu.finDeMancheCallback = (nomGagnant) => {
  let msg = nomGagnant ? `Manche terminée — Gagnant: ${nomGagnant}.` : 'Manche terminée — Égalité.';
  message.textContent = msg;
  majScores();
  
  if (p1.score >= jeu.manchesPourGagner || p2.score >= jeu.manchesPourGagner) {
    const champion = p1.score > p2.score ? p1.nom : (p2.score > p1.score ? p2.nom : 'Aucun');
    message.textContent = `PARTIE TERMINÉE — Vainqueur: ${champion}.`;
    btnStart.disabled = false; // Réactiver bouton [cite: 28]
    clearInterval(jeu.idIntervalle);
  } else {
    setTimeout(() => jeu.demarrerManche(), 1000);
  }
};

btnStart.addEventListener('click', () => {
  p1.score = 0; p2.score = 0; majScores();
  btnStart.disabled = true; // Désactiver pendant partie [cite: 28]
  jeu.demarrerManche();
  
  if (jeu.idIntervalle) clearInterval(jeu.idIntervalle);
  jeu.idIntervalle = setInterval(() => { 
    if (jeu.enCours) jeu.boucle(); 
  }, DUREE_TICK);
});

btnReset.addEventListener('click', () => {
  p1.score = 0; p2.score = 0; majScores();
  message.textContent = 'Scores réinitialisés.';
});

btnConfig.addEventListener('click', () => {
  const m = inputs.mapTouches;
  const ids = ['p1_left','p1_down','p1_right','p1_up','p1_jump','p2_left','p2_down','p2_right','p2_up','p2_jump'];
  ids.forEach(id => document.getElementById(id).value = m[id]);
  dialog.showModal();
});

document.getElementById('saveConfig').addEventListener('click', (ev) => {
  ev.preventDefault();
  const getVal = (id) => document.getElementById(id).value;
  const newMap = {};
  ['p1_left','p1_down','p1_right','p1_up','p1_jump','p2_left','p2_down','p2_right','p2_up','p2_jump'].forEach(k => {
      const val = getVal(k);
      if(val) newMap[k] = val;
  });
  inputs.definirMap(newMap);
  dialog.close();
});

document.getElementById('cancelConfig').addEventListener('click', (ev) => {
  ev.preventDefault();
  dialog.close();
});
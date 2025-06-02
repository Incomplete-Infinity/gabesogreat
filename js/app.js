// js/app.js

class Card {
  constructor() {
    this.cards = document.querySelectorAll('.card-item');
  }

  showCategory(category) {
    this.cards.forEach(card => {
      if (card.dataset.category === category) {
        card.style.display = 'block';
        card.style.zIndex = 2;
      } else {
        card.style.display = 'none';
        card.style.zIndex = 1;
      }
    });
  }

  flip(category) {
    const card = Array.from(this.cards).find(c => c.dataset.category === category);
    if (!card) return;
    const inner = card.querySelector('.card-inner');
    inner.classList.toggle('flipped');
  }
}

class JokeManager {
  constructor() {
    this.maxJokes = 5;
    this.activeJokes = []; // {id, el, bbox}
    this.jokeApi = 'https://api.chucknorris.io/jokes/random';
  }

  async spawnJoke() {
    if (this.activeJokes.length >= this.maxJokes) return;

    // Fetch random joke
    let response, data;
    try {
      response = await fetch(this.jokeApi);
      data = await response.json();
    } catch (e) {
      return;
    }
    let text = data.value.replace(/Chuck Norris/gi, 'Gabe');
    const id = data.id;

    // Ensure uniqueness
    if (this.activeJokes.some(j => j.id === id)) return;

    const blurb = document.createElement('div');
    blurb.className = 'blurb topcoat-card';
    blurb.textContent = text;
    document.body.appendChild(blurb);

    // Positioning
    const bbox = blurb.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const edgeMargin = 50;
    const centerMargin = Math.max(bbox.width, bbox.height) + 150;
    let x, y;
    let tries = 0;
    do {
      x = edgeMargin + Math.random() * (vw - 2 * edgeMargin - bbox.width);
      y = edgeMargin + Math.random() * (vh - 2 * edgeMargin - bbox.height);
      if (x < 10) x = 10;
      if (x > vw - bbox.width - 10) x = vw - bbox.width - 10;
      if (y < 10) y = 10;
      if (y > vh - bbox.height - 10) y = vh - bbox.height - 10;
      const centerX = vw / 2 - bbox.width / 2;
      const centerY = vh / 2 - bbox.height / 2;
      const overlapsCenter = Math.abs(x - centerX) < centerMargin && Math.abs(y - centerY) < centerMargin;
      const overlapsAny = this.activeJokes.some(j => {
        const b = j.bbox;
        return !(x + bbox.width < b.left || x > b.right || y + bbox.height < b.top || y > b.bottom);
      });
      if (!overlapsCenter && !overlapsAny) break;
      tries++;
    } while (tries < 10);

    blurb.style.left = `${x}px`;
    blurb.style.top = `${y}px`;

    const finalBbox = blurb.getBoundingClientRect();
    this.activeJokes.push({ id, el: blurb, bbox: finalBbox });

    // Remove after random lifetime
    const life = 30000 + Math.random() * 15000;
    const fadeDuration = 2000;
    setTimeout(() => {
      blurb.style.transition = `opacity ${fadeDuration}ms`;
      blurb.style.opacity = '0';
      setTimeout(() => {
        blurb.remove();
        this.activeJokes = this.activeJokes.filter(j => j.el !== blurb);
        setTimeout(() => this.spawnJoke(), 2000 + Math.random() * 3000);
      }, fadeDuration);
    }, life);
  }

  start() {
    for (let i = 0; i < this.maxJokes; i++) {
      setTimeout(() => this.spawnJoke(), Math.random() * 2000);
    }
  }
}

let cardManager;
let jokeManager;
document.addEventListener('DOMContentLoaded', () => {
  cardManager = new Card();
  cardManager.showCategory('default');

  jokeManager = new JokeManager();
  jokeManager.start();
});

function selectCategory(input) {
  const category = input.value;
  cardManager.showCategory(category);
  setTimeout(() => {
    cardManager.flip(category);
  }, 100);
}

// app.js

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const previewBtn = document.getElementById('preview-btn');
  const questionCard = document.getElementById('question-card');
  const questionInput = document.getElementById('question-input');
  const questionSubmit = document.getElementById('question-submit');

  const envelopeArea = document.getElementById('envelope-area');
  const envelopeLock = document.getElementById('envelope-lock');
  const envelopeKeyInput = document.getElementById('envelope-key-input');
  const envelopeUnlockBtn = document.getElementById('envelope-unlock-btn');
  const openEnvelope = document.getElementById('open-envelope');

  const letterArea = document.getElementById('letter-area');
  const nicknameSpan = document.getElementById('nickname');
  const pages = Array.from(document.querySelectorAll('.page'));
  const steps = Array.from(document.querySelectorAll('.step'));
  const backMain = document.getElementById('back-to-main');

  // normalized check helper
  const normalize = s => (s||'').trim().toLowerCase().replace(/\s+/g,' ');

  // Accepted answers for initial question (existing) and accepted unlock names
  const accepted = ['mera payara baita','mera payara beta','mera pyara baita','mera pyara beta'];
  const acceptedNames = ['mera bagrbilla','my sweet honey','meri jawn'];

  // Start shows question card
  startBtn.addEventListener('click', () => {
    questionCard.classList.remove('hidden','shake','success');
    requestAnimationFrame(()=> questionCard.classList.add('show'));
    setTimeout(()=>{ questionInput.focus(); }, 260);
  });

  previewBtn && previewBtn.addEventListener('click', () => {
    const hero = document.querySelector('.hero');
    hero.classList.add('hidden');
    envelopeArea.classList.remove('hidden');
    setTimeout(()=>{ envelopeArea.classList.add('hidden'); hero.classList.remove('hidden'); }, 1100);
  });

  function showEnvelopeFromQuestion(){
    questionCard.classList.remove('show');
    questionCard.classList.add('success');
    setTimeout(()=> {
      questionCard.classList.add('hidden');
      // show envelope with lock active and Open disabled
      envelopeArea.classList.remove('hidden');
      openEnvelope.disabled = true;
      // reset lock UI
      envelopeLock.classList.remove('unlocked','shake');
      envelopeKeyInput.value = '';
      envelopeKeyInput.focus();
      // small envelope pop
      const env = envelopeArea.querySelector('.envelope-outer');
      if(env) env.style.transform = 'translateY(-6px) scale(1.02)';
      setTimeout(()=>{ if(env) env.style.transform = ''; }, 300);
    }, 420);
  }

  // question submit logic (unchanged acceptance)
  questionSubmit.addEventListener('click', () => {
    const val = normalize(questionInput.value);
    if (accepted.includes(val)) {
      showEnvelopeFromQuestion();
    } else {
      questionCard.classList.remove('show');
      questionCard.classList.add('shake');
      setTimeout(()=> {
        questionCard.classList.remove('shake');
        requestAnimationFrame(()=> questionCard.classList.add('show'));
      }, 600);
    }
  });
  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); questionSubmit.click(); }
  });

  // envelope unlock logic: check acceptedNames
  envelopeUnlockBtn.addEventListener('click', () => {
    const key = normalize(envelopeKeyInput.value);
    if (acceptedNames.includes(key)) {
      // success: mark unlocked, enable open button
      envelopeLock.classList.add('unlocked');
      envelopeLock.classList.remove('shake');
      openEnvelope.disabled = false;
      envelopeUnlockBtn.textContent = 'Unlocked ✅';
      envelopeUnlockBtn.disabled = true;
      envelopeKeyInput.disabled = true;
    } else {
      // wrong: shake and clear input slightly
      envelopeLock.classList.remove('unlocked');
      envelopeLock.classList.add('shake');
      setTimeout(()=> envelopeLock.classList.remove('shake'), 520);
      // brief highlight
      envelopeKeyInput.style.transform = 'translateX(-6px)';
      setTimeout(()=> envelopeKeyInput.style.transform = '',120);
    }
  });

  envelopeKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); envelopeUnlockBtn.click(); }
  });

  // envelope open — unchanged, but only enabled after unlock
  openEnvelope && openEnvelope.addEventListener('click', () => {
    if (openEnvelope.disabled) return;
    const env = envelopeArea.querySelector('.envelope-outer');
    if(env) env.classList.add('opening');
    openEnvelope.disabled = true;
    setTimeout(() => {
      if(env) env.classList.remove('opening');
      envelopeArea.classList.add('hidden');
      letterArea.classList.remove('hidden');
      goToPage(1);
    }, 700);
  });

  // remove nickname-modal logic; instead maintain a pool of names that will be revealed one-by-one
  let availableNames = [
    'Meri shazadi',
    'Meri jawn',
    'My sukoon',
    'Meri Bagrbilli'
  ];

  function getNextName(){
    return availableNames.length ? availableNames.shift() : null;
  }

  // attachRevealHandler now uses the next name from availableNames
  function attachRevealHandler(target){
    const revealBtn = target && target.querySelector('.reveal-page');
    const nextBtn = target && target.querySelector('.next');
    if (!revealBtn) return;
    revealBtn.disabled = false; // user can click to reveal the next available name

    revealBtn.onclick = (e) => {
      const name = getNextName();
      if (!name) {
        revealBtn.disabled = true;
        revealBtn.textContent = 'No names left';
        return;
      }

      Array.from(target.querySelectorAll('.nick-placeholder')).forEach(el => {
        el.textContent = name;
        el.classList.add('revealed');
      });

      if (nextBtn) nextBtn.disabled = false;
      revealBtn.disabled = true;
      revealBtn.textContent = 'Revealed';
      // mark step active visually
      const pageIndex = Number(target.dataset.page);
      const step = document.querySelectorAll('.step')[pageIndex - 1];
      if (step) step.classList.add('active');
    };

    // ensure next is disabled until reveal
    if (nextBtn) nextBtn.disabled = true;
  }

  // modify goToPage to call attachRevealHandler for the target page
  function goToPage(n){
    pages.forEach(p => {
      p.classList.remove('active','emerge');
      Array.from(p.querySelectorAll('.nick-placeholder')).forEach(el => el.classList.remove('revealed'));
    });
    steps.forEach(s => s.classList.remove('active'));
    const target = pages.find(p => Number(p.dataset.page) === n);
    const step = steps[n - 1];
    if (target) {
      target.classList.add('active');
      requestAnimationFrame(() => {
        target.classList.add('emerge');
        const cleanup = () => target.classList.remove('emerge');
        target.addEventListener('animationend', cleanup, {once:true});
      });
    }
    if (step) step.classList.add('active');

    // attach new reveal handler
    if (target) attachRevealHandler(target);

    const prevBtn = target && target.querySelector('.prev');
    const nextBtn = target && target.querySelector('.next');

    if (prevBtn) prevBtn.onclick = () => {
      const prevIndex = Math.max(1, n - 1);
      goToPage(prevIndex);
    };
    if (nextBtn) nextBtn.onclick = () => {
      const nextIndex = Math.min(4, n + 1);
      goToPage(nextIndex);
    };
  }

  backMain && backMain.addEventListener('click', () => {
    letterArea.classList.add('hidden');
    envelopeArea.classList.add('hidden');
    document.querySelector('.hero').classList.remove('hidden');
  });

  // Celebration: emoji burst + thank you modal on final button click
  const celebrationModal = document.getElementById('celebration-modal');
  const particlesContainer = celebrationModal && celebrationModal.querySelector('.particles');

  function launchCelebration() {
    if (!celebrationModal || !particlesContainer) return;
    celebrationModal.classList.remove('hidden');
    celebrationModal.classList.remove('hiding');
    celebrationModal.setAttribute('aria-hidden','false');

    // create particles
    const emojis = ['🌸','💐','💖','😘','💞','🌹','💋'];
    const count = 28;
    for (let i=0;i<count;i++){
      const p = document.createElement('span');
      p.className = 'particle';
      p.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 160;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - (Math.random()*20);
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.animationDelay = (Math.random() * 220) + 'ms';
      p.style.fontSize = (16 + Math.random()*18) + 'px';
      particlesContainer.appendChild(p);
    }

    // increase display time: keep modal visible longer before hiding
    // hide start after 5000ms (5s)
    setTimeout(()=> {
      celebrationModal.classList.add('hiding');
    }, 5000);

    // cleanup and fully hide after 7000ms (7s)
    setTimeout(()=> {
      particlesContainer.innerHTML = '';
      celebrationModal.classList.add('hidden');
      celebrationModal.classList.remove('hiding');
      celebrationModal.setAttribute('aria-hidden','true');
    }, 7000);
  }

  // attach to final button(s)
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;
    // match .final anchor/button inside last page
    if (target.matches('.final') || target.closest('.final')) {
      e.preventDefault();
      launchCelebration();
    }
  });
});
// Progressive enhancement only: every page is complete and usable without this script.
(() => {
  'use strict';

  // Walkthroughs stay a still poster on the page. Play opens the GIF in a theater that fills the screen.
  // The theater uses the Fullscreen API when it can, and otherwise fills the browser window.
  const triggers = [...document.querySelectorAll('.player-toggle')];
  if (triggers.length) {
    const theater = document.createElement('dialog');
    theater.className = 'theater';
    theater.setAttribute('aria-labelledby', 'theater-title');
    theater.innerHTML = `<div class="theater-frame">
<div class="theater-bar">
<p class="theater-title"><span class="tag">Illustrative</span> <span id="theater-title"></span></p>
<div class="theater-actions">
<a data-theater-transcript href="#">Transcript</a>
<button type="button" data-theater-play></button>
<button type="button" data-theater-close aria-keyshortcuts="Escape">Exit full screen <kbd aria-hidden="true">Esc</kbd></button>
</div>
<p class="theater-hint">Turn your phone sideways for a bigger picture.</p>
</div>
<div class="theater-stage"><img alt="" width="1280" height="720"></div>
</div>`;
    document.body.append(theater);

    const frame = theater.querySelector('.theater-frame');
    const title = theater.querySelector('#theater-title');
    const stage = theater.querySelector('.theater-stage img');
    const transcript = theater.querySelector('[data-theater-transcript]');
    const play = theater.querySelector('[data-theater-play]');
    const close = theater.querySelector('[data-theater-close]');
    const portraitPhone = matchMedia('(orientation: portrait) and (max-width: 767px)');
    let current = null;

    const show = (playing) => {
      stage.src = playing ? current.img.dataset.gif : current.img.dataset.poster;
      stage.dataset.playing = String(playing);
      play.textContent = playing ? 'Stop' : 'Play again';
    };

    const open = (trigger, img) => {
      current = { trigger, img };
      title.textContent = trigger.dataset.label;
      stage.alt = img.alt;
      transcript.href = trigger.dataset.transcript;
      show(true);
      document.documentElement.classList.add('theater-open');
      theater.showModal();
      close.focus();
      // A dialog cannot go full screen itself, so the frame inside it does.
      if (document.fullscreenEnabled && frame.requestFullscreen) {
        frame.requestFullscreen({ navigationUI: 'hide' })
          .then(() => {
            if (!theater.open) return document.exitFullscreen().catch(() => {});
            // A 16:9 walkthrough is far bigger sideways. Browsers allow this lock only in full screen, and many not at all.
            if (portraitPhone.matches) screen.orientation?.lock?.('landscape').catch(() => {});
          })
          .catch(() => {});
      }
    };

    const shut = () => {
      if (theater.open) theater.close();
    };

    theater.addEventListener('close', () => {
      document.documentElement.classList.remove('theater-open');
      stage.removeAttribute('src');
      const trigger = current?.trigger;
      current = null;
      try { screen.orientation?.unlock?.(); } catch { /* Unsupported, or never locked. */ }
      // While the frame is full screen the rest of the page is inert, so focus can only return once full screen ends.
      if (document.fullscreenElement) {
        document.addEventListener('fullscreenchange', () => trigger?.focus(), { once: true });
        document.exitFullscreen().catch(() => trigger?.focus());
      } else {
        trigger?.focus();
      }
    });
    // In real full screen the browser takes Esc to leave full screen, so leaving full screen closes the theater too.
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && theater.open) theater.close();
    });
    close.addEventListener('click', shut);
    play.addEventListener('click', () => show(stage.dataset.playing !== 'true'));

    for (const trigger of triggers) {
      const img = trigger.closest('.player').querySelector('.player-media img');
      trigger.hidden = false;
      trigger.addEventListener('click', () => open(trigger, img));
      img.classList.add('is-playable');
      img.addEventListener('click', () => open(trigger, img));
    }
  }

  // Copy buttons on code blocks.
  if (navigator.clipboard) {
    for (const pre of document.querySelectorAll('main pre')) {
      const block = document.createElement('div');
      block.className = 'code-block';
      pre.replaceWith(block);
      block.append(pre);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy';
      button.textContent = 'Copy';
      button.setAttribute('aria-live', 'polite');
      button.setAttribute('aria-label', 'Copy this command or code block');
      block.append(button);
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ''));
          button.textContent = 'Copied';
        } catch {
          button.textContent = 'Copy failed';
          button.title = 'Select the command text and copy it manually.';
        }
        setTimeout(() => { button.textContent = 'Copy'; }, 2000);
      });
    }
  }
})();

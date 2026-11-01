// Command Studio UI. Classic script (no modules) so it works from file://.
(function () {
  'use strict';

  const DATA = globalThis.STUDIO_DATA;
  const Core = globalThis.StudioCore;
  if (!DATA || !Core) {
    document.body.insertAdjacentHTML('afterbegin', '<p class="banner">Studio data is missing. Run npm run build:studio.</p>');
    return;
  }

  const COMMANDS = Core.allCommands(DATA);
  const SCENES = DATA.scenes;
  const MISSIONS = DATA.missions;
  const MODES = ['watch', 'try', 'mission', 'commands'];
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (id) => document.getElementById(id);

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null || value === false) continue;
        if (key === 'text') node.textContent = value;
        else if (key === 'className') node.className = value;
        else if (key === 'dataset') Object.assign(node.dataset, value);
        else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value === true ? '' : value);
      }
    }
    for (const child of [].concat(children || [])) {
      if (child === null || child === undefined || child === false) continue;
      node.append(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function mechanismTitle(id) {
    const mechanism = DATA.registry.mechanisms.find((item) => item.id === id);
    return mechanism ? mechanism.title : id;
  }

  function safeLink(url, text) {
    if (!/^https:\/\//.test(String(url || ''))) return el('span', { text });
    return el('a', { href: url, target: '_blank', rel: 'noopener noreferrer', text });
  }

  // ---------- Tabs ----------
  let mode = 'watch';

  function setMode(next, focusTab) {
    if (!MODES.includes(next)) return;
    mode = next;
    for (const name of MODES) {
      const tab = $(`tab-${name}`);
      const selected = name === next;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      $(`view-${name}`).hidden = !selected;
    }
    if (next !== 'watch') pause();
    if (focusTab) $(`tab-${next}`).focus();
    const hash = next === 'watch' ? `#watch/${watch.scene.id}` : `#${next}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
    tab.addEventListener('keydown', (event) => {
      const index = MODES.indexOf(tab.dataset.mode);
      let target = null;
      if (event.key === 'ArrowRight') target = MODES[(index + 1) % MODES.length];
      if (event.key === 'ArrowLeft') target = MODES[(index - 1 + MODES.length) % MODES.length];
      if (event.key === 'Home') target = MODES[0];
      if (event.key === 'End') target = MODES[MODES.length - 1];
      if (target) { event.preventDefault(); setMode(target, true); }
    });
  });

  document.addEventListener('keydown', (event) => {
    const tag = (event.target && event.target.tagName) || '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.ctrlKey || event.metaKey || event.altKey) return;
    const index = ['1', '2', '3', '4'].indexOf(event.key);
    if (index >= 0) { event.preventDefault(); setMode(MODES[index], true); }
  });

  // ---------- Watch ----------
  const watch = { scene: SCENES[0], step: 0, fraction: 1, playing: false, raf: 0, started: 0 };
  const STEP_MS = 5200;

  function renderCode(code) {
    const pre = $('code');
    pre.replaceChildren();
    for (const line of String(code || '').split('\n')) {
      pre.append(el('span', { className: `ln ${Core.codeLineKind(line)}`, text: line || ' ' }));
    }
  }

  function renderTerminal(text) {
    const pre = $('terminal');
    pre.replaceChildren();
    if (!text) return;
    for (const line of text.split('\n')) {
      let cls = '';
      if (/^(ok\b|# pass\s+[1-9]|PASS\b|\u2714)/.test(line) || /^# fail 0$/.test(line)) cls = 'pass';
      if (/^(not ok\b|# fail\s+[1-9]|FAIL\b|\u2716)/.test(line)) cls = 'fail';
      pre.append(el('span', { className: cls, text: line }), '\n');
    }
  }

  function renderStage(sceneId, index, fraction) {
    const scene = SCENES.find((item) => item.id === sceneId);
    if (!scene) throw new Error(`Unknown scene: ${sceneId}`);
    const state = Core.stepState(scene, index, fraction);
    const step = state.step;
    watch.scene = scene;
    watch.step = index;
    watch.fraction = Core.clamp(fraction);

    $('stage').dataset.tone = step.tone;
    const chip = $('stage-mechanism');
    chip.className = `chip mech-${scene.mechanism}`;
    chip.textContent = mechanismTitle(scene.mechanism);
    $('stage-title').textContent = scene.title;
    $('stage-step').textContent = `Step ${index + 1}/${state.total} - ${step.phase}`;
    $('stage-tone').textContent = step.tone === 'slop' ? 'slop' : step.tone === 'command' ? 'command' : 'evidence';
    $('stage-heading-text').textContent = step.heading;
    $('stage-file').textContent = step.file;
    renderCode(step.code);

    const typedPrompt = Core.splitCommand(state.prompt);
    $('prompt-cmd').textContent = typedPrompt.command;
    $('prompt-rest').textContent = typedPrompt.rest;
    $('response').textContent = state.response;
    $('response-wrap').classList.toggle('empty', !state.response);
    renderTerminal(state.terminal);

    const dots = $('stage-dots');
    dots.replaceChildren(...scene.steps.map((_, i) => el('i', { className: i <= index ? 'on' : '' })));
    $('takeaway').textContent = scene.takeaway;

    document.querySelectorAll('#scene-picker button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.scene === scene.id));
    });
    $('step-prev').disabled = index === 0;
    $('step-next').disabled = index === state.total - 1;
    $('watch-status').textContent = `${scene.title}: step ${index + 1} of ${state.total}`;
    return state;
  }

  function overflowReport() {
    const ids = ['code', 'response', 'terminal', 'stage-title', 'takeaway'];
    const clipped = [];
    for (const id of ids) {
      const node = $(id);
      if (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1) clipped.push(id);
    }
    const stage = $('stage');
    if (stage.scrollHeight > stage.clientHeight + 1) clipped.push('stage');
    return clipped;
  }

  function tick(now) {
    if (!watch.playing) return;
    const elapsed = now - watch.started;
    const fraction = Math.min(1, elapsed / STEP_MS);
    renderStage(watch.scene.id, watch.step, fraction);
    if (fraction >= 1) {
      if (watch.step < watch.scene.steps.length - 1) {
        watch.step += 1;
        watch.started = now + 900;
        renderStage(watch.scene.id, watch.step, 0);
      } else {
        pause();
        return;
      }
    }
    watch.raf = requestAnimationFrame(tick);
  }

  function play() {
    if (reducedMotion) {
      renderStage(watch.scene.id, watch.step, 1);
      $('watch-status').textContent = 'Reduced motion is on: use Next step to advance.';
      return;
    }
    if (watch.step === watch.scene.steps.length - 1 && watch.fraction >= 1) watch.step = 0;
    watch.playing = true;
    watch.started = performance.now();
    $('play').textContent = 'Pause';
    $('play').setAttribute('aria-pressed', 'true');
    watch.raf = requestAnimationFrame(tick);
  }

  function pause() {
    watch.playing = false;
    cancelAnimationFrame(watch.raf);
    $('play').textContent = 'Play';
    $('play').setAttribute('aria-pressed', 'false');
  }

  function selectScene(id) {
    pause();
    renderStage(id, 0, 1);
    if (mode === 'watch') history.replaceState(null, '', `#watch/${id}`);
  }

  $('scene-picker').append(...SCENES.map((scene) => el('button', {
    type: 'button', dataset: { scene: scene.id }, 'aria-pressed': 'false', onclick: () => selectScene(scene.id),
  }, [el('span', { className: `chip mech-${scene.mechanism}`, text: mechanismTitle(scene.mechanism) }), ` ${scene.title}`])));

  $('play').addEventListener('click', () => (watch.playing ? pause() : play()));
  $('step-prev').addEventListener('click', () => { pause(); renderStage(watch.scene.id, Math.max(0, watch.step - 1), 1); });
  $('step-next').addEventListener('click', () => {
    pause();
    renderStage(watch.scene.id, Math.min(watch.scene.steps.length - 1, watch.step + 1), 1);
  });

  // ---------- Try it ----------
  const input = $('try-input');
  const palette = $('palette');
  const log = $('try-log');
  let paletteItems = [];
  let active = -1;

  function closePalette() {
    palette.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function setActive(index) {
    active = index;
    palette.querySelectorAll('li').forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
    if (index >= 0 && paletteItems[index]) {
      const id = `opt-${paletteItems[index].name}`;
      input.setAttribute('aria-activedescendant', id);
      const node = document.getElementById(id);
      if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function openPalette() {
    const value = input.value;
    const parsed = Core.parseInput(value);
    if (!value.startsWith('/') || (parsed.kind === 'command' && /\s/.test(value))) { closePalette(); return; }
    paletteItems = Core.filterCommands(COMMANDS, value).slice(0, 12);
    if (!paletteItems.length) { closePalette(); return; }
    palette.replaceChildren(...paletteItems.map((command, i) => el('li', {
      id: `opt-${command.name}`, role: 'option', 'aria-selected': 'false',
      onmousedown: (event) => { event.preventDefault(); choose(i); },
    }, [
      el('span', { className: 'p-name', text: `/${command.name}` }),
      el('span', { className: 'p-kind', text: command.kind === 'custom' ? 'prompt file' : 'built-in' }),
      el('span', { className: 'p-desc', text: command.purpose }),
    ])));
    palette.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    setActive(0);
  }

  function choose(index) {
    const command = paletteItems[index];
    if (!command) return;
    input.value = `/${command.name} `;
    closePalette();
    input.focus();
  }

  input.addEventListener('input', openPalette);
  input.addEventListener('blur', () => setTimeout(closePalette, 100));
  input.addEventListener('keydown', (event) => {
    if (palette.hidden) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((active + 1) % paletteItems.length); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((active - 1 + paletteItems.length) % paletteItems.length); }
    else if (event.key === 'Tab' || (event.key === 'Enter' && active >= 0 && Core.parseInput(input.value).kind !== 'command')) {
      event.preventDefault(); choose(active);
    } else if (event.key === 'Escape') { event.preventDefault(); closePalette(); }
  });

  function field(label, content) {
    return [el('span', { className: 'label', text: label }), content];
  }

  function respond(value) {
    const parsed = Core.parseInput(value);
    if (parsed.kind === 'empty') return;
    log.append(el('div', { className: 'msg user', text: value }));
    const reply = el('div', { className: 'msg agent' });

    if (parsed.kind === 'text' || parsed.kind === 'partial') {
      const words = String(parsed.text || parsed.name || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      const seen = new Set();
      const suggestions = [];
      for (const word of words) {
        for (const command of Core.filterCommands(COMMANDS, word)) {
          if (!seen.has(command.name)) { seen.add(command.name); suggestions.push(command); }
        }
      }
      reply.append(
        el('h3', { text: 'Plain prompts work, but a command is a contract' }),
        el('p', { text: 'A slash command tells the agent which procedure and output format to follow. Try one of these:' }),
        el('p', {}, (suggestions.length ? suggestions : COMMANDS.filter((c) => ['plan', 'clarify', 'verify'].includes(c.name)))
          .slice(0, 4).map((command) => el('button', {
            type: 'button', className: 'suggest', onclick: () => { input.value = `/${command.name} `; input.focus(); openPalette(); },
          }, `/${command.name}`))),
      );
    } else {
      const command = Core.resolveCommand(COMMANDS, parsed.name);
      if (!command) {
        const close = Core.filterCommands(COMMANDS, parsed.name.slice(0, 3)).slice(0, 3);
        reply.append(
          el('h3', { text: `No /${parsed.name} command here` }),
          el('p', { text: close.length ? `Did you mean ${close.map((c) => `/${c.name}`).join(', ')}?` : 'Type / to list every command.' }),
        );
      } else if (command.kind === 'custom') {
        const sample = DATA.samples[command.name];
        reply.append(
          el('h3', { text: `/${command.name} - prompt file (${command.access})` }),
          el('p', { text: command.purpose }),
          ...field('Runs from', el('code', { text: command.file })),
          ...field('Fixes this slop', el('p', { text: command.slop })),
          ...field('Evidence you should get back', el('p', { text: command.evidence })),
          ...field('Tools it may use', el('p', { text: command.tools.join(', ') })),
          ...field('Prompt file body (what the agent receives)', el('pre', { text: command.body })),
          ...field(`Sample answer${parsed.args ? '' : ` for "/${command.name} ${sample.args}"`} (illustrative)`, el('pre', { text: sample.text })),
        );
      } else {
        reply.append(
          el('h3', { text: `/${command.name} - built-in` }),
          el('p', { text: command.purpose }),
          ...field('Why it reduces slop', el('p', { text: command.antiSlop })),
          ...field('Example', el('pre', { text: command.usage })),
          ...field('Availability', el('p', { text: command.availability })),
          ...(command.aliases.length ? field('Aliases', el('p', { text: command.aliases.map((a) => `/${a}`).join(', ') })) : []),
          command.caution ? el('p', { className: 'caution', text: 'Caution: this removes a human checkpoint. Use only in a throwaway sandbox.' }) : null,
          el('p', {}, safeLink(command.doc, 'Read the VS Code docs')),
        );
        if (command.name.toLowerCase() !== parsed.name.toLowerCase()) {
          reply.append(el('p', { className: 'muted', text: `/${parsed.name} is an alias for /${command.name}.` }));
        }
      }
      if (parsed.args) reply.append(el('p', { className: 'muted', text: `Your task text "${parsed.args}" would be appended after the command.` }));
    }
    log.append(reply);
    log.scrollTop = log.scrollHeight;
  }

  $('try-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    closePalette();
    respond(value);
    input.value = '';
  });

  const EXAMPLES = ['/clarify', '/plan', '/verify', '/ground', '/deslop', '/root-cause', '/handoff', '/compact', '/troubleshoot', '/yolo'];
  $('try-examples').append(...EXAMPLES.map((text) => el('button', {
    type: 'button', onclick: () => { setMode('try'); respond(text); input.focus(); },
  }, text)));

  log.append(el('div', { className: 'msg agent' }, [
    el('h3', { text: 'Simulated chat' }),
    el('p', { text: 'Type / to open the command list. Use the arrow keys, then Tab or Enter to pick one. Press Enter again to send.' }),
  ]));

  // ---------- Mission ----------
  const mission = { index: 0, results: new Array(MISSIONS.length).fill(null) };

  function renderMission() {
    const item = MISSIONS[mission.index];
    const result = mission.results[mission.index];
    $('mission-count').textContent = `Smell ${mission.index + 1} of ${MISSIONS.length}`;
    $('mission-smell').textContent = item.smell;
    const choices = $('mission-choices');
    choices.replaceChildren(...item.choices.map((choice) => {
      let className = '';
      if (result) {
        if (choice === item.answer) className = 'right';
        else if (choice === result.choice) className = 'wrong';
      }
      return el('button', {
        type: 'button', className, disabled: Boolean(result), onclick: () => answer(choice),
      }, `/${choice}`);
    }));
    const feedback = $('mission-feedback');
    feedback.replaceChildren();
    if (result) {
      feedback.append(
        el('p', {}, [
          el('span', { className: `verdict ${result.correct ? 'good' : 'bad'}`, text: result.correct ? 'Correct. ' : `Not quite: the best fit is /${item.answer}. ` }),
          item.why,
        ]),
      );
    }
    const summary = Core.missionSummary(mission.results);
    $('mission-score').textContent = `Score ${summary.correct}/${summary.answered} answered, ${summary.total} total`;
    $('mission-prev').disabled = mission.index === 0;
    $('mission-next').textContent = mission.index === MISSIONS.length - 1 ? 'Finish' : 'Next \u2192';
    if (summary.answered === summary.total && mission.index === MISSIONS.length - 1 && result) {
      feedback.append(el('p', { className: 'verdict good', text: `Done: ${summary.correct} of ${summary.total}. Now run npm run demo and practice the real exercises.` }));
    }
  }

  function answer(choice) {
    const item = MISSIONS[mission.index];
    const scored = Core.scoreMission(item, choice);
    mission.results[mission.index] = { ...scored, choice };
    renderMission();
    $('mission-next').focus();
  }

  $('mission-prev').addEventListener('click', () => { mission.index = Math.max(0, mission.index - 1); renderMission(); });
  $('mission-next').addEventListener('click', () => {
    if (mission.index < MISSIONS.length - 1) { mission.index += 1; renderMission(); }
  });
  $('mission-restart').addEventListener('click', () => {
    mission.index = 0; mission.results.fill(null); renderMission();
  });

  // ---------- Commands reference ----------
  const filters = { query: '', mechanism: 'all', kind: 'all' };

  function chipGroup(container, options, key) {
    container.replaceChildren(...options.map((option) => el('button', {
      type: 'button', 'aria-pressed': String(filters[key] === option.id), dataset: { value: option.id },
      onclick: () => {
        filters[key] = option.id;
        container.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === option.id)));
        renderReference();
      },
    }, option.label)));
  }

  function renderReference() {
    const matches = (filters.query ? Core.filterCommands(COMMANDS, filters.query) : COMMANDS.slice())
      .filter((command) => filters.mechanism === 'all' || command.mechanism === filters.mechanism)
      .filter((command) => filters.kind === 'all' || command.kind === filters.kind);
    $('cmd-count').textContent = `${matches.length} of ${COMMANDS.length} commands`;
    $('cmd-list').replaceChildren(...matches.map((command) => el('article', { className: 'card' }, [
      el('h3', {}, [
        `/${command.name}`,
        el('span', { className: `kind ${command.kind === 'custom' ? 'custom' : ''}`, text: command.kind === 'custom' ? 'prompt file' : 'built-in' }),
        el('span', { className: `chip mech-${command.mechanism}`, text: mechanismTitle(command.mechanism) }),
        command.caution ? el('span', { className: 'kind caution', text: 'caution' }) : null,
      ]),
      el('p', { text: command.purpose }),
      el('p', { className: 'slop', text: command.kind === 'custom' ? `Slop it fixes: ${command.slop}` : command.antiSlop }),
      el('p', { className: 'meta', text: command.kind === 'custom'
        ? `${command.file} - ${command.access}`
        : `${command.availability}${command.aliases.length ? ` - alias ${command.aliases.map((a) => `/${a}`).join(', ')}` : ''}` }),
      el('div', { className: 'actions' }, [
        el('button', { type: 'button', onclick: () => { setMode('try'); respond(`/${command.name}`); input.focus(); } }, 'Try it'),
        command.doc ? safeLink(command.doc, 'Docs') : null,
      ]),
    ])));
  }

  $('cmd-search').addEventListener('input', (event) => { filters.query = event.target.value; renderReference(); });
  chipGroup($('cmd-mech'), [{ id: 'all', label: 'All mechanisms' }].concat(
    DATA.registry.mechanisms.map((m) => ({ id: m.id, label: m.title }))), 'mechanism');
  chipGroup($('cmd-kind'), [
    { id: 'all', label: 'All kinds' }, { id: 'custom', label: 'Prompt files (12)' }, { id: 'built-in', label: 'Built-in' },
  ], 'kind');

  const app = DATA.registry.copilotApp;
  $('copilot-app-note').textContent = app.note;
  $('copilot-app-list').replaceChildren(...app.commands.map((c) => el('li', { title: c.purpose, text: `/${c.name}` })));
  if (/^https:\/\//.test(app.doc)) $('copilot-app-doc').href = app.doc;
  $('as-of').textContent = `Command list checked against VS Code docs dated ${DATA.registry.docsDated}. Registry as of ${DATA.registry.asOf}.`;

  // ---------- Capture hook for GIF recording ----------
  window.__studio = {
    scenes: SCENES.map((scene) => ({ id: scene.id, steps: scene.steps.length })),
    renderFrame(sceneId, step, fraction) {
      document.body.classList.add('capture');
      pause();
      setMode('watch');
      renderStage(sceneId, step, fraction);
      return overflowReport();
    },
    overflowReport,
    commandCount: COMMANDS.length,
  };

  // ---------- Boot ----------
  function boot() {
    const hash = location.hash.replace(/^#/, '');
    const [first, second] = hash.split('/');
    const scene = SCENES.find((item) => item.id === second) || SCENES[0];
    renderStage(scene.id, 0, 1);
    renderMission();
    renderReference();
    setMode(MODES.includes(first) ? first : 'watch');
    document.documentElement.dataset.ready = 'true';
  }

  window.addEventListener('hashchange', () => {
    const [first, second] = location.hash.replace(/^#/, '').split('/');
    if (!MODES.includes(first)) return;
    setMode(first);
    if (first === 'watch' && SCENES.some((item) => item.id === second)) selectScene(second);
  });

  boot();
})();

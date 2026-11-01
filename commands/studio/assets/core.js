// Pure Command Studio logic. No DOM access, so tests can load it in a Node vm context.
(function (root) {
  'use strict';

  const PROMPT_END = 0.35;
  const RESPONSE_END = 0.7;

  function clamp(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }

  function allCommands(data) {
    const registry = data.registry;
    const custom = registry.custom.map((entry) => {
      const prompt = data.prompts[entry.name];
      if (!prompt) throw new Error(`Missing prompt file for /${entry.name}`);
      return {
        kind: 'custom', name: entry.name, aliases: [], mechanism: entry.mechanism, access: entry.access,
        file: entry.file, slop: entry.slop, evidence: entry.evidence,
        purpose: prompt.description, argumentHint: prompt.argumentHint || '', tools: prompt.tools.slice(),
        body: prompt.body, availability: 'Local (prompt file)', local: true, caution: false,
      };
    });
    const builtIn = registry.builtIns.map((entry) => ({
      kind: 'built-in', name: entry.name, aliases: (entry.aliases || []).slice(), mechanism: entry.mechanism,
      purpose: entry.purpose, antiSlop: entry.antiSlop, usage: entry.usage, availability: entry.availability,
      doc: entry.doc, caution: Boolean(entry.caution), local: entry.local !== false, argumentHint: '',
    }));
    return custom.concat(builtIn);
  }

  function normalizeQuery(query) {
    return String(query || '').trim().replace(/^\//, '').toLowerCase();
  }

  function rankCommand(command, query) {
    if (!query) return 0;
    const name = command.name.toLowerCase();
    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    if (command.aliases.some((alias) => alias.toLowerCase().startsWith(query))) return 2;
    if (name.includes(query)) return 3;
    const text = `${command.purpose} ${command.antiSlop || ''} ${command.slop || ''}`.toLowerCase();
    if (text.includes(query)) return 4;
    return -1;
  }

  function filterCommands(commands, query) {
    const normalized = normalizeQuery(query);
    return commands
      .map((command) => ({ command, rank: rankCommand(command, normalized) }))
      .filter((item) => item.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.command.name.localeCompare(b.command.name))
      .map((item) => item.command);
  }

  function parseInput(text) {
    const value = String(text || '').trim();
    if (!value) return { kind: 'empty' };
    if (!value.startsWith('/')) return { kind: 'text', text: value };
    const match = value.match(/^\/([A-Za-z][\w-]*)(?:\s+([\s\S]*))?$/);
    if (!match) return { kind: 'partial', name: value.slice(1) };
    return { kind: 'command', name: match[1], args: (match[2] || '').trim() };
  }

  function resolveCommand(commands, name) {
    const wanted = String(name || '').toLowerCase();
    return commands.find((command) => command.name.toLowerCase() === wanted)
      || commands.find((command) => command.aliases.some((alias) => alias.toLowerCase() === wanted))
      || null;
  }

  function scoreMission(mission, choice) {
    const correct = choice === mission.answer;
    return { correct, answer: mission.answer, why: mission.why };
  }

  function missionSummary(results) {
    const answered = results.filter((result) => result !== undefined && result !== null);
    const correct = answered.filter((result) => result.correct).length;
    return { answered: answered.length, correct, total: results.length };
  }

  function typed(text, fraction) {
    const value = String(text || '');
    return value.slice(0, Math.round(value.length * clamp(fraction)));
  }

  function lines(text, fraction) {
    const all = String(text || '').split('\n');
    const count = Math.round(all.length * clamp(fraction));
    return all.slice(0, count).join('\n');
  }

  function stepState(scene, index, fraction) {
    if (!scene || !Array.isArray(scene.steps)) throw new Error('Unknown scene.');
    if (!Number.isInteger(index) || index < 0 || index >= scene.steps.length) throw new Error('Step out of range.');
    const f = clamp(fraction);
    const step = scene.steps[index];
    return {
      step,
      index,
      total: scene.steps.length,
      prompt: typed(step.prompt, f / PROMPT_END),
      response: lines(step.response, (f - PROMPT_END) / (RESPONSE_END - PROMPT_END)),
      terminal: lines(step.terminal, (f - RESPONSE_END) / (1 - RESPONSE_END)),
      complete: f >= 1,
    };
  }

  function splitCommand(prompt) {
    const match = String(prompt || '').match(/^(\/[A-Za-z][\w-]*)([\s\S]*)$/);
    return match ? { command: match[1], rest: match[2] } : { command: '', rest: String(prompt || '') };
  }

  function codeLineKind(line) {
    if (/^\+(\s|$)/.test(line)) return 'add';
    if (/^-(\s|$)/.test(line)) return 'del';
    return 'ctx';
  }

  const api = {
    PROMPT_END, RESPONSE_END, clamp, allCommands, filterCommands, parseInput, resolveCommand,
    scoreMission, missionSummary, typed, lines, stepState, splitCommand, codeLineKind,
  };
  root.StudioCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

class StrategyFactory {
  create(options) {
    return (left, right) => String(left[options.field]).localeCompare(String(right[options.field]));
  }
}
export function sortPriority(rows) {
  const strategy = new StrategyFactory().create({ field: 'priority' });
  return rows.sort(strategy);
}

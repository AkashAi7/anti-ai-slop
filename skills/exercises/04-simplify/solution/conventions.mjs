export const byPriority = (left, right) => left.priority - right.priority;
export const byId = (rows) => [...rows].sort((left, right) => left.id.localeCompare(right.id));

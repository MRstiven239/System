import { dateKey } from './dates';

function makeIdSimple() {
  return Math.random().toString(36).substring(2, 9);
}

export function createReflection({
  content,    // texto libre
  tags,       // array de strings opcionales
}) {
  return {
    id: makeIdSimple(),
    content,
    tags: tags || [],
    date: dateKey(new Date()),
    createdAt: Date.now(),
  };
}

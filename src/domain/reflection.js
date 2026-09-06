import { dateKey } from './dates';

function makeIdSimple() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

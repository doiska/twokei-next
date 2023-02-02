const hasSameKeys = (obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  return keys1.length === keys2.length && keys1.every(key => keys2.includes(key));
}
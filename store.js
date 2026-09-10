const STORAGE_KEY = 'simple-crud-records';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export function createStore(storage = globalThis.localStorage) {
  const read = () => {
    try {
      return JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  };

  const write = (records) => storage.setItem(STORAGE_KEY, JSON.stringify(records));

  return {
    getAll() {
      return read();
    },

    getById(id) {
      return read().find((record) => record.id === id);
    },

    add(input) {
      const record = {
        id: makeId(),
        name: input.name.trim(),
        description: input.description.trim(),
      };
      write([...read(), record]);
      return record;
    },

    update(id, input) {
      const records = read().map((record) => (
        record.id === id
          ? { ...record, name: input.name.trim(), description: input.description.trim() }
          : record
      ));
      write(records);
      return records.find((record) => record.id === id);
    },

    remove(id) {
      write(read().filter((record) => record.id !== id));
    },
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../store.js';

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
};

test('用户可以新增并查看一条记录', () => {
  const store = createStore(memoryStorage());

  const record = store.add({ name: '学习 Git', description: '完成第一次提交' });

  assert.equal(store.getAll().length, 1);
  assert.equal(store.getAll()[0].name, '学习 Git');
  assert.equal(store.getAll()[0].description, '完成第一次提交');
  assert.equal(store.getAll()[0].id, record.id);
});

test('用户可以修改记录', () => {
  const store = createStore(memoryStorage());
  const record = store.add({ name: '旧标题', description: '旧内容' });

  store.update(record.id, { name: '新标题', description: '新内容' });

  assert.deepEqual(store.getById(record.id), {
    id: record.id,
    name: '新标题',
    description: '新内容',
  });
});

test('用户可以删除记录，并且数据会保存到存储中', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  const record = store.add({ name: '待删除', description: '临时记录' });

  store.remove(record.id);

  assert.equal(store.getAll().length, 0);
  assert.deepEqual(JSON.parse(storage.getItem('simple-crud-records')), []);
});

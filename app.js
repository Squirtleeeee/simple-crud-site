import { createStore } from './store.js';

const store = createStore(window.localStorage);
const form = document.querySelector('#record-form');
const nameInput = document.querySelector('#record-name');
const descriptionInput = document.querySelector('#record-description');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const formTitle = document.querySelector('#form-title');
const formBadge = document.querySelector('#form-badge');
const searchInput = document.querySelector('#search-input');
const list = document.querySelector('#record-list');
const totalCount = document.querySelector('#total-count');
const statusText = document.querySelector('#status-text');

let editingId = null;
let searchTerm = '';

const setStatus = (message) => {
  statusText.textContent = message;
};

const resetForm = () => {
  editingId = null;
  form.reset();
  formTitle.textContent = '新增记录';
  formBadge.textContent = '01';
  saveButton.textContent = '保存记录';
  cancelButton.classList.add('hidden');
};

const createRecordCard = (record) => {
  const card = document.createElement('article');
  card.className = 'record-card';
  card.dataset.id = record.id;

  const content = document.createElement('div');
  content.className = 'record-content';

  const title = document.createElement('h3');
  title.textContent = record.name;
  content.append(title);

  const description = document.createElement('p');
  description.textContent = record.description || '暂无内容';
  content.append(description);

  const actions = document.createElement('div');
  actions.className = 'record-actions';

  const editButton = document.createElement('button');
  editButton.className = 'icon-button';
  editButton.type = 'button';
  editButton.dataset.action = 'edit';
  editButton.textContent = '编辑';
  editButton.setAttribute('aria-label', `编辑 ${record.name}`);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'icon-button danger';
  deleteButton.type = 'button';
  deleteButton.dataset.action = 'delete';
  deleteButton.textContent = '删除';
  deleteButton.setAttribute('aria-label', `删除 ${record.name}`);

  actions.append(editButton, deleteButton);
  card.append(content, actions);
  return card;
};

const render = () => {
  const records = store.getAll();
  const visibleRecords = records.filter((record) => {
    const text = `${record.name} ${record.description}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  totalCount.textContent = records.length;
  list.replaceChildren();

  if (visibleRecords.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = searchTerm ? '没有找到匹配的记录' : '还没有记录，先新增一条吧';
    list.append(emptyState);
    return;
  }

  visibleRecords.forEach((record) => list.append(createRecordCard(record)));
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = {
    name: nameInput.value,
    description: descriptionInput.value,
  };

  if (!input.name.trim()) return;

  if (editingId) {
    store.update(editingId, input);
    setStatus('记录已更新');
  } else {
    store.add(input);
    setStatus('记录已新增');
  }

  resetForm();
  render();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  setStatus('已取消编辑');
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const card = button.closest('[data-id]');
  const record = store.getById(card.dataset.id);
  if (!record) return;

  if (button.dataset.action === 'edit') {
    editingId = record.id;
    nameInput.value = record.name;
    descriptionInput.value = record.description;
    formTitle.textContent = '编辑记录';
    formBadge.textContent = '02';
    saveButton.textContent = '保存修改';
    cancelButton.classList.remove('hidden');
    nameInput.focus();
    setStatus('正在编辑');
    return;
  }

  if (window.confirm(`确定删除“${record.name}”吗？`)) {
    store.remove(record.id);
    if (editingId === record.id) resetForm();
    setStatus('记录已删除');
    render();
  }
});

searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value.trim();
  render();
});

render();

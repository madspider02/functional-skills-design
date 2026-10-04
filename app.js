const API_URL = 'https://script.google.com/macros/s/AKfycbyS6YYMQM1y8FAWYfzRhBju0gYZOhTDXovNCVbfldS9fmMw-KbwD-d4mjMtsgO_Br3U/exec';

const abilities = [
  { name: '溝通', desc: '表達需求、理解訊息、主動溝通，以及使用口語、圖像或輔助溝通方式與他人互動。' },
  { name: '社會互動技巧', desc: '主動互動、輪流、等待、共同活動、求助、拒絕，以及理解基本社會規則。' },
  { name: '時間概念', desc: '理解先後順序、等待多久、幾點做什麼，以及依照作息或行程完成活動。' },
  { name: '自我實現', desc: '認識自己的喜好與能力、做選擇、表達想法，並逐步完成自己想做的事情。' },
  { name: '替代的書寫工具', desc: '當手寫困難時，使用鍵盤、語音輸入、圖像、選擇式作答或其他工具表達。' },
  { name: '金錢概念', desc: '辨識幣值、比較價格、付款、找零，以及在生活情境中合理使用金錢。' }
];

let ranking = [...abilities];
let draggedIndex = null;

const rankingList = document.querySelector('#rankingList');
const topAbilityText = document.querySelector('#topAbilityText');
const topAbilityHint = document.querySelector('#topAbilityHint');
const form = document.querySelector('#learningForm');
const nameInput = document.querySelector('#studentName');
const topicInput = document.querySelector('#teachingTopic');
const overviewInput = document.querySelector('#teachingOverview');
const overviewCount = document.querySelector('#overviewCount');
const submitBtn = document.querySelector('#submitBtn');
const submitStatus = document.querySelector('#submitStatus');
const successPanel = document.querySelector('#successPanel');
const submittedTopAbility = document.querySelector('#submittedTopAbility');

function renderRanking() {
  rankingList.innerHTML = '';

  ranking.forEach((ability, index) => {
    const item = document.createElement('li');
    item.className = 'ability-card';
    item.draggable = true;
    item.dataset.index = String(index);

    item.innerHTML = `
      <div class="rank-badge">${index + 1}</div>
      <div>
        <div class="ability-name">${escapeHtml(ability.name)}</div>
        <div class="ability-desc">${escapeHtml(ability.desc)}</div>
      </div>
      <div class="move-controls" aria-label="調整${escapeHtml(ability.name)}的順位">
        <button class="move-btn" type="button" data-action="up" ${index === 0 ? 'disabled' : ''} aria-label="往上移">↑</button>
        <button class="move-btn" type="button" data-action="down" ${index === ranking.length - 1 ? 'disabled' : ''} aria-label="往下移">↓</button>
      </div>
    `;

    item.addEventListener('dragstart', () => {
      draggedIndex = Number(item.dataset.index);
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
      draggedIndex = null;
      item.classList.remove('dragging');
    });

    item.addEventListener('dragover', (event) => event.preventDefault());

    item.addEventListener('drop', (event) => {
      event.preventDefault();
      const targetIndex = Number(item.dataset.index);
      if (draggedIndex === null || draggedIndex === targetIndex) return;
      const [moved] = ranking.splice(draggedIndex, 1);
      ranking.splice(targetIndex, 0, moved);
      renderRanking();
    });

    item.querySelectorAll('.move-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const target = action === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= ranking.length) return;
        [ranking[index], ranking[target]] = [ranking[target], ranking[index]];
        renderRanking();
      });
    });

    rankingList.appendChild(item);
  });

  const first = ranking[0];
  topAbilityText.textContent = first.name;
  topAbilityHint.textContent = first.desc;
}

function validateForm() {
  let valid = true;
  const name = nameInput.value.trim();
  const topic = topicInput.value.trim();
  const overview = overviewInput.value.trim();

  document.querySelector('#nameError').textContent = '';
  document.querySelector('#topicError').textContent = '';
  document.querySelector('#overviewError').textContent = '';

  if (!name) {
    document.querySelector('#nameError').textContent = '請填寫真實姓名。';
    valid = false;
  }
  if (!topic) {
    document.querySelector('#topicError').textContent = '請填寫教學主題。';
    valid = false;
  }
  if (overview.length < 30) {
    document.querySelector('#overviewError').textContent = `目前 ${overview.length} 字，請至少填寫 30 字。`;
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitStatus.textContent = '正在送出資料……';

  const payload = {
    name: nameInput.value.trim(),
    rankingOrder: ranking.map((item) => item.name),
    teachingTopic: topicInput.value.trim(),
    teachingOverview: overviewInput.value.trim()
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || '資料送出失敗');

    submittedTopAbility.textContent = data.topAbility || ranking[0].name;
    form.classList.add('hidden');
    successPanel.classList.remove('hidden');
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    submitStatus.textContent = `送出失敗：${error.message}。請確認 Apps Script 已部署為「任何人」可存取。`;
    submitBtn.disabled = false;
  }
});

overviewInput.addEventListener('input', () => {
  overviewCount.textContent = `${overviewInput.value.length} / 2000`;
});

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

renderRanking();

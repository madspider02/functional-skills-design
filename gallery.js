const API_URL = 'https://script.google.com/macros/s/AKfycbyS6YYMQM1y8FAWYfzRhBju0gYZOhTDXovNCVbfldS9fmMw-KbwD-d4mjMtsgO_Br3U/exec';
const abilityOrder = ['溝通', '社會互動技巧', '時間概念', '自我實現', '替代的書寫工具', '金錢概念'];

let galleryData = null;
let activeFilter = '全部';

const summaryGrid = document.querySelector('#summaryGrid');
const filterBar = document.querySelector('#filterBar');
const ideasContainer = document.querySelector('#ideasContainer');
const submissionCount = document.querySelector('#submissionCount');
const lastUpdated = document.querySelector('#lastUpdated');
const refreshBtn = document.querySelector('#refreshBtn');
const galleryError = document.querySelector('#galleryError');
const galleryErrorText = document.querySelector('#galleryErrorText');

async function loadGallery() {
  refreshBtn.disabled = true;
  lastUpdated.textContent = '正在讀取最新資料……';
  galleryError.classList.add('hidden');

  try {
    const response = await fetch(`${API_URL}?action=gallery&t=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || '無法取得共學資料');

    galleryData = data;
    renderSummary();
    renderFilters();
    renderIdeas();

    submissionCount.textContent = `目前共 ${data.totalSubmissions ?? 0} 份公開提交`;
    lastUpdated.textContent = `最後更新：${new Date().toLocaleString('zh-TW')}`;
  } catch (error) {
    galleryErrorText.textContent = `${error.message}。請確認 Apps Script Web App 權限已設為「任何人」可存取。`;
    galleryError.classList.remove('hidden');
    lastUpdated.textContent = '讀取失敗';
  } finally {
    refreshBtn.disabled = false;
  }
}

function renderSummary() {
  const summary = galleryData?.abilitySummary || [];
  summaryGrid.innerHTML = '';

  summary.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'summary-card';
    card.innerHTML = `
      <div class="summary-rank">#${index + 1}</div>
      <h3>${escapeHtml(item.ability)}</h3>
      <p>平均順位：${item.averageRank === null ? '—' : Number(item.averageRank).toFixed(2)}</p>
      <p>列為第一順位：${item.firstChoiceCount ?? 0} 人</p>
      <p>教學想法：${item.ideaCount ?? 0} 則</p>
    `;
    summaryGrid.appendChild(card);
  });

  if (!summary.length) {
    summaryGrid.innerHTML = '<div class="empty-state">目前尚無排序資料。</div>';
  }
}

function renderFilters() {
  const filters = ['全部', ...abilityOrder];
  filterBar.innerHTML = '';

  filters.forEach((label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-btn${activeFilter === label ? ' active' : ''}`;
    button.textContent = label;
    button.addEventListener('click', () => {
      activeFilter = label;
      renderFilters();
      renderIdeas();
    });
    filterBar.appendChild(button);
  });
}

function renderIdeas() {
  ideasContainer.innerHTML = '';
  const ideasByAbility = galleryData?.ideasByAbility || {};
  const visibleAbilities = activeFilter === '全部' ? abilityOrder : [activeFilter];
  let renderedCount = 0;

  visibleAbilities.forEach((ability) => {
    const ideas = Array.isArray(ideasByAbility[ability]) ? ideasByAbility[ability] : [];
    if (!ideas.length && activeFilter === '全部') return;

    const section = document.createElement('section');
    section.className = 'ability-section';
    section.innerHTML = `<h3 class="ability-section-title">${escapeHtml(ability)} <span>(${ideas.length})</span></h3>`;

    if (!ideas.length) {
      section.insertAdjacentHTML('beforeend', '<div class="empty-state">目前還沒有同學以這項能力作為第一順位並提出教學設計。</div>');
    } else {
      ideas.forEach((idea) => {
        const article = document.createElement('article');
        article.className = 'idea-card';
        article.innerHTML = `
          <h3>${escapeHtml(idea.teachingTopic || '未命名主題')}</h3>
          <p>${escapeHtml(idea.teachingOverview || '')}</p>
        `;
        section.appendChild(article);
        renderedCount += 1;
      });
    }

    ideasContainer.appendChild(section);
  });

  if (!ideasContainer.children.length) {
    ideasContainer.innerHTML = '<div class="empty-state">目前還沒有公開的教學設計想法。</div>';
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

refreshBtn.addEventListener('click', loadGallery);
loadGallery();
setInterval(loadGallery, 30000);

(function () {
  'use strict';

  const CATEGORY_NAMES = {
    '哲': '哲学', '经': '经济学', '法': '法学', '教': '教育学',
    '文': '文学', '史': '历史学', '理': '理学', '工': '工学',
    '农': '农学', '医': '医学', '管': '管理学', '艺': '艺术学', '军': '军事学'
  };

  const STATE = {
    data: null,
    filters: {
      category: 'all',
      level: 'all',
      heat: 'all',
      search: '',
      sort: 'default'
    },
    favorites: new Set(),
    currentDetailTab: 0,
    favoritesMode: false
  };

  const DEBOUNCE_DELAY = 300;
  let searchDebounceTimer = null;

  function $(id) { return document.getElementById(id); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function resolveDataPath() {
    const candidates = [
      'data/data.json',
      './data/data.json',
      '../data/data.json'
    ];
    for (const p of candidates) {
      try {
        if (typeof XMLHttpRequest !== 'undefined') {
          return p;
        }
      } catch (e) {}
    }
    return 'data/data.json';
  }

  function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function loadFavorites() {
    try {
      const raw = localStorage.getItem('favorites');
      if (raw) STATE.favorites = new Set(JSON.parse(raw));
    } catch (e) { STATE.favorites = new Set(); }
    updateFavCount();
  }

  function saveFavorites() {
    try {
      localStorage.setItem('favorites', JSON.stringify(Array.from(STATE.favorites)));
    } catch (e) {}
    updateFavCount();
  }

  function updateFavCount() {
    const el = $('favCount');
    if (el) el.textContent = STATE.favorites.size;
  }

  function toggleFavorite(id, event) {
    if (event) event.stopPropagation();
    const numId = Number(id);
    if (STATE.favorites.has(numId)) {
      STATE.favorites.delete(numId);
    } else {
      STATE.favorites.add(numId);
    }
    saveFavorites();
    renderCards();
    const modalBtn = document.querySelector('.detail-favorite-btn');
    if (modalBtn) updateFavoriteBtn(modalBtn, numId);
  }

  function updateFavoriteBtn(btn, id) {
    const numId = Number(id);
    const active = STATE.favorites.has(numId);
    btn.classList.toggle('active', active);
    btn.textContent = active ? '❤️' : '🤍';
    btn.title = active ? '取消收藏' : '收藏';
  }

  async function loadData() {
    const path = resolveDataPath();
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      STATE.data = await res.json();
      return true;
    } catch (err) {
      console.error('加载数据失败:', err);
      return false;
    }
  }

  function showLoading() {
    $('loadingState').classList.remove('hidden');
    $('errorState').classList.add('hidden');
    $('emptyState').classList.add('hidden');
    $('majorsGrid').innerHTML = '';
  }

  function showError() {
    $('loadingState').classList.add('hidden');
    $('errorState').classList.remove('hidden');
    $('emptyState').classList.add('hidden');
    $('majorsGrid').innerHTML = '';
    updateStats(0, 0, 0);
  }

  function showEmpty() {
    $('loadingState').classList.add('hidden');
    $('errorState').classList.add('hidden');
    $('emptyState').classList.remove('hidden');
    $('majorsGrid').innerHTML = '';
  }

  function filterMajors() {
    if (!STATE.data || !STATE.data.majors) return [];
    let list = STATE.data.majors.slice();

    if (STATE.favoritesMode) {
      list = list.filter(m => STATE.favorites.has(m.id));
    }

    if (STATE.filters.category !== 'all') {
      list = list.filter(m => m.category === STATE.filters.category);
    }

    if (STATE.filters.level !== 'all') {
      list = list.filter(m => m.degree === STATE.filters.level);
    }

    if (STATE.filters.heat !== 'all') {
      const tag = STATE.filters.heat;
      list = list.filter(m => {
        if (tag === '国家特色') return m.isCharacteristic || m.hotTag === tag;
        return m.hotTag === tag;
      });
    }

    const kw = STATE.filters.search.trim().toLowerCase();
    if (kw) {
      list = list.filter(m => {
        if (m.name.toLowerCase().includes(kw)) return true;
        if (m.code.includes(kw)) return true;
        if (m.coreCourses && m.coreCourses.some(c => c.toLowerCase().includes(kw))) return true;
        if (m.employment && m.employment.universities) {
          if (m.employment.universities.some(u => u.name.toLowerCase().includes(kw))) return true;
        }
        if (m.overview) {
          if (m.overview.whatIs && m.overview.whatIs.toLowerCase().includes(kw)) return true;
          if (m.overview.whatLearn && m.overview.whatLearn.toLowerCase().includes(kw)) return true;
        }
        if (m.employment && m.employment.industries) {
          if (m.employment.industries.some(i => i.name.toLowerCase().includes(kw))) return true;
        }
        if (CATEGORY_NAMES[m.category] && CATEGORY_NAMES[m.category].includes(kw)) return true;
        return false;
      });
    }

    switch (STATE.filters.sort) {
      case 'popularity-desc': list.sort((a, b) => b.popularity - a.popularity); break;
      case 'popularity-asc': list.sort((a, b) => a.popularity - b.popularity); break;
      case 'employment-desc': list.sort((a, b) => b.employmentRate - a.employmentRate); break;
      case 'employment-asc': list.sort((a, b) => a.employmentRate - b.employmentRate); break;
      case 'salary-desc': list.sort((a, b) => b.avgSalary5y - a.avgSalary5y); break;
      case 'salary-asc': list.sort((a, b) => a.avgSalary5y - b.avgSalary5y); break;
      default: list.sort((a, b) => a.id - b.id);
    }
    return list;
  }

  function updateStats(total, bachelor, associate) {
    $('totalCount').textContent = total;
    $('bachelorCount').textContent = bachelor;
    $('associateCount').textContent = associate;
  }

  function renderStars(n) {
    const full = Math.floor(n);
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += i < full ? '★' : '☆';
    }
    return '<span class="popularity-stars">' + html + '</span>';
  }

  function renderCards() {
    const list = filterMajors();
    const bachelor = list.filter(m => m.degree === '学士').length;
    const associate = list.filter(m => m.degree === 'associate').length;
    updateStats(list.length, bachelor, associate);

    if (list.length === 0) {
      showEmpty();
      return;
    }

    $('loadingState').classList.add('hidden');
    $('errorState').classList.add('hidden');
    $('emptyState').classList.add('hidden');

    const grid = $('majorsGrid');
    grid.innerHTML = list.map(m => renderCard(m)).join('');

    $$('.major-card', grid).forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) return;
        openDetail(Number(card.dataset.id));
      });
    });

    $$('.favorite-btn', grid).forEach(btn => {
      btn.addEventListener('click', (e) => toggleFavorite(btn.dataset.id, e));
    });
  }

  function renderCard(m) {
    const catName = CATEGORY_NAMES[m.category] || m.category;
    const degreeLabel = m.degree === 'associate' ? '专科' : m.degree;
    const progClass = m.employmentRate >= 90 ? '' : (m.employmentRate >= 80 ? 'medium' : 'low');
    const isFav = STATE.favorites.has(m.id);
    let badges = '<span class="badge badge-cat">' + catName + '</span>';
    badges += '<span class="badge badge-degree">' + degreeLabel + '</span>';
    if (m.isFirstClass) badges += '<span class="badge badge-first-class">一流本科</span>';
    if (m.isCharacteristic) badges += '<span class="badge badge-feature">国家特色</span>';
    if (m.hotTag === '热门') badges += '<span class="badge badge-hot">🔥热门</span>';
    if (m.hotTag === '新增') badges += '<span class="badge badge-hot">🆕新增</span>';
    if (m.hotTag === '冷门') badges += '<span class="badge badge-degree">❄️冷门</span>';

    return `
      <div class="major-card" data-id="${m.id}" data-cat="${m.category}">
        <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${m.id}" title="${isFav ? '取消收藏' : '收藏'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <div class="card-header">
          <div class="card-title">
            <div class="major-name">${escapeHtml(m.name)}</div>
            <span class="major-code">${m.code}</span>
          </div>
        </div>
        <div class="card-badges">${badges}</div>
        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-label">学位:</span>
            <span class="meta-value">${degreeLabel}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">学制:</span>
            <span class="meta-value">${m.years}年</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">人气:</span>
            <span class="meta-value">${renderStars(m.popularity)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">层次:</span>
            <span class="meta-value">${m.years >= 4 ? '高等教育' : '高等专科'}</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-row">
            <span class="stat-name">就业率</span>
            <div class="progress-bar">
              <div class="progress-fill ${progClass}" style="width:${m.employmentRate}%"></div>
            </div>
            <span class="stat-value-num">${m.employmentRate}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">平均薪资</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${Math.min(100, m.avgSalary5y / 250)}%;background:linear-gradient(90deg,var(--accent-orange),#ea580c)"></div>
            </div>
            <span class="stat-value-num salary-value">¥${(m.avgSalary5y / 10000).toFixed(1)}万</span>
          </div>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  function openDetail(id) {
    const major = STATE.data && STATE.data.majors ? STATE.data.majors.find(m => m.id === Number(id)) : null;
    if (!major) return;
    location.hash = '#major=' + id;
  }

  function closeDetail() {
    if (location.hash.startsWith('#major=')) {
      history.pushState('', document.title, location.pathname + location.search);
    }
    hideModal();
  }

  function showModal() {
    $('modalOverlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    $('modalOverlay').classList.add('hidden');
    document.body.style.overflow = '';
  }

  function renderDetail(id) {
    const major = STATE.data.majors.find(m => m.id === Number(id));
    if (!major) { hideModal(); return; }

    const catName = CATEGORY_NAMES[major.category] || major.category;
    const degreeLabel = major.degree === 'associate' ? '专科' : major.degree;
    const emp = major.employment || {};
    const salary = emp.salary || { avgMonth5y: 0, topCities: [] };
    const post = emp.postgraduate || { directions: [] };
    const unis = emp.universities || [];
    const qas = major.qas || [];
    const courses = major.coreCourses || [];
    const industries = emp.industries || [];
    const subj = major.selectSubjects || { preferred: '不限', firstChoice: { physics: 50, history: 50 }, secondChoice: {} };
    const relatedIds = major.relatedIds || [];

    const progClass = major.employmentRate >= 90 ? '' : (major.employmentRate >= 80 ? 'medium' : 'low');
    const favActive = STATE.favorites.has(major.id);

    let badges = '<span class="badge badge-cat" style="background:rgba(255,255,255,0.25);color:white;border:1px solid rgba(255,255,255,0.35)">' + catName + '</span>';
    badges += '<span class="badge badge-degree" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3)">' + degreeLabel + '</span>';
    if (major.isFirstClass) badges += '<span class="badge badge-first-class">🏆 国家级一流本科</span>';
    if (major.isCharacteristic) badges += '<span class="badge badge-feature">⭐ 国家特色</span>';

    const relatedList = relatedIds.map(rid => {
      const r = STATE.data.majors.find(m => m.id === rid);
      if (!r) return '';
      return `<div class="related-item" onclick="openDetail(${r.id});return false;">
        <div class="related-name">${escapeHtml(r.name)}</div>
        <div class="related-code">${r.code} · ${CATEGORY_NAMES[r.category] || r.category}</div>
      </div>`;
    }).join('');

    const maxSalary = salary.topCities.reduce((m, c) => Math.max(m, c.salary), 0) || 1;

    const content = `
      <div class="detail-header" data-cat="${major.category}">
        <button class="favorite-btn detail-favorite-btn ${favActive ? 'active' : ''}" 
          style="top:24px;right:56px;font-size:24px;position:absolute;background:rgba(255,255,255,0.15);padding:6px 10px;border-radius:8px;"
          onclick="toggleFavorite(${major.id}, event)" title="${favActive ? '取消收藏' : '收藏'}">
          ${favActive ? '❤️' : '🤍'}
        </button>
        <h2 class="detail-title">${escapeHtml(major.name)} <span style="font-size:16px;opacity:0.85;font-weight:400">#${major.code}</span></h2>
        <div class="detail-subtitle">
          <div class="item">🎓 学位：${degreeLabel}</div>
          <div class="item">📚 学制：${major.years}年</div>
          <div class="item">⭐ 人气：${renderStars(major.popularity)}</div>
          <div class="item">✅ 就业率：${major.employmentRate}%</div>
          <div class="item">💰 5年平均：¥${salary.avgMonth5y.toLocaleString()}/月</div>
        </div>
        <div class="card-badges" style="margin-top:16px">${badges}</div>
      </div>

      <div class="detail-tabs" role="tablist">
        <button class="detail-tab active" data-tab="0">📖 专业概况</button>
        <button class="detail-tab" data-tab="1">📝 核心课程</button>
        <button class="detail-tab" data-tab="2">💼 就业方向</button>
        <button class="detail-tab" data-tab="3">💵 薪资行情</button>
        <button class="detail-tab" data-tab="4">🎯 考研方向</button>
        <button class="detail-tab" data-tab="5">🏫 院校推荐</button>
        <button class="detail-tab" data-tab="6">❓ 常见问答</button>
      </div>

      <div class="detail-body">
        <div class="tab-section active" data-section="0">
          <div class="section-block">
            <h3>专业是什么</h3>
            <div class="overview-text">${escapeHtml(major.overview?.whatIs || '')}</div>
          </div>
          <div class="section-block">
            <h3>主要学什么</h3>
            <div class="overview-text">${escapeHtml(major.overview?.whatLearn || '')}</div>
          </div>

          <h3>学生构成数据</h3>
          <div class="charts-row">
            <div class="chart-card">
              <div class="chart-title">男女比例</div>
              <div class="pie-chart-container">
                <div class="pie-chart" style="background: conic-gradient(#3b82f6 0% ${major.maleRatio}%, #ec4899 ${major.maleRatio}% 100%)"></div>
                <div class="pie-legend">
                  <div class="legend-item"><span class="legend-color" style="background:#3b82f6"></span>男生<span class="legend-value">${major.maleRatio}%</span></div>
                  <div class="legend-item"><span class="legend-color" style="background:#ec4899"></span>女生<span class="legend-value">${major.femaleRatio}%</span></div>
                </div>
              </div>
            </div>
            <div class="chart-card">
              <div class="chart-title">文理科比例</div>
              <div class="pie-chart-container">
                <div class="pie-chart" style="background: conic-gradient(#f59e0b 0% ${major.libRatio}%, #2563eb ${major.libRatio}% 100%)"></div>
                <div class="pie-legend">
                  <div class="legend-item"><span class="legend-color" style="background:#f59e0b"></span>文科<span class="legend-value">${major.libRatio}%</span></div>
                  <div class="legend-item"><span class="legend-color" style="background:#2563eb"></span>理科<span class="legend-value">${major.sciRatio}%</span></div>
                </div>
              </div>
            </div>
            <div class="chart-card">
              <div class="chart-title">就业率概况</div>
              <div class="bar-chart" style="margin-top:20px">
                <div class="bar-item">
                  <span class="bar-label">就业率</span>
                  <div class="bar-track">
                    <div class="bar-fill" style="width:${major.employmentRate}%">
                      <span class="bar-fill-text">${major.employmentRate}%</span>
                    </div>
                  </div>
                </div>
                <div class="bar-item" style="margin-top:20px">
                  <span class="bar-label">平均月薪</span>
                  <div class="bar-track">
                    <div class="bar-fill" style="width:${Math.min(100, salary.avgMonth5y / 250)}%;background:linear-gradient(90deg,#f97316,#ea580c)">
                      <span class="bar-fill-text">¥${salary.avgMonth5y}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="select-subjects-card">
            <h3>新高考3+1+2选考科目要求</h3>
            <span class="subject-preferred">首选建议：${escapeHtml(subj.preferred)}</span>
            <div class="subjects-section" style="margin-top:20px">
              <div class="subjects-title">首选科目占比（物理/历史）</div>
              <div class="subject-bar-row">
                <span class="subject-bar-label">物理</span>
                <div class="subject-bar-track">
                  <div class="subject-bar-fill fill-physics" style="width:${subj.firstChoice?.physics || 0}%"></div>
                </div>
                <span class="subject-bar-value">${subj.firstChoice?.physics || 0}%</span>
              </div>
              <div class="subject-bar-row">
                <span class="subject-bar-label">历史</span>
                <div class="subject-bar-track">
                  <div class="subject-bar-fill fill-history" style="width:${subj.firstChoice?.history || 0}%"></div>
                </div>
                <span class="subject-bar-value">${subj.firstChoice?.history || 0}%</span>
              </div>
            </div>
            <div class="subjects-section">
              <div class="subjects-title">再选科目组合要求</div>
              <div class="second-subjects">
                ${Object.entries(subj.secondChoice || {}).map(([k, v]) => `
                  <div class="second-subject-item">
                    <span class="second-subject-combo">${escapeHtml(k)}</span>
                    <span class="second-subject-percent">${v}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="tab-section" data-section="1">
          <h3>核心课程（共${courses.length}门）</h3>
          <div class="courses-grid">
            ${courses.map((c, i) => `<div class="course-item"><span style="color:var(--accent-primary);font-weight:600;margin-right:6px">${i + 1}.</span>${escapeHtml(c)}</div>`).join('')}
          </div>
        </div>

        <div class="tab-section" data-section="2">
          <h3>就业行业分布</h3>
          <div class="industries-list">
            ${industries.map(ind => `
              <div class="industry-item">
                <div class="industry-head">
                  <span class="industry-name">${escapeHtml(ind.name)}</span>
                  <span class="industry-percent">${ind.percent}%</span>
                </div>
                <div class="industry-bar">
                  <div class="industry-fill" style="width:${ind.percent}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-section" data-section="3">
          <div class="salary-highlight">
            <div class="salary-desc">毕业5年平均月薪</div>
            <div class="salary-number">¥${salary.avgMonth5y.toLocaleString()}</div>
            <div class="salary-desc">数据仅供参考，因地区、行业、能力而异</div>
          </div>
          <h3>行业TOP10就业城市薪资对比</h3>
          <div class="cities-list">
            ${salary.topCities.map((c, i) => `
              <div class="city-item">
                <span class="city-rank">${i + 1}</span>
                <span class="city-name">${c.city}</span>
                <div class="city-bar">
                  <div class="city-fill" style="width:${(c.salary / maxSalary * 100).toFixed(0)}%"></div>
                </div>
                <span class="city-salary">¥${c.salary.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-section" data-section="4">
          <h3>对口研究生专业推荐</h3>
          <div class="post-list">
            ${post.directions.length ? post.directions.map(d => `
              <div class="post-item">
                <div class="post-name">🎯 ${escapeHtml(d.name)}</div>
                <div class="post-major">${escapeHtml(d.major)}</div>
              </div>
            `).join('') : '<p style="color:var(--text-tertiary);padding:20px;text-align:center">暂无推荐数据</p>'}
          </div>
        </div>

        <div class="tab-section" data-section="5">
          <h3>开设院校推荐（共${unis.length}所）</h3>
          <div class="university-list">
            ${unis.map(u => {
              let levels = '';
              if (u.level) {
                if (u.level.includes('985')) levels += '<span class="level-tag level-985">985</span>';
                if (u.level.includes('211')) levels += '<span class="level-tag level-211">211</span>';
                if (u.level.includes('双一流')) levels += '<span class="level-tag level-double">双一流</span>';
              }
              if (u.isStrongBase) levels += '<span class="level-tag level-strongbase">强基计划</span>';
              return `
                <div class="university-item">
                  <div class="university-head">
                    <div>
                      <div class="university-name">🏛️ ${escapeHtml(u.name)}</div>
                      <div class="university-levels" style="margin-top:6px">${levels}</div>
                    </div>
                    <div class="university-score">
                      <span class="score-label">参考分数</span>
                      <span class="score-value">${u.score}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="tab-section" data-section="6">
          <h3>常见问答</h3>
          <div class="qa-list">
            ${qas.map(qa => `
              <div class="qa-item">
                <div class="qa-q">${escapeHtml(qa.q)}</div>
                <div class="qa-a">${escapeHtml(qa.a)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="related-section">
        <div class="related-title">🔗 同门类相似专业推荐</div>
        <div class="related-grid">
          ${relatedList || '<p style="color:var(--text-tertiary);grid-column:1/-1;text-align:center;padding:20px">暂无推荐</p>'}
        </div>
      </div>
    `;

    $('modalContent').innerHTML = content;
    showModal();

    $$('.detail-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = Number(tab.dataset.tab);
        STATE.currentDetailTab = idx;
        $$('.detail-tab').forEach(t => t.classList.toggle('active', Number(t.dataset.tab) === idx));
        $$('.tab-section').forEach(s => s.classList.toggle('active', Number(s.dataset.section) === idx));
      });
    });

    $$('.related-item .related-item, .related-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const n = item.querySelector('.related-code');
        if (!n) return;
        e.stopPropagation();
        const rid = item.getAttribute('onclick')?.match(/\d+/)?.[0];
        if (rid) openDetail(rid);
      });
    });
  }

  function onHashChange() {
    const hash = location.hash;
    const match = hash.match(/#major=(\d+)/);
    if (match) {
      const id = Number(match[1]);
      if (STATE.data && STATE.data.majors) {
        renderDetail(id);
      }
    } else {
      hideModal();
    }
  }

  function debounceSearch(val) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      STATE.filters.search = val;
      renderCards();
    }, DEBOUNCE_DELAY);
  }

  function bindEvents() {
    $('themeToggle').addEventListener('click', toggleTheme);

    $('favoritesBtn').addEventListener('click', () => {
      STATE.favoritesMode = !STATE.favoritesMode;
      $('favoritesBtn').style.background = STATE.favoritesMode ? 'rgba(239,68,68,0.85)' : '';
      renderCards();
    });

    $('searchBtn').addEventListener('click', () => {
      STATE.filters.search = $('searchInput').value;
      renderCards();
    });

    $('searchInput').addEventListener('input', (e) => {
      debounceSearch(e.target.value);
    });

    $('searchInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        STATE.filters.search = e.target.value;
        clearTimeout(searchDebounceTimer);
        renderCards();
      }
    });

    $$('#searchTips .hot-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        $('searchInput').value = tag.textContent.trim();
        STATE.filters.search = tag.textContent.trim();
        renderCards();
      });
    });

    $$('#categoryTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#categoryTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filters.category = btn.dataset.category;
        renderCards();
      });
    });

    $$('#levelTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#levelTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filters.level = btn.dataset.level;
        renderCards();
      });
    });

    $$('#heatTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#heatTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filters.heat = btn.dataset.heat;
        renderCards();
      });
    });

    $('sortSelect').addEventListener('change', (e) => {
      STATE.filters.sort = e.target.value;
      renderCards();
    });

    $('retryBtn').addEventListener('click', bootstrap);
    $('resetFiltersBtn').addEventListener('click', () => {
      STATE.filters = { category: 'all', level: 'all', heat: 'all', search: '', sort: 'default' };
      STATE.favoritesMode = false;
      $('searchInput').value = '';
      $('sortSelect').value = 'default';
      $('favoritesBtn').style.background = '';
      $$('.filter-tabs').forEach(group => {
        $$('.tab-btn', group).forEach((b, i) => b.classList.toggle('active', i === 0));
      });
      renderCards();
    });

    $('modalOverlay').addEventListener('click', (e) => {
      if (e.target === $('modalOverlay')) closeDetail();
    });
    $('modalClose').addEventListener('click', closeDetail);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('modalOverlay').classList.contains('hidden')) closeDetail();
    });

    let scrollTimer = null;
    const backBtn = $('backToTop');
    window.addEventListener('scroll', () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        if (window.scrollY > 400) backBtn.classList.remove('hidden');
        else backBtn.classList.add('hidden');
      }, 100);
    }, { passive: true });

    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
  }

  async function bootstrap() {
    showLoading();
    bindEvents();
    const ok = await loadData();
    if (!ok) {
      showError();
      return;
    }
    renderCards();
    onHashChange();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadFavorites();
    bootstrap();
  });

  window.openDetail = openDetail;
  window.toggleFavorite = toggleFavorite;
})();

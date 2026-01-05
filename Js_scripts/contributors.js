// 🔮 GitHub Config – Optimized for OpenSource-Compass
const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'OpenSource-Compass'; // ← Corrected to match project!
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// 💎 Scoring System (Inspired by SWOC/GSSoC tiers)
const POINTS = { L3: 11, L2: 5, L1: 2, DEFAULT: 1 };
let contributorsData = [];
let currentPage = 1;
const itemsPerPage = 8;

// 🚀 Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupModalEvents();
});

// 🌐 Master Data Loader (with graceful fallback)
async function initData() {
  try {
    const [repoRes, contributorsRes, pulls] = await Promise.all([
      fetch(API_BASE),
      fetch(`${API_BASE}/contributors?per_page=100`),
      fetchAllPulls()
    ]);

    if (repoRes.status === 403 || contributorsRes.status === 403) throw new Error("Rate Limit");
    if (!repoRes.ok || !contributorsRes.ok) throw new Error("Repo Error");

    const repoData = await repoRes.json();
    const rawContributors = await contributorsRes.json();
    const totalCommits = await fetchTotalCommits();

    processData(repoData, rawContributors, pulls, totalCommits);
    fetchRecentActivity();

  } catch (err) {
    console.warn("🚨 API Failed → Loading Mock Data", err);
    loadMockData(); // ← Safety net
  }
}

// 🧪 Mock Data (Beautiful & Thematic)
function loadMockData() {
  const grid = document.getElementById('contributors-grid');
  if (grid && !document.querySelector('.offline-banner')) {
    grid.insertAdjacentHTML('beforebegin', `
      <div class="offline-banner">
        <i class="fas fa-exclamation-triangle"></i>
        Demo Mode: API Limit Reached — Showing Sample Contributors
      </div>
    `);
  }

  updateGlobalStats(8, 32, 420, 120, 28, 342);
  contributorsData = Array.from({length: 8}, (_, i) => ({
    login: ["Nova_Coder", "ByteQueen", "DevWizard", "CodeSorceress", "GitNinja", "PixelPioneer", "LoopMaster", "AsyncAlchemist"][i] || `User${i+1}`,
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${i+1}`,
    html_url: "#",
    points: [250, 180, 130, 95, 70, 45, 25, 10][i],
    prs: [20, 15, 12, 9, 7, 4, 2, 1][i],
    contributions: [50, 40, 30, 25, 20, 10, 5, 2][i]
  }));

  renderContributors(1);
  mockActivityFeed();
}

function mockActivityFeed() {
  const feed = document.getElementById('activity-list');
  if (!feed) return;
  feed.innerHTML = `
    <div class="activity-item">
      <div class="activity-marker"></div>
      <div class="commit-msg"><span>DevWizard</span>: Added responsive modal system</div>
      <div class="commit-date">3 hours ago</div>
    </div>
    <div class="activity-item">
      <div class="activity-marker"></div>
      <div class="commit-msg"><span>CodeSorceress</span>: Implemented league-based scoring</div>
      <div class="commit-date">1 day ago</div>
    </div>
    <div class="activity-item">
      <div class="activity-marker"></div>
      <div class="commit-msg"><span>System</span>: Demo Mode Active — Contribute to unlock real data!</div>
      <div class="commit-date">Now</div>
    </div>
  `;
}

// 📊 Fetch helpers
async function fetchTotalCommits() {
  try {
    const res = await fetch(`${API_BASE}/commits?per_page=1`);
    const link = res.headers.get('Link');
    if (link) {
      const match = link.match(/page=(\d+)>; rel="last"/);
      return match ? match[1] : 1;
    }
    return 1;
  } catch { return "N/A"; }
}

async function fetchAllPulls() {
  let all = [], page = 1;
  while (page <= 3) {
    try {
      const res = await fetch(`${API_BASE}/pulls?state=all&per_page=100&page=${page}`);
      if (!res.ok) break;
      const data = await res.json();
      if (!data.length) break;
      all = all.concat(data);
      page++;
    } catch (e) { break; }
  }
  return all;
}

// 🧠 Process & Rank
function processData(repoData, contributors, pulls, totalCommits) {
  const statsMap = {};
  let totalPRs = 0, totalPoints = 0;

  pulls.forEach(pr => {
    if (!pr.merged_at || !pr.user) return;
    const login = pr.user.login;
    if (!statsMap[login]) statsMap[login] = { prs: 0, points: 0 };
    
    statsMap[login].prs++;
    totalPRs++;

    let pts = POINTS.DEFAULT;
    const labels = pr.labels?.map(l => l.name.toLowerCase()) || [];
    if (labels.some(l => l.includes('level 3'))) pts = POINTS.L3;
    else if (labels.some(l => l.includes('level 2'))) pts = POINTS.L2;
    else if (labels.some(l => l.includes('level 1'))) pts = POINTS.L1;
    
    statsMap[login].points += pts;
    totalPoints += pts;
  });

  contributorsData = contributors
    .filter(c => c.login.toLowerCase() !== REPO_OWNER.toLowerCase())
    .map(c => ({ ...c, ...statsMap[c.login] }))
    .filter(c => c.prs > 0)
    .sort((a, b) => b.points - a.points);

  updateGlobalStats(contributorsData.length, totalPRs, totalPoints, repoData.stargazers_count, repoData.forks_count, totalCommits);
  renderContributors(1);
}

function updateGlobalStats(count, prs, points, stars, forks, commits) {
  const update = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  update('total-contributors', count);
  update('total-prs', prs);
  update('total-points', points);
  update('total-stars', stars || 0);
  update('total-forks', forks || 0);
  update('total-commits', commits || 'N/A');
}

// 🏆 League System
function getLeague(points) {
  if (points >= 150) return { label: 'Gold League 🏆', class: 'tier-gold', badge: 'badge-gold' };
  if (points >= 75)  return { label: 'Silver League 🥈', class: 'tier-silver', badge: 'badge-silver' };
  if (points >= 30)  return { label: 'Bronze League 🥉', class: 'tier-bronze', badge: 'badge-bronze' };
  return { label: 'Contributor 🎖️', class: 'tier-contributor', badge: 'badge-contributor' };
}

// 🖼️ Render Cards
function renderContributors(page) {
  const grid = document.getElementById('contributors-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const items = contributorsData.slice(start, end);

  if (items.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#888;">No contributors yet. Be the first!</p>';
    return;
  }

  items.forEach((c, idx) => {
    const rank = start + idx + 1;
    const league = getLeague(c.points);
    const card = document.createElement('div');
    card.className = `contributor-card ${league.class}`;
    card.innerHTML = `
      <img src="${c.avatar_url}&s=160" alt="${c.login}">
      <span class="cont-name">${c.login}</span>
      <span class="cont-commits-badge ${league.badge}">PRs: ${c.prs} | Pts: ${c.points}</span>
    `;
    card.addEventListener('click', () => openModal(c, league, rank));
    grid.appendChild(card);
  });

  renderPagination(page);
}

function renderPagination(page) {
  const total = Math.ceil(contributorsData.length / itemsPerPage);
  const el = document.getElementById('pagination-controls');
  if (total <= 1) { if (el) el.innerHTML = ''; return; }
  if (!el) return;
  el.innerHTML = `
    <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
      <i class="fas fa-chevron-left"></i> Prev
    </button>
    <span class="page-info">Page ${page} of ${total}</span>
    <button class="pagination-btn" ${page === total ? 'disabled' : ''} onclick="changePage(${page + 1})">
      Next <i class="fas fa-chevron-right"></i>
    </button>
  `;
}

window.changePage = (p) => { currentPage = p; renderContributors(p); };

// 🔍 Modal
function setupModalEvents() {
  const modal = document.getElementById('contributor-modal');
  const close = document.querySelector('.close-modal');
  if (close) close.addEventListener('click', () => modal.classList.remove('active'));
  if (modal) modal.addEventListener('click', (e) => e.target === modal && modal.classList.remove('active'));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && modal?.classList.remove('active'));
}

function openModal(contributor, league, rank) {
  const m = document.getElementById('contributor-modal');
  const container = m.querySelector('.modal-container');
  
  document.getElementById('modal-avatar').src = `${contributor.avatar_url}&s=200`;
  document.getElementById('modal-name').textContent = contributor.login;
  document.getElementById('modal-id').textContent = `ID: ${contributor.id || 'N/A'}`;
  document.getElementById('modal-rank').textContent = `#${rank}`;
  document.getElementById('modal-score').textContent = contributor.points;
  document.getElementById('modal-prs').textContent = contributor.prs;
  document.getElementById('modal-commits').textContent = contributor.contributions || 0;
  const badgeEl = document.getElementById('modal-league-badge');
  badgeEl.textContent = league.label;
  badgeEl.className = 'league-badge ' + league.badge;

  const prLink = `https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls?q=is%3Apr+author%3A${contributor.login}`;
  document.getElementById('modal-pr-link').href = prLink;
  document.getElementById('modal-profile-link').href = contributor.html_url || '#';

  container.className = 'modal-container ' + league.class;
  m.classList.add('active');
}

// 📡 Recent Activity
async function fetchRecentActivity() {
  try {
    const res = await fetch(`${API_BASE}/commits?per_page=10`);
    if (!res.ok) return;
    const commits = await res.json();
    const list = document.getElementById('activity-list');
    if (!list) return;
    list.innerHTML = commits.map(commit => {
      const name = commit.commit.author.name || 'Anonymous';
      const msg = (commit.commit.message.split('\n')[0] || 'Commit').substring(0, 80) + '...';
      const date = new Date(commit.commit.author.date).toLocaleDateString();
      return `
        <div class="activity-item">
          <div class="activity-marker"></div>
          <div class="commit-msg"><span>${name}</span>: ${msg}</div>
          <div class="commit-date">${date}</div>
        </div>
      `;
    }).join('');
  } catch (e) { console.log("Activity feed offline"); }
}
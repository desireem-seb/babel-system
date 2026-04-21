// State
let currentProduct = null;
let currentFramework = null;
let currentCampaign = null;
let editingAsset = null;
let lastFrameworkUpdate = null;
let calendarQuarterOffset = 0;
let currentQuarter = null;
let currentAssetSearch = '';

// DOM Elements
const productSelector = document.getElementById('productSelector');
const emptyState = document.getElementById('emptyState');
const campaignContent = document.getElementById('campaignContent');
const portfolioText = document.getElementById('portfolioText');
const taglineText = document.getElementById('taglineText');
const pillarsGrid = document.getElementById('pillarsGrid');
const addAssetBtn = document.getElementById('addAssetBtn');
const assetModal = document.getElementById('assetModal');
const assetForm = document.getElementById('assetForm');
const saveCampaignBtn = document.getElementById('saveCampaign');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  // Initialize journey map
  if (typeof initializeJourneyMap === 'function') {
    journeyMap = initializeJourneyMap();
  }
});

function setupEventListeners() {
  // Home button - go back to welcome screen
  const homeButton = document.getElementById('homeButton');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      goHome();
    });
  }

  // Product selector
  productSelector.addEventListener('change', (e) => {
    if (e.target.value) {
      loadProduct(e.target.value);
    }
  });

  // Product cards in empty state
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const product = card.dataset.product;
      productSelector.value = product;
      loadProduct(product);
    });
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // Add Asset Button
  addAssetBtn.addEventListener('click', () => {
    openAssetModal();
  });

  // Asset search
  const assetSearchInput = document.getElementById('assetSearchInput');
  if (assetSearchInput) {
    let searchTimer;
    assetSearchInput.addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        currentAssetSearch = e.target.value.trim().toLowerCase();
        renderAssetRepository();
      }, 200);
    });
  }

  // CSV export
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportAssetsCSV);
  }

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAssetModal();
    });
  });

  // Click outside modal to close
  assetModal.addEventListener('click', (e) => {
    if (e.target === assetModal) {
      closeAssetModal();
    }
  });

  // Asset form submit
  assetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveAsset();
  });

  // Save Campaign
  saveCampaignBtn.addEventListener('click', () => {
    saveCampaign();
  });

  // Feedback button and modal
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackModal = document.getElementById('feedbackModal');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackCloseButtons = document.querySelectorAll('.feedback-close');

  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      feedbackModal.style.display = 'flex';
    });
  }

  feedbackCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      feedbackModal.style.display = 'none';
      feedbackForm.reset();
    });
  });

  feedbackModal.addEventListener('click', (e) => {
    if (e.target === feedbackModal) {
      feedbackModal.style.display = 'none';
      feedbackForm.reset();
    }
  });

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitFeedback();
    });
  }

  // Edit Framework button and modal
  const editFrameworkBtn = document.getElementById('editFrameworkBtn');
  const editFrameworkModal = document.getElementById('editFrameworkModal');
  const editFrameworkForm = document.getElementById('editFrameworkForm');
  const frameworkCloseButtons = document.querySelectorAll('.framework-close');

  if (editFrameworkBtn) {
    editFrameworkBtn.addEventListener('click', () => {
      openEditFrameworkModal();
    });
  }

  frameworkCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      editFrameworkModal.style.display = 'none';
      editFrameworkForm.reset();
    });
  });

  editFrameworkModal.addEventListener('click', (e) => {
    if (e.target === editFrameworkModal) {
      editFrameworkModal.style.display = 'none';
      editFrameworkForm.reset();
    }
  });

  if (editFrameworkForm) {
    editFrameworkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveFrameworkEdits();
    });
  }

  // Edit Flow button and modal
  const editFlowBtn = document.getElementById('editFlowBtn');
  const editFlowModal = document.getElementById('editFlowModal');
  const editFlowForm = document.getElementById('editFlowForm');
  const flowCloseButtons = document.querySelectorAll('.flow-close');

  if (editFlowBtn) {
    editFlowBtn.addEventListener('click', () => {
      openEditFlowModal();
    });
  }

  flowCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      editFlowModal.style.display = 'none';
      editFlowForm.reset();
    });
  });

  editFlowModal.addEventListener('click', (e) => {
    if (e.target === editFlowModal) {
      editFlowModal.style.display = 'none';
      editFlowForm.reset();
    }
  });

  if (editFlowForm) {
    editFlowForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveFlowEdits();
    });
  }

  // Content Generation Form
  const generateContentForm = document.getElementById('generateContentForm');
  if (generateContentForm) {
    generateContentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await generateNewContent();
    });
  }

  // Flow filters
  const flowPersonaFilter = document.getElementById('flowPersonaFilter');
  const flowRegionFilter = document.getElementById('flowRegionFilter');
  const flowLanguageFilter = document.getElementById('flowLanguageFilter');
  const flowResetFilters = document.getElementById('flowResetFilters');

  if (flowPersonaFilter) {
    flowPersonaFilter.addEventListener('change', () => renderCampaignFlow());
  }
  if (flowRegionFilter) {
    flowRegionFilter.addEventListener('change', () => renderCampaignFlow());
  }
  if (flowLanguageFilter) {
    flowLanguageFilter.addEventListener('change', () => renderCampaignFlow());
  }
  if (flowResetFilters) {
    flowResetFilters.addEventListener('click', () => {
      flowPersonaFilter.value = '';
      flowRegionFilter.value = '';
      flowLanguageFilter.value = '';
      renderCampaignFlow();
    });
  }

  // Close content preview
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => {
      document.getElementById('contentPreviewPanel').style.display = 'none';
    });
  }

  // Journey filters
  const journeyApplyFilters = document.getElementById('journeyApplyFilters');
  const journeyResetFilters = document.getElementById('journeyResetFilters');

  if (journeyApplyFilters) {
    journeyApplyFilters.addEventListener('click', () => {
      applyJourneyFilters();
    });
  }
  if (journeyResetFilters) {
    journeyResetFilters.addEventListener('click', () => {
      document.getElementById('journeyPersonaFilter').value = '';
      document.getElementById('journeyRegionFilter').value = '';
      document.getElementById('journeyLanguageFilter').value = '';
      applyJourneyFilters();
    });
  }

  // Quarter tabs — delegated from container
  const quarterDropdown = document.getElementById('quarterDropdown');
  if (quarterDropdown) {
    quarterDropdown.addEventListener('change', e => {
      currentQuarter = e.target.value || null;
      calendarQuarterOffset = 0;
      applyQuarterFilter();
    });
  }

  // Add quarter button
  const addQuarterBtn = document.getElementById('addQuarterBtn');
  if (addQuarterBtn) {
    addQuarterBtn.addEventListener('click', openAddQuarterModal);
  }

  // Add quarter modal
  const addQuarterModal = document.getElementById('addQuarterModal');
  document.querySelectorAll('.aq-close').forEach(btn => {
    btn.addEventListener('click', () => { addQuarterModal.style.display = 'none'; });
  });
  if (addQuarterModal) {
    addQuarterModal.addEventListener('click', e => {
      if (e.target === addQuarterModal) addQuarterModal.style.display = 'none';
    });
  }
  const newQuarterSelect = document.getElementById('newQuarterSelect');
  if (newQuarterSelect) {
    newQuarterSelect.addEventListener('change', updateAddQuarterPrompt);
  }
  document.getElementById('aqAddBlank')?.addEventListener('click', () => {
    addQuarterToList(document.getElementById('newQuarterSelect').value, false);
  });
  document.getElementById('aqDuplicate')?.addEventListener('click', () => {
    const target = document.getElementById('newQuarterSelect').value;
    document.getElementById('addQuarterModal').style.display = 'none';
    openDuplicateQuarterModal(currentQuarter, target);
  });
  document.getElementById('aqAddBlankOnly')?.addEventListener('click', () => {
    addQuarterToList(document.getElementById('newQuarterSelect').value, false);
  });

  // Campaign Brief modal
  const editBriefBtn = document.getElementById('editBriefBtn');
  const campaignBriefModal = document.getElementById('campaignBriefModal');
  const briefCloseButtons = document.querySelectorAll('.brief-modal-close');
  const saveBriefBtn = document.getElementById('saveBriefBtn');
  const useTemplateBtn = document.getElementById('useTemplateBtn');
  const briefFileUpload = document.getElementById('briefFileUpload');

  if (editBriefBtn) {
    editBriefBtn.addEventListener('click', openCampaignBriefModal);
  }
  briefCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => { campaignBriefModal.style.display = 'none'; });
  });
  if (campaignBriefModal) {
    campaignBriefModal.addEventListener('click', e => {
      if (e.target === campaignBriefModal) campaignBriefModal.style.display = 'none';
    });
  }
  if (saveBriefBtn) {
    saveBriefBtn.addEventListener('click', saveCampaignBrief);
  }
  if (useTemplateBtn) {
    useTemplateBtn.addEventListener('click', useTemplate);
  }
  if (briefFileUpload) {
    briefFileUpload.addEventListener('change', handleBriefFileUpload);
  }

  // Asset suggestions modal
  const suggestionsCloseButtons = document.querySelectorAll('.suggestions-close');
  const assetSuggestionsModal = document.getElementById('assetSuggestionsModal');
  suggestionsCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => { assetSuggestionsModal.style.display = 'none'; });
  });
  if (assetSuggestionsModal) {
    assetSuggestionsModal.addEventListener('click', e => {
      if (e.target === assetSuggestionsModal) assetSuggestionsModal.style.display = 'none';
    });
  }
  const generateSuggestedBtn = document.getElementById('generateSuggestedBtn');
  if (generateSuggestedBtn) {
    generateSuggestedBtn.addEventListener('click', generateSuggestedAssets);
  }

  // Duplicate quarter review modal
  const duplicateQuarterModal = document.getElementById('duplicateQuarterModal');
  document.querySelectorAll('.duplicate-close').forEach(btn => {
    btn.addEventListener('click', () => { duplicateQuarterModal.style.display = 'none'; });
  });
  if (duplicateQuarterModal) {
    duplicateQuarterModal.addEventListener('click', e => {
      if (e.target === duplicateQuarterModal) duplicateQuarterModal.style.display = 'none';
    });
  }
  document.getElementById('confirmDuplicateBtn')?.addEventListener('click', confirmDuplicateQuarter);

  // Calendar filters
  const calendarView = document.getElementById('calendarView');
  const calendarProductFilter = document.getElementById('calendarProductFilter');
  const calendarAudienceFilter = document.getElementById('calendarAudienceFilter');
  const calendarStageFilter = document.getElementById('calendarStageFilter');
  const exportToSlidesBtn = document.getElementById('exportToSlidesBtn');
  const downloadCalendarBtn = document.getElementById('downloadCalendarBtn');

  if (calendarView) {
    calendarView.addEventListener('change', () => renderCalendar());
  }
  if (calendarProductFilter) {
    calendarProductFilter.addEventListener('change', () => renderCalendar());
  }
  if (calendarAudienceFilter) {
    calendarAudienceFilter.addEventListener('change', () => renderCalendar());
  }
  if (calendarStageFilter) {
    calendarStageFilter.addEventListener('change', () => renderCalendar());
  }
  if (exportToSlidesBtn) {
    exportToSlidesBtn.addEventListener('click', () => exportCalendarToSlides());
  }
  if (downloadCalendarBtn) {
    downloadCalendarBtn.addEventListener('click', () => downloadCalendar());
  }
}

function goHome() {
  currentProduct = null;
  currentFramework = null;
  currentCampaign = null;
  currentQuarter = null;
  productSelector.value = '';
  document.getElementById('quarterNavGroup').style.display = 'none';
  document.getElementById('saveCampaign').style.display = 'none';
  campaignContent.style.display = 'none';
  emptyState.style.display = 'block';
}

async function loadProduct(productId) {
  currentProduct = productId;

  try {
    // Load framework
    const frameworkRes = await fetch(`/api/frameworks/${productId}`);
    currentFramework = await frameworkRes.json();

    // Load campaign
    const campaignRes = await fetch(`/api/campaigns/${productId}`);
    currentCampaign = await campaignRes.json();

    // Show campaign content
    emptyState.style.display = 'none';
    campaignContent.style.display = 'block';
    document.getElementById('saveCampaign').style.display = 'inline-flex';

    // Init active quarters (default to current calendar quarter)
    if (!currentCampaign.activeQuarters || currentCampaign.activeQuarters.length === 0) {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3) + 1;
      const y = now.getFullYear();
      currentCampaign.activeQuarters = [`Q${q}-${y}`];
    }
    document.getElementById('quarterNavGroup').style.display = 'flex';
    renderQuarterTabs();

    // Render all tabs
    renderFramework();
    renderAssetRepository();
    renderCampaignFlow();
    renderContentGenerator();

    // Load assets into journey map
    if (journeyMap) {
      journeyMap.loadAssets(currentCampaign.assets || []);
      journeyMap.loadState(currentCampaign);
    }
  } catch (error) {
    console.error('Error loading product:', error);
    showToast('⚠️ Failed to load product data', 4000);
  }
}

function renderFramework() {
  // Portfolio
  portfolioText.textContent = currentFramework.portfolioMessage || currentFramework.portfolio || '';
  taglineText.textContent = currentFramework.tagline || '';

  // Pillars
  pillarsGrid.innerHTML = '';
  currentFramework.pillars.forEach(pillar => {
    const pillarCard = document.createElement('div');
    pillarCard.className = 'pillar-card';
    pillarCard.innerHTML = `
      <div class="pillar-header">
        <div class="pillar-name">${pillar.name}</div>
      </div>
      <div class="pillar-description">${pillar.description}</div>
      <div class="pillar-capabilities">
        <strong>Key Capabilities:</strong>
        <ul>
          ${pillar.capabilities.map(cap => `<li>${cap}</li>`).join('')}
        </ul>
      </div>
    `;
    pillarsGrid.appendChild(pillarCard);
  });

  // Update pillar selector in modal
  const pillarSelect = document.getElementById('assetPillar');
  pillarSelect.innerHTML = '<option value="">No specific pillar</option>';
  currentFramework.pillars.forEach(pillar => {
    const option = document.createElement('option');
    option.value = pillar.id;
    option.textContent = pillar.name;
    pillarSelect.appendChild(option);
  });

  rebuildPersonaFilters();
  rebuildChannelFilters();
  renderCampaignBrief();
}

function renderCampaignBrief() {
  const briefSection = document.getElementById('campaignBriefSection');
  const briefDisplay = document.getElementById('campaignBriefDisplay');
  if (!briefSection || !briefDisplay) return;

  briefSection.style.display = 'block';

  // Quarter theme pill
  const themeDisplay = document.getElementById('quarterThemeDisplay');
  if (themeDisplay && currentQuarter && currentFramework) {
    const theme = (currentFramework.quarterlyThemes || {})[currentQuarter];
    if (theme) {
      themeDisplay.textContent = `🎯 ${currentQuarter}: ${theme}`;
      themeDisplay.style.display = 'inline-block';
    } else {
      themeDisplay.style.display = 'none';
    }
  } else if (themeDisplay) {
    themeDisplay.style.display = 'none';
  }

  const content = currentFramework.campaignBrief?.content || '';

  if (!content) {
    briefDisplay.innerHTML = `
      <div class="brief-empty">
        <p>No campaign brief yet. Click <strong>✏️ Edit Campaign Brief</strong> to add one — paste from Google Docs or use the built-in template.</p>
      </div>
    `;
    return;
  }

  briefDisplay.innerHTML = `<div class="brief-content-body">${content.replace(/\n/g, '<br>')}</div>`;
}

function getQuarterFilteredAssets(assets) {
  if (!currentQuarter) return assets;
  return assets.filter(a => {
    if (!a.quarters || a.quarters.length === 0) {
      // Fall back to launch date if no quarters assigned
      if (a.launchDate || a.createdAt) {
        const d = new Date(a.launchDate || a.createdAt);
        const q = Math.floor(d.getMonth() / 3) + 1;
        const y = d.getFullYear();
        return `Q${q}-${y}` === currentQuarter;
      }
      return true; // unassigned with no date shows in all views
    }
    return a.quarters.includes(currentQuarter);
  });
}

function renderAssetRepository() {
  const stages = ['awareness', 'familiarity', 'consideration', 'decision'];
  let allAssets = getQuarterFilteredAssets(currentCampaign.assets || []);

  // Apply search filter
  if (currentAssetSearch) {
    allAssets = allAssets.filter(a =>
      a.name.toLowerCase().includes(currentAssetSearch) ||
      (a.type || '').toLowerCase().includes(currentAssetSearch) ||
      (a.description || '').toLowerCase().includes(currentAssetSearch)
    );
  }

  // Show/hide no-results banner
  const noResults = document.getElementById('searchNoResults');
  const searchTermEl = document.getElementById('searchTerm');
  if (noResults) {
    const hasAny = allAssets.length > 0;
    noResults.style.display = (currentAssetSearch && !hasAny) ? 'block' : 'none';
    if (searchTermEl) searchTermEl.textContent = currentAssetSearch;
  }

  stages.forEach(stage => {
    const assets = allAssets.filter(a => a.stage === stage);
    const liveCount = assets.filter(a => a.status === 'live').length;

    const countEl = document.getElementById(`${stage}Count`);
    countEl.textContent = `${assets.length} assets | ${liveCount} live`;

    const listEl = document.getElementById(`${stage}Assets`);
    listEl.innerHTML = '';
    assets.forEach(asset => listEl.appendChild(createAssetCard(asset)));
  });
}

function createAssetCard(asset) {
  const card = document.createElement('div');
  card.className = 'asset-card';
  card.dataset.assetId = asset.id;

  const statusIcons = {
    'live': '✅',
    'in-progress': '🔴',
    'being-refreshed': '🟠'
  };

  // Handle both singular and plural field names for backward compatibility
  const channels = asset.channels || (asset.channel ? [].concat(asset.channel) : []);
  const personas = asset.personas || (asset.persona ? [].concat(asset.persona) : []);
  const regions = asset.regions || (asset.region ? [].concat(asset.region) : []);
  const languages = asset.languages || (asset.language ? [].concat(asset.language) : []);

  const channelTags = channels.map(ch =>
    `<span class="channel-tag">${getChannelLabel(ch)}</span>`
  ).join('');

  const personaTags = personas.map(p => {
    const label = getPersonaLabel(p);
    return `<span class="persona-tag ${p.toLowerCase().replace(/\s+/g, '-')}">${label}</span>`;
  }).join('');

  const regionTags = regions.map(r =>
    `<span class="region-tag">${r}</span>`
  ).join('');

  const languageTags = languages.map(l =>
    `<span class="language-tag">${l}</span>`
  ).join('');

  const statusCycle = { 'live': 'in-progress', 'in-progress': 'being-refreshed', 'being-refreshed': 'live' };
  const statusLabels = { 'live': 'Live', 'in-progress': 'In Progress', 'being-refreshed': 'Refreshing' };

  card.innerHTML = `
    <div class="asset-header">
      <span class="asset-type">${asset.type}</span>
      <div class="asset-card-actions">
        <button class="asset-status-btn status-${asset.status}" data-status="${asset.status}" title="Click to change status">${statusIcons[asset.status] || '⚪'} <span class="status-label">${statusLabels[asset.status] || ''}</span></button>
        <button class="asset-dupe-btn" title="Duplicate asset">⧉</button>
        <button class="asset-edit-btn" title="Edit asset">✏️</button>
      </div>
    </div>
    <div class="asset-name">${asset.name}</div>
    ${asset.description ? `<div class="asset-description">${asset.description}</div>` : ''}
    ${asset.url ? `<a class="asset-url-link" href="${asset.url}" target="_blank" rel="noopener" title="${asset.url}">🔗 View asset</a>` : ''}
    <div class="asset-tags">
      ${channelTags}
      ${personaTags}
      ${regionTags}
      ${languageTags}
    </div>
  `;

  // Edit button — open full modal
  card.querySelector('.asset-edit-btn').addEventListener('click', e => {
    e.stopPropagation();
    openAssetModal(asset);
  });

  // Status quick-toggle
  card.querySelector('.asset-status-btn').addEventListener('click', async e => {
    e.stopPropagation();
    const nextStatus = statusCycle[asset.status] || 'live';
    await patchAssetStatus(asset, nextStatus);
  });

  // Duplicate
  card.querySelector('.asset-dupe-btn').addEventListener('click', e => {
    e.stopPropagation();
    duplicateAsset(asset);
  });

  // Card body click → edit
  card.addEventListener('click', () => openAssetModal(asset));

  return card;
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}Tab`);
  });

  // Tab-specific render hooks
  if (tabName === 'calendar') {
    renderCalendar();
  }
}

// ─── Channel Helpers ─────────────────────────────────────────────────────────

function getFrameworkChannels() {
  if (currentFramework?.channels?.length) return currentFramework.channels;
  return [
    { value: 'paid-search', label: 'Paid Search' },
    { value: 'paid-social', label: 'Paid Social' },
    { value: 'email', label: 'Email' },
    { value: 'events-webinar', label: 'Events / Webinar' },
    { value: 'content-seo', label: 'Content / SEO' },
    { value: 'website', label: 'Website' },
    { value: 'direct-sales', label: 'Direct Sales' }
  ];
}

function getChannelLabel(value) {
  const channels = getFrameworkChannels();
  const match = channels.find(c => c.value === value || c.label === value);
  return match ? match.label : value;
}

function buildChannelCheckboxes(selectedChannels = []) {
  const group = document.getElementById('channelCheckboxGroup');
  if (!group) return;
  const channels = getFrameworkChannels();
  group.innerHTML = channels.map(c => `
    <label>
      <input type="checkbox" name="channel" value="${c.value}" ${selectedChannels.includes(c.value) ? 'checked' : ''}>
      ${c.label}
    </label>
  `).join('');
}

function renderChannelsEditor() {
  const list = document.getElementById('channelsEditorList');
  if (!list) return;
  const channels = getFrameworkChannels();
  list.innerHTML = '';
  channels.forEach(c => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:0.5rem; align-items:center;';
    row.innerHTML = `
      <input type="text" class="channel-label-input" value="${c.label}" placeholder="Channel name" style="flex:1; padding:0.35rem 0.6rem; font-size:0.82rem;">
      <button type="button" class="btn btn-secondary channel-remove-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem;">✕</button>
    `;
    row.querySelector('.channel-remove-btn').addEventListener('click', () => row.remove());
    list.appendChild(row);
  });
  document.getElementById('addChannelBtn').onclick = () => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:0.5rem; align-items:center;';
    row.innerHTML = `
      <input type="text" class="channel-label-input" value="" placeholder="e.g., Partner Marketing" style="flex:1; padding:0.35rem 0.6rem; font-size:0.82rem;">
      <button type="button" class="btn btn-secondary channel-remove-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem;">✕</button>
    `;
    row.querySelector('.channel-remove-btn').addEventListener('click', () => row.remove());
    list.appendChild(row);
    row.querySelector('input').focus();
  };
}

function readChannelsFromEditor() {
  const list = document.getElementById('channelsEditorList');
  if (!list) return null;
  const channels = [];
  list.querySelectorAll('.channel-label-input').forEach(input => {
    const label = input.value.trim();
    if (label) {
      const value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      channels.push({ value, label });
    }
  });
  return channels.length ? channels : null;
}

// ─── Persona Helpers ─────────────────────────────────────────────────────────

function getFrameworkPersonas() {
  if (currentFramework?.personas?.length) return currentFramework.personas;
  // Generic defaults if none defined
  return [
    { value: 'cio', label: 'CIO' },
    { value: 'cmo', label: 'CMO' },
    { value: 'cdo', label: 'CDO' },
    { value: 'ciso', label: 'CISO' },
    { value: 'vp-marketing', label: 'VP Marketing' },
    { value: 'marketing-manager', label: 'Marketing Manager' },
    { value: 'demand-gen', label: 'Demand Gen Manager' },
    { value: 'it-director', label: 'IT Director' },
    { value: 'technical', label: 'Technical Audiences' },
    { value: 'product-marketer', label: 'Product Marketer' },
    { value: 'business-decision-maker', label: 'Business Decision Maker' }
  ];
}

function getPersonaLabel(value) {
  const personas = getFrameworkPersonas();
  const match = personas.find(p => p.value === value || p.label === value);
  return match ? match.label : value;
}

function buildPersonaCheckboxes(selectedPersonas = []) {
  const group = document.getElementById('personaCheckboxGroup');
  if (!group) return;
  const personas = getFrameworkPersonas();
  group.innerHTML = personas.map(p => `
    <label>
      <input type="checkbox" name="persona" value="${p.value}" ${selectedPersonas.includes(p.value) ? 'checked' : ''}>
      ${p.label}
    </label>
  `).join('');
}

// Also rebuild the filter dropdowns when framework changes
function rebuildPersonaFilters() {
  const personas = getFrameworkPersonas();
  const optionsHtml = `<option value="">All Personas</option>` +
    personas.map(p => `<option value="${p.value}">${p.label}</option>`).join('');
  ['flowPersonaFilter', 'journeyPersonaFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = optionsHtml;
  });
  // Content generator audience
  const genAudience = document.getElementById('genAudience');
  if (genAudience) {
    genAudience.innerHTML = personas.map(p => `<option value="${p.label}">${p.label}</option>`).join('');
  }
}

function rebuildChannelFilters() {
  // Rebuild the channel filter in Asset Repository if it exists
  const el = document.getElementById('channelFilter');
  if (!el) return;
  const channels = getFrameworkChannels();
  el.innerHTML = `<option value="">All Channels</option>` +
    channels.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
}

function buildQuarterCheckboxes(selectedQuarters = []) {
  const group = document.getElementById('assetQuartersGroup');
  if (!group) return;
  const now = new Date();
  const year = now.getFullYear();
  const quarters = [];
  for (let y = year - 1; y <= year + 1; y++) {
    for (let q = 1; q <= 4; q++) quarters.push(`Q${q}-${y}`);
  }
  group.innerHTML = quarters.map(q => `
    <label>
      <input type="checkbox" name="quarter" value="${q}" ${selectedQuarters.includes(q) ? 'checked' : ''}>
      ${q.replace('-', ' ')}
    </label>
  `).join('');
}

function openAssetModal(asset = null) {
  editingAsset = asset;

  const modalTitle = document.getElementById('modalTitle');

  if (asset) {
    modalTitle.textContent = 'Edit Asset';

    // Populate form
    document.getElementById('assetType').value = asset.type;
    document.getElementById('assetName').value = asset.name;
    document.getElementById('assetUrl').value = asset.url || '';
    document.getElementById('assetStage').value = asset.stage;
    document.getElementById('assetStatus').value = asset.status;
    document.getElementById('assetPillar').value = asset.pillar || '';
    document.getElementById('assetDescription').value = asset.description || '';

    // Channels — build dynamically from framework, then pre-check
    const assetChannels = asset.channels || (asset.channel ? [].concat(asset.channel) : []);
    buildChannelCheckboxes(assetChannels);

    // Personas — build dynamically from framework, then pre-check
    const assetPersonas = asset.personas || (asset.persona ? [].concat(asset.persona) : []);
    buildPersonaCheckboxes(assetPersonas);

    // Regions — handle both singular/plural
    const assetRegions = asset.regions || (asset.region ? [].concat(asset.region) : []);
    document.querySelectorAll('input[name="region"]').forEach(input => {
      input.checked = assetRegions.map(r => r.toLowerCase()).includes(input.value.toLowerCase());
    });

    // Languages — handle both singular/plural
    const assetLanguages = asset.languages || (asset.language ? [].concat(asset.language) : []);
    document.querySelectorAll('input[name="language"]').forEach(input => {
      input.checked = assetLanguages.map(l => l.toLowerCase()).includes(input.value.toLowerCase());
    });

    // Quarters
    buildQuarterCheckboxes(asset.quarters || []);
  } else {
    modalTitle.textContent = 'Add New Asset';
    assetForm.reset();
    document.getElementById('assetUrl').value = '';
    buildChannelCheckboxes([]);
    buildPersonaCheckboxes([]);
    buildQuarterCheckboxes(currentQuarter ? [currentQuarter] : []);
  }

  assetModal.classList.add('active');
}

function closeAssetModal() {
  assetModal.classList.remove('active');
  editingAsset = null;
  assetForm.reset();
}

async function saveAsset() {
  const assetData = {
    type: document.getElementById('assetType').value,
    name: document.getElementById('assetName').value,
    url: document.getElementById('assetUrl').value.trim() || null,
    stage: document.getElementById('assetStage').value,
    status: document.getElementById('assetStatus').value,
    pillar: document.getElementById('assetPillar').value || null,
    description: document.getElementById('assetDescription').value || null,
    channels: Array.from(document.querySelectorAll('input[name="channel"]:checked')).map(cb => cb.value),
    personas: Array.from(document.querySelectorAll('input[name="persona"]:checked')).map(cb => cb.value),
    regions: Array.from(document.querySelectorAll('input[name="region"]:checked')).map(cb => cb.value),
    languages: Array.from(document.querySelectorAll('input[name="language"]:checked')).map(cb => cb.value),
    quarters: Array.from(document.querySelectorAll('input[name="quarter"]:checked')).map(cb => cb.value)
  };

  try {
    if (editingAsset) {
      // Update existing asset
      const response = await fetch(`/api/campaigns/${currentProduct}/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      });

      const result = await response.json();

      // Update local state
      const index = currentCampaign.assets.findIndex(a => a.id === editingAsset.id);
      currentCampaign.assets[index] = result.asset;
    } else {
      // Create new asset
      const response = await fetch(`/api/campaigns/${currentProduct}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      });

      const result = await response.json();

      // Add to local state
      if (!currentCampaign.assets) {
        currentCampaign.assets = [];
      }
      currentCampaign.assets.push(result.asset);
    }

    // Re-render
    renderAssetRepository();

    // Update journey map asset list
    if (journeyMap) {
      journeyMap.loadAssets(currentCampaign.assets || []);
    }

    closeAssetModal();
  } catch (error) {
    console.error('Error saving asset:', error);
  }
}

// ─── Asset Quick Actions ─────────────────────────────────────────────────────

async function patchAssetStatus(asset, newStatus) {
  const updated = { ...asset, status: newStatus };
  try {
    const res = await fetch(`/api/campaigns/${currentProduct}/assets/${asset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const result = await res.json();
    const idx = currentCampaign.assets.findIndex(a => a.id === asset.id);
    if (idx !== -1) currentCampaign.assets[idx] = result.asset;
    renderAssetRepository();
    renderCampaignFlow();
    renderContentGenerator();
  } catch (err) {
    console.error('Status update failed', err);
  }
}

async function duplicateAsset(asset) {
  const copy = {
    ...asset,
    id: undefined,
    name: asset.name + ' (Copy)',
    status: 'in-progress',
    content: undefined,
    createdAt: undefined
  };
  // Remove undefined keys
  Object.keys(copy).forEach(k => copy[k] === undefined && delete copy[k]);

  try {
    const res = await fetch(`/api/campaigns/${currentProduct}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(copy)
    });
    const result = await res.json();
    if (!currentCampaign.assets) currentCampaign.assets = [];
    currentCampaign.assets.push(result.asset);
    renderAssetRepository();
    showToast(`Duplicated "${asset.name}"`);
  } catch (err) {
    console.error('Duplicate failed', err);
  }
}

function exportAssetsCSV() {
  const assets = currentCampaign?.assets || [];
  if (!assets.length) { showToast('No assets to export'); return; }

  const headers = ['Name', 'Type', 'Stage', 'Status', 'URL', 'Pillar', 'Channels', 'Personas', 'Regions', 'Languages', 'Quarters', 'Launch Date', 'Description'];

  const rows = assets.map(a => {
    const channels = (a.channels || (a.channel ? [].concat(a.channel) : [])).join('; ');
    const personas = (a.personas || (a.persona ? [].concat(a.persona) : [])).join('; ');
    const regions  = (a.regions  || (a.region  ? [].concat(a.region)  : [])).join('; ');
    const langs    = (a.languages || (a.language ? [].concat(a.language) : [])).join('; ');
    const quarters = (a.quarters || []).join('; ');
    return [
      a.name, a.type, a.stage, a.status, a.url || '',
      a.pillar || '', channels, personas, regions, langs, quarters,
      a.launchDate || '', (a.description || '').replace(/\n/g, ' ')
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProduct}-assets-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function showToast(message, duration = 2500) {
  const toast = document.getElementById('saveToast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, duration);
}

async function saveCampaign() {
  try {
    // Save journey map state before saving campaign
    if (journeyMap) {
      journeyMap.saveState();
    }

    const response = await fetch(`/api/campaigns/${currentProduct}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCampaign)
    });

    const result = await response.json();

    if (result.success) {
      showToast('✅ Campaign saved');
    }
  } catch (error) {
    console.error('Error saving campaign:', error);
  }
}

async function submitFeedback() {
  const type = document.getElementById('feedbackType').value;
  const priority = document.getElementById('feedbackPriority').value;
  const title = document.getElementById('feedbackTitle').value;
  const description = document.getElementById('feedbackDescription').value;
  const email = document.getElementById('feedbackEmail').value;

  // Show loading state
  const btnText = document.getElementById('feedbackBtnText');
  const btnSpinner = document.getElementById('feedbackBtnSpinner');
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        priority,
        title,
        description,
        email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast('✅ Thank you for your feedback!');
      document.getElementById('feedbackModal').style.display = 'none';
      document.getElementById('feedbackForm').reset();
    } else {
      throw new Error(result.error || 'Feedback submission failed');
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    showToast('⚠️ Failed to submit feedback: ' + error.message, 4000);
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

function openEditFrameworkModal() {
  if (!currentFramework) return;

  document.getElementById('editPortfolioMessage').value = currentFramework.portfolioMessage || '';
  document.getElementById('editTagline').value = currentFramework.tagline || '';

  const pillars = currentFramework.pillars || [];
  for (let i = 0; i < 4; i++) {
    const pillar = pillars[i] || {};
    const n = i + 1;
    document.getElementById(`editPillar${n}Name`).value = pillar.name || '';
    document.getElementById(`editPillar${n}Description`).value = pillar.description || '';
  }

  // Personas editor
  renderPersonasEditor();

  // Channels editor
  renderChannelsEditor();

  document.getElementById('editFrameworkModal').style.display = 'flex';
}

function renderPersonasEditor() {
  const list = document.getElementById('personasEditorList');
  if (!list) return;
  const personas = getFrameworkPersonas();
  list.innerHTML = '';
  personas.forEach((p, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:0.5rem; align-items:center;';
    row.innerHTML = `
      <input type="text" class="persona-label-input" value="${p.label}" placeholder="Persona name" style="flex:1; padding:0.35rem 0.6rem; font-size:0.82rem;">
      <button type="button" class="btn btn-secondary persona-remove-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem;">✕</button>
    `;
    row.querySelector('.persona-remove-btn').addEventListener('click', () => row.remove());
    list.appendChild(row);
  });
  document.getElementById('addPersonaBtn').onclick = () => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:0.5rem; align-items:center;';
    row.innerHTML = `
      <input type="text" class="persona-label-input" value="" placeholder="e.g., VP of Engineering" style="flex:1; padding:0.35rem 0.6rem; font-size:0.82rem;">
      <button type="button" class="btn btn-secondary persona-remove-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem;">✕</button>
    `;
    row.querySelector('.persona-remove-btn').addEventListener('click', () => row.remove());
    list.appendChild(row);
    row.querySelector('input').focus();
  };
}

function readPersonasFromEditor() {
  const list = document.getElementById('personasEditorList');
  if (!list) return null;
  const personas = [];
  list.querySelectorAll('.persona-label-input').forEach(input => {
    const label = input.value.trim();
    if (label) {
      const value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      personas.push({ value, label });
    }
  });
  return personas.length ? personas : null;
}

async function saveFrameworkEdits() {
  if (!currentProduct) {
    showToast('No product selected', 3000);
    return;
  }

  // Get header values
  const portfolioMessage = document.getElementById('editPortfolioMessage').value;
  const tagline = document.getElementById('editTagline').value;

  // Get pillar values
  const pillars = [];
  for (let i = 0; i < 4; i++) {
    const pillarNum = i + 1;
    const name = document.getElementById(`editPillar${pillarNum}Name`).value;
    const description = document.getElementById(`editPillar${pillarNum}Description`).value;

    if (name && description) {
      pillars.push({
        id: currentFramework.pillars[i]?.id || `pillar-${i + 1}`,
        name: name,
        description: description,
        capabilities: currentFramework.pillars[i]?.capabilities || []
      });
    }
  }

  // Show loading state
  const btnText = document.getElementById('frameworkBtnText');
  const btnSpinner = document.getElementById('frameworkBtnSpinner');
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';

  try {
    const response = await fetch(`/api/frameworks/${currentProduct}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioMessage, tagline, pillars, personas: readPersonasFromEditor() || currentFramework.personas, channels: readChannelsFromEditor() || currentFramework.channels })
    });

    const result = await response.json();

    if (result.success) {
      // Update local framework
      currentFramework = result.framework;

      // Close modal
      document.getElementById('editFrameworkModal').style.display = 'none';
      document.getElementById('editFrameworkForm').reset();

      // Cascade updates to all tabs
      propagateFrameworkUpdate();
    } else {
      throw new Error(result.error || 'Framework update failed');
    }
  } catch (error) {
    console.error('Error updating framework:', error);
    showToast('⚠️ Failed to update framework: ' + error.message, 4000);
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

function propagateFrameworkUpdate() {
  lastFrameworkUpdate = new Date();

  // Re-render the framework tab (brief + pillars)
  renderFramework();

  // Re-render asset repository (pillar names on cards refresh)
  renderAssetRepository();

  // Re-render campaign flow (uses currentFramework for stage labels)
  renderCampaignFlow();

  renderContentGenerator();

  // Reload assets in journey map
  if (typeof journeyMap !== 'undefined' && journeyMap) {
    journeyMap.loadAssets(currentCampaign.assets || []);
  }

  // Show dismissible update banner on all non-framework tabs
  const tabIds = ['repositoryTab', 'flowTab', 'generatorTab', 'journeyTab', 'calendarTab'];
  tabIds.forEach(tabId => {
    const tab = document.getElementById(tabId);
    if (!tab) return;
    const existing = tab.querySelector('.framework-update-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.className = 'framework-update-banner';
    banner.innerHTML = `
      <span>🔄 Campaign brief & messaging updated — all views now reflect the latest strategy</span>
      <button class="banner-dismiss" onclick="this.closest('.framework-update-banner').remove()">✕</button>
    `;
    tab.insertAdjacentElement('afterbegin', banner);
  });

  // Prompt user to generate new assets aligned with updated messaging
  setTimeout(() => showAssetSuggestions(), 400);
}

// ─── Quarter Tabs ────────────────────────────────────────────────────────────

function renderQuarterTabs() {
  const sel = document.getElementById('quarterDropdown');
  if (!sel || !currentCampaign) return;
  const active = currentCampaign.activeQuarters || [];
  sel.innerHTML = `<option value="">All Quarters</option>` +
    active.map(q => `<option value="${q}" ${currentQuarter === q ? 'selected' : ''}>${q.replace('-', ' ')}</option>`).join('');
  if (!currentQuarter) sel.value = '';
}

function openAddQuarterModal() {
  const active = new Set(currentCampaign.activeQuarters || []);
  const now = new Date();
  const year = now.getFullYear();
  const sel = document.getElementById('newQuarterSelect');
  sel.innerHTML = '';
  for (let y = year; y <= year + 1; y++) {
    for (let q = 1; q <= 4; q++) {
      const val = `Q${q}-${y}`;
      if (!active.has(val)) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = `Q${q} ${y}`;
        sel.appendChild(opt);
      }
    }
  }
  if (!sel.options.length) {
    showToast('All quarters for this year and next are already added.', 3000);
    return;
  }
  updateAddQuarterPrompt();
  document.getElementById('addQuarterModal').style.display = 'flex';
}

function updateAddQuarterPrompt() {
  const hasCurrentQuarter = !!currentQuarter;
  const dupPrompt = document.getElementById('duplicateFromPrompt');
  const noDropPrompt = document.getElementById('noDuplicatePrompt');
  if (hasCurrentQuarter) {
    document.getElementById('duplicateFromLabel').textContent = currentQuarter.replace('-', ' ');
    dupPrompt.style.display = 'block';
    noDropPrompt.style.display = 'none';
  } else {
    dupPrompt.style.display = 'none';
    noDropPrompt.style.display = 'block';
  }
}

function addQuarterToList(quarter, switchToIt = true) {
  if (!quarter) return;
  if (!currentCampaign.activeQuarters) currentCampaign.activeQuarters = [];
  if (!currentCampaign.activeQuarters.includes(quarter)) {
    currentCampaign.activeQuarters.push(quarter);
    currentCampaign.activeQuarters.sort();
  }
  document.getElementById('addQuarterModal').style.display = 'none';
  if (switchToIt) {
    currentQuarter = quarter;
    calendarQuarterOffset = 0;
  }
  renderQuarterTabs();
  const sel = document.getElementById('quarterDropdown');
  if (sel && currentQuarter) sel.value = currentQuarter;
  applyQuarterFilter();
}

function applyQuarterFilter() {
  renderFramework();
  renderAssetRepository();
  renderCampaignFlow();
  renderContentGenerator();
  if (typeof journeyMap !== 'undefined' && journeyMap) {
    journeyMap.loadAssets(getQuarterFilteredAssets(currentCampaign.assets || []));
  }
  // Sync calendar quarter offset to selected quarter
  if (currentQuarter) {
    const [qPart, yPart] = currentQuarter.split('-');
    const q = parseInt(qPart.replace('Q', '')) - 1;
    const y = parseInt(yPart);
    const now = new Date();
    const baseQ = Math.floor(now.getMonth() / 3);
    const baseY = now.getFullYear();
    calendarQuarterOffset = (y - baseY) * 4 + (q - baseQ);
  } else {
    calendarQuarterOffset = 0;
  }
}

// ─── Campaign Brief ──────────────────────────────────────────────────────────

function openCampaignBriefModal() {
  const modal = document.getElementById('campaignBriefModal');
  const textarea = document.getElementById('briefContentInput');
  if (textarea) textarea.value = currentFramework.campaignBrief?.content || '';

  // Show quarter theme field if a quarter is selected
  const themeSection = document.getElementById('quarterThemeSection');
  const themeLabel = document.getElementById('quarterThemeLabel');
  const themeInput = document.getElementById('quarterThemeInput');
  if (currentQuarter && themeSection && themeInput) {
    themeSection.style.display = 'block';
    themeLabel.textContent = `for ${currentQuarter}`;
    themeInput.value = (currentFramework.quarterlyThemes || {})[currentQuarter] || '';
  } else if (themeSection) {
    themeSection.style.display = 'none';
  }

  modal.style.display = 'flex';
}

async function saveCampaignBrief() {
  const content = document.getElementById('briefContentInput').value;
  const themeInput = document.getElementById('quarterThemeInput');
  const themeSection = document.getElementById('quarterThemeSection');

  const updates = {
    campaignBrief: { content }
  };

  // Save quarter theme if visible
  if (currentQuarter && themeSection && themeSection.style.display !== 'none' && themeInput) {
    const themes = { ...(currentFramework.quarterlyThemes || {}), [currentQuarter]: themeInput.value };
    updates.quarterlyThemes = themes;
  }

  try {
    const response = await fetch(`/api/frameworks/${currentProduct}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const result = await response.json();
    if (result.success) {
      currentFramework = result.framework;
      document.getElementById('campaignBriefModal').style.display = 'none';
      propagateFrameworkUpdate();
    }
  } catch (err) {
    showToast('⚠️ Failed to save brief: ' + err.message, 4000);
  }
}

function useTemplate() {
  const pillars = (currentFramework?.pillars || []).map(p => p.name);
  const product = currentFramework?.name || 'Product';
  const template = `CAMPAIGN BRIEF

Campaign Name: [Name]
Quarter: [Q# YYYY]
Campaign Period: [Start Date] – [End Date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAMPAIGN OBJECTIVE
[What is the primary goal? e.g., Generate 500 MQLs, increase brand awareness by 30%]

TARGET AUDIENCE
Primary: [e.g., CIOs at enterprise companies with 1,000+ employees]
Secondary: [e.g., IT Architects and Technical Decision Makers]

KEY MESSAGES
${pillars.length ? pillars.map((p, i) => `${i + 1}. [Message aligned with: ${p}]`).join('\n') : '1. [Core message]\n2. [Core message]\n3. [Core message]'}
${pillars.length + 1}. [Proof point / differentiator]

CAMPAIGN THEME / HOOK
[The narrative angle for this quarter, e.g., "AI Readiness Starts Here"]

SUCCESS METRICS (KPIs)
• MQLs: [target]
• Pipeline: [target]
• Awareness lift: [target]
• Content engagement: [target]

CHANNELS
☐ Email  ☐ SEM/Paid  ☐ Content Syndication  ☐ Webinar
☐ Social  ☐ Field Events  ☐ Partner  ☐ SDR Outreach

BUDGET
[Campaign budget if applicable]

NOTES / CONSTRAINTS
[Any additional context, dependencies, or constraints]`;

  document.getElementById('briefContentInput').value = template;
}

function handleBriefFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    document.getElementById('briefContentInput').value = evt.target.result;
  };
  reader.readAsText(file);
  e.target.value = ''; // reset so same file can be re-uploaded
}

// ─── Asset Suggestions ───────────────────────────────────────────────────────

function buildAssetSuggestions() {
  if (!currentFramework) return [];
  const pillars = currentFramework.pillars || [];
  const portfolio = currentFramework.portfolioMessage || currentFramework.name || 'Platform';
  const brief = currentFramework.campaignBrief?.content || '';
  const qSuffix = currentQuarter ? ` — ${currentQuarter}` : '';

  return [
    {
      type: 'WHITEPAPER',
      stage: 'awareness',
      name: `${pillars[0]?.name || portfolio} Executive Guide${qSuffix}`,
      reason: 'Top-of-funnel asset to establish thought leadership with your primary pillar',
      pillar: pillars[0]?.id
    },
    {
      type: 'WEBPAGE',
      stage: 'awareness',
      name: `${portfolio} Solution Overview Landing Page${qSuffix}`,
      reason: 'Central landing page anchoring all campaign traffic to the updated messaging',
      pillar: null
    },
    {
      type: 'BLOG POST',
      stage: 'familiarity',
      name: `How ${pillars[1]?.name || portfolio} Transforms Your Business${qSuffix}`,
      reason: 'SEO-friendly content to drive organic awareness for Pillar 2',
      pillar: pillars[1]?.id
    },
    {
      type: 'SOLUTION BRIEF',
      stage: 'familiarity',
      name: `${pillars[2]?.name || portfolio} Datasheet${qSuffix}`,
      reason: 'Short-form asset for prospects who need quick spec-level proof',
      pillar: pillars[2]?.id
    },
    {
      type: 'WEBINAR',
      stage: 'consideration',
      name: `${portfolio} Deep-Dive Webinar${qSuffix}`,
      reason: 'Mid-funnel engagement event aligned with updated messaging',
      pillar: pillars[1]?.id
    },
    {
      type: 'NEWSLETTER',
      stage: 'decision',
      name: `${pillars[3]?.name || portfolio} ROI Email Series${qSuffix}`,
      reason: 'Bottom-funnel nurture sequence to convert warm leads to pipeline',
      pillar: pillars[3]?.id
    }
  ];
}

function showAssetSuggestions() {
  const modal = document.getElementById('assetSuggestionsModal');
  const list = document.getElementById('assetSuggestionsList');
  if (!modal || !list) return;

  const suggestions = buildAssetSuggestions();

  list.innerHTML = suggestions.map((s, i) => `
    <div class="suggestion-item">
      <label class="suggestion-checkbox">
        <input type="checkbox" name="suggestion" value="${i}" checked>
        <span class="suggestion-icon">${getAssetIcon(s.type)}</span>
        <div class="suggestion-details">
          <div class="suggestion-name">${s.name}</div>
          <div class="suggestion-meta">
            <span class="suggestion-type">${s.type}</span>
            <span class="suggestion-stage ${s.stage}">${s.stage}</span>
          </div>
          <div class="suggestion-reason">${s.reason}</div>
        </div>
      </label>
    </div>
  `).join('');

  document.getElementById('suggestionsGenerating').style.display = 'none';
  document.getElementById('generateSuggestedBtn').style.display = 'inline-block';
  document.querySelector('.suggestions-close').style.display = 'inline-block';
  modal.style.display = 'flex';
}

async function generateSuggestedAssets() {
  const checked = Array.from(document.querySelectorAll('input[name="suggestion"]:checked')).map(cb => parseInt(cb.value));
  if (checked.length === 0) { showToast('Select at least one asset to generate.', 3000); return; }

  const suggestions = buildAssetSuggestions();
  const selected = checked.map(i => suggestions[i]);

  const progress = document.getElementById('suggestionsProgress');
  const generating = document.getElementById('suggestionsGenerating');
  const generateBtn = document.getElementById('generateSuggestedBtn');
  const skipBtn = document.querySelector('.suggestions-close');

  generating.style.display = 'block';
  generateBtn.style.display = 'none';
  skipBtn.style.display = 'none';
  document.getElementById('assetSuggestionsList').style.display = 'none';

  let created = 0;
  for (const s of selected) {
    progress.textContent = `Generating ${s.type}: ${s.name} (${created + 1}/${selected.length})…`;
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: currentProduct,
          contentType: s.type,
          stage: s.stage.toUpperCase(),
          audience: 'Enterprise Leaders',
          customPrompt: s.name
        })
      });
      const result = await response.json();
      if (result.success) {
        // Add quarter assignment to generated asset
        const assetWithQuarter = {
          ...result.asset,
          pillar: s.pillar || null,
          quarters: currentQuarter ? [currentQuarter] : []
        };
        if (!currentCampaign.assets) currentCampaign.assets = [];
        currentCampaign.assets.push(assetWithQuarter);
        created++;
      }
    } catch (err) {
      console.error('Failed to generate:', s.name, err);
    }
  }

  progress.textContent = `✅ Generated ${created} asset${created !== 1 ? 's' : ''}! Refreshing views…`;
  setTimeout(() => {
    document.getElementById('assetSuggestionsModal').style.display = 'none';
    document.getElementById('assetSuggestionsList').style.display = 'block';
    renderAssetRepository();
    renderCampaignFlow();
    renderContentGenerator();
    if (typeof journeyMap !== 'undefined' && journeyMap) {
      journeyMap.loadAssets(currentCampaign.assets || []);
    }
  }, 1200);
}

// ─── Duplicate Quarter ───────────────────────────────────────────────────────

function openDuplicateQuarterModal(sourceQ, targetQ) {
  const sourceQuarter = sourceQ || currentQuarter;
  if (!sourceQuarter) {
    showToast('Select a source quarter first.', 3000);
    return;
  }

  // Derive target if not provided
  let nextQuarter = targetQ;
  if (!nextQuarter) {
    const [qPart, yPart] = sourceQuarter.split('-');
    const q = parseInt(qPart.replace('Q', ''));
    const y = parseInt(yPart);
    const nextQ = q === 4 ? 1 : q + 1;
    const nextY = q === 4 ? y + 1 : y;
    nextQuarter = `Q${nextQ}-${nextY}`;
  }

  const modal = document.getElementById('duplicateQuarterModal');
  const content = document.getElementById('duplicateQuarterContent');

  // Temporarily filter as if sourceQuarter is selected
  const savedQuarter = currentQuarter;
  currentQuarter = sourceQuarter;
  const quarterAssets = getQuarterFilteredAssets(currentCampaign.assets || []);
  currentQuarter = savedQuarter;

  content.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <p>Duplicate <strong>${sourceQuarter.replace('-', ' ')}</strong> → <strong>${nextQuarter.replace('-', ' ')}</strong></p>
      <p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.5rem;">
        ${quarterAssets.length} asset${quarterAssets.length !== 1 ? 's' : ''} will be copied. Statuses reset to "In Progress". Uncheck any you don't want to carry forward.
      </p>
    </div>
    <input type="hidden" id="duplicateTargetQuarter" value="${nextQuarter}">
    <div class="duplicate-asset-list">
      ${quarterAssets.length === 0
        ? '<p style="color:var(--text-muted);">No assets assigned to this quarter yet.</p>'
        : quarterAssets.map((a, i) => `
          <label class="duplicate-asset-row">
            <input type="checkbox" name="duplicateAsset" value="${a.id}" checked>
            <span class="asset-icon">${getAssetIcon(a.type)}</span>
            <div>
              <div class="duplicate-asset-name">${a.name}</div>
              <div class="duplicate-asset-meta">${a.type} · ${a.stage}</div>
            </div>
          </label>
        `).join('')}
    </div>
  `;

  modal.style.display = 'flex';
}

async function confirmDuplicateQuarter() {
  const targetQuarter = document.getElementById('duplicateTargetQuarter').value;
  const selectedIds = Array.from(document.querySelectorAll('input[name="duplicateAsset"]:checked')).map(cb => cb.value);
  if (selectedIds.length === 0) { showToast('Select at least one asset to duplicate.', 3000); return; }

  const assetsToDuplicate = (currentCampaign.assets || []).filter(a => selectedIds.includes(a.id));

  const newAssets = assetsToDuplicate.map(a => ({
    ...a,
    id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    status: 'in-progress',
    quarters: [...new Set([...(a.quarters || []).filter(q => q !== currentQuarter), targetQuarter])],
    createdAt: new Date().toISOString(),
    launchDate: null,
    content: null
  }));

  if (!currentCampaign.assets) currentCampaign.assets = [];
  currentCampaign.assets.push(...newAssets);

  try {
    await fetch(`/api/campaigns/${currentProduct}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCampaign)
    });
    document.getElementById('duplicateQuarterModal').style.display = 'none';
    // Add and switch to the new quarter
    addQuarterToList(targetQuarter, true);
    showToast(`✅ Duplicated ${newAssets.length} assets to ${targetQuarter.replace('-', ' ')}`);
  } catch (err) {
    showToast('⚠️ Failed to save duplicated assets: ' + err.message, 4000);
  }
}


const DEFAULT_FLOW_STAGES = {
  'awareness': { label: 'AWARENESS', subtitle: 'First touch' },
  'hero_asset': { label: 'HERO CONTENT', subtitle: 'Flagship offer' },
  'conversion': { label: 'CONVERSION', subtitle: 'Capture lead' },
  'conversion_confirmation': { label: 'THANK YOU', subtitle: 'Confirmation' },
  'nurture_day1': { label: 'DAY 1', subtitle: 'Welcome series' },
  'nurture_day3': { label: 'DAY 3', subtitle: 'Value demo' },
  'nurture_day7': { label: 'DAY 7', subtitle: 'Use case deep-dive' },
  'nurture_day14': { label: 'DAY 14', subtitle: 'Social proof' },
  'nurture_day21': { label: 'DAY 21', subtitle: 'Event invite' },
  'engagement_registration': { label: 'WEBINAR REG', subtitle: 'Sign up' },
  'engagement_event': { label: 'LIVE EVENT', subtitle: 'Webinar/demo' },
  'engagement_followup': { label: 'FOLLOW-UP', subtitle: 'Recording & resources' },
  'decision_demo_offer': { label: 'DEMO REQUEST', subtitle: 'Sales handoff' },
  'decision_proof': { label: 'PROOF POINTS', subtitle: 'ROI & case studies' }
};

function renderFlowStageCard(stageKey, stage, container) {
  const stageDiv = document.createElement('div');
  stageDiv.className = 'flow-stage-edit-card';
  stageDiv.dataset.stageKey = stageKey;
  stageDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
      <span class="flow-stage-key-badge">${stageKey}</span>
      <button type="button" class="flow-remove-stage-btn" title="Remove this touchpoint">✕</button>
    </div>
    <div class="form-group" style="margin-bottom:0.5rem;">
      <label>Label</label>
      <input type="text" class="flow-stage-label-input" value="${stage.label}" placeholder="e.g., AWARENESS">
    </div>
    <div class="form-group" style="margin-bottom:0;">
      <label>Subtitle</label>
      <input type="text" class="flow-stage-subtitle-input" value="${stage.subtitle}" placeholder="e.g., First touch">
    </div>
  `;
  stageDiv.querySelector('.flow-remove-stage-btn').addEventListener('click', () => {
    stageDiv.remove();
  });
  container.appendChild(stageDiv);
}

function openEditFlowModal() {
  if (!currentFramework) return;

  const flowStages = currentFramework.flowStages || DEFAULT_FLOW_STAGES;
  const container = document.getElementById('flowStagesContainer');
  container.innerHTML = '';

  Object.keys(flowStages).forEach(stageKey => {
    renderFlowStageCard(stageKey, flowStages[stageKey], container);
  });

  // Add Stage button
  const addBtn = document.getElementById('addFlowStageBtn');
  addBtn.onclick = () => {
    const key = `custom_${Date.now()}`;
    renderFlowStageCard(key, { label: 'NEW STAGE', subtitle: 'Description' }, container);
  };

  document.getElementById('editFlowModal').style.display = 'flex';
}

async function saveFlowEdits() {
  if (!currentProduct) return;

  // Read all stage cards from the modal
  const container = document.getElementById('flowStagesContainer');
  const flowStages = {};
  container.querySelectorAll('.flow-stage-edit-card').forEach(card => {
    const key = card.dataset.stageKey;
    const label = card.querySelector('.flow-stage-label-input')?.value?.trim();
    const subtitle = card.querySelector('.flow-stage-subtitle-input')?.value?.trim();
    if (key && label) {
      flowStages[key] = { label, subtitle: subtitle || '' };
    }
  });

  // Show loading state
  const btnText = document.getElementById('flowBtnText');
  const btnSpinner = document.getElementById('flowBtnSpinner');
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';

  try {
    const response = await fetch(`/api/frameworks/${currentProduct}/flow`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowStages })
    });

    const result = await response.json();

    if (result.success) {
      // Update local framework
      currentFramework.flowStages = result.flowStages;

      // Re-render flow
      renderCampaignFlow();

      // Close modal
      document.getElementById('editFlowModal').style.display = 'none';
      document.getElementById('editFlowForm').reset();

      showToast('✅ Campaign flow updated');
    } else {
      throw new Error(result.error || 'Flow update failed');
    }
  } catch (error) {
    console.error('Error updating flow:', error);
    showToast('⚠️ Failed to update flow: ' + error.message, 4000);
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

async function generateNewContent() {
  if (!currentProduct) {
    showToast('Please select a product first', 3000);
    return;
  }

  const contentType = document.getElementById('genContentType').value;
  const stage = document.getElementById('genStage').value;
  const audience = document.getElementById('genAudience').value;
  const customPrompt = document.getElementById('genPrompt').value;

  if (!contentType) {
    showToast('Please select a content type', 3000);
    return;
  }

  const btnText = document.getElementById('generateBtnText');
  const btnSpinner = document.getElementById('generateBtnSpinner');
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';

  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: currentProduct, contentType, stage, audience, customPrompt })
    });

    const result = await response.json();

    if (result.error === 'API key not configured') {
      showApiKeyBanner();
      return;
    }

    if (!result.success) {
      throw new Error(result.error || 'Content generation failed');
    }

    // Asset is already persisted server-side — sync local state
    if (!currentCampaign.assets) currentCampaign.assets = [];
    currentCampaign.assets.push(result.asset);

    document.getElementById('generateContentForm').reset();
    document.getElementById('genStage').value = 'AWARENESS';
    if (document.getElementById('genAudience').options.length > 0) {
      document.getElementById('genAudience').selectedIndex = 0;
    }

    renderContentGenerator();
    showToast('✅ Content generated and saved to Asset Repository');
  } catch (error) {
    console.error('Error generating content:', error);
    showToast('⚠️ Generation failed: ' + error.message, 4000);
  } finally {
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

function showApiKeyBanner() {
  const existing = document.getElementById('apiKeyBanner');
  if (existing) return;
  const banner = document.createElement('div');
  banner.id = 'apiKeyBanner';
  banner.style.cssText = 'margin:1rem 0;padding:1.25rem 1.5rem;background:#fff8e1;border:2px solid #f59e0b;border-radius:8px;';
  banner.innerHTML = `
    <strong style="font-size:1rem;">⚠️ ANTHROPIC_API_KEY not set</strong>
    <p style="margin:0.5rem 0 0.25rem 0;">Content generation requires an Anthropic API key. To set it up:</p>
    <ol style="margin:0.5rem 0 0.5rem 1.25rem;font-size:0.9rem;">
      <li>Get a free API key at <strong>console.anthropic.com</strong></li>
      <li>Create a <code>.env</code> file in the project root (copy from <code>.env.example</code>)</li>
      <li>Add: <code>ANTHROPIC_API_KEY=sk-ant-...</code></li>
      <li>Restart the server: <code>npm start</code></li>
    </ol>
    <button onclick="document.getElementById('apiKeyBanner').remove()" style="background:none;border:none;cursor:pointer;font-size:0.875rem;color:#92400e;text-decoration:underline;">Dismiss</button>
  `;
  const form = document.getElementById('generateContentForm');
  form.parentNode.insertBefore(banner, form);
}

function renderContentGenerator() {
  const contentList = document.getElementById('contentPreviewList');
  contentList.innerHTML = '';

  const stages = {
    'awareness': { label: 'Awareness', subtitle: 'Top of Funnel - Building Brand Awareness' },
    'familiarity': { label: 'Familiarity', subtitle: 'Top of Funnel - Educating on Solutions' },
    'consideration': { label: 'Consideration', subtitle: 'Middle of Funnel - Evaluating Options' },
    'decision': { label: 'Decision', subtitle: 'Bottom of Funnel - Making the Purchase' }
  };

  const filteredForGenerator = getQuarterFilteredAssets(currentCampaign.assets || []);
  Object.keys(stages).forEach(stageKey => {
    const stageAssets = filteredForGenerator.filter(a => a.stage === stageKey);

    if (stageAssets.length === 0) return;

    const stageSection = document.createElement('div');
    stageSection.className = 'content-stage-section';
    stageSection.innerHTML = `
      <div class="content-stage-header">
        <h3>${stages[stageKey].label}</h3>
        <p class="content-stage-subtitle">${stages[stageKey].subtitle}</p>
        <span class="content-stage-count">${stageAssets.length} ${stageAssets.length === 1 ? 'asset' : 'assets'}</span>
      </div>
      <div class="content-previews-grid"></div>
    `;

    const grid = stageSection.querySelector('.content-previews-grid');

    stageAssets.forEach(asset => {
      const preview = createContentPreview(asset);
      grid.appendChild(preview);
    });

    contentList.appendChild(stageSection);
  });

  if (filteredForGenerator.length === 0) {
    contentList.innerHTML = `
      <div class="empty-content-state">
        <h3>${currentQuarter ? `No Assets in ${currentQuarter}` : 'No Assets Yet'}</h3>
        <p>${currentQuarter ? 'No assets are assigned to this quarter yet.' : 'Add assets in the Asset Repository tab to see content previews here.'}</p>
      </div>
    `;
  }
}

function createContentPreview(asset) {
  const card = document.createElement('div');
  card.className = 'content-preview-card';

  const hasContent = asset.content && Object.keys(asset.content).length > 0;
  const statusIcon = {
    'live': '✅',
    'in-progress': '🔴',
    'being-refreshed': '🟠'
  }[asset.status] || '⚪';

  let contentSnippet = '';
  if (hasContent) {
    if (asset.type === 'WHITEPAPER' && asset.content.sections) {
      const firstSection = asset.content.sections[0];
      contentSnippet = firstSection ? `<p class="content-snippet">${firstSection.body.substring(0, 200)}...</p>` : '';
    } else if (asset.type === 'WEBPAGE' && asset.content.hero) {
      contentSnippet = `<p class="content-snippet">${asset.content.hero.headline}</p>`;
    } else if (asset.type === 'NEWSLETTER' && asset.content.series) {
      contentSnippet = `<p class="content-snippet">${asset.content.series.length}-part email series</p>`;
    } else if (asset.type === 'WEBINAR' && asset.content.title) {
      contentSnippet = `<p class="content-snippet">${asset.content.duration || '60 min'} - ${asset.content.agenda?.length || 0} agenda items</p>`;
    } else if (asset.type === 'THIRD-PARTY RESEARCH' && asset.content.customer) {
      contentSnippet = `<p class="content-snippet">Customer: ${asset.content.customer.name} (${asset.content.customer.industry})</p>`;
    }
  }

  card.innerHTML = `
    <div class="content-preview-header">
      <span class="content-preview-type">${asset.type}</span>
      <span class="content-preview-status">${statusIcon}</span>
    </div>
    <h4 class="content-preview-title">${asset.name}</h4>
    ${contentSnippet}
    <div class="content-preview-actions">
      ${hasContent ? '<button class="btn-preview" data-asset-id="' + asset.id + '">👁️ View Full Content</button>' : '<button class="btn-generate" data-asset-id="' + asset.id + '">✨ Generate Content</button>'}
    </div>
  `;

  // Add event listeners
  const viewBtn = card.querySelector('.btn-preview');
  if (viewBtn) {
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('View button clicked for:', asset.name);
      console.log('Asset has content:', !!asset.content);
      showFullContent(asset);
    });
  }

  const generateBtn = card.querySelector('.btn-generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('Use the Generate Content form above to create this asset', 3000);
    });
  }

  return card;
}


function renderFullContent(asset) {
  if (!asset.content) return '<p>No content available</p>';

  let html = '';

  // Whitepaper
  if (asset.type === 'WHITEPAPER' && asset.content.sections) {
    html += `
      <div class="whitepaper-content">
        <h1>${asset.content.title}</h1>
        ${asset.content.subtitle ? `<h2 class="subtitle">${asset.content.subtitle}</h2>` : ''}
    `;
    asset.content.sections.forEach(section => {
      html += `
        <div class="section">
          <h3>${section.heading}</h3>
          <p>${section.body}</p>
        </div>
      `;
    });
    if (asset.content.cta) {
      html += `
        <div class="cta-section">
          <h4>Call to Action</h4>
          <p><strong>Primary:</strong> ${asset.content.cta.primary}</p>
          ${asset.content.cta.secondary ? `<p><strong>Secondary:</strong> ${asset.content.cta.secondary}</p>` : ''}
        </div>
      `;
    }
    if (asset.content.competitive) {
      html += `
        <div class="competitive-section">
          <h4>Competitive Positioning</h4>
          <p><strong>Focus:</strong> ${asset.content.competitive.focus}</p>
          <ul>
            ${asset.content.competitive.differentiation.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    html += '</div>';
  }

  // Landing Page
  else if (asset.type === 'WEBPAGE' && asset.content.hero) {
    html += `
      <div class="landing-page-content">
        <div class="hero-section">
          <h1>${asset.content.hero.headline}</h1>
          <p class="subheadline">${asset.content.hero.subheadline}</p>
          <p><strong>CTA:</strong> ${asset.content.hero.cta}</p>
        </div>
    `;
    if (asset.content.problem) {
      html += `
        <div class="problem-section">
          <h3>${asset.content.problem.heading}</h3>
          <ul>${asset.content.problem.points.map(p => `<li>${p}</li>`).join('')}</ul>
        </div>
      `;
    }
    if (asset.content.solution) {
      html += `
        <div class="solution-section">
          <h3>${asset.content.solution.heading}</h3>
          ${asset.content.solution.pillars.map(p => `
            <div class="pillar">
              <h4>${p.name}</h4>
              <p>${p.description}</p>
              <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
          `).join('')}
        </div>
      `;
    }
    html += '</div>';
  }

  // Email Series
  else if (asset.type === 'NEWSLETTER' && asset.content.series) {
    html += `<div class="email-series-content">`;
    asset.content.series.forEach(email => {
      html += `
        <div class="email-preview">
          <h3>Email ${email.email}</h3>
          <p><strong>Subject:</strong> ${email.subject}</p>
          <p><strong>Preview:</strong> ${email.preview}</p>
          <p class="email-body">${email.body}</p>
          <p><strong>CTA:</strong> ${email.cta}</p>
        </div>
      `;
    });
    html += '</div>';
  }

  // Webinar
  else if (asset.type === 'WEBINAR' && asset.content.title) {
    html += `
      <div class="webinar-content">
        <h1>${asset.content.title}</h1>
        ${asset.content.subtitle ? `<h2>${asset.content.subtitle}</h2>` : ''}
        <p><strong>Duration:</strong> ${asset.content.duration}</p>
        <p><strong>Format:</strong> ${asset.content.format}</p>
        <h3>Agenda</h3>
        ${asset.content.agenda.map(item => `
          <div class="agenda-item">
            <p><strong>${item.time}:</strong> ${item.topic}</p>
            <p>${item.description}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Case Study
  else if (asset.type === 'THIRD-PARTY RESEARCH' && asset.content.customer) {
    html += `
      <div class="case-study-content">
        <h1>${asset.content.title}</h1>
        <div class="customer-info">
          <h3>${asset.content.customer.name}</h3>
          <p>${asset.content.customer.industry} | ${asset.content.customer.size}</p>
        </div>
        <div class="challenge-section">
          <h3>${asset.content.challenge.heading}</h3>
          <p>${asset.content.challenge.body}</p>
        </div>
        <div class="solution-section">
          <h3>${asset.content.solution.heading}</h3>
          <p>${asset.content.solution.body}</p>
          <p><strong>Products Used:</strong> ${asset.content.solution.products.join(', ')}</p>
        </div>
        <div class="results-section">
          <h3>Results</h3>
          <div class="metrics-grid">
            ${asset.content.results.metrics.map(m => `
              <div class="metric">
                <div class="metric-stat">${m.stat}</div>
                <div class="metric-desc">${m.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ${asset.content.quote ? `
          <div class="quote-section">
            <blockquote>${asset.content.quote.body}</blockquote>
            <p class="attribution">— ${asset.content.quote.attribution}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  else {
    html = `<pre>${JSON.stringify(asset.content, null, 2)}</pre>`;
  }

  return html;
}

function renderCampaignFlow() {
  const flowViz = document.getElementById('flowVisualization');
  flowViz.innerHTML = '';

  if (!currentCampaign.assets || currentCampaign.assets.length === 0) {
    flowViz.innerHTML = `
      <div class="empty-flow-state">
        <h3>No Campaign Flow</h3>
        <p>Add assets in the Asset Repository to see the campaign flow.</p>
      </div>
    `;
    return;
  }

  // Get filter values
  const personaFilter = document.getElementById('flowPersonaFilter')?.value || '';
  const regionFilter = document.getElementById('flowRegionFilter')?.value || '';
  const languageFilter = document.getElementById('flowLanguageFilter')?.value || '';

  // Filter assets — quarter first, then persona/region/language
  let filteredAssets = getQuarterFilteredAssets(currentCampaign.assets);

  if (personaFilter) {
    filteredAssets = filteredAssets.filter(a => (a.personas || []).includes(personaFilter));
  }
  if (regionFilter) {
    filteredAssets = filteredAssets.filter(a => (a.regions || []).includes(regionFilter));
  }
  if (languageFilter) {
    filteredAssets = filteredAssets.filter(a => (a.languages || []).includes(languageFilter));
  }

  if (filteredAssets.length === 0) {
    flowViz.innerHTML = `
      <div class="empty-flow-state">
        <h3>No Assets Match Filters</h3>
        <p>Try adjusting your filter criteria or add assets with these attributes.</p>
      </div>
    `;
    return;
  }

  // Group assets by flow position
  // Use stored flow configuration if available, otherwise use defaults
  const defaultFlowStages = {
    'acquisition': { label: 'ACQUISITION', subtitle: 'Drive traffic' },
    'hero_asset': { label: 'HERO ASSET', subtitle: 'Core content offer' },
    'conversion': { label: 'CONVERSION', subtitle: 'Capture lead' },
    'conversion_confirmation': { label: 'CONFIRMATION', subtitle: 'Thank you' },
    'nurture_day1': { label: 'NURTURE - Day 1', subtitle: 'Welcome' },
    'nurture_day3': { label: 'NURTURE - Day 3', subtitle: 'Follow-up' },
    'nurture_day7': { label: 'NURTURE - Day 7', subtitle: 'Education' },
    'nurture_day14': { label: 'NURTURE - Day 14', subtitle: 'Engagement' },
    'nurture_day21': { label: 'NURTURE - Day 21', subtitle: 'Event invite' },
    'engagement_registration': { label: 'WEBINAR REG', subtitle: 'Sign up' },
    'engagement_event': { label: 'WEBINAR', subtitle: 'Live event' },
    'engagement_followup': { label: 'POST-WEBINAR', subtitle: 'Recording' },
    'decision_demo_offer': { label: 'DEMO OFFER', subtitle: 'Sales handoff' },
    'decision_proof': { label: 'PROOF', subtitle: 'Case study' }
  };

  const configuredFlowStages = currentFramework?.flowStages || defaultFlowStages;

  // Add assets array to each stage
  const flowStages = {};
  Object.keys(configuredFlowStages).forEach(key => {
    flowStages[key] = {
      ...configuredFlowStages[key],
      assets: []
    };
  });

  // Sort assets into stages
  filteredAssets.forEach(asset => {
    const position = asset.flow_position || 'other';
    if (flowStages[position]) {
      flowStages[position].assets.push(asset);
    }
  });

  // Build flow visualization
  const flowContainer = document.createElement('div');
  flowContainer.className = 'flow-container';

  // Add stages
  Object.keys(flowStages).forEach(stageKey => {
    const stage = flowStages[stageKey];
    if (stage.assets.length === 0) return;

    const stageEl = document.createElement('div');
    stageEl.className = 'flow-stage';

    stageEl.innerHTML = `
      <div class="flow-stage-header">
        <div class="flow-stage-label">${stage.label}</div>
        <div class="flow-stage-subtitle">${stage.subtitle}</div>
      </div>
      <div class="flow-stage-assets">
        ${stage.assets.map(asset => `
          <div class="flow-asset-card" data-asset-id="${asset.id}" style="position: relative;">
            <button class="flow-asset-edit-btn" onclick="event.stopPropagation(); openAssetModal(currentCampaign.assets.find(a => a.id === '${asset.id}'))" style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--primary); color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'" title="Edit asset">✏️</button>
            <div class="flow-asset-type">${asset.type}</div>
            <div class="flow-asset-name">${asset.name}</div>
            ${asset.next_touchpoints ? `
              <div class="flow-asset-next">
                <span class="flow-arrow">↓</span>
                ${asset.next_touchpoints.length} next touchpoint${asset.next_touchpoints.length > 1 ? 's' : ''}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    // Add connection arrow after each stage (except last)
    const allStageKeys = Object.keys(flowStages).filter(k => flowStages[k].assets.length > 0);
    const isLastStage = stageKey === allStageKeys[allStageKeys.length - 1];

    flowContainer.appendChild(stageEl);

    if (!isLastStage) {
      const connector = document.createElement('div');
      connector.className = 'flow-connector';
      connector.innerHTML = '<div class="flow-arrow-down">↓</div>';
      flowContainer.appendChild(connector);
    }
  });

  // Add summary stats
  const stats = document.createElement('div');
  stats.className = 'flow-stats';

  const stageCount = Object.values(flowStages).filter(s => s.assets.length > 0).length;
  const totalAssets = currentCampaign.assets.length;
  const avgAssetsPerStage = (totalAssets / stageCount).toFixed(1);

  stats.innerHTML = `
    <h3>Campaign Flow Summary</h3>
    <div class="flow-stats-grid">
      <div class="flow-stat">
        <div class="flow-stat-number">${stageCount}</div>
        <div class="flow-stat-label">Touchpoints</div>
      </div>
      <div class="flow-stat">
        <div class="flow-stat-number">${totalAssets}</div>
        <div class="flow-stat-label">Total Assets</div>
      </div>
      <div class="flow-stat">
        <div class="flow-stat-number">${avgAssetsPerStage}</div>
        <div class="flow-stat-label">Avg Assets/Stage</div>
      </div>
    </div>
  `;

  flowViz.appendChild(stats);
  flowViz.appendChild(flowContainer);

  // Add click handlers for asset cards
  document.querySelectorAll('.flow-asset-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const assetId = card.dataset.assetId;
      const asset = currentCampaign.assets.find(a => a.id === assetId);
      if (asset && asset.content) {
        showFullContent(asset);
      } else {
        openAssetModal(asset);
      }
    });
  });
}

function renderCalendar() {
  const calendarContainer = document.getElementById('calendarContainer');
  if (!calendarContainer) return;

  if (!currentCampaign || !currentCampaign.assets || currentCampaign.assets.length === 0) {
    calendarContainer.innerHTML = `
      <div class="empty-calendar-state">
        <h3>No Campaign Assets</h3>
        <p>Add assets with launch dates to see them in the calendar view.</p>
      </div>
    `;
    return;
  }

  // Get filter values
  const viewType = document.getElementById('calendarView')?.value || 'month';
  const productFilter = document.getElementById('calendarProductFilter')?.value || '';
  const audienceFilter = document.getElementById('calendarAudienceFilter')?.value || '';
  const stageFilter = document.getElementById('calendarStageFilter')?.value || '';

  // Filter assets
  let filteredAssets = currentCampaign.assets.filter(asset => asset.launchDate || asset.createdAt);

  if (productFilter && currentProduct !== productFilter) {
    filteredAssets = [];
  }
  if (audienceFilter) {
    filteredAssets = filteredAssets.filter(a =>
      (a.audience || '').toLowerCase().includes(audienceFilter.toLowerCase())
    );
  }
  if (stageFilter) {
    filteredAssets = filteredAssets.filter(a =>
      (a.stage || '').toLowerCase() === stageFilter
    );
  }

  // Generate calendar based on view type
  if (viewType === 'month') {
    renderMonthCalendar(calendarContainer, filteredAssets);
  } else if (viewType === 'quarter') {
    renderQuarterCalendar(calendarContainer, filteredAssets);
  } else {
    renderYearCalendar(calendarContainer, filteredAssets);
  }
}

function renderMonthCalendar(container, assets) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Month name
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  let html = `
    <div class="calendar-month-view">
      <div class="calendar-month-header">
        <h3>${monthNames[currentMonth]} ${currentYear}</h3>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
  `;

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAssets = assets.filter(asset => {
      const assetDate = asset.launchDate || asset.createdAt;
      return assetDate && assetDate.startsWith(dateStr);
    });

    const isToday = day === now.getDate();
    html += `
      <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <div class="calendar-day-number">${day}</div>
        <div class="calendar-day-assets">
          ${dayAssets.map(asset => `
            <div class="calendar-asset" data-asset-id="${asset.id}" title="${asset.name}">
              <span class="calendar-asset-type">${getAssetIcon(asset.type)}</span>
              <span class="calendar-asset-name">${asset.name.length > 22 ? asset.name.substring(0, 22) + '…' : asset.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Add click handlers for assets
  container.querySelectorAll('.calendar-asset').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const assetId = el.dataset.assetId;
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        showFullContent(asset);
      }
    });
  });
}

function renderQuarterCalendar(container, assets) {
  const now = new Date();
  let baseQuarter = Math.floor(now.getMonth() / 3);
  let year = now.getFullYear();

  // Apply navigation offset
  let totalQuarters = baseQuarter + calendarQuarterOffset;
  while (totalQuarters < 0) { totalQuarters += 4; year--; }
  while (totalQuarters > 3) { totalQuarters -= 4; year++; }
  const quarter = totalQuarters;

  const quarterStartMonth = quarter * 3;
  const quarterStart = new Date(year, quarterStartMonth, 1);
  const quarterEnd = new Date(year, quarterStartMonth + 3, 0);

  // Build 13 weeks spanning the quarter
  const weeks = [];
  const weekCursor = new Date(quarterStart);
  for (let w = 0; w < 13; w++) {
    const wEnd = new Date(weekCursor);
    wEnd.setDate(wEnd.getDate() + 6);
    weeks.push({ start: new Date(weekCursor), end: new Date(wEnd) });
    weekCursor.setDate(weekCursor.getDate() + 7);
  }

  const stages = ['awareness', 'familiarity', 'consideration', 'decision'];
  const stageLabels = { awareness: 'Awareness', familiarity: 'Familiarity', consideration: 'Consideration', decision: 'Decision' };

  // Place assets into grid[stage][weekIndex]
  const grid = {};
  stages.forEach(s => { grid[s] = weeks.map(() => []); });

  assets.forEach(asset => {
    const dateStr = asset.launchDate || asset.createdAt;
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d < quarterStart || d > quarterEnd) return;
    const wi = weeks.findIndex(w => d >= w.start && d <= w.end);
    if (wi === -1) return;
    const s = (asset.stage || '').toLowerCase();
    if (grid[s]) grid[s][wi].push(asset);
  });

  // Month divider labels for week headers
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const qNames = ['Q1', 'Q2', 'Q3', 'Q4'];
  const qMonths = `${monthNames[quarterStartMonth]}–${monthNames[quarterStartMonth + 2]}`;

  // Count assets in this quarter
  const quarterAssets = assets.filter(a => {
    const d = new Date(a.launchDate || a.createdAt || '');
    return d >= quarterStart && d <= quarterEnd;
  });

  // Build HTML
  const stageRows = stages.map(stage => {
    const cells = weeks.map((w, wi) => {
      const cellAssets = grid[stage][wi];
      const chips = cellAssets.map(a => `
        <div class="qw-asset-chip ${stage}" data-asset-id="${a.id}" title="${a.name}">
          ${getAssetIcon(a.type)} <span>${a.name.length > 16 ? a.name.substring(0, 16) + '…' : a.name}</span>
        </div>
      `).join('');
      return `<div class="qw-cell">${chips}</div>`;
    }).join('');
    return `<div class="qw-row">
      <div class="qw-stage-label ${stage}">${stageLabels[stage]}</div>
      ${cells}
    </div>`;
  }).join('');

  const weekHeaders = weeks.map((w, i) => {
    const isMonthBoundary = i === 0 || w.start.getMonth() !== weeks[i - 1].start.getMonth();
    const monthLabel = isMonthBoundary ? `<div class="qw-month-label">${monthNames[w.start.getMonth()]}</div>` : '<div class="qw-month-label"></div>';
    return `<div class="qw-week-header" title="${w.start.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${w.end.toLocaleDateString(undefined,{month:'short',day:'numeric'})}">${monthLabel}<div class="qw-week-num">W${i + 1}</div></div>`;
  }).join('');

  const stageSummary = stages.map(stage => {
    const count = quarterAssets.filter(a => (a.stage || '').toLowerCase() === stage).length;
    return `<div class="qw-summary-stat"><span class="qw-stat-dot ${stage}"></span>${stageLabels[stage]}: <strong>${count}</strong></div>`;
  }).join('');

  container.innerHTML = `
    <div class="quarter-weekly-view">
      <div class="qw-nav">
        <button class="btn btn-secondary qw-prev">← Prev Quarter</button>
        <h3>${qNames[quarter]} ${year} <span class="qw-subtitle">(${qMonths})</span></h3>
        <button class="btn btn-secondary qw-next">Next Quarter →</button>
      </div>
      <div class="qw-grid-wrapper">
        <div class="qw-grid">
          <div class="qw-corner"></div>
          ${weekHeaders}
          ${stageRows}
        </div>
      </div>
      <div class="qw-summary">
        <span class="qw-total"><strong>${quarterAssets.length}</strong> assets this quarter</span>
        <div class="qw-summary-stages">${stageSummary}</div>
      </div>
    </div>
  `;

  // Navigation handlers
  container.querySelector('.qw-prev').addEventListener('click', () => {
    calendarQuarterOffset--;
    renderCalendar();
  });
  container.querySelector('.qw-next').addEventListener('click', () => {
    calendarQuarterOffset++;
    renderCalendar();
  });

  // Asset chip click handlers
  container.querySelectorAll('.qw-asset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const asset = assets.find(a => a.id === chip.dataset.assetId);
      if (asset) showFullContent(asset);
    });
  });
}

function renderYearCalendar(container, assets) {
  const currentYear = new Date().getFullYear();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let html = `
    <div class="calendar-year-view">
      <div class="calendar-year-header">
        <h3>${currentYear} Overview</h3>
      </div>
      <div class="calendar-year-grid">
  `;

  for (let month = 0; month < 12; month++) {
    const monthAssets = assets.filter(asset => {
      const assetDate = asset.launchDate || asset.createdAt;
      if (!assetDate) return false;
      const date = new Date(assetDate);
      return date.getMonth() === month && date.getFullYear() === currentYear;
    });

    html += `
      <div class="calendar-year-month">
        <h5>${monthNames[month]}</h5>
        <div class="year-month-count">${monthAssets.length}</div>
        <div class="year-month-label">asset${monthAssets.length !== 1 ? 's' : ''}</div>
      </div>
    `;
  }

  html += `
      </div>
      <div class="calendar-year-summary">
        <h4>Year Summary</h4>
        <p>${assets.length} total campaign assets scheduled for ${currentYear}</p>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function getAssetIcon(type) {
  const icons = {
    'EMAIL': '📧',
    'BLOG POST': '📝',
    'WHITEPAPER': '📄',
    'WEBINAR': '🎥',
    'LANDING PAGE': '🌐',
    'DEMO': '🖥️',
    'CASE STUDY': '📊',
    'SOCIAL POST': '📱',
    'EBOOK': '📚',
    'INFOGRAPHIC': '📈'
  };
  return icons[type] || '📄';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function exportCalendarToSlides() {
  if (!currentCampaign || !currentCampaign.assets || currentCampaign.assets.length === 0) {
    showToast('No campaign assets to export', 3000);
    return;
  }

  // Generate HTML presentation
  const assets = currentCampaign.assets.filter(a => a.launchDate || a.createdAt);
  const productName = currentFramework?.portfolioMessage || currentProduct?.toUpperCase() || 'Campaign';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${productName} Campaign Calendar</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f3f3f3;
    }
    .slide {
      width: 960px;
      height: 540px;
      margin: 2rem auto;
      background: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      padding: 3rem;
      box-sizing: border-box;
      page-break-after: always;
      display: flex;
      flex-direction: column;
    }
    .slide-header {
      border-bottom: 4px solid #0176D3;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .slide-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #181818;
      margin: 0 0 0.5rem 0;
    }
    .slide-subtitle {
      font-size: 1.25rem;
      color: #706E6B;
      margin: 0;
    }
    .slide-content {
      flex: 1;
      overflow: hidden;
    }
    .asset-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .asset-card {
      background: #f3f3f3;
      padding: 1.25rem;
      border-radius: 8px;
      border-left: 4px solid #0176D3;
    }
    .asset-type {
      font-size: 0.875rem;
      color: #0176D3;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .asset-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #181818;
      margin-bottom: 0.5rem;
    }
    .asset-date {
      font-size: 0.875rem;
      color: #706E6B;
    }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin: 2rem 0;
    }
    .stat-box {
      text-align: center;
      background: linear-gradient(135deg, #D8EDFF, #EFF6FF);
      padding: 2rem;
      border-radius: 12px;
      border: 2px solid #0176D3;
    }
    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      color: #0176D3;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      font-size: 1.125rem;
      color: #3E3E3C;
      font-weight: 600;
    }
    .timeline {
      margin: 2rem 0;
    }
    .timeline-item {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #DDDBDA;
    }
    .timeline-date {
      font-size: 1rem;
      font-weight: 700;
      color: #0176D3;
      min-width: 120px;
    }
    .timeline-details {
      flex: 1;
    }
    .timeline-asset {
      font-size: 1.125rem;
      font-weight: 600;
      color: #181818;
    }
    .timeline-type {
      font-size: 0.875rem;
      color: #706E6B;
    }
    @media print {
      body { background: white; }
      .slide { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>

  <!-- Title Slide -->
  <div class="slide">
    <div class="slide-header">
      <h1 class="slide-title">${productName}</h1>
      <p class="slide-subtitle">Campaign Calendar ${new Date().getFullYear()}</p>
    </div>
    <div class="slide-content">
      <div class="summary-stats">
        <div class="stat-box">
          <div class="stat-number">${assets.length}</div>
          <div class="stat-label">Total Assets</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${[...new Set(assets.map(a => a.type))].length}</div>
          <div class="stat-label">Content Types</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${[...new Set(assets.map(a => a.stage))].length}</div>
          <div class="stat-label">Campaign Stages</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Asset Timeline Slides -->
  ${generateAssetTimelineSlides(assets, productName)}

  <!-- Asset Details Slides -->
  ${generateAssetDetailSlides(assets, productName)}

</body>
</html>`;

  // Create and download file
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${productName.replace(/\s+/g, '-')}-Campaign-Calendar-${new Date().getFullYear()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('✅ Exported — open the HTML file and print to PDF or paste into Google Slides', 4000);
}

function generateAssetTimelineSlides(assets, productName) {
  // Sort assets by date
  const sortedAssets = [...assets].sort((a, b) => {
    const dateA = new Date(a.launchDate || a.createdAt);
    const dateB = new Date(b.launchDate || b.createdAt);
    return dateA - dateB;
  });

  // Group by month
  const monthGroups = {};
  sortedAssets.forEach(asset => {
    const date = new Date(asset.launchDate || asset.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = [];
    }
    monthGroups[monthKey].push(asset);
  });

  // Generate slides for each month
  return Object.entries(monthGroups).map(([monthKey, monthAssets]) => {
    const date = new Date(monthKey + '-01');
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `
  <div class="slide">
    <div class="slide-header">
      <h2 class="slide-title">${monthName}</h2>
      <p class="slide-subtitle">${monthAssets.length} Assets Scheduled</p>
    </div>
    <div class="slide-content">
      <div class="timeline">
        ${monthAssets.map(asset => `
          <div class="timeline-item">
            <div class="timeline-date">${formatDate(asset.launchDate || asset.createdAt)}</div>
            <div class="timeline-details">
              <div class="timeline-asset">${asset.name}</div>
              <div class="timeline-type">${asset.type} • ${asset.stage}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
  }).join('\n');
}

function generateAssetDetailSlides(assets, productName) {
  // Group assets into chunks of 4 per slide
  const chunks = [];
  for (let i = 0; i < assets.length; i += 4) {
    chunks.push(assets.slice(i, i + 4));
  }

  return chunks.map((chunk, index) => `
  <div class="slide">
    <div class="slide-header">
      <h2 class="slide-title">Campaign Assets</h2>
      <p class="slide-subtitle">Page ${index + 1} of ${chunks.length}</p>
    </div>
    <div class="slide-content">
      <div class="asset-grid">
        ${chunk.map(asset => `
          <div class="asset-card">
            <div class="asset-type">${getAssetIcon(asset.type)} ${asset.type}</div>
            <div class="asset-name">${asset.name}</div>
            <div class="asset-date">Launch: ${formatDate(asset.launchDate || asset.createdAt)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`).join('\n');
}

function downloadCalendar() {
  if (!currentCampaign || !currentCampaign.assets || currentCampaign.assets.length === 0) {
    showToast('No campaign assets to download', 3000);
    return;
  }

  // Generate CSV format
  const assets = currentCampaign.assets.filter(a => a.launchDate || a.createdAt);
  const productName = currentFramework?.portfolioMessage || currentProduct?.toUpperCase() || 'Campaign';

  // CSV Headers
  let csv = 'Asset Name,Type,Stage,Audience,Launch Date,Status,Description\n';

  // CSV Rows
  assets.forEach(asset => {
    const row = [
      `"${(asset.name || '').replace(/"/g, '""')}"`,
      `"${(asset.type || '').replace(/"/g, '""')}"`,
      `"${(asset.stage || '').replace(/"/g, '""')}"`,
      `"${(asset.audience || '').replace(/"/g, '""')}"`,
      `"${asset.launchDate || asset.createdAt || ''}"`,
      `"${(asset.status || '').replace(/"/g, '""')}"`,
      `"${(asset.description || '').replace(/"/g, '""')}"`
    ];
    csv += row.join(',') + '\n';
  });

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${productName.replace(/\s+/g, '-')}-Campaign-Calendar-${new Date().getFullYear()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('✅ CSV downloaded — open in Excel, Google Sheets, or any spreadsheet app', 4000);
}

// Simple modal approach that works everywhere
function showFullContent(asset) {
  console.log('showFullContent called for:', asset.name);
  console.log('Asset has content:', !!asset.content);
  
  // Remove any existing modal
  const existingModal = document.querySelector('.content-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'content-modal-overlay';
  
  let contentHtml = `
    <div class="asset-meta-header">
      <div class="meta-row">
        <div class="meta-item">
          <span class="meta-label">Type</span>
          <span class="meta-badge meta-type">${asset.type}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Stage</span>
          <span class="meta-badge meta-stage">${asset.stage}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Status</span>
          <span class="meta-badge meta-status">${asset.status}</span>
        </div>
      </div>
  `;

  if (asset.personas && asset.personas.length > 0) {
    contentHtml += `
      <div class="meta-row">
        <div class="meta-item meta-full">
          <span class="meta-label">Personas</span>
          <div class="meta-badges">
            ${asset.personas.map(p => `<span class="meta-badge-sm">${p.toUpperCase().replace('-', ' ')}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }

  if (asset.regions && asset.regions.length > 0) {
    contentHtml += `
      <div class="meta-row">
        <div class="meta-item meta-full">
          <span class="meta-label">Regions</span>
          <div class="meta-badges">
            ${asset.regions.map(r => `<span class="meta-badge-sm">${r.toUpperCase().replace('-', ' ')}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }

  if (asset.languages && asset.languages.length > 0) {
    contentHtml += `
      <div class="meta-row">
        <div class="meta-item meta-full">
          <span class="meta-label">Languages</span>
          <div class="meta-badges">
            ${asset.languages.map(l => `<span class="meta-badge-sm">${l.charAt(0).toUpperCase() + l.slice(1)}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }

  contentHtml += `</div>`;

  if (asset.content) {
    const content = asset.content;

    // Whitepaper/Guide content with FULL sections
    if (content.sections && content.sections.length > 0) {
      contentHtml += '<div class="preview-section whitepaper-content">';

      if (content.pageCount) {
        contentHtml += `<div class="content-meta"><strong>Length:</strong> ${content.pageCount} | <strong>Reading Time:</strong> ${content.readingTime || '15 minutes'}</div>`;
      }

      if (content.title) {
        contentHtml += `<h2 class="whitepaper-title">${content.title}</h2>`;
      }

      if (content.subtitle) {
        contentHtml += `<h4 class="whitepaper-subtitle">${content.subtitle}</h4>`;
      }

      contentHtml += '<div class="whitepaper-sections">';

      content.sections.forEach((section, idx) => {
        contentHtml += `
          <div class="whitepaper-section">
            <h3 class="section-heading">${section.heading}</h3>
            <div class="section-body">${section.body.replace(/\n/g, '<br>')}</div>
          </div>
        `;
      });

      contentHtml += '</div></div>';

      if (content.cta) {
        contentHtml += `
          <div class="preview-section cta-section">
            <h5>Calls to Action:</h5>
            <div><strong>Primary:</strong> ${content.cta.primary}</div>
            ${content.cta.secondary ? `<div><strong>Secondary:</strong> ${content.cta.secondary}</div>` : ''}
            ${content.cta.tertiary ? `<div><strong>Tertiary:</strong> ${content.cta.tertiary}</div>` : ''}
          </div>
        `;
      }
    }

    // Blog post content with FULL body
    if (content.introduction || content.body) {
      contentHtml += '<div class="preview-section blog-content">';

      if (content.title) {
        contentHtml += `<h2 class="blog-title">${content.title}</h2>`;
      }

      if (content.author) {
        contentHtml += `<div class="blog-meta"><strong>By:</strong> ${content.author}`;
        if (content.publishDate) contentHtml += ` | <strong>Published:</strong> ${content.publishDate}`;
        if (content.readingTime) contentHtml += ` | <strong>Reading Time:</strong> ${content.readingTime}`;
        contentHtml += '</div>';
      }

      if (content.tags && content.tags.length > 0) {
        contentHtml += `<div class="blog-tags">${content.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>`;
      }

      if (content.introduction) {
        contentHtml += `<div class="blog-section"><h4>Introduction</h4><p>${content.introduction.replace(/\n/g, '<br>')}</p></div>`;
      }

      if (content.body) {
        contentHtml += `<div class="blog-section"><h4>Article Body</h4><div class="blog-body">${content.body.replace(/\n/g, '<br>')}</div></div>`;
      }

      if (content.conclusion) {
        contentHtml += `<div class="blog-section"><h4>Conclusion</h4><p>${content.conclusion.replace(/\n/g, '<br>')}</p></div>`;
      }

      if (content.cta) {
        contentHtml += `<div class="blog-cta"><strong>CTAs:</strong> ${content.cta.primary}${content.cta.secondary ? ' | ' + content.cta.secondary : ''}</div>`;
      }

      contentHtml += '</div>';
    }

    // Email, webinar, case study content
    if (content.subject && !content.introduction) {
      contentHtml += `
        <div class="email-content-wrapper">
          <div class="email-content-card">
            <h3 class="email-content-header">Email Content</h3>
            <div class="email-content-body">
              <div class="email-field">
                <span class="email-label">Subject:</span>
                <span class="email-value">${content.subject}</span>
              </div>
              ${content.preview ? `
                <div class="email-field">
                  <span class="email-label">Preview Text:</span>
                  <span class="email-value">${content.preview}</span>
                </div>
              ` : ''}
              <div class="email-field email-body-field">
                <span class="email-label">Body:</span>
                <div class="email-body-content">${content.body}</div>
              </div>
              ${content.cta ? `
                <div class="email-field">
                  <span class="email-label">CTA:</span>
                  <span class="email-value email-cta">${content.cta}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }
  }

  contentHtml += `
    <div class="preview-actions">
      <button class="btn btn-primary" onclick="navigator.clipboard.writeText(document.querySelector('.content-modal-body').innerText); showToast('📋 Content copied to clipboard')">📋 Copy Content</button>
      <button class="btn btn-secondary" onclick="document.querySelector('.content-modal-overlay').remove()">Close</button>
    </div>
  `;

  modalOverlay.innerHTML = `
    <div class="content-modal">
      <div class="content-modal-header">
        <h2>${asset.name}</h2>
        <button class="modal-close-btn" onclick="this.closest('.content-modal-overlay').remove()">&times;</button>
      </div>
      <div class="content-modal-body">
        ${contentHtml}
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  
  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
  
  console.log('Modal created and added to page');
}

function applyJourneyFilters() {
  const personaFilter = document.getElementById('journeyPersonaFilter').value;
  const regionFilter = document.getElementById('journeyRegionFilter').value;
  const languageFilter = document.getElementById('journeyLanguageFilter').value;

  if (!currentCampaign || !currentCampaign.assets) return;

  // Filter assets based on criteria
  let filteredAssets = currentCampaign.assets;

  if (personaFilter) {
    filteredAssets = filteredAssets.filter(a => (a.personas || []).includes(personaFilter));
  }
  if (regionFilter) {
    filteredAssets = filteredAssets.filter(a => (a.regions || []).includes(regionFilter));
  }
  if (languageFilter) {
    filteredAssets = filteredAssets.filter(a => (a.languages || []).includes(languageFilter));
  }

  // Update journey map to show only filtered assets
  if (journeyMap) {
    journeyMap.loadAssets(filteredAssets);
  }

  // Update asset dropdown
  const assetSelect = document.getElementById('assetToAdd');
  assetSelect.innerHTML = '<option value="">Select an asset...</option>';
  filteredAssets.forEach(asset => {
    const option = document.createElement('option');
    option.value = asset.id;
    option.textContent = `${asset.type}: ${asset.name}`;
    assetSelect.appendChild(option);
  });
}

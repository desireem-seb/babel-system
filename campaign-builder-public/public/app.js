// State
let currentProduct = null;
let currentFramework = null;
let currentCampaign = null;
let editingAsset = null;
let lastFrameworkUpdate = null;
let calendarQuarterOffset = 0;

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
  // Reset state
  currentProduct = null;
  currentFramework = null;
  currentCampaign = null;

  // Reset product selector
  productSelector.value = '';

  // Show empty state, hide campaign content
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

    // Render all tabs
    renderFramework();
    renderAssetRepository();
    renderCampaignFlow();
    renderContentGenerator();
    renderContentGeneratorBriefContext();

    // Load assets into journey map
    if (journeyMap) {
      journeyMap.loadAssets(currentCampaign.assets || []);
      journeyMap.loadState(currentCampaign);
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Failed to load product data');
  }
}

function renderFramework() {
  // Portfolio
  portfolioText.textContent = currentFramework.portfolio;
  taglineText.textContent = currentFramework.tagline;

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

  renderCampaignBrief();
}

function renderCampaignBrief() {
  const briefSection = document.getElementById('campaignBriefSection');
  const briefDisplay = document.getElementById('campaignBriefDisplay');
  if (!briefSection || !briefDisplay) return;

  const brief = currentFramework.campaignBrief || {};
  briefSection.style.display = 'block';

  const hasContent = brief.campaignName || brief.objective || brief.keyMessages || brief.targetOutcomes;

  if (!hasContent) {
    briefDisplay.innerHTML = `
      <div class="brief-empty">
        <p>No campaign brief added yet. Click <strong>✏️ Edit Framework</strong> to define your campaign strategy — it will flow through to all tabs.</p>
      </div>
    `;
    return;
  }

  briefDisplay.innerHTML = `
    <div class="brief-fields">
      ${brief.campaignName ? `<div class="brief-field"><span class="brief-label">Campaign</span><span class="brief-value">${brief.campaignName}</span></div>` : ''}
      ${brief.campaignPeriod ? `<div class="brief-field"><span class="brief-label">Period</span><span class="brief-value">${brief.campaignPeriod}</span></div>` : ''}
      ${brief.targetOutcomes ? `<div class="brief-field"><span class="brief-label">KPIs</span><span class="brief-value">${brief.targetOutcomes}</span></div>` : ''}
      ${brief.objective ? `<div class="brief-field brief-field-full"><span class="brief-label">Objective</span><div class="brief-value">${brief.objective}</div></div>` : ''}
      ${brief.keyMessages ? `<div class="brief-field brief-field-full"><span class="brief-label">Key Messages</span><div class="brief-value brief-messages">${brief.keyMessages.replace(/\n/g, '<br>')}</div></div>` : ''}
    </div>
  `;
}

function renderAssetRepository() {
  const stages = ['awareness', 'familiarity', 'consideration', 'decision'];

  stages.forEach(stage => {
    const assets = (currentCampaign.assets || []).filter(a => a.stage === stage);
    const liveCount = assets.filter(a => a.status === 'live').length;

    // Update count
    const countEl = document.getElementById(`${stage}Count`);
    countEl.textContent = `${assets.length} assets | ${liveCount} live`;

    // Render assets
    const listEl = document.getElementById(`${stage}Assets`);
    listEl.innerHTML = '';

    assets.forEach(asset => {
      const assetCard = createAssetCard(asset);
      listEl.appendChild(assetCard);
    });
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

  const channelTags = (asset.channels || []).map(ch =>
    `<span class="channel-tag ${ch}">${ch.toUpperCase()}</span>`
  ).join('');

  const productTags = (asset.products || []).map(p =>
    `<span class="product-tag ${p}">${p.toUpperCase().replace('-', ' ')}</span>`
  ).join('');

  const personaTags = (asset.personas || []).map(p =>
    `<span class="persona-tag ${p}">${p.toUpperCase().replace('-', ' ')}</span>`
  ).join('');

  const regionTags = (asset.regions || []).map(r =>
    `<span class="region-tag ${r}">${r.toUpperCase().replace('-', ' ')}</span>`
  ).join('');

  const languageTags = (asset.languages || []).map(l =>
    `<span class="language-tag ${l}">${l.charAt(0).toUpperCase() + l.slice(1)}</span>`
  ).join('');

  card.innerHTML = `
    <div class="asset-header">
      <span class="asset-type">${asset.type}</span>
      <span class="asset-status">${statusIcons[asset.status]}</span>
    </div>
    <div class="asset-name">${asset.name}</div>
    <div class="asset-tags">
      ${channelTags}
      ${productTags}
      ${personaTags}
      ${regionTags}
      ${languageTags}
    </div>
  `;

  card.addEventListener('click', () => {
    openAssetModal(asset);
  });

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
  if (tabName === 'generator' && currentFramework) {
    renderContentGeneratorBriefContext();
  }
}

function openAssetModal(asset = null) {
  editingAsset = asset;

  const modalTitle = document.getElementById('modalTitle');

  if (asset) {
    modalTitle.textContent = 'Edit Asset';

    // Populate form
    document.getElementById('assetType').value = asset.type;
    document.getElementById('assetName').value = asset.name;
    document.getElementById('assetStage').value = asset.stage;
    document.getElementById('assetStatus').value = asset.status;
    document.getElementById('assetPillar').value = asset.pillar || '';
    document.getElementById('assetDescription').value = asset.description || '';

    // Channels
    document.querySelectorAll('input[name="channel"]').forEach(input => {
      input.checked = (asset.channels || []).includes(input.value);
    });

    // Products
    document.querySelectorAll('input[name="product"]').forEach(input => {
      input.checked = (asset.products || []).includes(input.value);
    });

    // Personas
    document.querySelectorAll('input[name="persona"]').forEach(input => {
      input.checked = (asset.personas || []).includes(input.value);
    });

    // Regions
    document.querySelectorAll('input[name="region"]').forEach(input => {
      input.checked = (asset.regions || []).includes(input.value);
    });

    // Languages
    document.querySelectorAll('input[name="language"]').forEach(input => {
      input.checked = (asset.languages || []).includes(input.value);
    });
  } else {
    modalTitle.textContent = 'Add New Asset';
    assetForm.reset();
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
    stage: document.getElementById('assetStage').value,
    status: document.getElementById('assetStatus').value,
    pillar: document.getElementById('assetPillar').value || null,
    description: document.getElementById('assetDescription').value || null,
    channels: Array.from(document.querySelectorAll('input[name="channel"]:checked')).map(cb => cb.value),
    products: Array.from(document.querySelectorAll('input[name="product"]:checked')).map(cb => cb.value),
    personas: Array.from(document.querySelectorAll('input[name="persona"]:checked')).map(cb => cb.value),
    regions: Array.from(document.querySelectorAll('input[name="region"]:checked')).map(cb => cb.value),
    languages: Array.from(document.querySelectorAll('input[name="language"]:checked')).map(cb => cb.value)
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
    alert('Failed to save asset');
  }
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
      alert('✅ Campaign saved successfully!');
    }
  } catch (error) {
    console.error('Error saving campaign:', error);
    alert('Failed to save campaign');
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
      alert('✅ Thank you for your feedback! It has been recorded.');
      document.getElementById('feedbackModal').style.display = 'none';
      document.getElementById('feedbackForm').reset();
    } else {
      throw new Error(result.error || 'Feedback submission failed');
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('Failed to submit feedback: ' + error.message);
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

function openEditFrameworkModal() {
  if (!currentFramework) {
    alert('No framework loaded');
    return;
  }

  // Populate header fields
  document.getElementById('editPortfolioMessage').value = currentFramework.portfolioMessage || '';
  document.getElementById('editTagline').value = currentFramework.tagline || '';

  // Populate pillar fields
  const pillars = currentFramework.pillars || [];
  for (let i = 0; i < 4; i++) {
    const pillar = pillars[i] || {};
    const pillarNum = i + 1;
    document.getElementById(`editPillar${pillarNum}Name`).value = pillar.name || '';
    document.getElementById(`editPillar${pillarNum}Description`).value = pillar.description || '';
  }

  // Populate campaign brief fields
  const brief = currentFramework.campaignBrief || {};
  document.getElementById('editCampaignName').value = brief.campaignName || '';
  document.getElementById('editCampaignPeriod').value = brief.campaignPeriod || '';
  document.getElementById('editCampaignObjective').value = brief.objective || '';
  document.getElementById('editKeyMessages').value = brief.keyMessages || '';
  document.getElementById('editTargetOutcomes').value = brief.targetOutcomes || '';

  // Show modal
  document.getElementById('editFrameworkModal').style.display = 'flex';
}

async function saveFrameworkEdits() {
  if (!currentProduct) {
    alert('No product selected');
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
    // Get campaign brief values
    const campaignBrief = {
      campaignName: document.getElementById('editCampaignName').value,
      campaignPeriod: document.getElementById('editCampaignPeriod').value,
      objective: document.getElementById('editCampaignObjective').value,
      keyMessages: document.getElementById('editKeyMessages').value,
      targetOutcomes: document.getElementById('editTargetOutcomes').value
    };

    const response = await fetch(`/api/frameworks/${currentProduct}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioMessage,
        tagline,
        pillars,
        campaignBrief
      })
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

      alert('✅ Framework & brief updated successfully!');
    } else {
      throw new Error(result.error || 'Framework update failed');
    }
  } catch (error) {
    console.error('Error updating framework:', error);
    alert('Failed to update framework: ' + error.message);
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

  // Update campaign context panel in content generator
  renderContentGenerator();
  renderContentGeneratorBriefContext();

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
}

function renderContentGeneratorBriefContext() {
  const panel = document.getElementById('generatorBriefContext');
  if (!panel || !currentFramework) return;

  const brief = currentFramework.campaignBrief || {};
  const hasContext = brief.campaignName || brief.objective || brief.keyMessages;

  if (!hasContext) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';
  panel.innerHTML = `
    <div class="generator-context-header">
      <h4>📄 Campaign Context</h4>
      <span class="context-from-brief">From Campaign Brief</span>
    </div>
    <div class="generator-context-body">
      ${brief.campaignName ? `<div class="context-row"><strong>Campaign:</strong> ${brief.campaignName}${brief.campaignPeriod ? ` &nbsp;·&nbsp; ${brief.campaignPeriod}` : ''}</div>` : ''}
      ${brief.objective ? `<div class="context-row"><strong>Objective:</strong> ${brief.objective}</div>` : ''}
      ${brief.keyMessages ? `<div class="context-row"><strong>Key Messages:</strong><div class="context-messages">${brief.keyMessages.replace(/\n/g, '<br>')}</div></div>` : ''}
      ${brief.targetOutcomes ? `<div class="context-row"><strong>KPIs:</strong> ${brief.targetOutcomes}</div>` : ''}
    </div>
  `;
}

function openEditFlowModal() {
  if (!currentFramework) {
    alert('No framework loaded');
    return;
  }

  // Get default flow stages
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

  // Use stored flow stages if they exist, otherwise use defaults
  const flowStages = currentFramework.flowStages || defaultFlowStages;

  // Populate flow stages in the modal
  const container = document.getElementById('flowStagesContainer');
  container.innerHTML = '';

  Object.keys(flowStages).forEach(stageKey => {
    const stage = flowStages[stageKey];
    const stageDiv = document.createElement('div');
    stageDiv.style.cssText = 'border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius-sm); background: var(--bg-secondary);';
    stageDiv.innerHTML = `
      <div class="form-group">
        <label style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; display: block;">Stage: ${stageKey}</label>
        <small style="color: var(--text-muted); display: block; margin-bottom: 0.75rem; font-size: 0.75rem;">
          This is the internal identifier for this stage
        </small>
        <label>Label *</label>
        <input type="text" id="flow_${stageKey}_label" value="${stage.label}" required placeholder="e.g., ACQUISITION" style="margin-bottom: 0.75rem;">
        <label>Subtitle *</label>
        <input type="text" id="flow_${stageKey}_subtitle" value="${stage.subtitle}" required placeholder="e.g., Drive traffic">
      </div>
    `;
    container.appendChild(stageDiv);
  });

  // Show modal
  document.getElementById('editFlowModal').style.display = 'flex';
}

async function saveFlowEdits() {
  if (!currentProduct) {
    alert('No product selected');
    return;
  }

  // Get default flow stage keys
  const stageKeys = [
    'acquisition', 'hero_asset', 'conversion', 'conversion_confirmation',
    'nurture_day1', 'nurture_day3', 'nurture_day7', 'nurture_day14', 'nurture_day21',
    'engagement_registration', 'engagement_event', 'engagement_followup',
    'decision_demo_offer', 'decision_proof'
  ];

  // Build flow stages object from form
  const flowStages = {};
  stageKeys.forEach(stageKey => {
    const label = document.getElementById(`flow_${stageKey}_label`)?.value;
    const subtitle = document.getElementById(`flow_${stageKey}_subtitle`)?.value;

    if (label && subtitle) {
      flowStages[stageKey] = { label, subtitle };
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

      alert('✅ Campaign flow updated successfully!');
    } else {
      throw new Error(result.error || 'Flow update failed');
    }
  } catch (error) {
    console.error('Error updating flow:', error);
    alert('Failed to update flow: ' + error.message);
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

async function generateNewContent() {
  if (!currentProduct) {
    alert('Please select a product first');
    return;
  }

  const contentType = document.getElementById('genContentType').value;
  const stage = document.getElementById('genStage').value;
  const audience = document.getElementById('genAudience').value;
  const customPrompt = document.getElementById('genPrompt').value;

  if (!contentType) {
    alert('Please select a content type');
    return;
  }

  // Show loading state
  const btnText = document.getElementById('generateBtnText');
  const btnSpinner = document.getElementById('generateBtnSpinner');
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';

  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: currentProduct,
        contentType,
        stage,
        audience,
        customPrompt
      })
    });

    const result = await response.json();

    if (result.success) {
      // Add the new asset to the current campaign
      if (!currentCampaign.assets) {
        currentCampaign.assets = [];
      }
      currentCampaign.assets.push(result.asset);

      // Reset form
      document.getElementById('generateContentForm').reset();
      document.getElementById('genStage').value = 'AWARENESS';
      document.getElementById('genAudience').value = 'Enterprise Leaders';

      // Refresh the content generator view
      renderContentGenerator();

      alert('✅ Content generated successfully!');
    } else {
      throw new Error(result.error || 'Content generation failed');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    alert('Failed to generate content: ' + error.message);
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
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

  Object.keys(stages).forEach(stageKey => {
    const stageAssets = (currentCampaign.assets || []).filter(a => a.stage === stageKey);

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

  if ((currentCampaign.assets || []).length === 0) {
    contentList.innerHTML = `
      <div class="empty-content-state">
        <h3>No Assets Yet</h3>
        <p>Add assets in the Asset Repository tab to see content previews here.</p>
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
      alert('Content generation coming soon! For now, check the System of Context campaign for examples.');
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

  // Filter assets
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
              <span class="calendar-asset-name">${asset.name}</span>
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
    const label = isMonthBoundary ? monthNames[w.start.getMonth()] : `${i + 1}`;
    return `<div class="qw-week-header ${isMonthBoundary ? 'month-boundary' : ''}" title="${w.start.toLocaleDateString()} – ${w.end.toLocaleDateString()}">${label}</div>`;
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
    alert('No campaign assets to export');
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
      font-family: 'Salesforce Sans', Arial, sans-serif;
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

  alert('✅ Calendar exported! Open the downloaded HTML file and print to PDF or copy-paste slides into Google Slides.');
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
    alert('No campaign assets to download');
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

  alert('✅ Calendar downloaded as CSV! You can open this in Excel, Google Sheets, or any spreadsheet application.');
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
      <button class="btn btn-primary" onclick="navigator.clipboard.writeText(document.querySelector('.content-modal-body').innerText); alert('Content copied to clipboard!')">📋 Copy Content</button>
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

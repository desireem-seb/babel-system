// Journey Map Module
class JourneyMap {
  constructor() {
    this.canvas = document.getElementById('journeyCanvas');
    this.svg = document.getElementById('connectionsSvg');
    this.nodes = [];
    this.connections = [];
    this.connectMode = false;
    this.selectedNode = null;
    this.draggedNode = null;
    this.dragOffset = { x: 0, y: 0 };

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add asset to canvas
    document.getElementById('addToCanvasBtn').addEventListener('click', () => {
      this.addAssetToCanvas();
    });

    // Clear all
    document.getElementById('clearJourneyBtn').addEventListener('click', () => {
      if (confirm('Clear all assets from the journey map?')) {
        this.clearCanvas();
      }
    });

    // Connect mode toggle
    document.getElementById('connectModeBtn').addEventListener('click', () => {
      this.toggleConnectMode();
    });

    // Canvas mouse events for dragging
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
  }

  loadAssets(assets) {
    // Populate asset selector
    const select = document.getElementById('assetToAdd');
    select.innerHTML = '<option value="">Select an asset...</option>';

    assets.forEach((asset, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `[${asset.stage.toUpperCase()}] ${asset.type} - ${asset.name}`;
      select.appendChild(option);
    });
  }

  addAssetToCanvas() {
    const select = document.getElementById('assetToAdd');
    const assetIndex = select.value;

    if (!assetIndex) {
      alert('Please select an asset');
      return;
    }

    const asset = currentCampaign.assets[assetIndex];

    // Create node
    const node = this.createNode(asset);
    this.nodes.push(node);
    this.canvas.appendChild(node.element);

    // Reset selector
    select.value = '';

    // Save state
    this.saveState();
  }

  createNode(asset, x = null, y = null) {
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create node element
    const nodeEl = document.createElement('div');
    nodeEl.className = `journey-node ${asset.stage}`;
    nodeEl.dataset.nodeId = nodeId;

    // Position (random if not specified)
    const posX = x !== null ? x : Math.random() * (this.canvas.offsetWidth - 200) + 20;
    const posY = y !== null ? y : Math.random() * (this.canvas.offsetHeight - 150) + 20;
    nodeEl.style.left = posX + 'px';
    nodeEl.style.top = posY + 'px';

    // Status emoji
    const statusIcons = {
      'live': '✅',
      'in-progress': '🔴',
      'being-refreshed': '🟠'
    };

    nodeEl.innerHTML = `
      <div class="node-header">
        <span class="node-stage">${asset.stage}</span>
        <button class="node-delete" onclick="journeyMap.deleteNode('${nodeId}')">×</button>
      </div>
      <div class="node-type">${asset.type}</div>
      <div class="node-name">${asset.name}</div>
      <div style="margin-top: 0.5rem; font-size: 1rem;">${statusIcons[asset.status]}</div>
    `;

    // Node click for connect mode
    nodeEl.addEventListener('click', (e) => {
      if (this.connectMode) {
        e.stopPropagation();
        this.handleNodeClick(nodeId);
      }
    });

    return {
      id: nodeId,
      element: nodeEl,
      asset: asset,
      x: posX,
      y: posY
    };
  }

  deleteNode(nodeId) {
    // Remove connections
    this.connections = this.connections.filter(conn =>
      conn.from !== nodeId && conn.to !== nodeId
    );

    // Remove node
    const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      this.nodes[nodeIndex].element.remove();
      this.nodes.splice(nodeIndex, 1);
    }

    this.redrawConnections();
    this.saveState();
  }

  toggleConnectMode() {
    this.connectMode = !this.connectMode;
    const btn = document.getElementById('connectModeBtn');
    const hint = document.getElementById('connectModeHint');

    if (this.connectMode) {
      btn.textContent = '✓ Connect Mode ON';
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
      this.canvas.style.cursor = 'crosshair';
      if (hint) hint.style.display = 'inline';
    } else {
      btn.textContent = '🔗 Connect Mode';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
      this.canvas.style.cursor = 'default';
      if (hint) hint.style.display = 'none';
      this.selectedNode = null;
    }
  }

  stageColor(stage) {
    return { awareness: '#3B82F6', familiarity: '#06B6D4', consideration: '#10B981', decision: '#8B5CF6' }[stage] || '#4a90e2';
  }

  handleNodeClick(nodeId) {
    if (!this.selectedNode) {
      this.selectedNode = nodeId;
      const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
      nodeEl.style.border = '3px solid #F59E0B';
      nodeEl.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.25)';
    } else if (this.selectedNode === nodeId) {
      // Clicked same node — deselect
      const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
      const node = this.nodes.find(n => n.id === nodeId);
      nodeEl.style.border = `2px solid ${this.stageColor(node.asset.stage)}`;
      nodeEl.style.boxShadow = '';
      this.selectedNode = null;
    } else {
      // Second node — draw connection
      this.createConnection(this.selectedNode, nodeId);

      const firstNodeEl = document.querySelector(`[data-node-id="${this.selectedNode}"]`);
      const firstNode = this.nodes.find(n => n.id === this.selectedNode);
      firstNodeEl.style.border = `2px solid ${this.stageColor(firstNode.asset.stage)}`;
      firstNodeEl.style.boxShadow = '';
      this.selectedNode = null;
    }
  }

  createConnection(fromId, toId) {
    // Check if connection already exists
    const exists = this.connections.some(conn =>
      conn.from === fromId && conn.to === toId
    );

    if (exists) {
      if (typeof showToast === 'function') showToast('Connection already exists', 2500);
      return;
    }

    this.connections.push({ from: fromId, to: toId });
    this.redrawConnections();
    this.saveState();
  }

  redrawConnections() {
    // Clear existing lines
    const existingLines = this.svg.querySelectorAll('.connection-line');
    existingLines.forEach(line => line.remove());

    // Draw all connections
    this.connections.forEach(conn => {
      const fromNode = this.nodes.find(n => n.id === conn.from);
      const toNode = this.nodes.find(n => n.id === conn.to);

      if (fromNode && toNode) {
        this.drawConnection(fromNode, toNode);
      }
    });
  }

  drawConnection(fromNode, toNode) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.classList.add('connection-line', fromNode.asset.stage);

    // Calculate centers
    const fromEl = fromNode.element;
    const toEl = toNode.element;

    const x1 = fromNode.x + fromEl.offsetWidth / 2;
    const y1 = fromNode.y + fromEl.offsetHeight / 2;
    const x2 = toNode.x + toEl.offsetWidth / 2;
    const y2 = toNode.y + toEl.offsetHeight / 2;

    // Create curved path
    const midX = (x1 + x2) / 2;
    const path = `M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2}, ${x2} ${y2}`;

    line.setAttribute('d', path);
    this.svg.appendChild(line);
  }

  // Drag functionality
  onMouseDown(e) {
    const nodeEl = e.target.closest('.journey-node');
    if (!nodeEl || this.connectMode) return;

    this.draggedNode = this.nodes.find(n => n.id === nodeEl.dataset.nodeId);
    if (this.draggedNode) {
      const rect = nodeEl.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();

      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      nodeEl.classList.add('dragging');
      this.canvas.style.cursor = 'grabbing';
    }
  }

  onMouseMove(e) {
    if (!this.draggedNode) return;

    const canvasRect = this.canvas.getBoundingClientRect();
    let x = e.clientX - canvasRect.left - this.dragOffset.x;
    let y = e.clientY - canvasRect.top - this.dragOffset.y;

    // Constrain to canvas
    x = Math.max(0, Math.min(x, this.canvas.offsetWidth - this.draggedNode.element.offsetWidth));
    y = Math.max(0, Math.min(y, this.canvas.offsetHeight - this.draggedNode.element.offsetHeight));

    this.draggedNode.x = x;
    this.draggedNode.y = y;
    this.draggedNode.element.style.left = x + 'px';
    this.draggedNode.element.style.top = y + 'px';

    this.redrawConnections();
  }

  onMouseUp() {
    if (this.draggedNode) {
      this.draggedNode.element.classList.remove('dragging');
      this.draggedNode = null;
      this.canvas.style.cursor = this.connectMode ? 'crosshair' : 'default';
      this.saveState();
    }
  }

  clearCanvas() {
    this.nodes.forEach(node => node.element.remove());
    this.nodes = [];
    this.connections = [];
    this.redrawConnections();
    this.saveState();
  }

  saveState() {
    if (!currentCampaign) return;

    const journeyState = {
      nodes: this.nodes.map(n => ({
        assetId: n.asset.id,
        x: n.x,
        y: n.y
      })),
      connections: this.connections
    };

    currentCampaign.journeyState = journeyState;
  }

  loadState(campaign) {
    this.clearCanvas();

    if (campaign.journeyState) {
      const state = campaign.journeyState;

      // Recreate nodes
      state.nodes.forEach(nodeData => {
        const asset = campaign.assets.find(a => a.id === nodeData.assetId);
        if (asset) {
          const node = this.createNode(asset, nodeData.x, nodeData.y);
          this.nodes.push(node);
          this.canvas.appendChild(node.element);
        }
      });

      // Recreate connections
      this.connections = state.connections || [];
      this.redrawConnections();
    }
  }
}

// Initialize journey map
let journeyMap;

// Export for use in app.js
window.initializeJourneyMap = function() {
  journeyMap = new JourneyMap();
  return journeyMap;
};

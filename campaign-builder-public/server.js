import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Paths
const DATA_DIR = join(__dirname, 'data');
const FRAMEWORKS_PATH = join(DATA_DIR, 'campaign-frameworks.json');
const ENHANCED_FRAMEWORKS_PATH = join(DATA_DIR, 'campaign-frameworks-enhanced.json');
const CAMPAIGNS_PATH = join(DATA_DIR, 'campaigns.json');
const CAMPAIGNS_DIR = join(DATA_DIR, 'campaigns');
const FEEDBACK_PATH = join(DATA_DIR, 'feedback.json');

// Ensure data files exist
await fs.ensureDir(DATA_DIR);
if (!await fs.pathExists(CAMPAIGNS_PATH)) {
  await fs.writeJson(CAMPAIGNS_PATH, {});
}
if (!await fs.pathExists(FEEDBACK_PATH)) {
  await fs.writeJson(FEEDBACK_PATH, []);
}

// Get all campaign frameworks
app.get('/api/frameworks', async (req, res) => {
  try {
    const frameworks = await fs.readJson(FRAMEWORKS_PATH);
    res.json(frameworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific framework
app.get('/api/frameworks/:product', async (req, res) => {
  try {
    const { product } = req.params;
    let frameworks = await fs.readJson(FRAMEWORKS_PATH);

    // Try to merge with enhanced frameworks if they exist
    if (await fs.pathExists(ENHANCED_FRAMEWORKS_PATH)) {
      const enhancedFrameworks = await fs.readJson(ENHANCED_FRAMEWORKS_PATH);
      frameworks = { ...frameworks, ...enhancedFrameworks };
    }

    if (!frameworks[product]) {
      return res.status(404).json({ error: 'Framework not found' });
    }

    res.json(frameworks[product]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update framework
app.put('/api/frameworks/:product', async (req, res) => {
  try {
    const { product } = req.params;
    const updates = req.body;

    // Read current frameworks
    let frameworks = await fs.readJson(FRAMEWORKS_PATH);

    // Check if framework exists
    if (!frameworks[product]) {
      return res.status(404).json({ error: 'Framework not found' });
    }

    // Update the framework
    frameworks[product] = {
      ...frameworks[product],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    // Save back to file
    await fs.writeJson(FRAMEWORKS_PATH, frameworks, { spaces: 2 });

    res.json({ success: true, framework: frameworks[product] });
  } catch (error) {
    console.error('Error updating framework:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update campaign flow configuration
app.put('/api/frameworks/:product/flow', async (req, res) => {
  try {
    const { product } = req.params;
    const { flowStages } = req.body;

    if (!flowStages) {
      return res.status(400).json({ error: 'Flow stages are required' });
    }

    // Read current frameworks
    let frameworks = await fs.readJson(FRAMEWORKS_PATH);

    // Check if framework exists
    if (!frameworks[product]) {
      return res.status(404).json({ error: 'Framework not found' });
    }

    // Update the flow configuration
    frameworks[product].flowStages = flowStages;
    frameworks[product].lastUpdated = new Date().toISOString();

    // Save back to file
    await fs.writeJson(FRAMEWORKS_PATH, frameworks, { spaces: 2 });

    res.json({ success: true, flowStages: frameworks[product].flowStages });
  } catch (error) {
    console.error('Error updating flow configuration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await fs.readJson(CAMPAIGNS_PATH);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific campaign
app.get('/api/campaigns/:product', async (req, res) => {
  try {
    const { product } = req.params;

    // First, check if there's an individual campaign file
    const individualCampaignPath = join(CAMPAIGNS_DIR, `${product}.json`);
    if (await fs.pathExists(individualCampaignPath)) {
      const campaign = await fs.readJson(individualCampaignPath);
      return res.json(campaign);
    }

    // Otherwise, check the main campaigns file
    const campaigns = await fs.readJson(CAMPAIGNS_PATH);
    const campaign = campaigns[product] || {
      product,
      assets: [],
      journeys: []
    };

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save campaign
app.post('/api/campaigns/:product', async (req, res) => {
  try {
    const { product } = req.params;
    const campaignData = req.body;

    const campaigns = await fs.readJson(CAMPAIGNS_PATH);
    campaigns[product] = {
      ...campaignData,
      product,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeJson(CAMPAIGNS_PATH, campaigns, { spaces: 2 });
    res.json({ success: true, campaign: campaigns[product] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add asset to campaign
app.post('/api/campaigns/:product/assets', async (req, res) => {
  try {
    const { product } = req.params;
    const asset = req.body;

    const campaigns = await fs.readJson(CAMPAIGNS_PATH);

    if (!campaigns[product]) {
      campaigns[product] = {
        product,
        assets: [],
        journeys: []
      };
    }

    const assetWithId = {
      ...asset,
      id: `asset-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    campaigns[product].assets.push(assetWithId);
    campaigns[product].lastUpdated = new Date().toISOString();

    await fs.writeJson(CAMPAIGNS_PATH, campaigns, { spaces: 2 });
    res.json({ success: true, asset: assetWithId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update asset
app.put('/api/campaigns/:product/assets/:assetId', async (req, res) => {
  try {
    const { product, assetId } = req.params;
    const updates = req.body;

    const campaigns = await fs.readJson(CAMPAIGNS_PATH);

    if (!campaigns[product]) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const assetIndex = campaigns[product].assets.findIndex(a => a.id === assetId);

    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    campaigns[product].assets[assetIndex] = {
      ...campaigns[product].assets[assetIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    campaigns[product].lastUpdated = new Date().toISOString();

    await fs.writeJson(CAMPAIGNS_PATH, campaigns, { spaces: 2 });
    res.json({ success: true, asset: campaigns[product].assets[assetIndex] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete asset
app.delete('/api/campaigns/:product/assets/:assetId', async (req, res) => {
  try {
    const { product, assetId } = req.params;

    const campaigns = await fs.readJson(CAMPAIGNS_PATH);

    if (!campaigns[product]) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    campaigns[product].assets = campaigns[product].assets.filter(a => a.id !== assetId);
    campaigns[product].lastUpdated = new Date().toISOString();

    await fs.writeJson(CAMPAIGNS_PATH, campaigns, { spaces: 2 });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add journey to campaign
app.post('/api/campaigns/:product/journeys', async (req, res) => {
  try {
    const { product } = req.params;
    const journey = req.body;

    const campaigns = await fs.readJson(CAMPAIGNS_PATH);

    if (!campaigns[product]) {
      campaigns[product] = {
        product,
        assets: [],
        journeys: []
      };
    }

    const journeyWithId = {
      ...journey,
      id: `journey-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    campaigns[product].journeys.push(journeyWithId);
    campaigns[product].lastUpdated = new Date().toISOString();

    await fs.writeJson(CAMPAIGNS_PATH, campaigns, { spaces: 2 });
    res.json({ success: true, journey: journeyWithId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate new content dynamically
app.post('/api/generate-content', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'API key not configured',
      setup: 'Set the ANTHROPIC_API_KEY environment variable. See README for instructions.'
    });
  }

  try {
    const { product, contentType, stage, audience, customPrompt } = req.body;

    if (!product || !contentType) {
      return res.status(400).json({ error: 'Product and content type are required' });
    }

    // Load framework for this product to give Claude context
    const frameworks = await fs.readJson(FRAMEWORKS_PATH);
    const framework = frameworks[product] || {};
    const brief = framework.campaignBrief?.content || '';
    const pillars = (framework.pillars || []).map(p => `- ${p.name}: ${p.description}`).join('\n');

    const systemPrompt = `You are an expert B2B marketing copywriter. Generate marketing content as a JSON object.
Return ONLY valid JSON — no markdown fences, no explanation.

Product: ${framework.name || product}
Portfolio message: ${framework.portfolioMessage || ''}
Tagline: ${framework.tagline || ''}
Pillars:
${pillars}
${brief ? `\nCampaign brief excerpt:\n${brief.slice(0, 800)}` : ''}`;

    const userPrompt = buildContentPrompt(contentType, stage, audience, customPrompt);

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt
    });

    const rawText = message.content[0].text.trim();
    // Strip markdown fences if the model adds them anyway
    const jsonText = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const generatedContent = JSON.parse(jsonText);

    // Persist the new asset directly to campaigns.json
    const assetName = customPrompt || generatedContent.title || generatedContent.subject || `${contentType} — ${stage}`;
    const newAsset = {
      id: `asset-${Date.now()}`,
      name: assetName,
      type: contentType.toUpperCase(),
      stage: (stage || 'AWARENESS').toLowerCase(),
      personas: audience ? [audience] : [],
      status: 'draft',
      content: generatedContent,
      createdAt: new Date().toISOString()
    };

    const campaigns = await fs.readJson(CAMPAIGNS_PATH);
    if (!campaigns[product]) {
      campaigns[product] = { product, assets: [], journeys: [] };
    }
    campaigns[product].assets = campaigns[product].assets || [];
    campaigns[product].assets.push(newAsset);
    campaigns[product].lastUpdated = new Date().toISOString();
    await fs.writeJson(CAMPAIGNS_PATH, campaigns, { spaces: 2 });

    res.json({ success: true, asset: newAsset });
  } catch (error) {
    console.error('Content generation error:', error);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'Model returned invalid JSON. Try again.' });
    }
    res.status(500).json({ error: error.message });
  }
});

function buildContentPrompt(contentType, stage, audience, customPrompt) {
  const context = customPrompt ? `Additional context / title hint: "${customPrompt}"` : '';
  const base = `Create a ${contentType} for the ${stage} stage targeting ${audience}.
${context}
Return a JSON object with relevant fields for this content type. Use these field names:
- Email: { subject, preview_text, body_html (short excerpt), cta_text }
- Blog Post: { title, meta_description, intro, body (3-4 paragraphs), cta }
- LinkedIn Ad: { headline, body, cta_text, image_description }
- Whitepaper: { title, executive_summary, key_sections (array of {title, summary}) }
- Case Study: { title, customer_name, challenge, solution, results (array of strings), quote }
- Webinar: { title, description, agenda (array of strings), speaker_bio }
- Landing Page: { headline, subheadline, value_props (array), cta_text, social_proof }
- Social Post: { platform, copy, hashtags (array), image_description }
- ROI Calculator: { title, description, inputs (array of {label, default_value}), output_metric }
- Demo Script: { title, opening, discovery_questions (array), key_demos (array), close }
- Newsletter: { subject, preview_text, sections (array of {title, body}) }
For any other type: { title, content, cta }`;
  return base;
}

// Submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const feedbackEntry = {
      id: `feedback-${Date.now()}`,
      ...req.body,
      submittedAt: new Date().toISOString()
    };

    // Read existing feedback
    let feedback = [];
    if (await fs.pathExists(FEEDBACK_PATH)) {
      feedback = await fs.readJson(FEEDBACK_PATH);
    }

    // Add new feedback
    feedback.push(feedbackEntry);

    // Save back to file
    await fs.writeJson(FEEDBACK_PATH, feedback, { spaces: 2 });

    res.json({ success: true, id: feedbackEntry.id });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all feedback (for admin/review)
app.get('/api/feedback', async (req, res) => {
  try {
    if (await fs.pathExists(FEEDBACK_PATH)) {
      const feedback = await fs.readJson(FEEDBACK_PATH);
      res.json(feedback);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export feedback as CSV
app.get('/api/feedback/export', async (req, res) => {
  try {
    if (!await fs.pathExists(FEEDBACK_PATH)) {
      return res.status(404).send('No feedback found');
    }

    const feedback = await fs.readJson(FEEDBACK_PATH);

    // Generate CSV
    let csv = 'ID,Type,Priority,Title,Description,Email,Submitted At,User Agent\n';

    feedback.forEach(entry => {
      const row = [
        entry.id || '',
        entry.type || '',
        entry.priority || '',
        `"${(entry.title || '').replace(/"/g, '""')}"`,
        `"${(entry.description || '').replace(/"/g, '""')}"`,
        entry.email || '',
        entry.submittedAt || entry.timestamp || '',
        `"${(entry.userAgent || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    // Send as downloadable CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="campaign-builder-feedback-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Campaign Builder running at http://localhost:${PORT}\n`);
});

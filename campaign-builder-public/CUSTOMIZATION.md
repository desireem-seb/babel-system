# Customization Guide

This guide will help you customize Campaign Builder for your organization.

## 🎨 Branding

### Colors

Edit `public/styles.css` to change the color scheme:

```css
:root {
  /* Primary Brand Color */
  --primary: #4a90e2;           /* Main brand color */
  --primary-hover: #357ABD;     /* Hover state */
  --primary-light: #E3F2FD;     /* Light background */
  --primary-darker: #2E5C8A;    /* Darker variant */

  /* Secondary Colors */
  --secondary: #04844B;         /* Success/secondary actions */
  --accent: #7F56D9;           /* Accent color */
  --accent-light: #F4F2FF;     /* Light accent background */

  /* Status Colors */
  --success: #04844B;          /* Live/success status */
  --warning: #FFB75D;          /* In-progress/warning */
  --error: #EA001E;            /* Error states */
}
```

### Logo

To add your company logo:

1. Add your logo file to `public/` directory (e.g., `logo.png`)
2. Edit `public/index.html`, line ~14:

```html
<div id="homeButton" class="header-brand">
  <img src="logo.png" alt="Your Company" style="height: 32px; width: auto;" />
  <h1>Campaign Builder</h1>
</div>
```

3. Add logo styling in `public/styles.css`:

```css
.header-brand img {
  height: 32px;
  width: auto;
  margin-right: 0.5rem;
}
```

### Typography

To change the font:

1. Add your font (Google Fonts, Adobe Fonts, or self-hosted)
2. Update `public/styles.css`:

```css
body {
  font-family: 'Your Font', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## 📦 Product Configuration

### Adding Products

Edit `data/campaign-frameworks.json`:

```json
{
  "product-id": {
    "name": "Product Display Name",
    "portfolioMessage": "Main headline or value proposition",
    "tagline": "Supporting tagline",
    "pillars": [
      {
        "id": "pillar-1",
        "name": "Pillar Title",
        "description": "What this pillar represents",
        "capabilities": [
          "Key capability 1",
          "Key capability 2",
          "Key capability 3"
        ]
      },
      {
        "id": "pillar-2",
        "name": "Second Pillar",
        "description": "Description",
        "capabilities": ["Capability 1", "Capability 2"]
      },
      {
        "id": "pillar-3",
        "name": "Third Pillar",
        "description": "Description",
        "capabilities": ["Capability 1", "Capability 2"]
      },
      {
        "id": "pillar-4",
        "name": "Fourth Pillar",
        "description": "Description",
        "capabilities": ["Capability 1", "Capability 2"]
      }
    ]
  }
}
```

### Product Selector

Update the product dropdown in `public/index.html`:

```html
<select id="productSelector" class="product-selector">
  <option value="">Select Product...</option>
  <option value="product-1">Product 1</option>
  <option value="product-2">Product 2</option>
  <option value="product-3">Product 3</option>
</select>
```

### Product Cards (Home Screen)

Update the product cards in `public/index.html`:

```html
<div class="product-grid">
  <div class="product-card" data-product="product-1">
    <h3>📦 Product 1</h3>
    <p>Brief description</p>
  </div>
  <div class="product-card" data-product="product-2">
    <h3>🚀 Product 2</h3>
    <p>Brief description</p>
  </div>
</div>
```

## 🎯 Asset Configuration

### Asset Types

Edit asset types in `public/index.html` (~line 450):

```html
<select id="assetType" required>
  <option value="">Select Type...</option>
  <option value="BLOG POST">Blog Post</option>
  <option value="WHITEPAPER">Whitepaper</option>
  <option value="WEBINAR">Webinar</option>
  <option value="VIDEO">Video</option>
  <!-- Add your custom types -->
  <option value="PODCAST">Podcast</option>
  <option value="INFOGRAPHIC">Infographic</option>
</select>
```

### Channels

Customize channels in `public/index.html` (~line 492):

```html
<div class="checkbox-group">
  <label><input type="checkbox" name="channel" value="email"> Email</label>
  <label><input type="checkbox" name="channel" value="social"> Social Media</label>
  <label><input type="checkbox" name="channel" value="paid"> Paid Ads</label>
  <label><input type="checkbox" name="channel" value="organic"> Organic</label>
  <!-- Add your channels -->
</div>
```

### Personas

Customize target personas (~line 524):

```html
<div class="checkbox-group">
  <label><input type="checkbox" name="persona" value="ceo"> CEO</label>
  <label><input type="checkbox" name="persona" value="cmo"> CMO</label>
  <label><input type="checkbox" name="persona" value="vp-sales"> VP Sales</label>
  <!-- Add your personas -->
</div>
```

### Regions

Customize regions (~line 537):

```html
<div class="checkbox-group">
  <label><input type="checkbox" name="region" value="north-america"> North America</label>
  <label><input type="checkbox" name="region" value="europe"> Europe</label>
  <label><input type="checkbox" name="region" value="asia"> Asia</label>
  <!-- Add your regions -->
</div>
```

## 🔄 Campaign Flow Stages

### Default Flow Stages

Flow stages are defined in `public/app.js` (~line 680) in the `openEditFlowModal()` function:

```javascript
const defaultFlowStages = {
  'awareness': { label: 'AWARENESS', subtitle: 'First touchpoint' },
  'consideration': { label: 'CONSIDERATION', subtitle: 'Evaluation' },
  'decision': { label: 'DECISION', subtitle: 'Purchase' },
  // Add or modify stages
  'onboarding': { label: 'ONBOARDING', subtitle: 'Customer activation' },
  'retention': { label: 'RETENTION', subtitle: 'Customer success' }
};
```

Note: These can be edited through the UI, so this just sets the initial defaults.

## 🔐 Environment Configuration

Create a `.env` file for configuration:

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Optional: Database connection (if you add database support)
# DATABASE_URL=your-database-url

# Optional: Analytics
# GOOGLE_ANALYTICS_ID=UA-XXXXX-Y

# Optional: Email notifications (if you add email features)
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-password
```

## 🎨 Advanced Styling

### Funnel Stage Colors

Customize funnel stage colors in `public/styles.css`:

```css
.funnel-stage[data-stage="awareness"] {
  border-left-color: #4a90e2; /* Your color */
}

.funnel-stage[data-stage="familiarity"] {
  border-left-color: #64B5F6; /* Your color */
}

.funnel-stage[data-stage="consideration"] {
  border-left-color: #06A59A; /* Your color */
}

.funnel-stage[data-stage="decision"] {
  border-left-color: #FFB75D; /* Your color */
}
```

### Card Styles

Customize card appearance:

```css
.product-card,
.asset-card {
  border-radius: 12px;        /* Roundness */
  padding: 1.5rem;            /* Spacing */
  box-shadow: var(--shadow-md); /* Depth */
}
```

## 📱 Mobile Responsiveness

The app is responsive by default, but you can customize breakpoints in `public/styles.css`:

```css
/* Tablet */
@media (max-width: 768px) {
  /* Your tablet styles */
}

/* Mobile */
@media (max-width: 480px) {
  /* Your mobile styles */
}
```

## 🔌 Adding Integrations

### Google Analytics

Add to `public/index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### Other Tools

You can integrate:
- **Slack notifications**: Add webhooks in `server.js`
- **CRM sync**: Connect to HubSpot, Salesforce APIs
- **File storage**: Integrate with AWS S3, Google Drive
- **Authentication**: Add user login with Auth0, Firebase

## 🎁 Tips

1. **Test changes locally** before deploying
2. **Keep backups** of your data files
3. **Version control** your customizations
4. **Document changes** for your team
5. **Start simple** - add features gradually

## 🆘 Need Help?

If you get stuck:
1. Check the main README.md
2. Review the code comments
3. Open an issue on GitHub
4. Search for similar customizations

Happy customizing! 🎉

# Screenshot Checklist for Documentation

This guide will help you capture professional screenshots for the Campaign Builder documentation.

## 📸 Before You Start

### 1. Set Up the Demo Environment

```bash
cd /Users/dmotamedi/Documents/personal-projects/campaign-builder-public
npm install
npm start
```

Open http://localhost:4000 in your browser

### 2. Browser Setup

- **Use Chrome or Firefox** for consistent rendering
- **Set browser zoom to 100%** (Cmd/Ctrl + 0)
- **Use a large window** (at least 1400px wide for desktop shots)
- **Clear browser cache** if needed
- **Use incognito/private mode** for clean state

### 3. Screenshot Tool Recommendations

**Mac:**
- Built-in: Cmd + Shift + 4 (drag to select area)
- Or use: CleanShot X, Snagit

**Windows:**
- Built-in: Windows + Shift + S
- Or use: Snagit, Greenshot

## ✅ Required Screenshots

### Screenshot 1: Home Screen - Product Selection
**File name:** `01-home-screen.png`

**Setup:**
1. Open http://localhost:4000
2. Should show all 3 product cards
3. Make sure "Getting Started" box is visible

**What to capture:**
- Full window showing header with "Campaign Builder" title
- All three product cards (CloudFlow, DataIQ, SecurePass)
- Getting Started instructions at bottom

**Tips:**
- Don't select any product yet
- Clean, initial state

---

### Screenshot 2: Campaign Framework View
**File name:** `02-framework-view.png`

**Setup:**
1. Select "CloudFlow Platform" from dropdown
2. Click "Framework" tab (should be default)
3. Wait for content to load

**What to capture:**
- Header showing "CloudFlow Platform" selected
- Portfolio message and tagline at top
- All 4 pillars displayed side-by-side
- Each pillar showing capabilities list

**Tips:**
- Scroll to show all 4 pillars if needed
- Make sure text is crisp and readable

---

### Screenshot 3: Framework Editor Modal
**File name:** `03-framework-editor.png`

**Setup:**
1. Stay on Framework tab
2. Click "✏️ Edit Framework" button
3. Modal should open with form fields

**What to capture:**
- Full modal dialog
- Header section (blue background)
- At least 2 pillar sections visible
- Save/Cancel buttons at bottom

**Tips:**
- Capture the full modal, including the dimmed background
- Show the form structure clearly

---

### Screenshot 4: Asset Repository - Full View
**File name:** `04-asset-repository.png`

**Setup:**
1. Click "📦 Asset Repository" tab
2. Should show assets organized by funnel stages

**What to capture:**
- All 4 funnel stages (Awareness, Familiarity, Consideration, Decision)
- Asset counts at top of each stage
- Several asset cards visible in each stage
- Color-coded stage indicators on left

**Tips:**
- Scroll to show all stages if needed
- Or take a taller screenshot
- Make sure status indicators (✅ 🔴) are visible

---

### Screenshot 5: Asset Detail Modal
**File name:** `05-asset-detail.png`

**Setup:**
1. Stay on Asset Repository tab
2. Click any asset card (try "State of Enterprise Integration 2026 Report")
3. Edit modal opens

**What to capture:**
- Full modal showing asset edit form
- Asset type, name, stage fields at top
- Checkbox groups for channels, personas, regions
- Form structure

**Tips:**
- Show populated fields (this asset already has data)
- Capture enough to show the form structure

---

### Screenshot 6: Campaign Flow View
**File name:** `06-campaign-flow.png`

**Setup:**
1. Click "Campaign Flow" tab
2. Flow visualization should render with assets in stages

**What to capture:**
- Multiple flow stages with assets
- Asset cards showing type and name
- Edit button (✏️) visible on asset cards
- Flow from left to right (Awareness → Decision)

**Tips:**
- Try to capture several stages in one shot
- Show the flow progression
- Include the "Edit Campaign Flow" button at top

---

### Screenshot 7: Campaign Flow Editor
**File name:** `07-flow-editor.png`

**Setup:**
1. Stay on Campaign Flow tab
2. Click "✏️ Edit Campaign Flow" button
3. Modal opens with flow stages

**What to capture:**
- Modal showing editable flow stages
- Grid layout of stage cards
- Stage labels and subtitles
- Save/Cancel buttons

**Tips:**
- Show at least 4-6 stage cards
- Clear view of the form structure

---

### Screenshot 8: Feedback Form (Optional but Nice)
**File name:** `08-feedback-form.png`

**Setup:**
1. Click "💬 Feedback" button in header
2. Modal opens with feedback form

**What to capture:**
- Feedback form with type, priority fields
- Title and description fields
- Email field (optional)

---

## 📐 Screenshot Specifications

### Dimensions
- **Desktop:** 1400px+ width recommended
- **File format:** PNG (best quality)
- **Resolution:** 72-144 DPI

### Editing (Optional)
After taking screenshots, you can:
- **Add subtle borders:** 1px gray border for clarity
- **Add drop shadows:** Subtle shadow for depth
- **Crop excess:** Remove unnecessary browser chrome
- **Don't:** Over-edit, change colors, or modify content

### Tools for Editing
- **Preview** (Mac) - basic cropping/annotation
- **Photoshop/Figma** - professional editing
- **Online:** Canva, Photopea

## 📂 Saving Your Screenshots

1. Save all screenshots to: `/Users/dmotamedi/Documents/personal-projects/campaign-builder-public/docs/images/`

2. Use the file names specified above

3. Check file sizes:
   - Each PNG should be under 500KB
   - If larger, consider:
     - Reducing window size slightly
     - Using PNG compression tools (ImageOptim, TinyPNG)

## ✨ Pro Tips

### Consistency
- Take all screenshots in **one session** for consistent look
- Use the **same browser window size**
- Keep **same zoom level** (100%)

### Quality
- Use **high-resolution display** if possible (Retina)
- Make sure **fonts are crisp**
- Check for **no typos** in visible text
- Ensure **no personal info** visible (if any test data)

### What to Avoid
- ❌ Cursor in the screenshot
- ❌ Browser notifications/popups
- ❌ Dev tools open
- ❌ Low resolution/blurry images
- ❌ Dark mode (unless that's your default)

## 🎯 After Taking Screenshots

1. **Review each image**
   - Is it clear and readable?
   - Does it show what you intended?
   - Is it at 100% zoom level?

2. **Test in README**
   - Preview the README to see how images look
   - Check they're not too large/small
   - Verify paths are correct

3. **Optimize file sizes**
   - Use ImageOptim (Mac) or similar
   - Aim for under 300KB per image
   - Don't sacrifice too much quality

## 📝 Next Steps After Screenshots

Once you have all screenshots:

1. I'll help you update README.md with the images
2. We'll add captions and descriptions
3. Create a visual walkthrough section
4. Commit and push to GitHub

---

**Questions while taking screenshots?** Feel free to ask! These are guidelines, not strict rules. The goal is clear, helpful documentation. 📸

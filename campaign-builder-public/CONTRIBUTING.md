# Contributing to Campaign Builder

First off, thank you for considering contributing to Campaign Builder! 🎉

It's people like you that make Campaign Builder a great tool for marketers everywhere. We welcome contributions from everyone, whether you're fixing a typo, reporting a bug, or building a new feature.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by basic principles of respect and professionalism. We are committed to providing a welcoming and inclusive experience for everyone.

**In short:**
- Be respectful and considerate
- Be collaborative
- Be patient with beginners
- Focus on what's best for the community

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the [existing issues](https://github.com/desireem-seb/babel-system/issues) to see if the problem has already been reported.

**When reporting a bug, include:**

- **Clear title and description** - What did you expect vs. what actually happened?
- **Steps to reproduce** - Be as detailed as possible
- **Environment details** - Node version, OS, browser
- **Screenshots** - If applicable, add screenshots to help explain the problem
- **Error messages** - Copy/paste any error messages from the console

**Example:**

```markdown
**Bug:** Asset Repository doesn't load on Safari

**Steps to Reproduce:**
1. Open Campaign Builder in Safari 17.0
2. Select "CloudFlow Platform"
3. Click "Asset Repository" tab
4. Nothing loads, console shows error: "Cannot read property..."

**Expected:** Assets should display organized by funnel stage
**Actual:** Blank screen with console error

**Environment:**
- Browser: Safari 17.0
- OS: macOS 14.2
- Node: v20.10.0
```

### Suggesting Features

We love feature suggestions! Before creating a feature request, please check [existing issues](https://github.com/desireem-seb/babel-system/issues) to see if someone else has already suggested it.

**When suggesting a feature, include:**

- **Use case** - Why do you need this feature? What problem does it solve?
- **Proposed solution** - How would you like it to work?
- **Alternatives considered** - What other solutions did you think about?
- **Mockups/examples** - If applicable, sketches or examples from other tools

**Example:**

```markdown
**Feature:** Export campaign to PDF

**Use Case:** As a marketing manager, I want to export my campaign framework to PDF so I can share it with stakeholders who don't have access to the tool.

**Proposed Solution:** Add an "Export to PDF" button on the Framework tab that generates a nicely formatted PDF with the portfolio message, tagline, and all 4 pillars.

**Alternatives:** Could also export to PowerPoint or Google Slides format.
```

### Your First Code Contribution

Unsure where to start? Look for issues labeled:
- `good first issue` - Simple issues perfect for beginners
- `help wanted` - Issues where we'd love community help
- `documentation` - Improvements to docs, always welcome!

**Never contributed to open source before?** Here are some friendly tutorials:
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [First Timers Only](https://www.firsttimersonly.com/)

### Pull Requests

**Before submitting a pull request:**

1. **Check existing PRs** - Someone might already be working on it
2. **Create an issue first** - For big changes, discuss the approach before coding
3. **Test your changes** - Make sure everything works
4. **Update documentation** - If you change functionality, update the README

**Pull Request Process:**

1. **Fork the repo** and create your branch from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clear, commented code
   - Follow the existing code style
   - Test thoroughly

3. **Commit with clear messages**
   ```bash
   git commit -m "Add export to PDF feature
   
   - Add PDF generation library
   - Create export button on framework tab
   - Generate formatted PDF with all framework data
   - Add tests for PDF generation"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Use a clear title: "Add export to PDF feature"
   - Describe what you changed and why
   - Reference any related issues: "Closes #123"
   - Add screenshots for UI changes

**What happens next?**

- A maintainer will review your PR
- They may request changes or ask questions
- Once approved, your PR will be merged! 🎉
- Your contribution will be credited

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Local Setup

```bash
# Fork and clone the repo
git clone https://github.com/YOUR-USERNAME/babel-system.git
cd babel-system/campaign-builder-public

# Install dependencies
npm install

# Start the dev server
npm start

# Open http://localhost:4000
```

### Project Structure

```
campaign-builder-public/
├── server.js              # Express server (backend)
├── public/
│   ├── index.html        # Main UI structure
│   ├── app.js            # Frontend JavaScript
│   ├── styles.css        # Styling
│   ├── journey-map.js    # Journey mapping logic
│   └── feedback-admin.html
├── data/
│   ├── campaign-frameworks.json  # Product frameworks
│   └── campaigns.json            # Campaign data
└── docs/
    ├── FAQ.md
    ├── CUSTOMIZATION.md
    └── images/
```

### Testing Your Changes

**Manual Testing Checklist:**

- [ ] App starts without errors
- [ ] All tabs load correctly (Framework, Asset Repository, Campaign Flow)
- [ ] Can create/edit/delete assets
- [ ] Framework editor works
- [ ] Campaign flow editor works
- [ ] Feedback form submits successfully
- [ ] No console errors
- [ ] Works in Chrome, Firefox, Safari

**Test with different products:**
- Try CloudFlow Platform (has full data)
- Try DataIQ Analytics (minimal data)
- Try creating a new product

### Making Changes

**Adding a new feature:**

1. Add backend logic to `server.js` if needed
2. Add frontend logic to `public/app.js`
3. Update UI in `public/index.html`
4. Style it in `public/styles.css`
5. Update documentation in `README.md`

**Fixing a bug:**

1. Reproduce the bug locally
2. Identify the root cause
3. Fix it
4. Test that it's actually fixed
5. Make sure you didn't break anything else

## Style Guidelines

### Code Style

**JavaScript:**
- Use ES6+ features (const/let, arrow functions, async/await)
- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

**Example:**
```javascript
// Good
async function loadCampaignFramework(productId) {
  try {
    const response = await fetch(`/api/frameworks/${productId}`);
    const framework = await response.json();
    return framework;
  } catch (error) {
    console.error('Failed to load framework:', error);
    throw error;
  }
}

// Avoid
async function load(p) {
  let r = await fetch('/api/frameworks/' + p);
  return await r.json();
}
```

**HTML:**
- Use semantic HTML (header, main, section, article)
- Add ARIA labels for accessibility
- Keep structure clean and indented

**CSS:**
- Use CSS variables for colors and spacing
- Follow BEM naming for new components
- Mobile-first responsive design
- Comment sections clearly

### Commit Messages

Write clear, descriptive commit messages:

**Good:**
```
Add export to PDF feature

- Integrate jsPDF library
- Add export button to framework tab
- Generate formatted PDF with logo and branding
- Include all framework data in export
```

**Avoid:**
```
fix stuff
update
changes
```

**Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Documentation

**When adding a feature:**
- Update README.md with usage instructions
- Add to CUSTOMIZATION.md if it's customizable
- Update FAQ.md if users might have questions
- Add screenshots if it's a UI feature

**When fixing a bug:**
- Comment the fix in the code
- Update docs if the bug was due to unclear instructions

## Community

### Get Help

- **GitHub Issues** - Ask questions, report bugs, suggest features
- **Discussions** - General questions, ideas, show-and-tell

### Recognition

All contributors will be:
- Listed in the project's contributors
- Credited in release notes for their contributions
- Celebrated in the community!

### Maintainers

Current maintainers:
- [@desireem-seb](https://github.com/desireem-seb) - Creator and lead maintainer

We review PRs regularly and aim to respond within a few days. Please be patient!

## Questions?

Don't hesitate to ask! There are no silly questions. We're here to help.

- Open an issue with your question
- Tag it with `question` label
- We'll do our best to help quickly

---

## Thank You! 🙏

Your contributions make Campaign Builder better for everyone. Whether you're fixing a typo or building a major feature, every contribution matters.

Happy coding! 🚀

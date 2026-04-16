# Frequently Asked Questions

## General

### What is Campaign Builder?
Campaign Builder is an open-source tool for marketing teams to create structured campaign frameworks, manage asset repositories, and visualize buyer journeys. Think of it as a campaign planning workbench.

### Is it really free?
Yes! Campaign Builder is released under the MIT License, which means you can use it for personal or commercial projects at no cost. You can even modify and redistribute it.

### Can I use this for commercial projects?
Absolutely! The MIT License allows commercial use. Use it for your company, your clients, or your side projects.

### Do I need to credit you?
Not required, but always appreciated! If you find it useful, a mention or link back to the repo helps others discover it.

## Technical

### What technology does it use?
- **Backend:** Node.js with Express
- **Frontend:** Vanilla JavaScript (no framework)
- **Data Storage:** Local JSON files
- **Styling:** Custom CSS

### Does it require a database?
No! Campaign Builder stores everything in JSON files in the `data/` directory. This makes it simple to deploy and easy to back up. For larger teams, you could add database support.

### Can I deploy this to production?
Yes! It's designed to be deployment-ready. You can host it on:
- Heroku (easiest - one-click deploy)
- Vercel
- AWS/GCP/Azure
- Your own server

See the README for deployment instructions.

### What are the system requirements?
- Node.js 18 or higher
- npm or yarn
- Any modern web browser

### How do I update to the latest version?
```bash
git pull origin main
npm install
npm start
```

## Customization

### How do I add my own products?
Edit `data/campaign-frameworks.json` and add your product with its framework, pillars, and capabilities. See `CUSTOMIZATION.md` for detailed instructions.

### Can I change the colors/branding?
Yes! Edit `public/styles.css` and change the CSS variables at the top. You can customize:
- Primary/secondary colors
- Fonts
- Spacing
- Shadows

See `CUSTOMIZATION.md` for the full guide.

### How do I add a logo?
1. Add your logo file to the `public/` directory
2. Edit `public/index.html` to reference your logo
3. Adjust styling in `public/styles.css`

Full instructions in `CUSTOMIZATION.md`.

### Can I add custom asset types?
Yes! Edit `public/index.html` around line 448 to add more asset types to the dropdown. Examples: Podcast, Infographic, Social Post, etc.

### How do I change the funnel stages?
The default stages are Awareness, Familiarity, Consideration, and Decision. To change these, edit `public/index.html` around line 472.

### Can I customize the campaign flow stages?
Yes! The flow stages (buyer journey touchpoints) can be edited through the UI or by modifying the defaults in `public/app.js` in the `openEditFlowModal()` function.

## Data & Security

### Where is my data stored?
All data is stored locally in the `data/` directory as JSON files:
- `campaign-frameworks.json` - Product frameworks
- `campaigns.json` - Campaign assets and data
- `feedback.json` - User feedback

### Is my data secure?
The app runs entirely on your server/local machine. There are no external API calls or data transmissions. Your data stays with you.

### How do I back up my data?
Simply copy the `data/` directory to a safe location. Or use version control (git) to track changes.

### Can multiple people use this at once?
The default setup is single-user. For team collaboration, you'd want to:
1. Add authentication
2. Use a proper database instead of JSON files
3. Add real-time sync

These are all possible but not included out-of-the-box.

### Can I export my data?
Your data is already in JSON format, which is easy to export. You can also:
- Copy JSON files directly
- Add export functionality (e.g., to CSV, PDF)
- Use the feedback export feature (already built-in)

## Features

### Does it integrate with other tools?
Not out-of-the-box, but you can add integrations:
- CRM (HubSpot, Salesforce)
- Project management (Asana, Jira)
- Analytics (Google Analytics)
- Storage (AWS S3, Google Drive)

The code is open and extensible.

### Can I generate content with AI?
The Salesforce internal version has AI content generation, but it's removed from the public version to keep dependencies simple. You could add this by integrating with:
- OpenAI API
- Anthropic Claude API
- Other LLM APIs

### Does it have analytics?
Not built-in, but you can add:
- Google Analytics for page tracking
- Custom analytics for campaign performance
- Integration with your existing analytics tools

### Can I schedule content?
Not currently. The calendar tab shows scheduled dates but doesn't automatically publish. You could add this feature or integrate with scheduling tools.

## Troubleshooting

### The server won't start
1. Check that Node.js 18+ is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if port 4000 is already in use: `lsof -ti:4000`
4. Try a different port: `PORT=3000 npm start`

### I see "Cannot find module" errors
Run `npm install` to install dependencies.

### Changes to JSON files aren't showing up
1. Stop the server (Ctrl+C)
2. Clear browser cache
3. Restart: `npm start`
4. Hard refresh browser: Cmd/Ctrl + Shift + R

### The UI looks broken
1. Hard refresh: Cmd/Ctrl + Shift + R
2. Check browser console for errors
3. Make sure CSS file loaded properly
4. Try a different browser

### My data disappeared
Check `data/` directory - JSON files should be there. If using git, check if files were gitignored accidentally.

## Contributing

### Can I contribute to this project?
Yes! Contributions are welcome. Open an issue or submit a pull request on GitHub.

### I found a bug. What should I do?
Open an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

### I have a feature idea
Great! Open an issue on GitHub labeled "feature request" and describe what you'd like to see.

### How do I submit code changes?
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description

## Use Cases

### What types of companies is this for?
- B2B SaaS companies
- Marketing agencies
- Product marketing teams
- Startups planning GTM
- Anyone doing campaign planning

### Can I use this for B2C campaigns?
Absolutely! While designed with B2B in mind, the framework works for B2C campaigns too. Just customize the personas, stages, and asset types to fit your needs.

### Is this only for digital campaigns?
No! While it's digital by nature (web app), you can plan multi-channel campaigns including offline activities. Just add custom asset types for print, events, direct mail, etc.

## Getting Help

### Where can I get help?
1. Check this FAQ
2. Read the README.md
3. Check CUSTOMIZATION.md
4. Open an issue on GitHub
5. Search existing GitHub issues

### Is there a community?
The GitHub repository is the main hub. Open issues for questions, discussions, or feature requests.

### Do you offer support?
This is an open-source project maintained as a side project. Community support via GitHub is the primary channel. For commercial support or custom development, you may want to hire a developer.

---

## Still have questions?

Open an issue on GitHub: https://github.com/desireem-seb/babel-system/issues

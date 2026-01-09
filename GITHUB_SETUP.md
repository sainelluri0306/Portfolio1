# GitHub Setup Guide

Follow these steps to connect your website to GitHub and publish it online.

## Step 1: Configure Git (First Time Only)

If you haven't configured Git before, run these commands with your information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Note:** Use the same email address associated with your GitHub account.

## Step 2: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in (or create an account)
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., "my-website")
5. Choose "Public" (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 3: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename your branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**If you haven't committed yet**, first run:
```bash
git add .
git commit -m "Initial commit: Modern website with HTML, CSS, and JavaScript"
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" (top menu)
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your website will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

**Note:** It may take a few minutes for your site to be available.

## Step 5: Making Updates

Whenever you make changes to your website:

```bash
git add .
git commit -m "Description of your changes"
git push
```

Your GitHub Pages site will automatically update within a few minutes.

## Troubleshooting

### Authentication Issues
If you get authentication errors when pushing:
- Use a Personal Access Token instead of password
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate a new token with `repo` permissions
- Use the token as your password when pushing

### Branch Name
If your default branch is `master` instead of `main`:
```bash
git branch -M main
```

## Need Help?

- [GitHub Docs](https://docs.github.com)
- [GitHub Pages Guide](https://pages.github.com)

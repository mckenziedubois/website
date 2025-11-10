# Partials System

This directory contains reusable HTML partials that are loaded dynamically to reduce code duplication across pages.

## Available Partials

- **nav.html** - Navigation bar (already in use)
- **footer.html** - Footer with copyright
- **masthead.html** - Page header/masthead with title
- **scripts.html** - Common JavaScript files (Bootstrap, theme scripts)

## How to Use

### Basic Setup

1. Add placeholder divs in your HTML:
```html
<!-- Navbar -->
<div id="navbar-placeholder"></div>

<!-- Masthead -->
<div id="masthead-placeholder"></div>

<!-- Footer -->
<div id="footer-placeholder"></div>

<!-- Common Scripts -->
<div id="scripts-placeholder"></div>
```

2. Load the partials loader script:
```html
<script src="../js/load-partials.js"></script>
```

3. Initialize the page:
```html
<script>
  initPage({
    pageTitle: 'Your Page Title',
    rootPrefix: '../',  // '../' for pages/, '' for root
    currentPage: 'yourpage.html'
  });
</script>
```

### Example: Complete Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>McKenzie DuBois</title>
  <link href="../css/styles.css" rel="stylesheet" />
  <link href="../css/custom.css" rel="stylesheet" />
  <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossorigin="anonymous"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
</head>
<body>
  <!-- Navbar -->
  <div id="navbar-placeholder"></div>

  <!-- Masthead -->
  <div id="masthead-placeholder"></div>

  <!-- Your page content here -->
  <main>
    <!-- ... -->
  </main>

  <!-- Footer -->
  <div id="footer-placeholder"></div>

  <!-- Common Scripts -->
  <div id="scripts-placeholder"></div>

  <!-- Load partials -->
  <script src="../js/load-partials.js"></script>
  <script>
    initPage({
      pageTitle: 'Page Title',
      rootPrefix: '../',
      currentPage: 'pagename.html'
    });
  </script>
</body>
</html>
```

## Configuration Options

The `initPage()` function accepts these options:

- `pageTitle` (string) - Title to display in the masthead
- `rootPrefix` (string) - Path prefix ('../' for pages/, '' for root)
- `currentPage` (string) - Current page filename for nav highlighting
- `loadNavbar` (boolean) - Load navbar (default: true)
- `loadMasthead` (boolean) - Load masthead (default: true)
- `loadFooter` (boolean) - Load footer (default: true)
- `loadScripts` (boolean) - Load common scripts (default: true)

## Benefits

- **DRY (Don't Repeat Yourself)**: Common elements are defined once
- **Easy Updates**: Change footer/nav once, updates everywhere
- **Consistency**: Ensures all pages use the same structure
- **Maintainability**: Less code to maintain


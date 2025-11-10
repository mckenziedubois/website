/**
 * Utility to load HTML partials and replace placeholders
 * Usage: loadPartial('navbar-placeholder', 'partials/nav.html', {ROOT: '../'})
 */
async function loadPartial(placeholderId, partialPath, replacements = {}) {
  try {
    const response = await fetch(partialPath);
    if (!response.ok) throw new Error(`Failed to load ${partialPath}`);
    
    let html = await response.text();
    
    // Replace placeholders
    Object.keys(replacements).forEach(key => {
      html = html.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
    });
    
    const element = document.getElementById(placeholderId);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading partial ${partialPath}:`, error);
  }
}

/**
 * Initialize common page elements
 * @param {Object} config - Configuration object
 * @param {string} config.pageTitle - Title for the page heading
 * @param {string} config.rootPrefix - Root path prefix ('' for root, '../' for pages/)
 * @param {string} config.currentPage - Current page filename for nav highlighting
 */
async function initPage(config = {}) {
  const {
    pageTitle = '',
    rootPrefix = '',
    currentPage = '',
    loadNavbar = true,
    loadMasthead = true,
    loadFooter = true,
    loadScripts = true
  } = config;

  // Determine root prefix if not provided
  const pathParts = window.location.pathname.split('/');
  const autoRootPrefix = rootPrefix || (pathParts.includes('pages') ? '../' : '');
  const autoCurrentPage = currentPage || pathParts.pop() || 'index.html';

  // Load navbar
  if (loadNavbar) {
    await loadPartial('navbar-placeholder', `${autoRootPrefix}partials/nav.html`, {
      ROOT: autoRootPrefix
    });

    // Highlight current link
    document.querySelectorAll('#navbar-placeholder .nav-link').forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop();
      if (linkPage === autoCurrentPage) {
        link.classList.add('active');
      }
    });
  }

  // Load masthead with title
  if (loadMasthead && pageTitle) {
    await loadPartial('masthead-placeholder', `${autoRootPrefix}partials/masthead.html`, {
      ROOT: autoRootPrefix,
      TITLE: pageTitle
    });
  }

  // Load footer
  if (loadFooter) {
    await loadPartial('footer-placeholder', `${autoRootPrefix}partials/footer.html`, {
      ROOT: autoRootPrefix
    });
  }

  // Load common scripts
  if (loadScripts) {
    await loadPartial('scripts-placeholder', `${autoRootPrefix}partials/scripts.html`, {
      ROOT: autoRootPrefix
    });
  }
}


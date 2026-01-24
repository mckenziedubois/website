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

      const scripts = Array.from(element.querySelectorAll('script'));
      const loadPromises = scripts.map(s => {
        return new Promise((resolve) => {
          const newScript = document.createElement('script');
          if (s.src) {
            newScript.src = s.src;
            newScript.async = false;
            newScript.onload = () => resolve();
            newScript.onerror = () => {
              console.error('Failed to load script', s.src);
              resolve();
            };
            document.body.appendChild(newScript);
          } else {
            newScript.text = s.innerHTML;
            document.body.appendChild(newScript);
            resolve();
          }
        });
      });

      // Remove original script tags from the partial node to avoid duplicate execution
      scripts.forEach(s => s.parentNode && s.parentNode.removeChild(s));

      // Wait for all external scripts to load before returning
      await Promise.all(loadPromises);
    }
  } catch (error) {
    console.error(`Error loading partial ${partialPath}:`, error);
  }
}

let __mastheadNavHeightTimer = null;
function updateMastheadNavHeight() {
  try {
    const nav = document.querySelector('#mainNav.masthead-nav') || document.querySelector('#masthead-nav-placeholder #mainNav') || document.querySelector('#mainNav');
    if (!nav) return;
    const rect = nav.getBoundingClientRect();
    const height = Math.ceil(rect.height) || 0;
    document.documentElement.style.setProperty('--masthead-nav-height', `${height}px`);
  } catch (e) {
  }
}

function scheduleUpdateMastheadNavHeight(delay = 100) {
  if (__mastheadNavHeightTimer) clearTimeout(__mastheadNavHeightTimer);
  __mastheadNavHeightTimer = setTimeout(updateMastheadNavHeight, delay);
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
  // Move or load nav into masthead
try {
    const mastheadNavSlot = document.getElementById('masthead-nav-placeholder');
    const navbarSlot = document.getElementById('navbar-placeholder');
    if (mastheadNavSlot) {
      if (navbarSlot && navbarSlot.firstElementChild) {
        const navNode = navbarSlot.firstElementChild;
        mastheadNavSlot.appendChild(navNode);
        const movedNav = mastheadNavSlot.querySelector('#mainNav');
        if (movedNav) movedNav.classList.add('masthead-nav');
        navbarSlot.innerHTML = '';
        scheduleUpdateMastheadNavHeight();
        const collapseEl = mastheadNavSlot.querySelector('.navbar-collapse');
        if (collapseEl && typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
          collapseEl.addEventListener('shown.bs.collapse', () => scheduleUpdateMastheadNavHeight(60));
          collapseEl.addEventListener('hidden.bs.collapse', () => scheduleUpdateMastheadNavHeight(60));
        }
      } else {
        await loadPartial('masthead-nav-placeholder', `${autoRootPrefix}partials/nav.html`, {
          ROOT: autoRootPrefix
        });
        const loadedNav = mastheadNavSlot.querySelector('#mainNav');
        if (loadedNav) loadedNav.classList.add('masthead-nav');
        scheduleUpdateMastheadNavHeight();
        const collapseEl = mastheadNavSlot.querySelector('.navbar-collapse');
        if (collapseEl) {
          collapseEl.addEventListener('shown.bs.collapse', () => scheduleUpdateMastheadNavHeight(60));
          collapseEl.addEventListener('hidden.bs.collapse', () => scheduleUpdateMastheadNavHeight(60));
        }
      }
    }
  } catch (e) {
    console.warn('Could not move or load nav into masthead:', e);
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


import { initializeWindowControls } from './window-controls.js';

document.addEventListener('DOMContentLoaded', function () {
  //
  // Window Dragging and Resizing Functionality (Desktop Only)
  //
  if (window.innerWidth >= 768) {
    const window = document.querySelector('.window');
    const titleBar = window.querySelector('.title-bar');
    const content = document.querySelector('.content');
    
    initializeWindowControls(window, titleBar, content);
  }

  //
  // Tab Selection & URL Management
  //
  const tabs = document.querySelectorAll('menu[role=tablist]');
  const path = window.location.pathname;
  const initialTabId = path === '/' ? 'index' : path.slice(1);

  // Initialize tabs based on URL
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const tabButtons = tab.querySelectorAll('menu[role=tablist] > button');

    tabButtons.forEach((button) => {
      if (button.getAttribute('aria-controls') === initialTabId) {
        button.setAttribute('aria-selected', true);
        openTab({ target: button }, tab);
      } else {
        button.setAttribute('aria-selected', false);
      }
    });

    // Add click handlers for tab switching
    tabButtons.forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        tabButtons.forEach((button) => {
          if (button.getAttribute('aria-controls') === e.target.getAttribute('aria-controls')) {
            button.setAttribute('aria-selected', true);
            openTab(e, tab);

            const tabId = e.target.getAttribute('aria-controls');
            const newPath = tabId === 'index' ? '/' : `/${tabId}`;
            window.history.pushState({}, '', newPath);
          } else {
            button.setAttribute('aria-selected', false);
          }
        });
      }),
    );
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function () {
    const currentPath = window.location.pathname;
    const tabId = currentPath === '/' ? 'index' : currentPath.slice(1);

    const tabButton = document.querySelector(`button[aria-controls="${tabId}"]`);
    if (tabButton) {
      tabButton.click();
    }
  });

  //
  // CV Download Handler
  //
  document.getElementById('download').addEventListener('click', function () {
    const link = document.createElement('a');
    link.href = 'assets/cv-kevin-kliimask.pdf';
    link.download = 'cv-kevin-kliimask.pdf';
    link.click();
  });
});

//
// Tab Panel Visibility Helper
//
function openTab(event, tab) {
  const articles = tab.parentNode.querySelectorAll('[role="tabpanel"]');
  articles.forEach((p) => {
    p.setAttribute('hidden', true);
  });
  const article = tab.parentNode.querySelector(`[role="tabpanel"]#${event.target.getAttribute('aria-controls')}`);
  article.removeAttribute('hidden');
}

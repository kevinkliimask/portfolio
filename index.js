document.addEventListener('DOMContentLoaded', function () {
  //
  // Window Dragging and Resizing Functionality (Desktop Only)
  //
  if (window.innerWidth >= 768) {
    const window = document.querySelector('.window');
    const titleBar = window.querySelector('.title-bar');
    const content = document.querySelector('.content');
    const resizeHandles = window.querySelectorAll('.resize-handle');

    let isDragging = false;
    let isResizing = false;
    let resizeDirection = null;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let initialWidth;
    let initialHeight;

    // Center window initially
    const contentRect = content.getBoundingClientRect();
    xOffset = (contentRect.width - window.offsetWidth) / 2;
    yOffset = (contentRect.height - window.offsetHeight) / 2;

    window.style.position = 'absolute';
    window.style.left = 0;
    window.style.top = 0;
    window.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

    // Add drag event listeners
    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Add resize event listeners
    resizeHandles.forEach((handle) => {
      handle.addEventListener('mousedown', (e) => resizeStart(e, handle));
    });
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', resizeEnd);

    function resizeStart(e, handle) {
      isResizing = true;
      resizeDirection = handle.classList[1]; // 'top', 'right', 'bottom', or 'left'
      window.classList.add('resizing');

      initialX = e.clientX;
      initialY = e.clientY;
      initialWidth = window.offsetWidth;
      initialHeight = window.offsetHeight;

      e.preventDefault();
    }

    function resize(e) {
      if (!isResizing) return;

      const contentRect = content.getBoundingClientRect();
      const windowRect = window.getBoundingClientRect();
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = xOffset;
      let newY = yOffset;

      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      switch (resizeDirection) {
        case 'left': {
          const proposedWidth = initialWidth - deltaX;
          // First check if we would exceed minimum width
          if (proposedWidth < 300) {
            newWidth = 300;
            newX = windowRect.right - 300 - contentRect.left;
          } else {
            const proposedX = windowRect.right - proposedWidth - contentRect.left;
            // Check if we would hit the left boundary
            if (proposedX < 0) {
              newWidth = windowRect.right - contentRect.left;
              newX = 0;
            } else {
              newWidth = proposedWidth;
              newX = proposedX;
            }
          }
          break;
        }
        case 'right': {
          newWidth = Math.max(300, initialWidth + deltaX);
          // Check right boundary
          if (windowRect.left + newWidth > contentRect.right) {
            newWidth = contentRect.right - windowRect.left;
          }
          break;
        }
        case 'top': {
          const proposedHeight = initialHeight - deltaY;
          // First check if we would exceed minimum height
          if (proposedHeight < 200) {
            newHeight = 200;
            newY = windowRect.bottom - 200 - contentRect.top;
          } else {
            const proposedY = windowRect.bottom - proposedHeight - contentRect.top;
            // Check if we would hit the top boundary
            if (proposedY < 0) {
              newHeight = windowRect.bottom - contentRect.top;
              newY = 0;
            } else {
              newHeight = proposedHeight;
              newY = proposedY;
            }
          }
          break;
        }
        case 'bottom': {
          newHeight = Math.max(200, initialHeight + deltaY);
          // Check bottom boundary
          if (windowRect.top + newHeight > contentRect.bottom) {
            newHeight = contentRect.bottom - windowRect.top;
          }
          break;
        }
      }

      // Apply new dimensions and position
      window.style.width = `${newWidth}px`;
      window.style.height = `${newHeight}px`;
      window.style.transform = `translate(${newX}px, ${newY}px)`;

      // Update offsets
      xOffset = newX;
      yOffset = newY;
    }

    function resizeEnd() {
      isResizing = false;
      resizeDirection = null;
      window.classList.remove('resizing');
    }

    function dragStart(e) {
      if (e.target === titleBar || e.target.closest('.title-bar')) {
        isDragging = true;
        window.classList.add('dragging');

        const windowRect = window.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();

        // Calculate the current position relative to the content
        xOffset = windowRect.left - contentRect.left;
        yOffset = windowRect.top - contentRect.top;

        // Calculate initial mouse position relative to the window
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();

        const contentRect = content.getBoundingClientRect();
        const windowRect = window.getBoundingClientRect();

        // Calculate new position relative to content
        let newX = e.clientX - initialX;
        let newY = e.clientY - initialY;

        // Calculate bounds
        const minX = 0;
        const maxX = contentRect.width - windowRect.width;
        const minY = 0;
        const maxY = contentRect.height - windowRect.height;

        // Constrain the position
        xOffset = Math.min(Math.max(newX, minX), maxX);
        yOffset = Math.min(Math.max(newY, minY), maxY);

        window.style.left = 0;
        window.style.top = 0;
        window.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      }
    }

    function dragEnd() {
      isDragging = false;
      window.classList.remove('dragging');
    }
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
    link.href = 'cv-kevin-kliimask.pdf';
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

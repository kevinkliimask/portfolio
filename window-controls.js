function initializeWindowControls(window, titleBar, content) {
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
  const resizeHandles = window.querySelectorAll('.resize-handle');
  resizeHandles.forEach((handle) => {
    handle.addEventListener('mousedown', (e) => resizeStart(e, handle));
  });
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', resizeEnd);

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

    const handleWidth = (isLeft) => {
      const delta = isLeft ? -deltaX : deltaX;
      const proposedWidth = initialWidth + delta;

      if (proposedWidth < 300) {
        newWidth = 300;
        if (isLeft) newX = windowRect.right - 300 - contentRect.left;
      } else {
        if (isLeft) {
          const proposedX = windowRect.right - proposedWidth - contentRect.left;
          if (proposedX < 0) {
            newWidth = windowRect.right - contentRect.left;
            newX = 0;
          } else {
            newWidth = proposedWidth;
            newX = proposedX;
          }
        } else {
          newWidth = proposedWidth;
          if (windowRect.left + newWidth > contentRect.right) {
            newWidth = contentRect.right - windowRect.left;
          }
        }
      }
    };

    const handleHeight = (isTop) => {
      const delta = isTop ? -deltaY : deltaY;
      const proposedHeight = initialHeight + delta;

      if (proposedHeight < 200) {
        newHeight = 200;
        if (isTop) newY = windowRect.bottom - 200 - contentRect.top;
      } else {
        if (isTop) {
          const proposedY = windowRect.bottom - proposedHeight - contentRect.top;
          if (proposedY < 0) {
            newHeight = windowRect.bottom - contentRect.top;
            newY = 0;
          } else {
            newHeight = proposedHeight;
            newY = proposedY;
          }
        } else {
          newHeight = proposedHeight;
          if (windowRect.top + newHeight > contentRect.bottom) {
            newHeight = contentRect.bottom - windowRect.top;
          }
        }
      }
    };

    // Handle resize based on direction
    if (resizeDirection.includes('left')) handleWidth(true);
    if (resizeDirection.includes('right')) handleWidth(false);
    if (resizeDirection.includes('top')) handleHeight(true);
    if (resizeDirection.includes('bottom')) handleHeight(false);

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
}

// Export the initialization function
export { initializeWindowControls }; 
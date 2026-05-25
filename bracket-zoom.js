// Interactive Zoom & Pan for World Cup Bracket (Mobile Frame only)
document.addEventListener('DOMContentLoaded', () => {
  initBracketZoomPan();
});

function initBracketZoomPan() {
  const wrapper = document.getElementById('bracket-scroll-container');
  const container = document.getElementById('bracket-container');
  if (!wrapper || !container) return;

  const isMobile = () => window.innerWidth < 992;

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;
  
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Pinch-to-zoom coordinates
  let startDistance = 0;
  let startScale = 1.0;
  const midPoint = { x: 0, y: 0 };

  const activePointers = {};

  // Create Zoom control panel dynamically
  const controls = document.createElement('div');
  controls.className = 'bracket-zoom-controls';
  
  const btnIn = document.createElement('button');
  btnIn.innerHTML = '＋';
  btnIn.title = 'Acercar';
  btnIn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isMobile()) return;
    container.style.transition = 'transform 0.15s ease-out';
    scale = Math.min(2.0, scale + 0.35); // Faster zoom step
    applyTransform();
  });

  const btnOut = document.createElement('button');
  btnOut.innerHTML = '－';
  btnOut.title = 'Alejar';
  btnOut.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isMobile()) return;
    container.style.transition = 'transform 0.15s ease-out';
    scale = Math.max(0.12, scale - 0.35); // Faster zoom step
    applyTransform();
  });

  const btnReset = document.createElement('button');
  btnReset.innerHTML = '🔄';
  btnReset.title = 'Ajustar Vista';
  btnReset.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isMobile()) return;
    container.style.transition = 'transform 0.25s ease-out';
    resetViewport();
  });

  controls.appendChild(btnIn);
  controls.appendChild(btnOut);
  controls.appendChild(btnReset);
  wrapper.appendChild(controls);

  // Set initial viewport layout
  function resetViewport() {
    if (!isMobile()) {
      // Restore standard desktop layout rules (clear inline transforms)
      container.style.transform = '';
      container.style.transition = '';
      container.style.position = '';
      container.style.transformOrigin = '';
      wrapper.style.cursor = '';
      wrapper.style.touchAction = '';
      return;
    }

    if (wrapper.offsetWidth === 0) return; // ignore if hidden

    // Apply mobile frame inline styles
    wrapper.style.touchAction = 'none';
    wrapper.style.cursor = 'grab';
    container.style.position = 'absolute';
    container.style.transformOrigin = '0 0';

    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;

    // Total width of bracket is 9 columns * 270px + gaps = ~2430px
    // Fit bracket horizontally inside the frame width with a smaller initial zoom (multiplied by 0.85)
    const fitScale = Math.max(0.12, Math.min(1.0, (wrapperWidth - 20) / 2430));
    scale = fitScale * 0.85; // Default zoom not so big

    // Center horizontally
    translateX = Math.max(0, (wrapperWidth - (2430 * scale)) / 2);
    // Center vertically inside the frame height (approx height is 900px)
    translateY = Math.max(10, (wrapperHeight - (900 * scale)) / 2);

    container.style.transition = 'transform 0.25s ease-out';
    applyTransform();
  }

  function applyTransform() {
    if (!isMobile()) return;
    container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // Drag actions
  function dragStart(clientX, clientY) {
    if (!isMobile()) return;
    isDragging = true;
    startX = clientX - translateX;
    startY = clientY - translateY;
    wrapper.style.cursor = 'grabbing';
    container.style.transition = 'none';
  }

  function dragMove(clientX, clientY) {
    if (!isDragging || !isMobile()) return;
    translateX = clientX - startX;
    translateY = clientY - startY;

    // Boundary constraints: Keep at least 150px of the bracket visible inside the viewport frame
    const rect = container.getBoundingClientRect();
    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;
    const margin = 150;

    if (translateX > wrapperWidth - margin) translateX = wrapperWidth - margin;
    if (translateX < -rect.width + margin) translateX = -rect.width + margin;
    if (translateY > wrapperHeight - margin) translateY = wrapperHeight - margin;
    if (translateY < -rect.height + margin) translateY = -rect.height + margin;

    applyTransform();
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    if (isMobile()) {
      wrapper.style.cursor = 'grab';
      container.style.transition = 'transform 0.15s ease-out';
    }
  }

  // Mouse drag event listeners
  wrapper.addEventListener('mousedown', (e) => {
    if (!isMobile()) return;
    
    // Ignore drag when clicking interactive elements or team cards
    if (
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'BUTTON' || 
      e.target.closest('.bracket-team-row') ||
      e.target.closest('.penalty-badge-btn')
    ) {
      return;
    }
    if (e.button !== 0) return; // Left click drag only
    e.preventDefault();
    dragStart(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging && isMobile()) {
      dragMove(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseup', () => {
    dragEnd();
  });

  // Touch pointer events (support single-pointer dragging & double-pointer pinch-zoom)
  wrapper.addEventListener('pointerdown', (e) => {
    if (!isMobile()) return;
    
    if (
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'BUTTON' || 
      e.target.closest('.bracket-team-row') ||
      e.target.closest('.penalty-badge-btn')
    ) {
      return;
    }

    activePointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    
    const pointerKeys = Object.keys(activePointers);
    if (pointerKeys.length === 1) {
      dragStart(e.clientX, e.clientY);
    } else if (pointerKeys.length === 2) {
      isDragging = false;
      container.style.transition = 'none';
      
      const p1 = activePointers[pointerKeys[0]];
      const p2 = activePointers[pointerKeys[1]];
      startDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      startScale = scale;

      midPoint.x = (p1.x + p2.x) / 2;
      midPoint.y = (p1.y + p2.y) / 2;
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isMobile()) return;
    
    if (activePointers[e.pointerId]) {
      activePointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    }

    const pointerKeys = Object.keys(activePointers);
    if (pointerKeys.length === 1 && isDragging) {
      dragMove(e.clientX, e.clientY);
    } else if (pointerKeys.length === 2) {
      const p1 = activePointers[pointerKeys[0]];
      const p2 = activePointers[pointerKeys[1]];
      const currentDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      
      if (startDistance > 0) {
        const ratio = currentDist / startDistance;
        const newScale = Math.max(0.12, Math.min(2.0, startScale * ratio));
        
        const zoomFactor = newScale / scale;
        scale = newScale;
        
        const rect = wrapper.getBoundingClientRect();
        const localMidX = midPoint.x - rect.left;
        const localMidY = midPoint.y - rect.top;
        
        translateX = localMidX - (localMidX - translateX) * zoomFactor;
        translateY = localMidY - (localMidY - translateY) * zoomFactor;
        
        applyTransform();
      }
    }
  });

  const removePointer = (e) => {
    delete activePointers[e.pointerId];
    if (Object.keys(activePointers).length < 2) {
      startDistance = 0;
    }
    dragEnd();
  };

  window.addEventListener('pointerup', removePointer);
  window.addEventListener('pointercancel', removePointer);

  // Wheel zoom inside the frame widget
  wrapper.addEventListener('wheel', (e) => {
    if (!isMobile()) return;
    e.preventDefault();
    container.style.transition = 'transform 0.1s ease-out';
    
    const zoomIntensity = 0.12; // Faster mouse wheel zoom
    const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
    const newScale = Math.max(0.12, Math.min(2.0, scale * zoomFactor));

    const rect = wrapper.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    translateX = cursorX - (cursorX - translateX) * (newScale / scale);
    translateY = cursorY - (cursorY - translateY) * (newScale / scale);
    scale = newScale;

    applyTransform();
  }, { passive: false });

  // Watch for visibility changes to initialize coordinates correctly
  const bracketSection = document.getElementById('bracket-section');
  if (bracketSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const isVisible = bracketSection.style.display !== 'none';
          if (isVisible) {
            setTimeout(resetViewport, 100);
          }
        }
      });
    });
    observer.observe(bracketSection, { attributes: true, attributeFilter: ['style'] });
  }

  // Initial load
  resetViewport();

  // Screen resizing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resetViewport, 150);
  });
}

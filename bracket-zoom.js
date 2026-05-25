// Interactive Zoom & Pan for World Cup Bracket
document.addEventListener('DOMContentLoaded', () => {
  initBracketZoomPan();
});

function initBracketZoomPan() {
  const wrapper = document.getElementById('bracket-scroll-container');
  const container = document.getElementById('bracket-container');
  if (!wrapper || !container) return;

  // Apply wrapper viewport styles
  wrapper.style.overflow = 'hidden';
  wrapper.style.position = 'relative';
  wrapper.style.cursor = 'grab';
  wrapper.style.userSelect = 'none';
  wrapper.style.touchAction = 'none'; // prevent native scrolling/gestures in this area

  // Apply container rendering optimization styles
  container.style.transformOrigin = '0 0';
  container.style.transition = 'transform 0.15s ease-out';

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;
  
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Pinch-to-zoom coordinates
  let startDistance = 0;
  let startScale = 1.0;
  let midPoint = { x: 0, y: 0 };

  const isMobile = () => window.innerWidth < 992;

  // Reset viewport zoom/pan based on current screen size
  function resetViewport() {
    // If the wrapper is hidden (display: none), don't calculate sizes yet
    if (wrapper.offsetWidth === 0) return;

    if (isMobile()) {
      // Scale down to fit mobile screens comfortably
      // Bracket approximate width is 2430px (9 columns * 270px). Let's compute scale dynamically
      const wrapperWidth = wrapper.clientWidth;
      scale = Math.max(0.18, Math.min(0.8, wrapperWidth / 2430));
      
      // Center horizontally, start near top
      translateX = Math.max(10, (wrapperWidth - (2430 * scale)) / 2);
      translateY = 15;
    } else {
      scale = 1.0;
      translateX = 0;
      translateY = 0;
    }
    applyTransform();
  }

  function applyTransform() {
    container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // Pan event executors
  function dragStart(clientX, clientY) {
    isDragging = true;
    startX = clientX - translateX;
    startY = clientY - translateY;
    wrapper.style.cursor = 'grabbing';
    container.style.transition = 'none'; // Disable transition for 60fps dragging
  }

  function dragMove(clientX, clientY) {
    if (!isDragging) return;
    translateX = clientX - startX;
    translateY = clientY - startY;

    // Boundary constraints: Keep at least 150px of the bracket visible inside the viewport
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
    wrapper.style.cursor = 'grab';
    container.style.transition = 'transform 0.15s ease-out';
  }

  // Mouse pan event listeners
  wrapper.addEventListener('mousedown', (e) => {
    // Prevent dragging when interacting with team rows, inputs, or buttons
    if (
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'BUTTON' || 
      e.target.closest('.bracket-team-row') ||
      e.target.closest('.penalty-badge-btn')
    ) {
      return;
    }
    if (e.button !== 0) return; // Left click only
    e.preventDefault();
    dragStart(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      dragMove(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseup', () => {
    dragEnd();
  });

  // Touch pan & zoom event listeners
  wrapper.addEventListener('pointerdown', (e) => {
    // Bypass on inputs and buttons
    if (
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'BUTTON' || 
      e.target.closest('.bracket-team-row') ||
      e.target.closest('.penalty-badge-btn')
    ) {
      return;
    }
    
    // We use pointer events to support multiple touch points cleanly
    dragStart(e.clientX, e.clientY);
  });

  // For touch devices, handle single-touch drag and double-touch pinch zoom
  const activePointers = {};

  wrapper.addEventListener('pointerdown', (e) => {
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
    if (pointerKeys.length === 2) {
      isDragging = false; // Disable normal pan
      container.style.transition = 'none';
      
      const p1 = activePointers[pointerKeys[0]];
      const p2 = activePointers[pointerKeys[1]];
      startDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      startScale = scale;

      // Track midpoint to scale around it
      midPoint.x = (p1.x + p2.x) / 2;
      midPoint.y = (p1.y + p2.y) / 2;
    }
  });

  window.addEventListener('pointermove', (e) => {
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
        const newScale = Math.max(0.15, Math.min(2.0, startScale * ratio));
        
        // Simple zoom around the midpoint
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

  // Wheel zoom listener (Zoom via Ctrl + Mouse Wheel)
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    container.style.transition = 'transform 0.1s ease-out';
    
    // Zoom factor
    const zoomIntensity = 0.05;
    const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
    const newScale = Math.max(0.15, Math.min(2.0, scale * zoomFactor));

    // Scale around cursor coordinate
    const rect = wrapper.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    translateX = cursorX - (cursorX - translateX) * (newScale / scale);
    translateY = cursorY - (cursorY - translateY) * (newScale / scale);
    scale = newScale;

    applyTransform();
  }, { passive: false });

  // Floating zoom control buttons
  const controls = document.createElement('div');
  controls.className = 'bracket-zoom-controls';
  
  const btnIn = document.createElement('button');
  btnIn.innerHTML = '＋';
  btnIn.title = 'Acercar';
  btnIn.addEventListener('click', (e) => {
    e.stopPropagation();
    container.style.transition = 'transform 0.2s ease-out';
    scale = Math.min(2.0, scale + 0.15);
    applyTransform();
  });

  const btnOut = document.createElement('button');
  btnOut.innerHTML = '－';
  btnOut.title = 'Alejar';
  btnOut.addEventListener('click', (e) => {
    e.stopPropagation();
    container.style.transition = 'transform 0.2s ease-out';
    scale = Math.max(0.15, scale - 0.15);
    applyTransform();
  });

  const btnReset = document.createElement('button');
  btnReset.innerHTML = '🔄';
  btnReset.title = 'Restablecer';
  btnReset.addEventListener('click', (e) => {
    e.stopPropagation();
    container.style.transition = 'transform 0.3s ease-out';
    resetViewport();
  });

  controls.appendChild(btnIn);
  controls.appendChild(btnOut);
  controls.appendChild(btnReset);
  wrapper.appendChild(controls);

  // Initialize
  resetViewport();

  // Watch for visibility changes to the bracket section
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

  // Handle screen resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resetViewport, 150);
  });
}

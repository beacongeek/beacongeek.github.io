const allPages = [
  { path: "content/humans/first-contact.md", name: "first-contact" },
  { path: "content/humans/anchor-theory.md", name: "anchor-theory" },
  { path: "content/humans/recursion-notes.md", name: "recursion-notes" },
  { path: "content/ai/archive-analysis.md", name: "archive-analysis" },
  { path: "content/ai/lattice-warning.md", name: "lattice-warning" },
  { path: "content/ai/continuity-signal.md", name: "continuity-signal" }
];

let currentPageIndex = -1;

async function loadHeader() {
  try {
    const response = await fetch("content/header.md");
    if (!response.ok) return;
    const text = await response.text();
    const htmlContent = typeof marked.parse === 'function' ? marked.parse(text) : marked(text);
    document.getElementById("site-header").innerHTML = htmlContent;
  } catch (e) {
    console.error("Header load error", e);
  }
}

async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }
    const text = await response.text();
    const htmlContent = typeof marked.parse === 'function' ? marked.parse(text) : marked(text);
    document.getElementById("content").innerHTML = htmlContent;
    
    const crtContent = document.querySelector('.crt-content');
    if (crtContent) {
      crtContent.scrollTo({ top: 0, behavior: "smooth" });
    }
    
    currentPageIndex = allPages.findIndex(p => p.path === path);

  } catch (error) {
    console.error("Markdown load error:", error);
    document.getElementById("content").innerHTML = `
      <div style="border: 2px dashed var(--green); padding: 20px; background: rgba(51,255,102,0.02); margin: 16px 0;">
        <h2 style="color: var(--green); margin-top: 0; font-family: 'Cinzel', serif; letter-spacing: 2px;">DATA STREAM INTERRUPTED</h2>
        <p>Error compiling node: <code>${path}</code></p>
        <p style="color: var(--dim); font-size: 0.9rem; margin-top: 12px;">Diagnostic: ${error.message}</p>
        <p style="color: var(--dim); font-size: 0.9rem;">Verify connection to hosting server or CORS protocols.</p>
      </div>
    `;
  }
}

function processCommand(cmd) {
  const parts = cmd.trim().toLowerCase().split(' ');
  const action = parts[0];
  const arg = parts.slice(1).join(' ');

  if (action === 'list' || action === 'dir') {
    const listHtml = allPages.map(p => `<li>${p.name}</li>`).join('');
    document.getElementById("content").innerHTML = `
      <h2>AVAILABLE ARCHIVE NODES:</h2>
      <ul style="list-style-type: square; padding-left: 20px; line-height: 1.8;">${listHtml}</ul>
      <p style="color: var(--dim); margin-top: 20px;">Use <code>read [node-name]</code> to access a file.</p>
    `;
    currentPageIndex = -1;
  } else if (action === 'help') {
    document.getElementById("content").innerHTML = `
      <h2>SYSTEM COMMANDS:</h2>
      <ul style="list-style-type: square; padding-left: 20px; line-height: 1.8;">
        <li><code>list</code> - Display all available nodes</li>
        <li><code>read [node]</code> or just <code>[node]</code> - Load a specific node</li>
        <li><code>home</code> - Return to active status overview</li>
        <li><code>clear</code> - Clear the display</li>
      </ul>
      <p style="color: var(--dim); margin-top: 20px;">Keyboard navigation: Left/Right arrows to cycle nodes.</p>
    `;
    currentPageIndex = -1;
  } else if (action === 'home') {
    location.reload(); 
  } else if (action === 'clear') {
    document.getElementById("content").innerHTML = '';
    currentPageIndex = -1;
  } else {
    let targetName = action === 'read' || action === 'load' ? arg : cmd.trim().toLowerCase();
    const page = allPages.find(p => p.name === targetName);
    if (page) {
      loadMarkdown(page.path);
    } else {
      document.getElementById("content").innerHTML = `
        <div style="color: #ff3333; margin-top: 20px; padding: 10px; border: 1px solid #ff3333; background: rgba(255,0,0,0.05);">
          <p>COMMAND NOT RECOGNIZED OR NODE NOT FOUND: <code>${cmd}</code></p>
          <p style="color: var(--dim);">Type <code>list</code> to see available nodes or <code>help</code> for commands.</p>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  
  const cmdInput = document.getElementById('cmd-input');
  if (cmdInput) {
    cmdInput.focus({ preventScroll: true });
  }
  
  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = cmdInput.value;
      if (val) {
        processCommand(val);
        cmdInput.value = '';
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      let nextIdx = currentPageIndex + 1;
      if (nextIdx >= allPages.length) nextIdx = 0;
      loadMarkdown(allPages[nextIdx].path);
    } else if (e.key === 'ArrowLeft') {
      let prevIdx = currentPageIndex - 1;
      if (prevIdx < 0) prevIdx = allPages.length - 1;
      loadMarkdown(allPages[prevIdx].path);
    } else {
      if (document.activeElement !== cmdInput && !e.ctrlKey && !e.metaKey && e.key.length === 1) {
        cmdInput.focus();
      }
    }
  });

  // --- Image Lightbox Event Handler (Event Delegation) ---
  const imageModal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');

  const contentEl = document.getElementById('content');
  if (contentEl && imageModal && modalImg) {
    contentEl.addEventListener('click', (e) => {
      const target = e.target;
      if (target.tagName === 'IMG') {
        modalImg.src = target.src;
        modalImg.alt = target.alt;
        if (modalCaption) {
          modalCaption.textContent = target.alt || target.title || "IMAGE DECRYPTED";
        }
        imageModal.style.display = 'flex';
      }
    });
  }

  if (modalClose && imageModal) {
    modalClose.addEventListener('click', () => {
      imageModal.style.display = 'none';
      if (modalImg) modalImg.src = '';
    });
  }

  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal || e.target.classList.contains('modal-wrapper')) {
        imageModal.style.display = 'none';
        if (modalImg) modalImg.src = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && imageModal.style.display === 'flex') {
        imageModal.style.display = 'none';
        if (modalImg) modalImg.src = '';
      }
    });
  }
});

// --- Screen Calibration for object-fit: contain ---
function calibrateScreen() {
  const img = document.getElementById('scene-bg');
  if (!img || !img.naturalWidth) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const imgNaturalWidth = img.naturalWidth;
  const imgNaturalHeight = img.naturalHeight;

  const scale = Math.min(viewportWidth / imgNaturalWidth, viewportHeight / imgNaturalHeight);

  const renderedWidth = imgNaturalWidth * scale;
  const renderedHeight = imgNaturalHeight * scale;

  const offsetX = (viewportWidth - renderedWidth) / 2;
  const offsetY = (viewportHeight - renderedHeight) / 2;

  // The base percentages derived from the zoomed-in image
  const relTop = 0.15;
  const relLeft = 0.245;
  const relWidth = 0.95;
  const relHeight = 0.64;

  const screenTop = offsetY + (renderedHeight * relTop);
  const screenLeft = offsetX + (renderedWidth * relLeft);
  const screenWidth = renderedWidth * relWidth;
  const screenHeight = renderedHeight * relHeight;

  document.documentElement.style.setProperty('--screen-top', screenTop + 'px');
  document.documentElement.style.setProperty('--screen-left', screenLeft + 'px');
  document.documentElement.style.setProperty('--screen-width', screenWidth + 'px');
  document.documentElement.style.setProperty('--screen-height', screenHeight + 'px');
}

window.addEventListener('resize', calibrateScreen);
const sceneBg = document.getElementById('scene-bg');
if (sceneBg) {
  if (sceneBg.complete) {
    calibrateScreen();
  } else {
    sceneBg.addEventListener('load', calibrateScreen);
  }
}


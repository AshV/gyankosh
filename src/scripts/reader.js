/**
 * src/scripts/reader.js
 * Client-side reader engine (3D Flip & Continuous Scroll) for Gyankosh.
 */

const shell = document.getElementById('reader-shell');
const config = window.__GYANKOSH_READER__ || {};
const slug = config.slug || shell?.dataset.slug || '';
const bookTitle = config.bookTitle || shell?.dataset.bookTitle || '';
const base = config.base || shell?.dataset.base || '';

      const ROOT = document.documentElement;
      const PREF_KEY = 'gyankosh_prefs';
      const PROGRESS_KEY = `gyankosh_progress_${slug}`;

      function isSmallScreen() {
        return window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches || (window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024);
      }

      function toHindiDigits(num) {
        if (typeof num === 'number' && !Number.isInteger(num)) {
          num = Math.round(num);
        }
        const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return num.toString().split('').map(d => digits[parseInt(d, 10)] || d).join('');
      }

      function loadPrefs() {
        try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); }
        catch { return {}; }
      }

      function isCoverScreenActive() {
        const cs = document.getElementById('reader-cover-screen');
        return !!(cs && !cs.classList.contains('cover-dismissed') && cs.style.display !== 'none');
      }

      function isScrollMode() {
        return ROOT.classList.contains('reader-scroll-mode');
      }

      function isLiteMode() {
        return ROOT.classList.contains('reader-lite-mode');
      }

      function evaluateDeviceCapability() {
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var isSaveData = navigator.connection && navigator.connection.saveData === true;
        var isLowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 3;
        var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
        var isLowCpu = typeof navigator.hardwareConcurrency === 'number' && isMobile && navigator.hardwareConcurrency <= 4;
        return prefersReducedMotion || isSaveData || isLowMemory || isLowCpu;
      }

      /* ── Gyankosh Vertical Pothi Page Flip Engine ── */
      class GyankoshReader {
        constructor() {
          this.stage = document.getElementById('reader-stage');
          this.rawSource = document.getElementById('reader-raw-source');
          this.viewport = document.getElementById('reader-viewport');
          this.pageInfo = document.getElementById('page-info');
          this.progressBar = document.getElementById('reading-progress');
          
          this.pages = [];
          this.currentPageIndex = 0;
          this.isFlipping = false;

          this.init();
        }

        init() {
          this.buildPages();
          this.setupEvents();
          this.restorePosition();
        }

        /* Build authentic sacred book pages without splitting shlokas */
        buildPages() {
          if (!this.rawSource || !this.stage) return;
          
          this.stage.innerHTML = '';
          this.pages = [];

          const isChanting = document.documentElement.classList.contains('chanting-mode') || document.body.classList.contains('chanting-mode');

          const childElements = Array.from(this.rawSource.children).filter(
            el => !el.classList.contains('sr-only') && (!isChanting || (!el.classList.contains('translation-block') && !el.classList.contains('block--translation') && !el.classList.contains('block--bhavarth')))
          );

          if (childElements.length === 0) return;

          // Stacking optimization: Mobile stacks automatically via CSS media query (@media max-width: 640px)
          // For desktop, measure using a single off-screen scratch element instead of thousands of body append/removes
          const isMobile = window.innerWidth <= 640;
          if (!isMobile) {
            const stageWidth = this.stage.clientWidth || window.innerWidth;
            const availableTextWidth = Math.max(120, stageWidth - 55);
            const scratch = document.createElement('div');
            scratch.style.cssText = 'position:absolute; visibility:hidden; left:-9999px; top:-9999px; width:max-content; display:inline-flex; flex-wrap:nowrap; column-gap:0.35em; font-family:var(--reader-font-family); font-size:var(--reader-font-size); line-height:var(--reader-line-height);';
            document.body.appendChild(scratch);

            childElements.forEach((node) => {
              if (node.classList.contains('verse-block')) {
                const lines = node.querySelectorAll('.verse-line');
                let verseNeedsStacking = false;
                for (let li = 0; li < lines.length; li++) {
                  const line = lines[li];
                  if (line.children.length > 1) {
                    scratch.textContent = line.textContent;
                    if (scratch.offsetWidth > availableTextWidth) {
                      verseNeedsStacking = true;
                      break;
                    }
                  }
                }
                if (verseNeedsStacking) {
                  node.classList.add('verse--stacked');
                } else {
                  node.classList.remove('verse--stacked');
                }
              }
            });
            document.body.removeChild(scratch);
          }

          // Measurement box
          const measureBox = document.createElement('div');
          measureBox.style.cssText = 'position:absolute; visibility:hidden; width:' + 
            (this.stage.clientWidth || window.innerWidth) + 'px; font-size:var(--reader-font-size); line-height:var(--reader-line-height);';
          document.body.appendChild(measureBox);

          // Helpers for identifying semantic Indic blocks
          const isTranslation = (el) => {
            if (!el) return false;
            return el.classList.contains('translation-block') ||
                   el.classList.contains('block--translation') ||
                   el.classList.contains('block--bhavarth');
          };

          const isVerse = (el) => {
            if (!el) return false;
            return el.classList.contains('verse-block');
          };

          const isSpeaker = (el) => {
            if (!el) return false;
            return el.classList.contains('speaker-block');
          };

          const isInstruction = (el) => {
            if (!el) return false;
            return el.classList.contains('instruction-block');
          };

          // Accurate height measurement for a group of nodes including inter-block spacing
          const measureNodes = (nodes) => {
            const container = document.createElement('div');
            container.style.cssText = 'display:flex; flex-direction:column;';
            nodes.forEach(n => container.appendChild(n.cloneNode(true)));
            measureBox.appendChild(container);
            const h = container.offsetHeight + 8;
            measureBox.removeChild(container);
            return h;
          };

          // Reserve space for compact sacred header (no page footer)
          const maxPageHeight = Math.max(260, this.stage.clientHeight - 30);

          let currentPageNodes = [];
          let currentHeight = 0;

          for (let i = 0; i < childElements.length; i++) {
            const node = childElements[i];

            // 1. Check for Speaker + Verse (+ Translation) cohesive group
            if (isSpeaker(node) && childElements[i + 1] && isVerse(childElements[i + 1])) {
              const nextEl = childElements[i + 1];
              const afterNext = childElements[i + 2];

              // Check if followed by Translation as well (Speaker + Verse + Translation)
              if (afterNext && isTranslation(afterNext)) {
                const trioHeight = measureNodes([node, nextEl, afterNext]);
                if (trioHeight <= maxPageHeight) {
                  if (currentHeight + trioHeight <= maxPageHeight) {
                    currentPageNodes.push(node.cloneNode(true), nextEl.cloneNode(true), afterNext.cloneNode(true));
                    currentHeight += trioHeight;
                    i += 2;
                    continue;
                  } else if (currentPageNodes.length > 0) {
                    this.pages.push(currentPageNodes);
                    currentPageNodes = [node.cloneNode(true), nextEl.cloneNode(true), afterNext.cloneNode(true)];
                    currentHeight = trioHeight;
                    i += 2;
                    continue;
                  }
                }
              }

              // Otherwise check Speaker + Verse pair
              const pairHeight = measureNodes([node, nextEl]);
              if (pairHeight <= maxPageHeight) {
                if (currentHeight + pairHeight <= maxPageHeight) {
                  currentPageNodes.push(node.cloneNode(true), nextEl.cloneNode(true));
                  currentHeight += pairHeight;
                  i += 1;
                  continue;
                } else if (currentPageNodes.length > 0) {
                  this.pages.push(currentPageNodes);
                  currentPageNodes = [node.cloneNode(true), nextEl.cloneNode(true)];
                  currentHeight = pairHeight;
                  i += 1;
                  continue;
                }
              }
            }

            // 2. Check for Verse + Translation cohesive pair
            if (isVerse(node) && childElements[i + 1] && isTranslation(childElements[i + 1])) {
              const nextEl = childElements[i + 1];
              const pairHeight = measureNodes([node, nextEl]);

              if (pairHeight <= maxPageHeight) {
                if (currentHeight + pairHeight <= maxPageHeight) {
                  // Both fit on current page
                  currentPageNodes.push(node.cloneNode(true), nextEl.cloneNode(true));
                  currentHeight += pairHeight;
                  i += 1;
                  continue;
                } else if (currentPageNodes.length > 0) {
                  // Don't split them! Start both together on a fresh page
                  this.pages.push(currentPageNodes);
                  currentPageNodes = [node.cloneNode(true), nextEl.cloneNode(true)];
                  currentHeight = pairHeight;
                  i += 1;
                  continue;
                }
              }
            }

            // 3. Check for Instruction header + immediate next element (avoid orphan section headers)
            if (isInstruction(node) && childElements[i + 1]) {
              const nextEl = childElements[i + 1];
              const pairHeight = measureNodes([node, nextEl]);

              if (pairHeight <= maxPageHeight && currentHeight + pairHeight > maxPageHeight && currentPageNodes.length > 0) {
                // Header would be orphaned at the bottom of current page; move it to next page
                this.pages.push(currentPageNodes);
                currentPageNodes = [node.cloneNode(true)];
                currentHeight = measureNodes([node]);
                continue;
              }
            }

            // 4. Standard single node placement (single verse, standalone instruction, or large blocks)
            const nodeHeight = measureNodes([node]);

            if (currentHeight + nodeHeight > maxPageHeight && currentPageNodes.length > 0) {
              this.pages.push(currentPageNodes);
              currentPageNodes = [node.cloneNode(true)];
              currentHeight = nodeHeight;
            } else {
              currentPageNodes.push(node.cloneNode(true));
              currentHeight += nodeHeight;
            }
          }

          if (currentPageNodes.length > 0) {
            this.pages.push(currentPageNodes);
          }

          document.body.removeChild(measureBox);

          const totalPages = this.pages.length || 1;

          // Render authentic pothi folio pages (without redundant page footer)
          this.pageElements = this.pages.map((nodeList, idx) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'reader-page' + (idx === this.currentPageIndex ? ' active-page' : '');
            pageDiv.setAttribute('data-page-index', idx);
            pageDiv.setAttribute('role', 'group');
            pageDiv.setAttribute('aria-label', `पृष्ठ ${idx + 1} कुल ${totalPages}`);

            // Running Page Header: Document Title
            const pageHeader = document.createElement('div');
            pageHeader.className = 'page-header-invocation';
            pageHeader.innerHTML = `॥ ${bookTitle} ॥`;
            pageDiv.appendChild(pageHeader);

            // Page Content Body
            const contentWrap = document.createElement('div');
            contentWrap.className = 'reader-content';
            contentWrap.style.padding = '0';
            contentWrap.style.margin = '0 auto';

            nodeList.forEach(n => contentWrap.appendChild(n));
            pageDiv.appendChild(contentWrap);

            this.stage.appendChild(pageDiv);
            return pageDiv;
          });

          this.updateUI();
        }

        /* Apply real-time interactive paper curl on scroll or drag (GPU-accelerated translate3d) */
        applyInteractiveCurl(progress) {
          if (this.isFlipping || !this.pageElements || this.pageElements.length <= 1 || isLiteMode()) return;

          const total = this.pages.length;
          const curr = this.currentPageIndex;
          const currPage = this.pageElements[curr];

          if (!currPage) return;

          if (progress > 0) {
            // Curled UP (Moving towards Next Page)
            if (curr >= total - 1) {
              // At end of book: rubber-band elastic curl
              const p = Math.min(0.2, progress * 0.35);
              currPage.classList.add('page-curling');
              currPage.style.transform = `translate3d(0, ${-p * 35}px, ${p * 25}px) rotateX(${p * 45}deg)`;
              return;
            }

            const p = Math.min(0.65, progress);
            const rot = Math.min(65, p * 95);
            const y = -p * 65;
            const z = p * 45;

            currPage.classList.add('page-curling');
            currPage.style.setProperty('--curl-sheen-opacity', `${Math.min(0.8, p * 1.5)}`);
            currPage.style.transform = `translate3d(0, ${y}px, ${z}px) rotateX(${rot}deg)`;

            const nextPage = this.pageElements[curr + 1];
            if (nextPage) {
              nextPage.classList.add('page-under-curl');
              nextPage.style.transform = `translate3d(0, 0, 0) scale(${0.985 + p * 0.015})`;
              nextPage.style.opacity = '1';
            }
          } else if (progress < 0) {
            // Curled DOWN (Moving towards Previous Page)
            if (curr <= 0) {
              // At start of book: subtle rubber-band
              const p = Math.min(0.2, Math.abs(progress) * 0.35);
              currPage.classList.add('page-curling');
              currPage.style.transform = `translate3d(0, ${p * 25}px, 0) rotateX(${-p * 30}deg)`;
              return;
            }

            const p = Math.min(0.65, Math.abs(progress));
            const prevPage = this.pageElements[curr - 1];
            if (prevPage) {
              const rot = Math.max(115, 180 - p * 95);
              const y = -110 + (p * 55);
              const z = p * 45;

              prevPage.classList.add('page-curling');
              prevPage.style.setProperty('--curl-sheen-opacity', `${Math.min(0.8, p * 1.5)}`);
              prevPage.style.transform = `translate3d(0, ${y}%, ${z}px) rotateX(${rot}deg)`;
              prevPage.style.opacity = `${Math.min(1, p * 2.8)}`;
            }
          }
        }

        /* Cancel/Snap-back interactive curl smoothly */
        cancelInteractiveCurl() {
          if (!this.pageElements) return;

          if (isLiteMode()) {
            this.pageElements.forEach((el, idx) => {
              el.className = 'reader-page' + (idx === this.currentPageIndex ? ' active-page' : '');
            });
            return;
          }

          this.pageElements.forEach((el) => {
            el.classList.remove('page-curling', 'page-under-curl');
            el.classList.add('page-curl-cancelling');
            el.style.transform = '';
            el.style.boxShadow = '';
            el.style.opacity = '';
            el.style.removeProperty('--curl-sheen-opacity');
          });

          setTimeout(() => {
            this.pageElements?.forEach((el, idx) => {
              el.classList.remove('page-curl-cancelling');
              el.className = 'reader-page' + (idx === this.currentPageIndex ? ' active-page' : '');
            });
          }, 340);
        }

        /* 3D Realistic Book Page Turn (पन्ना पलट) */
        flipToPage(newIndex, direction = 'down') {
          if (newIndex < 0 || newIndex >= this.pages.length || this.isFlipping) return;
          if (newIndex === this.currentPageIndex) return;

          if (typeof resetWakeLockActivityTimer === 'function') {
            resetWakeLockActivityTimer();
          }

          this.isFlipping = true;

          // Clear any inline drag transforms
          this.pageElements?.forEach((el) => {
            el.classList.remove('page-curling', 'page-under-curl', 'page-curl-cancelling');
            el.style.transform = '';
            el.style.boxShadow = '';
            el.style.opacity = '';
            el.style.removeProperty('--curl-sheen-opacity');
          });

          const oldIndex = this.currentPageIndex;
          const oldPage = this.pageElements[oldIndex];
          const newPage = this.pageElements[newIndex];

          const isForward = direction === 'down' || direction === 'next' || newIndex > oldIndex;

          if (isForward) {
            newPage.className = 'reader-page flip-turn-forward-enter';
            oldPage.className = 'reader-page flip-turn-forward-exit';
          } else {
            newPage.className = 'reader-page flip-turn-backward-enter';
            oldPage.className = 'reader-page flip-turn-backward-exit';
          }

          this.currentPageIndex = newIndex;
          this.updateUI();

          const flipDuration = isLiteMode() ? 240 : 530;
          setTimeout(() => {
            this.pageElements.forEach((el, idx) => {
              el.className = 'reader-page' + (idx === this.currentPageIndex ? ' active-page' : '');
            });
            this.isFlipping = false;
            this.savePosition();
            // Trigger completion screen on last page after a brief reading pause
            if (this.currentPageIndex >= this.pages.length - 1 && !window.__gyankoshCompletionTriggered) {
              window.__gyankoshCompletionTriggered = true;
              setTimeout(() => { if (typeof showCompletionScreen === 'function') showCompletionScreen(); }, 1800);
            }
          }, flipDuration);
        }

        nextPage() {
          this.flipToPage(this.currentPageIndex + 1, 'next');
        }

        prevPage() {
          this.flipToPage(this.currentPageIndex - 1, 'prev');
        }

        updateUI() {
          const total = this.pages.length || 1;
          const current = this.currentPageIndex + 1;
          const pct = Math.round((current / total) * 100);

          if (this.pageInfo) {
            this.pageInfo.textContent = `${toHindiDigits(current)} / ${toHindiDigits(total)}`;
          }

          if (this.progressBar) {
            this.progressBar.style.width = pct + '%';
            this.progressBar.setAttribute('aria-valuenow', pct);
          }

          if (!window.__isGyankoshScrubbing) {
            const fill = document.getElementById('reader-scrubber-fill');
            const thumb = document.getElementById('reader-scrubber-thumb');
            const track = document.getElementById('reader-scrubber-track');
            if (fill) fill.style.width = pct + '%';
            if (thumb) thumb.style.left = pct + '%';
            if (track) track.setAttribute('aria-valuenow', pct);
          }

          const btnUp = document.getElementById('btn-page-up');
          const btnDown = document.getElementById('btn-page-down');
          const btnBottomPrev = document.getElementById('btn-bottom-prev');
          const btnBottomNext = document.getElementById('btn-bottom-next');
          const btnRestart = document.getElementById('btn-restart');

          if (btnRestart) btnRestart.disabled = this.currentPageIndex === 0;
          if (btnUp) btnUp.disabled = this.currentPageIndex === 0;
          if (btnBottomPrev) btnBottomPrev.disabled = this.currentPageIndex === 0;
          
          if (btnDown) btnDown.disabled = this.currentPageIndex >= total - 1;
          if (btnBottomNext) btnBottomNext.disabled = this.currentPageIndex >= total - 1;
        }

        savePosition() {
          const total = this.pages.length || 1;
          const isCompleted = (this.currentPageIndex >= total - 1);
          const percent = Math.round(((this.currentPageIndex + 1) / total) * 100);
          try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify({
              pageIndex: this.currentPageIndex,
              percent,
              scrollPercent: percent,
              isCompleted,
              ts: Date.now()
            }));
          } catch {}
        }

        restorePosition() {
          try {
            const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
            if (saved) {
              const isAtEnd = saved.isCompleted ||
                (typeof saved.percent === 'number' && saved.percent >= 99.5) ||
                (typeof saved.scrollPercent === 'number' && saved.scrollPercent >= 99.5) ||
                (typeof saved.pageIndex === 'number' && saved.pageIndex >= this.pages.length - 1);
              if (isAtEnd) {
                this.currentPageIndex = 0;
                localStorage.removeItem(PROGRESS_KEY);
                this.pageElements?.forEach((el, idx) => {
                  el.className = 'reader-page' + (idx === 0 ? ' active-page' : '');
                });
                this.updateUI();
                return;
              }

              if (typeof saved.pageIndex === 'number' && saved.pageIndex < this.pages.length) {
                this.currentPageIndex = saved.pageIndex;
              } else if (typeof saved.scrollPercent === 'number' && this.pages.length > 0) {
                this.currentPageIndex = Math.min(Math.round((saved.scrollPercent / 100) * (this.pages.length - 1)), this.pages.length - 1);
              }
              this.pageElements?.forEach((el, idx) => {
                el.className = 'reader-page' + (idx === this.currentPageIndex ? ' active-page' : '');
              });
              this.updateUI();
            }
          } catch {}
        }

        setupEvents() {
          // Navigation Buttons
          document.getElementById('btn-page-up')?.addEventListener('click', () => this.prevPage());
          document.getElementById('btn-page-down')?.addEventListener('click', () => this.nextPage());
          document.getElementById('btn-bottom-prev')?.addEventListener('click', () => this.prevPage());
          document.getElementById('btn-bottom-next')?.addEventListener('click', () => this.nextPage());
          document.getElementById('btn-restart')?.addEventListener('click', () => this.flipToPage(0, 'prev'));

          // On small screens, touching anywhere on the reading viewport enters fullscreen if not already active
          const enterFullscreenOnTouch = (e) => {
            if (isCoverScreenActive()) return;
            if (isSmallScreen() && !isFullscreenActive()) {
              if (!e.target.closest('button, a, input, select')) {
                enterFullscreen();
              }
            }
          };

          this.viewport?.addEventListener('pointerup', enterFullscreenOnTouch, { passive: true });

          // Tap Zones (Top/Left = Prev, Bottom/Right = Next)
          document.getElementById('tap-prev')?.addEventListener('click', (e) => {
            if (isCoverScreenActive()) return;
            e.stopPropagation();
            this.prevPage();
          });
          document.getElementById('tap-next')?.addEventListener('click', (e) => {
            if (isCoverScreenActive()) return;
            e.stopPropagation();
            this.nextPage();
          });
          document.getElementById('tap-center')?.addEventListener('click', (e) => {
            if (isCoverScreenActive()) return;
            e.stopPropagation();
            this.nextPage();
          });

          // Touch Gestures with Live Real-time Paper Curl Feedback (rAF throttled for older devices)
          let touchStartY = 0;
          let touchStartX = 0;
          let isTouchDragging = false;
          let touchProgress = 0;
          let touchRafId = null;

          this.viewport?.addEventListener('touchstart', (e) => {
            if (isCoverScreenActive() || this.isFlipping) return;
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            isTouchDragging = true;
            touchProgress = 0;
          }, { passive: true });

          this.viewport?.addEventListener('touchmove', (e) => {
            if (isCoverScreenActive() || !isTouchDragging || this.isFlipping) return;
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const diffY = touchStartY - currentY;
            const diffX = touchStartX - currentX;

            const effectiveDiff = Math.abs(diffY) >= Math.abs(diffX) ? diffY : diffX;
            const stageHeight = this.stage.clientHeight || window.innerHeight;
            touchProgress = effectiveDiff / (stageHeight * 0.38);

            if (!isLiteMode()) {
              if (!touchRafId) {
                touchRafId = requestAnimationFrame(() => {
                  this.applyInteractiveCurl(touchProgress);
                  touchRafId = null;
                });
              }
            }
          }, { passive: true });

          this.viewport?.addEventListener('touchend', (e) => {
            if (touchRafId) {
              cancelAnimationFrame(touchRafId);
              touchRafId = null;
            }
            if (isCoverScreenActive()) {
              isTouchDragging = false;
              return;
            }
            if (!isTouchDragging) return;
            isTouchDragging = false;

            if (this.isFlipping) return;

            const swipeThreshold = isLiteMode() ? 0.12 : 0.16;
            if (touchProgress > swipeThreshold) {
              if (this.currentPageIndex < this.pages.length - 1) {
                this.nextPage();
              } else {
                this.cancelInteractiveCurl();
              }
            } else if (touchProgress < -swipeThreshold) {
              if (this.currentPageIndex > 0) {
                this.prevPage();
              } else {
                this.cancelInteractiveCurl();
              }
            } else {
              this.cancelInteractiveCurl();
            }
          }, { passive: true });

          this.viewport?.addEventListener('touchcancel', () => {
            if (touchRafId) {
              cancelAnimationFrame(touchRafId);
              touchRafId = null;
            }
            isTouchDragging = false;
            this.cancelInteractiveCurl();
          }, { passive: true });

          // Mouse Wheel / Trackpad Scroll with Live Dynamic Paper Curl (Active ONLY after opening text)
          let wheelProgress = 0;
          let wheelResetTimer = null;
          let wheelRafId = null;

          this.viewport?.addEventListener('wheel', (e) => {
            if (isCoverScreenActive()) return;

            e.preventDefault();
            if (this.isFlipping) return;

            clearTimeout(wheelResetTimer);

            const delta = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) || 0;
            wheelProgress += delta * 0.0035;
            wheelProgress = Math.max(-0.6, Math.min(0.6, wheelProgress));

            if (!isLiteMode()) {
              if (!wheelRafId) {
                wheelRafId = requestAnimationFrame(() => {
                  this.applyInteractiveCurl(wheelProgress);
                  wheelRafId = null;
                });
              }
            }

            const wheelThreshold = isLiteMode() ? 0.12 : 0.18;
            if (wheelProgress > wheelThreshold) {
              wheelProgress = 0;
              if (this.currentPageIndex < this.pages.length - 1) {
                this.nextPage();
              } else {
                this.cancelInteractiveCurl();
              }
            } else if (wheelProgress < -wheelThreshold) {
              wheelProgress = 0;
              if (this.currentPageIndex > 0) {
                this.prevPage();
              } else {
                this.cancelInteractiveCurl();
              }
            } else {
              wheelResetTimer = setTimeout(() => {
                wheelProgress = 0;
                this.cancelInteractiveCurl();
              }, 180);
            }
          }, { passive: false });

          // Keyboard navigation (Active ONLY after opening text)
          document.addEventListener('keydown', (e) => {
            if (isCoverScreenActive()) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
              e.preventDefault();
              this.nextPage();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
              e.preventDefault();
              this.prevPage();
            } else if (e.key === ' ' && !e.target.matches('input, select, textarea')) {
              e.preventDefault();
              if (e.shiftKey) this.prevPage();
              else this.nextPage();
            }
          });

          // Responsive Resize
          let resizeTimeout = null;
          window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              const prevPage = this.currentPageIndex;
              this.buildPages();
              this.currentPageIndex = Math.min(prevPage, this.pages.length - 1);
              this.pageElements?.forEach((el, idx) => {
                el.className = 'reader-page' + (idx === this.currentPageIndex ? ' active-page' : '');
              });
              this.updateUI();
            }, 200);
          });
        }

        findPageForTocId(tocId) {
          if (!this.pageElements || this.pageElements.length === 0) return -1;
          for (let i = 0; i < this.pageElements.length; i++) {
            const pageEl = this.pageElements[i];
            if (pageEl.querySelector(`[data-toc-id="${tocId}"]`)) {
              return i;
            }
          }
          return -1;
        }

        getCurrentTocId() {
          if (!this.pageElements || this.pageElements.length === 0) return null;
          const pageEl = this.pageElements[this.currentPageIndex];
          if (!pageEl) return null;
          const firstTocEl = pageEl.querySelector('[data-toc-id]');
          return firstTocEl ? firstTocEl.getAttribute('data-toc-id') : null;
        }
      }

      let gyankoshReaderInstance = null;

      /* ── Gyankosh Scroll Reader Engine (स्क्रोल पठन) ── */
      class GyankoshScrollReader {
        constructor() {
          this.stage = document.getElementById('reader-stage');
          this.rawSource = document.getElementById('reader-raw-source');
          this.viewport = document.getElementById('reader-viewport');
          this.pageInfo = document.getElementById('page-info');
          this.progressBar = document.getElementById('reading-progress');
          this.sectionAnchors = [];
          this.currentSectionIndex = 0;
          this._scrollRafId = null;
          this._scrollSaveTimer = null;

          this.init();
        }

        init() {
          this.buildScrollView();
          this.setupScrollEvents();
          // If cover screen is already dismissed, restore immediately
          if (!isCoverScreenActive()) {
            this.restoreScrollPosition();
          }
        }

        buildScrollView() {
          if (!this.rawSource || !this.stage) return;
          this.stage.innerHTML = '';
          this.sectionAnchors = [];

          const isChanting = ROOT.classList.contains('chanting-mode') || document.body.classList.contains('chanting-mode');

          const childElements = Array.from(this.rawSource.children).filter(
            el => !el.classList.contains('sr-only') &&
              (!isChanting || (!el.classList.contains('translation-block') &&
                !el.classList.contains('block--translation') &&
                !el.classList.contains('block--bhavarth')))
          );

          if (childElements.length === 0) return;

          // Stacking optimization: Mobile stacks automatically via CSS media query (@media max-width: 640px)
          const isMobile = window.innerWidth <= 640;
          if (!isMobile) {
            const stageWidth = this.stage.clientWidth || window.innerWidth;
            const availableTextWidth = Math.max(120, stageWidth - 55);
            const scratch = document.createElement('div');
            scratch.style.cssText = 'position:absolute; visibility:hidden; left:-9999px; top:-9999px; width:max-content; display:inline-flex; flex-wrap:nowrap; column-gap:0.35em; font-family:var(--reader-font-family); font-size:var(--reader-font-size); line-height:var(--reader-line-height);';
            document.body.appendChild(scratch);

            childElements.forEach((node) => {
              if (node.classList.contains('verse-block')) {
                const lines = node.querySelectorAll('.verse-line');
                let verseNeedsStacking = false;
                for (let li = 0; li < lines.length; li++) {
                  const line = lines[li];
                  if (line.children.length > 1) {
                    scratch.textContent = line.textContent;
                    if (scratch.offsetWidth > availableTextWidth) {
                      verseNeedsStacking = true;
                      break;
                    }
                  }
                }
                if (verseNeedsStacking) {
                  node.classList.add('verse--stacked');
                } else {
                  node.classList.remove('verse--stacked');
                }
              }
            });
            document.body.removeChild(scratch);
          }

          // Wrap everything in a single page div (scroll is continuous)
          const pageDiv = document.createElement('div');
          pageDiv.className = 'reader-page active-page';
          pageDiv.setAttribute('role', 'main');
          pageDiv.setAttribute('aria-label', `${bookTitle} — संपूर्ण पाठ`);

          // Running header
          const pageHeader = document.createElement('div');
          pageHeader.className = 'page-header-invocation';
          pageHeader.innerHTML = `‥ ${bookTitle} ‥`;
          pageDiv.appendChild(pageHeader);

          const contentWrap = document.createElement('div');
          contentWrap.className = 'reader-content';
          contentWrap.style.padding = '0';
          contentWrap.style.margin = '0 auto';

          // Insert anchors before each "section start" (speaker, instruction, or first verse of a group)
          childElements.forEach((node, i) => {
            const isSection = node.classList.contains('speaker-block') ||
              node.classList.contains('instruction-block') ||
              (node.classList.contains('verse-block') && (i === 0 ||
                (!childElements[i - 1]?.classList.contains('verse-block') &&
                  !childElements[i - 1]?.classList.contains('translation-block'))));

            if (isSection) {
              const anchor = document.createElement('span');
              anchor.className = 'scroll-section-anchor';
              anchor.setAttribute('data-section-index', this.sectionAnchors.length);
              anchor.id = `scroll-section-${this.sectionAnchors.length}`;
              contentWrap.appendChild(anchor);
              this.sectionAnchors.push(anchor);
            }
            const clone = node.cloneNode(true);
            if (clone.classList.contains('verse-block')) {
              const copyBtn = document.createElement('button');
              copyBtn.type = 'button';
              copyBtn.className = 'verse-copy-btn';
              copyBtn.title = 'श्लोक कॉपी करें';
              copyBtn.setAttribute('aria-label', 'श्लोक कॉपी करें');
              copyBtn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              `;
              clone.appendChild(copyBtn);
            }
            contentWrap.appendChild(clone);
          });

          // Fix 3: Sentinel element at end of content for precise completion detection
          const endSentinel = document.createElement('div');
          endSentinel.id = 'reader-end-sentinel';
          endSentinel.setAttribute('aria-hidden', 'true');
          endSentinel.style.cssText = 'height:1px;width:100%;pointer-events:none;';
          contentWrap.appendChild(endSentinel);

          // Allow tapping directly on a verse to focus it or copy it
          contentWrap.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.verse-copy-btn');
            if (copyBtn) {
              e.stopPropagation();
              const verse = copyBtn.closest('.verse-block');
              if (verse && typeof copyVerseText === 'function') {
                copyVerseText(verse);
              }
              return;
            }
            const verse = e.target.closest('.verse-block');
            if (verse && this.isVerseFocusEnabled()) {
              if (this._currentFocusedVerse && this._currentFocusedVerse !== verse) {
                this._currentFocusedVerse.classList.remove('verse-block--focused');
              }
              verse.classList.add('verse-block--focused');
              this._currentFocusedVerse = verse;
            }
          });

          pageDiv.appendChild(contentWrap);
          this.stage.appendChild(pageDiv);
          this.updateScrollUI();
          this.setupEntryAnimations(contentWrap);
          this.setupCompletionObserver();
          // Cache verse blocks and initialize native focus observer
          this._verseBlocks = Array.from(this.stage.querySelectorAll('.verse-block'));
          this.setupVerseFocusObserver();
        }

        setupScrollEvents() {
          if (!this.viewport) return;

          this.viewport.addEventListener('scroll', () => {
            if (this._scrollRafId) return;
            this._scrollRafId = requestAnimationFrame(() => {
              this._scrollRafId = null;
              this.onScroll();
            });
          }, { passive: true });

          // Navigation buttons scroll to next/prev section
          document.getElementById('btn-page-up')?.addEventListener('click', () => this.scrollToPrevSection());
          document.getElementById('btn-page-down')?.addEventListener('click', () => this.scrollToNextSection());
          document.getElementById('btn-bottom-prev')?.addEventListener('click', () => this.scrollToPrevSection());
          document.getElementById('btn-bottom-next')?.addEventListener('click', () => this.scrollToNextSection());
          document.getElementById('btn-restart')?.addEventListener('click', () => this.scrollToTop());

          // Keyboard navigation
          document.addEventListener('keydown', (e) => {
            if (isCoverScreenActive()) return;
            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
              e.preventDefault();
              this.scrollToNextSection();
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
              e.preventDefault();
              this.scrollToPrevSection();
            } else if (e.key === ' ' && !e.target.matches('input, select, textarea')) {
              e.preventDefault();
              if (e.shiftKey) this.scrollToPrevSection();
              else this.scrollToNextSection();
            }
          });

          // Rebuild on resize
          let resizeTimeout = null;
          window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              this.buildScrollView();
            }, 200);
          });
        }

        onScroll() {
          const vp = this.viewport;
          if (!vp) return;
          const scrollTop = vp.scrollTop;
          const scrollHeight = vp.scrollHeight - vp.clientHeight;
          const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
          this._lastPct = pct;

          if (this.progressBar) {
            this.progressBar.style.width = pct + '%';
            this.progressBar.setAttribute('aria-valuenow', pct);
          }

          if (this.pageInfo) {
            this.pageInfo.textContent = `${toHindiDigits(pct)}%`;
          }

          if (!window.__isGyankoshScrubbing) {
            const fill = document.getElementById('reader-scrubber-fill');
            const thumb = document.getElementById('reader-scrubber-thumb');
            const track = document.getElementById('reader-scrubber-track');
            if (fill) fill.style.width = pct + '%';
            if (thumb) thumb.style.left = pct + '%';
            if (track) track.setAttribute('aria-valuenow', pct);
          }

          // Fix 2: Gate section index scan — skip if scroll moved < 6px since last check
          if (this.sectionAnchors.length > 0) {
            const scrollDelta = Math.abs(scrollTop - (this._lastSectionCheckScrollTop ?? -999));
            if (scrollDelta >= 6) {
              this._lastSectionCheckScrollTop = scrollTop;
              const vpTop = vp.getBoundingClientRect().top;
              let active = 0;
              for (let i = 0; i < this.sectionAnchors.length; i++) {
                const top = this.sectionAnchors[i].getBoundingClientRect().top;
                if (top <= vpTop + 80) {
                  active = i;
                } else {
                  break; // anchors are in DOM order — safe to break early
                }
              }
              this.currentSectionIndex = active;
            }
          }

          this.updateNavBtns(pct);

          // Debounce save
          clearTimeout(this._scrollSaveTimer);
          this._scrollSaveTimer = setTimeout(() => this.saveScrollPosition(pct), 400);
          // Note: completion screen is now handled by setupCompletionObserver() (IntersectionObserver on sentinel)

          if (typeof resetWakeLockActivityTimer === 'function') {
            resetWakeLockActivityTimer();
          }
        }

        updateScrollUI() {
          if (this.pageInfo) this.pageInfo.textContent = `${toHindiDigits(0)}%`;
          if (this.progressBar) {
            this.progressBar.style.width = '0%';
            this.progressBar.setAttribute('aria-valuenow', 0);
          }
          if (!window.__isGyankoshScrubbing) {
            const fill = document.getElementById('reader-scrubber-fill');
            const thumb = document.getElementById('reader-scrubber-thumb');
            const track = document.getElementById('reader-scrubber-track');
            if (fill) fill.style.width = '0%';
            if (thumb) thumb.style.left = '0%';
            if (track) track.setAttribute('aria-valuenow', 0);
          }
          this.updateNavBtns(0);
        }

        updateNavBtns(pct) {
          const atTop = pct <= 0;
          const atBottom = pct >= 99;
          ['btn-page-up', 'btn-bottom-prev', 'btn-restart'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = atTop;
          });
          ['btn-page-down', 'btn-bottom-next'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = atBottom;
          });
        }

        scrollToNextSection() {
          if (!this.viewport) return;
          if (this.sectionAnchors.length > 0) {
            const nextIdx = Math.min(this.currentSectionIndex + 1, this.sectionAnchors.length - 1);
            if (nextIdx !== this.currentSectionIndex) {
              const anchor = this.sectionAnchors[nextIdx];
              const anchorTop = anchor.getBoundingClientRect().top;
              const vpTop = this.viewport.getBoundingClientRect().top;
              this.viewport.scrollBy({ top: anchorTop - vpTop - 12, behavior: 'smooth' });
              this.currentSectionIndex = nextIdx;
              return;
            }
          }
          // Fallback: scroll by viewport height
          this.viewport.scrollBy({ top: this.viewport.clientHeight * 0.85, behavior: 'smooth' });
        }

        scrollToPrevSection() {
          if (!this.viewport) return;
          if (this.sectionAnchors.length > 0) {
            const prevIdx = Math.max(this.currentSectionIndex - 1, 0);
            if (prevIdx !== this.currentSectionIndex || this.currentSectionIndex > 0) {
              const anchor = this.sectionAnchors[prevIdx];
              const anchorTop = anchor.getBoundingClientRect().top;
              const vpTop = this.viewport.getBoundingClientRect().top;
              this.viewport.scrollBy({ top: anchorTop - vpTop - 12, behavior: 'smooth' });
              this.currentSectionIndex = prevIdx;
              return;
            }
          }
          // Fallback: scroll up by viewport height
          this.viewport.scrollBy({ top: -(this.viewport.clientHeight * 0.85), behavior: 'smooth' });
        }

        scrollToTop() {
          window.__gyankoshCompletionTriggered = false;
          this.viewport?.scrollTo({ top: 0, behavior: 'smooth' });
          this.currentSectionIndex = 0;
          // Re-arm the completion observer so it fires again on the next read-through
          this.setupCompletionObserver();
        }

        saveScrollPosition(pct) {
          try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify({
              scrollPercent: pct,
              percent: pct,
              isCompleted: pct >= 99,
              ts: Date.now()
            }));
          } catch {}
        }

        flushScrollPosition() {
          if (typeof this._lastPct === 'number') {
            clearTimeout(this._scrollSaveTimer);
            this.saveScrollPosition(this._lastPct);
          }
        }

        restoreScrollPosition() {
          try {
            const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
            const rawPct = typeof saved.scrollPercent === 'number' ? saved.scrollPercent : (typeof saved.percent === 'number' ? saved.percent : null);
            const pct = rawPct !== null ? Math.round(rawPct) : null;
            if (pct !== null && pct > 0 && !saved.isCompleted) {
              const vp = this.viewport;
              if (!vp) return;
              requestAnimationFrame(() => {
                const scrollHeight = vp.scrollHeight - vp.clientHeight;
                if (scrollHeight > 0) {
                  vp.scrollTop = Math.round((pct / 100) * scrollHeight);
                  if (this.progressBar) {
                    this.progressBar.style.width = pct + '%';
                    this.progressBar.setAttribute('aria-valuenow', pct);
                  }
                  if (this.pageInfo) {
                    this.pageInfo.textContent = `${toHindiDigits(pct)}%`;
                  }
                  this.updateNavBtns(pct);
                  this.updateVerseFocus();
                } else {
                  this.updateVerseFocus();
                }
              });
            } else {
              requestAnimationFrame(() => {
                this.updateVerseFocus();
              });
            }
          } catch {}
        }

        // Called when chanting mode or font changes — rebuild and restore section
        rebuild() {
          if (this._entryObserver) {
            this._entryObserver.disconnect();
            this._entryObserver = null;
          }
          this._currentFocusedVerse = null;
          const prevSection = this.currentSectionIndex;
          this.buildScrollView();
          requestAnimationFrame(() => {
            if (this.sectionAnchors[prevSection]) {
              const anchor = this.sectionAnchors[prevSection];
              const anchorTop = anchor.getBoundingClientRect().top;
              const vpTop = this.viewport?.getBoundingClientRect().top || 0;
              this.viewport?.scrollBy({ top: anchorTop - vpTop - 12, behavior: 'instant' });
            }
          });
        }

        // Win 4: Cached pref — avoids JSON.parse(localStorage) on every scroll rAF
        isVerseFocusEnabled() {
          // _verseFocusEnabled is set at init and toggled by setVerseFocus()
          return this._verseFocusEnabled !== false;
        }

        // Call once at startup to hydrate the cache from localStorage
        initVerseFocusCache() {
          try {
            const prefs = loadPrefs();
            this._verseFocusEnabled = prefs.verseFocus !== false;
          } catch {
            this._verseFocusEnabled = true;
          }
        }

        setupVerseFocusObserver() {
          if (this._focusObserver) {
            this._focusObserver.disconnect();
            this._focusObserver = null;
          }
          if (!this.viewport || !this.isVerseFocusEnabled()) {
            this.clearVerseFocus();
            return;
          }

          const verses = this._verseBlocks?.length
            ? this._verseBlocks
            : Array.from(this.stage?.querySelectorAll('.verse-block') || []);
          if (!verses || verses.length === 0) return;

          this._focusObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                const target = entry.target;
                if (this._currentFocusedVerse !== target) {
                  if (this._currentFocusedVerse) {
                    this._currentFocusedVerse.classList.remove('verse-block--focused');
                  }
                  target.classList.add('verse-block--focused');
                  this._currentFocusedVerse = target;
                }
                break;
              }
            }
          }, {
            root: this.viewport,
            rootMargin: '-25% 0px -65% 0px',
            threshold: 0,
          });

          verses.forEach(v => this._focusObserver.observe(v));
        }

        updateVerseFocus() {
          if (!this.isVerseFocusEnabled()) {
            this.clearVerseFocus();
            return;
          }
          if (!this._focusObserver) {
            this.setupVerseFocusObserver();
          }
        }

        // Fix 3: Precision completion screen via IntersectionObserver on sentinel element
        setupCompletionObserver() {
          // Tear down any existing observer first
          if (this._endObserver) {
            this._endObserver.disconnect();
            this._endObserver = null;
          }
          if (typeof IntersectionObserver === 'undefined') return;
          const sentinel = document.getElementById('reader-end-sentinel');
          if (!sentinel) return;

          this._endObserver = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            if (window.__gyankoshCompletionTriggered) return;
            window.__gyankoshCompletionTriggered = true;
            // Short intentional pause so user finishes reading the last line
            setTimeout(() => {
              if (typeof showCompletionScreen === 'function') {
                showCompletionScreen();
              }
            }, 400);
          }, {
            root: this.viewport,
            threshold: 0.5
          });
          this._endObserver.observe(sentinel);
        }

        clearVerseFocus() {
          if (this._currentFocusedVerse) {
            this._currentFocusedVerse.classList.remove('verse-block--focused');
            this._currentFocusedVerse = null;
          }
          const all = this.stage?.querySelectorAll('.verse-block--focused');
          all?.forEach((el) => el.classList.remove('verse-block--focused'));
        }

        setupEntryAnimations(contentWrap) {
          const wrap = contentWrap || this.stage?.querySelector('.reader-content');
          if (!wrap) return;
          if (typeof IntersectionObserver === 'undefined') return;
          if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
          }

          if (this._entryObserver) {
            this._entryObserver.disconnect();
            this._entryObserver = null;
          }

          const blocks = wrap.querySelectorAll('.verse-block, .speaker-block, .instruction-block, .translation-block');
          if (!blocks || blocks.length === 0) return;

          // If lite mode or low memory device, reveal all immediately with no animation overhead
          if (isLiteMode() || evaluateDeviceCapability()) {
            blocks.forEach(b => b.classList.add('verse-revealed'));
            return;
          }

          const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('verse-revealed');
                obs.unobserve(entry.target);
              }
            });
          }, {
            root: this.viewport || null,
            threshold: 0.05,
            rootMargin: '0px 0px 80px 0px'
          });

          // First 12 blocks reveal immediately on start; remaining blocks are observed without layout reflows
          blocks.forEach((block, idx) => {
            if (idx < 12) {
              block.classList.add('verse-revealed');
            } else {
              block.classList.add('verse-reveal');
              observer.observe(block);
            }
          });

          this._entryObserver = observer;
        }

        getCurrentTocId() {
          const vp = this.viewport;
          if (!vp) return null;
          const tocEls = this.stage?.querySelectorAll('[data-toc-id]');
          if (!tocEls || tocEls.length === 0) return null;
          const vpTop = vp.getBoundingClientRect().top;
          let currentId = null;
          for (let i = 0; i < tocEls.length; i++) {
            const rect = tocEls[i].getBoundingClientRect();
            if (rect.top <= vpTop + 100) {
              currentId = tocEls[i].getAttribute('data-toc-id');
            } else {
              break;
            }
          }
          return currentId || (tocEls[0] ? tocEls[0].getAttribute('data-toc-id') : null);
        }
      }

      let gyankoshScrollInstance = null;

      /* ── Fullscreen Controls ── */
      function isFullscreenActive() {
        return !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        );
      }

      function enterFullscreen() {
        const elem = document.documentElement;
        try {
          if (elem.requestFullscreen) {
            elem.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
              elem.requestFullscreen().catch(() => {});
            });
          } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
          }
        } catch (e) {}
      }

      function exitFullscreen() {
        try {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        } catch (e) {}
      }

      const fsBtn = document.getElementById('fullscreen-toggle');
      const enterIcon = fsBtn?.querySelector('.icon-fullscreen-enter');
      const exitIcon = fsBtn?.querySelector('.icon-fullscreen-exit');

      function updateFullscreenUI() {
        const isFs = isFullscreenActive();
        document.documentElement.classList.toggle('is-fullscreen', isFs);
        document.body.classList.toggle('is-fullscreen', isFs);
        if (fsBtn) {
          fsBtn.classList.toggle('active', isFs);
          fsBtn.setAttribute('aria-pressed', isFs ? 'true' : 'false');
          fsBtn.title = isFs ? 'पूर्ण स्क्रीन बंद करें' : 'पूर्ण स्क्रीन';
          fsBtn.setAttribute('aria-label', isFs ? 'पूर्ण स्क्रीन बंद करें' : 'पूर्ण स्क्रीन');
        }
        if (enterIcon) enterIcon.style.display = isFs ? 'none' : 'block';
        if (exitIcon) exitIcon.style.display = isFs ? 'block' : 'none';
      }

      fsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isFullscreenActive()) {
          exitFullscreen();
        } else {
          enterFullscreen();
        }
      });

      document.addEventListener('fullscreenchange', updateFullscreenUI);
      document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
      document.addEventListener('mozfullscreenchange', updateFullscreenUI);
      document.addEventListener('MSFullscreenChange', updateFullscreenUI);

      /* ── Chanting / Paath Mode (पाठ मोड — केवल मूल श्लोक) ── */
      const chantingBtn = document.getElementById('chanting-toggle');
      const hasTranslations = Boolean(document.querySelector('#reader-raw-source .translation-block, #reader-raw-source .block--translation, #reader-raw-source .block--bhavarth'));

      if (chantingBtn) {
        if (!hasTranslations) {
          // If document has no translations, hide the पाठ button completely
          chantingBtn.style.display = 'none';
        } else {
          chantingBtn.style.display = 'inline-flex';
        }
      }

      function updateChantingUI(isChanting) {
        document.documentElement.classList.toggle('chanting-mode', isChanting);
        document.body.classList.toggle('chanting-mode', isChanting);
        if (chantingBtn) {
          chantingBtn.classList.toggle('active', isChanting);
          chantingBtn.setAttribute('aria-pressed', isChanting ? 'true' : 'false');
          chantingBtn.title = isChanting ? 'पाठ मोड सक्रिय (अर्थ छिपा है) — अर्थ देखने हेतु क्लिक करें' : 'पाठ मोड — केवल मूल श्लोक (अर्थ छिपाएं)';
        }
      }

      // Default state is translations hidden (chanting = true) unless user explicitly toggled it off
      const initialPrefs = loadPrefs();
      const defaultChanting = initialPrefs.chanting !== undefined ? initialPrefs.chanting : true;
      updateChantingUI(defaultChanting);

      chantingBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const curChanting = document.documentElement.classList.contains('chanting-mode') || document.body.classList.contains('chanting-mode');
        const nextChanting = !curChanting;
        try {
          const prefs = loadPrefs();
          localStorage.setItem(PREF_KEY, JSON.stringify({ ...prefs, chanting: nextChanting }));
        } catch {}
        updateChantingUI(nextChanting);
        if (isScrollMode()) {
          gyankoshScrollInstance?.rebuild();
        } else if (gyankoshReaderInstance) {
          const prevPageIndex = gyankoshReaderInstance.currentPageIndex;
          gyankoshReaderInstance.buildPages();
          gyankoshReaderInstance.currentPageIndex = Math.min(prevPageIndex, gyankoshReaderInstance.pages.length - 1);
          gyankoshReaderInstance.pageElements?.forEach((el, idx) => {
            el.className = 'reader-page' + (idx === gyankoshReaderInstance.currentPageIndex ? ' active-page' : '');
          });
          gyankoshReaderInstance.updateUI();
        }
      });

      /* ── Font Size Controls (अक्षर आकार छोटा/बड़ा करें) ── */
      function adjustFontSize(delta) {
        const cur = parseFloat(getComputedStyle(ROOT).getPropertyValue('--reader-font-size')) || 1.15;
        const next = Math.max(0.85, Math.min(1.85, (cur + delta))).toFixed(2);
        ROOT.style.setProperty('--reader-font-size', next + 'rem');
        try {
          const prefs = loadPrefs();
          localStorage.setItem(PREF_KEY, JSON.stringify({ ...prefs, fontSize: next }));
        } catch {}
        if (isScrollMode()) {
          gyankoshScrollInstance?.rebuild();
        } else {
          gyankoshReaderInstance?.buildPages();
        }
      }

      document.getElementById('font-decrease')?.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustFontSize(-0.08);
      });

      document.getElementById('font-increase')?.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustFontSize(0.08);
      });

      /* ── Aarambh (आरम्भ) Screen Trigger ── */
      const coverScreen = document.getElementById('reader-cover-screen');
      const btnAarambh = document.getElementById('btn-aarambh');

      let isStartingReading = false;
      function startReading(skipRestore = false) {
        if (isStartingReading) return;
        isStartingReading = true;
        document.querySelector('.reader-shell')?.classList.remove('has-cover-screen');
        document.body.classList.remove('has-cover-screen');
        if (coverScreen) {
          coverScreen.classList.add('cover-dismissed');
          setTimeout(() => {
            coverScreen.style.display = 'none';
          }, 450);
        }
        if (isSmallScreen() && !isFullscreenActive()) {
          enterFullscreen();
        }
        if (isScrollMode()) {
          if (!gyankoshScrollInstance) {
            gyankoshScrollInstance = new GyankoshScrollReader();
            gyankoshScrollInstance.initVerseFocusCache(); // Win 4: hydrate pref cache
          } else {
            gyankoshScrollInstance.rebuild();
          }
          const onCoverDismissed = () => {
            if (!skipRestore) {
              gyankoshScrollInstance?.restoreScrollPosition();
            }
            gyankoshScrollInstance?.setupEntryAnimations();
            gyankoshScrollInstance?.updateVerseFocus();
          };
          setTimeout(onCoverDismissed, 460);
        } else {
          if (!gyankoshReaderInstance) {
            gyankoshReaderInstance = new GyankoshReader();
          } else {
            gyankoshReaderInstance.buildPages();
          }
        }
        resetWakeLockActivityTimer();
      }

      // Pre-initialize reader engine only if cover screen is not active
      function initReaderEngine() {
        if (isCoverScreenActive()) {
          return;
        }
        if (isScrollMode()) {
          if (!gyankoshScrollInstance) {
            gyankoshScrollInstance = new GyankoshScrollReader();
            gyankoshScrollInstance.initVerseFocusCache(); // Win 4: hydrate pref cache
          }
        } else {
          if (!gyankoshReaderInstance) {
            gyankoshReaderInstance = new GyankoshReader();
          }
        }
      }

      function setupReaderInit() {
        initTableOfContents();
        initReaderEngine();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupReaderInit);
      } else {
        setupReaderInit();
      }

      /* ── Sacred Temple Bell (मंदिर की घण्टी) Synthesis via Web Audio API ── */
      let hasChimedOnAarambh = false;
      function playTempleChime() {
        if (hasChimedOnAarambh) return;
        hasChimedOnAarambh = true;

        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          const now = ctx.currentTime;
          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.24, now);
          masterGain.connect(ctx.destination);

          // Dynamic filter: bright bell shimmer initially, smoothly settling into pure tone
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(6500, now);
          filter.frequency.exponentialRampToValueAtTime(1600, now + 2.8);
          filter.connect(masterGain);

          // 1. Crisp brass clapper strike transient (टंकार / tankar)
          const strikeOsc = ctx.createOscillator();
          const strikeGain = ctx.createGain();
          strikeOsc.type = 'triangle';
          strikeOsc.frequency.setValueAtTime(2800, now);
          strikeOsc.frequency.exponentialRampToValueAtTime(450, now + 0.04);
          strikeGain.gain.setValueAtTime(0.25, now);
          strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          strikeOsc.connect(strikeGain);
          strikeGain.connect(filter);
          strikeOsc.start(now);
          strikeOsc.stop(now + 0.05);

          // 2. High metallic ping transient (sparkling strike)
          const pingOsc = ctx.createOscillator();
          const pingGain = ctx.createGain();
          pingOsc.type = 'sine';
          pingOsc.frequency.setValueAtTime(4800, now);
          pingGain.gain.setValueAtTime(0.12, now);
          pingGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.06);
          pingOsc.connect(pingGain);
          pingGain.connect(filter);
          pingOsc.start(now);
          pingOsc.stop(now + 0.07);

          // 3. Brass Temple Bell Resonant Harmonics (f0 = 980 Hz — authentic temple ghanti pitch)
          const f0 = 980;
          const bellModes = [
            { mult: 1.0,    gain: 0.45, decay: 3.2, detune: 0 },    // Pure bell fundamental
            { mult: 1.002,  gain: 0.35, decay: 3.0, detune: 1.8 },  // Bell flutter / shimmer beating
            { mult: 1.21,   gain: 0.28, decay: 2.2, detune: -1.0 }, // Tierce (minor 3rd harmonic)
            { mult: 1.50,   gain: 0.20, decay: 1.8, detune: 1.5 },  // Quint (5th)
            { mult: 2.00,   gain: 0.16, decay: 1.5, detune: 0 },    // Nominal octave
            { mult: 2.76,   gain: 0.10, decay: 1.1, detune: -2.0 }, // Upper ring
            { mult: 3.84,   gain: 0.06, decay: 0.8, detune: 1.0 },  // Silver sparkle
            { mult: 5.18,   gain: 0.03, decay: 0.5, detune: 0 }     // Top bell shimmer
          ];

          bellModes.forEach((m) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f0 * m.mult + m.detune, now);
            g.gain.setValueAtTime(0.0001, now);
            // Crisp 6ms rise for clear bell attack
            g.gain.linearRampToValueAtTime(m.gain, now + 0.006);
            g.gain.exponentialRampToValueAtTime(0.0001, now + m.decay);
            osc.connect(g);
            g.connect(filter);
            osc.start(now);
            osc.stop(now + m.decay + 0.1);
          });

          setTimeout(() => {
            try { ctx.close(); } catch {}
          }, 3600);
        } catch {}
      }

      btnAarambh?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playTempleChime();
        startReading();
      });

      btnAarambh?.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playTempleChime();
        startReading();
      });

      /* ── Resume Indicator on Cover Screen (पिछली बार कितना पढ़ा) ── */
      (function initResumeIndicator() {
        try {
          const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
          const rawPct = typeof saved.scrollPercent === 'number' ? saved.scrollPercent :
                         (typeof saved.percent === 'number' ? saved.percent : null);
          const pct = rawPct !== null ? Math.round(rawPct) : null;

          if (pct !== null && pct > 0 && pct < 99 && !saved.isCompleted) {
            const indicator = document.getElementById('cover-resume-indicator');
            const progressText = document.getElementById('resume-progress-text');
            if (indicator) indicator.style.display = '';
            if (progressText) progressText.textContent = 'पिछली बार: ' + toHindiDigits(pct) + '% पढ़ा';
            if (btnAarambh) {
              const textSpan = btnAarambh.querySelector('span:last-child');
              if (textSpan) textSpan.textContent = 'आगे पढ़ें';
            }
          }
        } catch {}
      })();

      const btnFreshStart = document.getElementById('btn-fresh-start');
      btnFreshStart?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try { localStorage.removeItem(PROGRESS_KEY); } catch {}
        // Reset button text
        if (btnAarambh) {
          const textSpan = btnAarambh.querySelector('span:last-child');
          if (textSpan) textSpan.textContent = 'आरम्भ करें';
        }
        const indicator = document.getElementById('cover-resume-indicator');
        if (indicator) indicator.style.display = 'none';
        startReading();
      });

      /* ── Toast Notification Helper ── */
      function showGyankoshToast(message, icon = '✓') {
        let toast = document.getElementById('gyankosh-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'gyankosh-toast';
          toast.className = 'gyankosh-toast';
          document.body.appendChild(toast);
        }
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
        toast.classList.add('show');
        clearTimeout(window.__gyankoshToastTimer);
        window.__gyankoshToastTimer = setTimeout(() => {
          toast?.classList.remove('show');
        }, 2600);
      }

      /* ── Save / Bookmark Functionality ── */
      const readerSaveBtn = document.getElementById('reader-save-btn');
      function isCurrentTextSaved() {
        try {
          const saved = JSON.parse(localStorage.getItem('gyankosh_saved') || '[]');
          return saved.includes(slug);
        } catch {
          return false;
        }
      }

      function updateReaderSaveUI() {
        const saved = isCurrentTextSaved();
        if (readerSaveBtn) {
          readerSaveBtn.classList.toggle('is-saved', saved);
          readerSaveBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
          readerSaveBtn.title = saved ? 'सहेजा गया (हटाने हेतु क्लिक करें)' : 'ग्रंथ सहेजें';
          readerSaveBtn.setAttribute('aria-label', saved ? 'सहेजा गया' : 'ग्रंथ सहेजें');
          const path = readerSaveBtn.querySelector('svg path');
          if (path) {
            path.style.fill = saved ? 'currentColor' : 'none';
          }
        }
      }

      updateReaderSaveUI();

      readerSaveBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          let saved = JSON.parse(localStorage.getItem('gyankosh_saved') || '[]');
          const idx = saved.indexOf(slug);
          let isNowSaved = false;
          if (idx >= 0) {
            saved.splice(idx, 1);
            isNowSaved = false;
          } else {
            saved.unshift(slug); // newest save at top!
            isNowSaved = true;
          }
          localStorage.setItem('gyankosh_saved', JSON.stringify(saved));
          updateReaderSaveUI();
          showGyankoshToast(isNowSaved ? '🔖 ग्रंथ सहेजा गया — मुख्य पृष्ठ पर सबसे ऊपर दिखेगा' : 'ग्रंथ सहेजे गए से हटाया गया');
        } catch (err) {
          console.error(err);
        }
      });

      /* ── Share Functionality ── */
      const readerShareBtn = document.getElementById('reader-share-btn');
      readerShareBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const shareUrl = window.location.href;
        const formattedShareMessage = `॥ ${bookTitle} ॥\nज्ञानकोश पर पढ़िए सम्पूर्ण शुद्ध पाठ एवं प्रामाणिक भावार्थ:\n${shareUrl}`;
        const shareData = {
          title: `${bookTitle} — ज्ञानकोश`,
          text: `॥ ${bookTitle} ॥ — ज्ञानकोश पर पढ़िए सम्पूर्ण शुद्ध पाठ एवं प्रामाणिक भावार्थ:`,
          url: shareUrl,
        };
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            return;
          } catch (err) {
            if (err.name === 'AbortError') return;
          }
        }
        try {
          await navigator.clipboard.writeText(formattedShareMessage);
          showGyankoshToast('🔗 पावन निमन्त्रण लिंक कॉपी किया गया!');
        } catch {
          window.prompt('ग्रंथ लिंक कॉपी करें:', shareUrl);
        }
      });

      /* ── Completion Screen (पाठ समापन पृष्ठ) ── */
      let completionShown = false;

      function showCompletionScreen() {
        const screen = document.getElementById('reader-completion-screen');
        if (completionShown || !screen) return;
        completionShown = true;

        // Generate falling flower petals 🌸
        const petalsContainer = document.getElementById('completion-petals');
        if (petalsContainer) {
          petalsContainer.innerHTML = '';
          const petalEmojis = ['🌸', '🪷', '🌺', '✿', '❀', '🏵️'];
          for (let i = 0; i < 35; i++) {
            const petal = document.createElement('span');
            petal.className = 'falling-petal';
            petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
            petal.style.left = (Math.random() * 100) + '%';
            petal.style.animationDelay = (Math.random() * 4) + 's';
            petal.style.animationDuration = (4 + Math.random() * 5) + 's';
            petal.style.fontSize = (0.9 + Math.random() * 1.1) + 'rem';
            petal.style.setProperty('--sway', (Math.random() * 50 - 25).toFixed(0));
            petalsContainer.appendChild(petal);
          }
        }

        screen.style.display = 'flex';
        // Hide bottom bar during completion
        const bottomBar = document.querySelector('.reader-bottombar');
        if (bottomBar) bottomBar.style.display = 'none';
        // Clear saved progress (next visit starts fresh)
        try { localStorage.removeItem(PROGRESS_KEY); } catch {}
      }

      function hideCompletionScreen() {
        const screen = document.getElementById('reader-completion-screen');
        if (!screen) return;
        completionShown = false;
        window.__gyankoshCompletionTriggered = false;
        screen.style.display = 'none';
        const petalsContainer = document.getElementById('completion-petals');
        if (petalsContainer) petalsContainer.innerHTML = '';
        // Restore bottom bar
        const bottomBar = document.querySelector('.reader-bottombar');
        if (bottomBar) bottomBar.style.removeProperty('display');
      }

      // Close button on completion screen
      document.getElementById('btn-completion-close')?.addEventListener('click', () => {
        hideCompletionScreen();
      });

      // Restart button on completion screen
      document.getElementById('btn-completion-restart')?.addEventListener('click', () => {
        hideCompletionScreen();
        if (isScrollMode() && gyankoshScrollInstance) {
          gyankoshScrollInstance.scrollToTop();
        } else if (gyankoshReaderInstance) {
          gyankoshReaderInstance.flipToPage(0, 'prev');
        }
      });

      // Share button on completion screen (with special "मैंने पाठ किया" message)
      document.getElementById('btn-completion-share')?.addEventListener('click', async () => {
        const shareUrl = window.location.href;
        const shareData = {
          title: bookTitle + ' — ज्ञानकोश',
          text: '॥ ' + bookTitle + ' ॥ — मैंने ज्ञानकोश पर संपूर्ण पाठ किया! आप भी पढ़ें:',
          url: shareUrl,
        };
        if (navigator.share) {
          try { await navigator.share(shareData); return; } catch (err) { if (err.name === 'AbortError') return; }
        }
        try {
          await navigator.clipboard.writeText(shareData.text + '\n' + shareUrl);
          showGyankoshToast('🔗 पावन निमन्त्रण लिंक कॉपी किया गया!');
        } catch {
          window.prompt('ग्रंथ लिंक कॉपी करें:', shareUrl);
        }
      });

      /* ── Table of Contents (विषय सूची) Functionality ── */
      const readerTocBtn = document.getElementById('reader-toc-btn');
      const readerTocDrawer = document.getElementById('reader-toc-drawer');
      const readerTocClose = document.getElementById('reader-toc-close');
      const readerTocBackdrop = document.getElementById('reader-toc-backdrop');
      const rawSource = document.getElementById('reader-raw-source');
      let tocItems = [];

      function initTableOfContents() {
        if (!rawSource) return;
        tocItems = [];
        const children = Array.from(rawSource.children).filter(
          el => !el.classList.contains('sr-only') &&
                !el.classList.contains('translation-block') &&
                !el.classList.contains('block--translation') &&
                !el.classList.contains('block--bhavarth')
        );

        let idx = 0;
        const typeHindiMap = {
          doha: 'दोहा',
          chaupai: 'चौपाई',
          shloka: 'श्लोक',
          mantra: 'मन्त्र',
          soratha: 'सोरठा',
          name: 'नाम',
          prose: 'गद्य',
        };
        const typeCounters = {};

        children.forEach((node) => {
          const isVerse = node.classList.contains('verse-block');
          const isSpeaker = node.classList.contains('speaker-block');
          const isInstruction = node.classList.contains('instruction-block');

          if (!isVerse && !isSpeaker && !isInstruction) return;

          const tocId = `toc-item-${idx++}`;
          node.setAttribute('data-toc-id', tocId);

          let badge = '';
          let badgeClass = '';
          let preview = '';
          let fullText = node.textContent.trim().replace(/\s+/g, ' ');

          if (isVerse) {
            const blockType = (node.getAttribute('data-block-type') || 'verse').toLowerCase();
            typeCounters[blockType] = (typeCounters[blockType] || 0) + 1;
            const countForType = typeCounters[blockType];
            const hindiType = typeHindiMap[blockType] || 'पद';
            badge = `${hindiType} ${toHindiDigits(countForType)}`;
            badgeClass = 'toc-item-badge--verse';

            const firstLine = node.querySelector('.verse-line')?.textContent?.trim().replace(/\s+/g, ' ') ||
                              node.querySelector('.pada')?.textContent?.trim().replace(/\s+/g, ' ') ||
                              node.textContent.trim().replace(/\s+/g, ' ');
            preview = firstLine;
          } else if (isSpeaker) {
            badge = 'वक्ता';
            badgeClass = 'toc-item-badge--speaker';
            const titleEl = node.querySelector('.speaker-title');
            preview = titleEl ? titleEl.textContent.trim().replace(/^॥\s*|\s*॥$/g, '') : node.textContent.trim();
          } else if (isInstruction) {
            badge = 'निर्देश';
            badgeClass = 'toc-item-badge--instruction';
            preview = node.textContent.trim().replace(/\s+/g, ' ');
            if (preview.length > 50) preview = preview.slice(0, 48) + '...';
          }

          tocItems.push({
            tocId,
            badge,
            badgeClass,
            preview,
            fullText,
          });
        });

        const statsEl = document.getElementById('reader-toc-stats');
        if (statsEl) {
          statsEl.textContent = `कुल ${toHindiDigits(tocItems.length)} पद`;
        }
      }

      function renderTocList(items) {
        const listEl = document.getElementById('reader-toc-list');
        if (!listEl) return;
        if (items.length === 0) {
          listEl.innerHTML = '<div class="reader-toc-empty">🙏 कोई पद नहीं मिला</div>';
          return;
        }

        const fragment = document.createDocumentFragment();
        items.forEach((item) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'reader-toc-item';
          btn.setAttribute('data-toc-id', item.tocId);
          btn.innerHTML = `
            <span class="toc-item-badge ${item.badgeClass}">${item.badge}</span>
            <div class="toc-item-content">
              <span class="toc-item-text">${item.preview}</span>
            </div>
          `;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateToTocItem(item.tocId);
          });
          fragment.appendChild(btn);
        });
        listEl.innerHTML = '';
        listEl.appendChild(fragment);
      }

      let tocRendered = false;

      function openTocDrawer() {
        if (!readerTocDrawer) return;
        if (!tocRendered) {
          renderTocList(tocItems);
          tocRendered = true;
        }
        readerTocDrawer.style.display = 'flex';
        readerTocBtn?.setAttribute('aria-expanded', 'true');

        let currentTocId = null;
        if (isScrollMode() && gyankoshScrollInstance) {
          currentTocId = gyankoshScrollInstance.getCurrentTocId();
        } else if (gyankoshReaderInstance) {
          currentTocId = gyankoshReaderInstance.getCurrentTocId();
        }

        const listEl = document.getElementById('reader-toc-list');
        if (listEl) {
          listEl.querySelectorAll('.reader-toc-item').forEach(el => {
            if (el.getAttribute('data-toc-id') === currentTocId) {
              el.classList.add('is-current');
              setTimeout(() => {
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }, 120);
            } else {
              el.classList.remove('is-current');
            }
          });
        }

        const searchInput = document.getElementById('reader-toc-search-input');
        if (searchInput) {
          searchInput.value = '';
          const clearBtn = document.getElementById('reader-toc-search-clear');
          if (clearBtn) clearBtn.style.display = 'none';
          renderTocList(tocItems);
        }
      }

      function closeTocDrawer() {
        if (!readerTocDrawer) return;
        readerTocDrawer.style.display = 'none';
        readerTocBtn?.setAttribute('aria-expanded', 'false');
      }

      function navigateToTocItem(tocId) {
        closeTocDrawer();

        if (isCoverScreenActive()) {
          startReading(true);
          setTimeout(() => performNavigation(tocId), 480);
        } else {
          performNavigation(tocId);
        }
      }

      function performNavigation(tocId) {
        if (isScrollMode() && gyankoshScrollInstance) {
          const target = document.querySelector(`#reader-stage [data-toc-id="${tocId}"]`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (gyankoshReaderInstance) {
          const pageIdx = gyankoshReaderInstance.findPageForTocId(tocId);
          if (pageIdx !== -1) {
            const dir = pageIdx >= gyankoshReaderInstance.currentPageIndex ? 'next' : 'prev';
            gyankoshReaderInstance.flipToPage(pageIdx, dir);
          }
        }
      }

      readerTocBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        openTocDrawer();
      });

      readerTocClose?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTocDrawer();
      });

      readerTocBackdrop?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTocDrawer();
      });

      // Search & Clear in TOC
      const tocSearchInput = document.getElementById('reader-toc-search-input');
      const tocClearBtn = document.getElementById('reader-toc-search-clear');

      tocSearchInput?.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (tocClearBtn) tocClearBtn.style.display = q ? 'block' : 'none';
        if (!q) {
          renderTocList(tocItems);
          const statsEl = document.getElementById('reader-toc-stats');
          if (statsEl) statsEl.textContent = `कुल ${toHindiDigits(tocItems.length)} पद`;
          return;
        }

        const filtered = tocItems.filter(item =>
          item.badge.toLowerCase().includes(q) ||
          item.preview.toLowerCase().includes(q) ||
          item.fullText.toLowerCase().includes(q)
        );

        renderTocList(filtered);
        const statsEl = document.getElementById('reader-toc-stats');
        if (statsEl) {
          statsEl.textContent = `${toHindiDigits(filtered.length)} पद मिले`;
        }
      });

      tocClearBtn?.addEventListener('click', () => {
        if (tocSearchInput) {
          tocSearchInput.value = '';
          tocSearchInput.focus();
        }
        if (tocClearBtn) tocClearBtn.style.display = 'none';
        renderTocList(tocItems);
        const statsEl = document.getElementById('reader-toc-stats');
        if (statsEl) statsEl.textContent = `कुल ${toHindiDigits(tocItems.length)} पद`;
      });

      // Quick Start / End buttons
      document.getElementById('toc-btn-goto-start')?.addEventListener('click', () => {
        closeTocDrawer();
        if (isCoverScreenActive()) startReading();
        if (isScrollMode() && gyankoshScrollInstance) {
          gyankoshScrollInstance.scrollToTop();
        } else if (gyankoshReaderInstance) {
          gyankoshReaderInstance.flipToPage(0, 'prev');
        }
      });

      document.getElementById('toc-btn-goto-end')?.addEventListener('click', () => {
        closeTocDrawer();
        if (isCoverScreenActive()) startReading();
        if (isScrollMode() && gyankoshScrollInstance) {
          const vp = gyankoshScrollInstance.viewport;
          if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: 'smooth' });
        } else if (gyankoshReaderInstance) {
          const lastIdx = gyankoshReaderInstance.pages.length - 1;
          gyankoshReaderInstance.flipToPage(lastIdx, 'next');
        }
      });

      /* ── Reading Progress Scrubber / Slider (प्रगति स्लाइडर) ── */
      function initProgressScrubber() {
        const container = document.getElementById('reader-scrubber-container');
        const track = document.getElementById('reader-scrubber-track');
        const rail = track?.querySelector('.reader-scrubber-rail');
        const fill = document.getElementById('reader-scrubber-fill');
        const thumb = document.getElementById('reader-scrubber-thumb');
        const tooltip = document.getElementById('reader-scrubber-tooltip');
        const tooltipBadge = document.getElementById('scrubber-tooltip-badge');
        const tooltipPct = document.getElementById('scrubber-tooltip-pct');
        const pageInfo = document.getElementById('page-info');

        if (!track || !rail || !fill || !thumb) return;

        let isDragging = false;

        function findVerseAtPct(pct) {
          if (!tocItems || tocItems.length === 0) {
            return { badge: '', pct };
          }
          if (isScrollMode() && gyankoshScrollInstance?.viewport) {
            const vp = gyankoshScrollInstance.viewport;
            const scrollHeight = vp.scrollHeight - vp.clientHeight;
            const targetTop = (pct / 100) * scrollHeight;
            const renderedElements = document.querySelectorAll('#reader-stage [data-toc-id]');
            let activeItem = tocItems[0];
            for (let i = 0; i < renderedElements.length; i++) {
              const el = renderedElements[i];
              if (el.offsetTop <= targetTop + 80) {
                const tocId = el.getAttribute('data-toc-id');
                const match = tocItems.find(t => t.tocId === tocId);
                if (match) activeItem = match;
              }
            }
            return { badge: activeItem ? activeItem.badge : '', pct };
          } else if (gyankoshReaderInstance) {
            const total = gyankoshReaderInstance.pages.length;
            const targetIdx = Math.min(total - 1, Math.round((pct / 100) * (total - 1)));
            return { badge: `पृष्ठ ${toHindiDigits(targetIdx + 1)}`, pct };
          }
          return { badge: '', pct };
        }

        function updateScrubberVisuals(pct, showTip = true) {
          const clamped = Math.max(0, Math.min(100, pct));
          fill.style.width = clamped + '%';
          thumb.style.left = clamped + '%';
          track.setAttribute('aria-valuenow', Math.round(clamped));

          if (isScrollMode() && pageInfo) {
            pageInfo.textContent = `${toHindiDigits(Math.round(clamped))}%`;
          }

          if (showTip && tooltip && tooltipBadge && tooltipPct) {
            const info = findVerseAtPct(clamped);
            tooltipBadge.textContent = info.badge;
            tooltipPct.textContent = `${toHindiDigits(Math.round(clamped))}%`;
            tooltip.style.left = clamped + '%';
            tooltip.style.display = 'flex';
          }
        }

        function applyScrub(pct, smooth = false) {
          const clamped = Math.max(0, Math.min(100, pct));
          if (isScrollMode() && gyankoshScrollInstance?.viewport) {
            const vp = gyankoshScrollInstance.viewport;
            const scrollHeight = vp.scrollHeight - vp.clientHeight;
            const targetTop = (clamped / 100) * scrollHeight;
            if (smooth) {
              vp.scrollTo({ top: targetTop, behavior: 'smooth' });
            } else {
              vp.scrollTop = targetTop;
            }
          } else if (gyankoshReaderInstance) {
            const total = gyankoshReaderInstance.pages.length;
            const targetIdx = Math.min(total - 1, Math.round((clamped / 100) * (total - 1)));
            gyankoshReaderInstance.flipToPage(targetIdx);
          }
        }

        function getPctFromEvent(e) {
          const rect = rail.getBoundingClientRect();
          const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
          const ratio = (clientX - rect.left) / rect.width;
          return Math.max(0, Math.min(100, ratio * 100));
        }

        function onStart(e) {
          if (isCoverScreenActive()) return;
          isDragging = true;
          window.__isGyankoshScrubbing = true;
          track.classList.add('is-dragging');
          const pct = getPctFromEvent(e);
          updateScrubberVisuals(pct, true);
          applyScrub(pct, false);
        }

        function onMove(e) {
          if (!isDragging) return;
          if (e.cancelable) e.preventDefault();
          const pct = getPctFromEvent(e);
          updateScrubberVisuals(pct, true);
          applyScrub(pct, false);
        }

        function onEnd(e) {
          if (!isDragging) return;
          isDragging = false;
          window.__isGyankoshScrubbing = false;
          track.classList.remove('is-dragging');
          if (tooltip) {
            setTimeout(() => {
              if (!isDragging) tooltip.style.display = 'none';
            }, 800);
          }
        }

        // Pointer / Touch / Mouse Listeners on Track
        track.addEventListener('mousedown', (e) => {
          onStart(e);
          const handleMouseMove = (ev) => onMove(ev);
          const handleMouseUp = (ev) => {
            onEnd(ev);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
          };
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
        });

        track.addEventListener('touchstart', (e) => {
          onStart(e);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
          if (isDragging) onMove(e);
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
          if (isDragging) onEnd(e);
        });

        window.addEventListener('touchcancel', (e) => {
          if (isDragging) onEnd(e);
        });

        // Hover tooltip on desktop
        track.addEventListener('mouseenter', (e) => {
          if (isCoverScreenActive() || isDragging) return;
          const pct = getPctFromEvent(e);
          const info = findVerseAtPct(pct);
          if (tooltip && tooltipBadge && tooltipPct) {
            tooltipBadge.textContent = info.badge;
            tooltipPct.textContent = `${toHindiDigits(Math.round(pct))}%`;
            tooltip.style.left = pct + '%';
            tooltip.style.display = 'flex';
          }
        });

        track.addEventListener('mousemove', (e) => {
          if (isCoverScreenActive() || isDragging) return;
          const pct = getPctFromEvent(e);
          const info = findVerseAtPct(pct);
          if (tooltip && tooltipBadge && tooltipPct) {
            tooltipBadge.textContent = info.badge;
            tooltipPct.textContent = `${toHindiDigits(Math.round(pct))}%`;
            tooltip.style.left = pct + '%';
          }
        });

        track.addEventListener('mouseleave', () => {
          if (!isDragging && tooltip) {
            tooltip.style.display = 'none';
          }
        });

        // Keyboard navigation (Left / Right / Home / End)
        track.addEventListener('keydown', (e) => {
          if (isCoverScreenActive()) return;
          let currentPct = parseFloat(track.getAttribute('aria-valuenow')) || 0;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = Math.min(100, currentPct + 2.5);
            updateScrubberVisuals(next, true);
            applyScrub(next, true);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = Math.max(0, currentPct - 2.5);
            updateScrubberVisuals(prev, true);
            applyScrub(prev, true);
          } else if (e.key === 'Home') {
            e.preventDefault();
            updateScrubberVisuals(0, true);
            applyScrub(0, true);
          } else if (e.key === 'End') {
            e.preventDefault();
            updateScrubberVisuals(100, true);
            applyScrub(100, true);
          }
        });
      }

      initProgressScrubber();

      /* ── Info Modal Functionality (Spiritual / Historical Context) ── */
      const readerInfoBtn = document.getElementById('reader-info-btn');
      const readerInfoModal = document.getElementById('reader-info-modal');
      const readerInfoClose = document.getElementById('reader-info-close');
      const readerInfoBackdrop = document.getElementById('reader-info-backdrop');

      function openInfoModal() {
        if (!readerInfoModal) return;
        readerInfoModal.style.display = 'flex';
        readerInfoBtn?.setAttribute('aria-expanded', 'true');
      }

      function closeInfoModal() {
        if (!readerInfoModal) return;
        readerInfoModal.style.display = 'none';
        readerInfoBtn?.setAttribute('aria-expanded', 'false');
      }

      readerInfoBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        openInfoModal();
      });

      readerInfoClose?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeInfoModal();
      });

      readerInfoBackdrop?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeInfoModal();
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (readerInfoModal && readerInfoModal.style.display === 'flex') {
            closeInfoModal();
          }
          if (readerTocDrawer && readerTocDrawer.style.display === 'flex') {
            closeTocDrawer();
          }
        }
      });

      /* ── Reading Mode Preference Handler (पठन शैली: स्क्रोल / 3D पोथी / Lite) ── */
      const readingModeToggleGroup = document.getElementById('reading-mode-toggle-group');

      function syncReadingModeUI() {
        const prefs = loadPrefs();
        const currentMode = prefs.readingMode || 'scroll';
        const buttons = readingModeToggleGroup?.querySelectorAll('.anim-opt-btn');
        buttons?.forEach(btn => {
          const mode = btn.getAttribute('data-mode');
          if (mode === currentMode) {
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
          } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-checked', 'false');
          }
        });
      }

      readingModeToggleGroup?.addEventListener('click', (e) => {
        const target = e.target.closest('.anim-opt-btn');
        if (!target) return;
        const mode = target.getAttribute('data-mode'); // 'scroll' | '3d' | 'lite'
        const prefs = loadPrefs();
        prefs.readingMode = mode;
        try {
          localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
        } catch {}

        // Apply mode classes
        if (mode === 'scroll') {
          ROOT.classList.add('reader-scroll-mode');
          ROOT.classList.remove('reader-lite-mode');
          showGyankoshToast('↓ स्क्रोल पठन मोड सक्रिय');
          // Destroy flip engine; start scroll engine
          gyankoshReaderInstance = null;
          gyankoshScrollInstance = null;
          setTimeout(() => {
            if (!isCoverScreenActive()) {
              gyankoshScrollInstance = new GyankoshScrollReader();
              gyankoshScrollInstance.restoreScrollPosition();
            }
          }, 50);
        } else {
          ROOT.classList.remove('reader-scroll-mode');
          if (mode === 'lite') {
            ROOT.classList.add('reader-lite-mode');
            showGyankoshToast('⚡ द्रुत Lite मोड सक्रिय');
          } else {
            ROOT.classList.remove('reader-lite-mode');
            showGyankoshToast('✨ 3D पन्ना पलट सक्रिय');
          }
          // Destroy scroll engine; start flip engine
          gyankoshScrollInstance = null;
          gyankoshReaderInstance = null;
          setTimeout(() => {
            if (!isCoverScreenActive()) {
              gyankoshReaderInstance = new GyankoshReader();
            }
          }, 50);
        }
        syncReadingModeUI();
        closeInfoModal();
      });

      syncReadingModeUI();

      /* ── Night / Dark Reading Mode (रात्रि पठन मोड) ── */
      const nightModeToggle = document.getElementById('night-mode-toggle');
      const themeToggleGroup = document.getElementById('theme-toggle-group');

      function isNightMode() {
        return ROOT.classList.contains('reader-night-mode');
      }

      function setNightMode(enable) {
        ROOT.classList.toggle('reader-night-mode', enable);
        document.body.classList.toggle('reader-night-mode', enable);

        // Update topbar icons & aria
        if (nightModeToggle) {
          nightModeToggle.setAttribute('aria-pressed', enable ? 'true' : 'false');
          nightModeToggle.title = enable ? 'दिवस मोड (ताम्रपत्र) पर लौटें' : 'रात्रि मोड — नेत्र-सुखद गहरा काष्ठ';
          const moonIcon = nightModeToggle.querySelector('.icon-moon');
          const sunIcon = nightModeToggle.querySelector('.icon-sun');
          if (moonIcon) moonIcon.style.display = enable ? 'none' : 'inline-block';
          if (sunIcon) sunIcon.style.display = enable ? 'inline-block' : 'none';
        }

        // Update settings modal theme buttons
        const themeBtns = themeToggleGroup?.querySelectorAll('.anim-opt-btn');
        themeBtns?.forEach((btn) => {
          const theme = btn.getAttribute('data-theme');
          const isActive = (enable && theme === 'night') || (!enable && theme === 'day');
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });

        // Update meta theme-color
        const themeColorMeta = document.getElementById('theme-color-meta');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', enable ? '#151210' : '#8e1b14');
        }

        // Save preference
        try {
          const prefs = loadPrefs();
          prefs.nightMode = enable;
          localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
        } catch {}
      }

      function syncNightModeUI() {
        const prefs = loadPrefs();
        const enable = !!prefs.nightMode;
        setNightMode(enable);
      }

      nightModeToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = !isNightMode();
        setNightMode(next);
        showGyankoshToast(next ? '🌙 रात्रि पठन मोड सक्रिय' : '☀️ दिवस पठन मोड सक्रिय');
      });

      themeToggleGroup?.addEventListener('click', (e) => {
        const btn = e.target.closest('.anim-opt-btn');
        if (!btn) return;
        const theme = btn.getAttribute('data-theme');
        const enable = theme === 'night';
        setNightMode(enable);
        showGyankoshToast(enable ? '🌙 रात्रि पठन मोड सक्रिय' : '☀️ दिवस पठन मोड सक्रिय');
        closeInfoModal();
      });

      syncNightModeUI();

      /* ── Auto-Scroll Mode (स्वचालित पठन) ── */
      let autoScrollActive = false;
      let autoScrollRafId = null;
      let autoScrollSpeed = 'slow'; // 'slow' (1x) | 'medium' (1.5x) | 'fast' (2x)
      const autoScrollSpeedMap = { slow: 0.55, medium: 1.15, fast: 1.95 };
      const autoScrollLabelMap = { slow: '१x', medium: '१.५x', fast: '२x' };

      const btnAutoScroll = document.getElementById('btn-auto-scroll');
      const floatingSpeedBadge = document.getElementById('autoscroll-floating-speed');
      const speedToggleGroup = document.getElementById('autoscroll-speed-toggle-group');

      function startAutoScroll() {
        if (isCoverScreenActive()) startReading();
        autoScrollActive = true;
        updateAutoScrollUI(true);
        requestScreenWakeLock();
        showGyankoshToast(`▶ स्वचालित पठन सक्रिय (${autoScrollLabelMap[autoScrollSpeed] || '१x'} गति)`);

        let lastTime = performance.now();
        function step(now) {
          if (!autoScrollActive) return;
          const dt = Math.min(32, now - lastTime);
          lastTime = now;

          if (isScrollMode() && gyankoshScrollInstance?.viewport) {
            const vp = gyankoshScrollInstance.viewport;
            const pxPerSec = (autoScrollSpeedMap[autoScrollSpeed] || 0.55) * 60;
            const delta = (pxPerSec * dt) / 1000;
            vp.scrollTop += delta;

            if (vp.scrollTop + vp.clientHeight >= vp.scrollHeight - 3) {
              stopAutoScroll(false);
              return;
            }
          }
          autoScrollRafId = requestAnimationFrame(step);
        }
        autoScrollRafId = requestAnimationFrame(step);
      }

      function stopAutoScroll(notify = true) {
        if (!autoScrollActive) return;
        autoScrollActive = false;
        if (autoScrollRafId) {
          cancelAnimationFrame(autoScrollRafId);
          autoScrollRafId = null;
        }
        updateAutoScrollUI(false);
        if (notify) {
          showGyankoshToast('⏸ स्वचालित पठन रोका गया');
        }
      }

      function toggleAutoScroll() {
        if (autoScrollActive) {
          stopAutoScroll(true);
        } else {
          startAutoScroll();
        }
      }

      function setAutoScrollSpeed(speed) {
        autoScrollSpeed = speed;
        try {
          const prefs = loadPrefs();
          prefs.autoScrollSpeed = speed;
          localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
        } catch {}
        syncAutoScrollSpeedUI();
        if (autoScrollActive) {
          showGyankoshToast(`गति: ${autoScrollLabelMap[speed] || '१x'}`);
        }
      }

      function syncAutoScrollSpeedUI() {
        const prefs = loadPrefs();
        autoScrollSpeed = prefs.autoScrollSpeed || 'slow';
        if (floatingSpeedBadge) {
          floatingSpeedBadge.textContent = autoScrollLabelMap[autoScrollSpeed] || '१x';
        }
        const buttons = speedToggleGroup?.querySelectorAll('.anim-opt-btn');
        buttons?.forEach(btn => {
          const s = btn.getAttribute('data-speed');
          const isActive = s === autoScrollSpeed;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
      }

      function updateAutoScrollUI(isActive) {
        if (btnAutoScroll) {
          btnAutoScroll.classList.toggle('active', isActive);
          btnAutoScroll.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          btnAutoScroll.title = isActive ? 'स्वचालित पठन रोकें' : 'स्वचालित पठन (हाथ-मुक्त पाठ) — आरम्भ करें';
          const iconPlay = btnAutoScroll.querySelector('.icon-play');
          const iconPause = btnAutoScroll.querySelector('.icon-pause');
          if (iconPlay) iconPlay.style.display = isActive ? 'none' : 'inline-block';
          if (iconPause) iconPause.style.display = isActive ? 'inline-block' : 'none';
        }
        if (floatingSpeedBadge) {
          floatingSpeedBadge.style.display = isActive ? 'inline-flex' : 'none';
        }
      }

      btnAutoScroll?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAutoScroll();
      });

      floatingSpeedBadge?.addEventListener('click', (e) => {
        e.stopPropagation();
        const order = ['slow', 'medium', 'fast'];
        const nextIdx = (order.indexOf(autoScrollSpeed) + 1) % order.length;
        setAutoScrollSpeed(order[nextIdx]);
      });

      speedToggleGroup?.addEventListener('click', (e) => {
        const btn = e.target.closest('.anim-opt-btn');
        if (!btn) return;
        const speed = btn.getAttribute('data-speed');
        setAutoScrollSpeed(speed);
      });

      // Pause auto-scroll on manual touch or wheel gesture
      const userScrollInterrupters = ['wheel', 'touchstart'];
      userScrollInterrupters.forEach((ev) => {
        window.addEventListener(ev, () => {
          if (autoScrollActive && !window.__isGyankoshScrubbing) {
            stopAutoScroll(false);
          }
        }, { passive: true });
      });

      // Keyboard shortcut: Shift+Space or 'p' to toggle auto-scroll
      document.addEventListener('keydown', (e) => {
        if (isCoverScreenActive() || e.target.matches('input, textarea, select')) return;
        if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          toggleAutoScroll();
        }
      });

      syncAutoScrollSpeedUI();

      /* ── Verse Focus Setting (श्लोक ध्यान केंद्र) ── */
      const verseFocusToggleGroup = document.getElementById('verse-focus-toggle-group');

      function setVerseFocus(enable) {
        try {
          const prefs = loadPrefs();
          prefs.verseFocus = enable;
          localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
        } catch {}
        // Win 4: Sync the cached flag so isVerseFocusEnabled() reflects the change instantly
        if (gyankoshScrollInstance) {
          gyankoshScrollInstance._verseFocusEnabled = enable;
        }
        syncVerseFocusUI();
        if (isScrollMode() && gyankoshScrollInstance) {
          if (enable) {
            gyankoshScrollInstance.updateVerseFocus();
          } else {
            gyankoshScrollInstance.clearVerseFocus();
          }
        }
        showGyankoshToast(enable ? '✨ श्लोक ध्यान केंद्र सक्रिय' : 'श्लोक ध्यान केंद्र सामान्य');
      }

      function syncVerseFocusUI() {
        const prefs = loadPrefs();
        const enable = prefs.verseFocus !== false;
        const buttons = verseFocusToggleGroup?.querySelectorAll('.anim-opt-btn');
        buttons?.forEach(btn => {
          const mode = btn.getAttribute('data-focus');
          const isActive = (enable && mode === 'on') || (!enable && mode === 'off');
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
      }

      verseFocusToggleGroup?.addEventListener('click', (e) => {
        const btn = e.target.closest('.anim-opt-btn');
        if (!btn) return;
        const mode = btn.getAttribute('data-focus');
        setVerseFocus(mode === 'on');
      });

      syncVerseFocusUI();

      /* ── Line-Height Setting (पंक्ति अन्तर) ── */
      const lineHeightToggleGroup = document.getElementById('line-height-toggle-group');
      const lineHeightMap = {
        normal: '1.9',
        relaxed: '2.3',
        loose: '2.7'
      };

      function setLineHeight(level) {
        const val = lineHeightMap[level] || '1.9';
        ROOT.style.setProperty('--reader-line-height', val);
        try {
          const prefs = loadPrefs();
          prefs.lineHeightLevel = level;
          localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
        } catch {}
        syncLineHeightUI();
        if (isScrollMode() && gyankoshScrollInstance) {
          gyankoshScrollInstance.updateVerseFocus();
        }
      }

      function syncLineHeightUI() {
        const prefs = loadPrefs();
        const level = prefs.lineHeightLevel || 'normal';
        const val = lineHeightMap[level] || '1.9';
        ROOT.style.setProperty('--reader-line-height', val);

        const buttons = lineHeightToggleGroup?.querySelectorAll('.anim-opt-btn');
        buttons?.forEach((btn) => {
          const l = btn.getAttribute('data-lh');
          const isActive = l === level;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
      }

      lineHeightToggleGroup?.addEventListener('click', (e) => {
        const btn = e.target.closest('.anim-opt-btn');
        if (!btn) return;
        const level = btn.getAttribute('data-lh');
        setLineHeight(level);
        showGyankoshToast(`पंक्ति अन्तर: ${btn.textContent.trim()}`);
      });

      syncLineHeightUI();

      /* ── Copy Verse Action (श्लोक प्रतिलिपि) ── */
      function copyVerseText(verseBlock) {
        if (!verseBlock) return;
        const lines = Array.from(verseBlock.querySelectorAll('.verse-line'));
        let text = '';
        if (lines.length > 0) {
          text = lines.map(l => l.textContent.trim().replace(/\s+/g, ' ')).join('\n');
        } else {
          const clone = verseBlock.cloneNode(true);
          clone.querySelectorAll('.verse-num, .verse-copy-btn').forEach(el => el.remove());
          text = clone.textContent.trim().replace(/\s+/g, ' ');
        }
        if (!text) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            showGyankoshToast('📋 श्लोक क्लिपबोर्ड में कॉपी किया गया');
          }).catch(() => {
            showGyankoshToast('📋 कॉपी करने में असमर्थ');
          });
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            showGyankoshToast('📋 श्लोक क्लिपबोर्ड में कॉपी किया गया');
          } catch {
            showGyankoshToast('📋 कॉपी करने में असमर्थ');
          }
          document.body.removeChild(ta);
        }
      }

      /* ── Cover Screen Reading Stats (पठन सांख्यिकी) ── */
      function computeReadingStats() {
        const rawSource = document.getElementById('reader-raw-source');
        if (!rawSource) return;

        const verses = rawSource.querySelectorAll('.verse-block');
        const totalVerses = verses.length;

        const typeCounters = {};
        verses.forEach((v) => {
          const t = (v.getAttribute('data-block-type') || 'verse').toLowerCase();
          typeCounters[t] = (typeCounters[t] || 0) + 1;
        });

        // Fast zero-allocation word counter
        let wordCount = 0;
        let inWord = false;
        for (let wi = 0; wi < fullText.length; wi++) {
          const code = fullText.charCodeAt(wi);
          if (code > 32) {
            if (!inWord) { wordCount++; inWord = true; }
          } else {
            inWord = false;
          }
        }
        const estMinutes = Math.max(1, Math.round(wordCount / 105));

        const timeEl = document.getElementById('cover-stat-time');
        const countEl = document.getElementById('cover-stat-count');

        if (timeEl) {
          timeEl.textContent = `⏱ ~${toHindiDigits(estMinutes)} मिनट पठन`;
        }

        if (countEl) {
          const parts = [];
          if (typeCounters.chaupai) parts.push(`${toHindiDigits(typeCounters.chaupai)} चौपाई`);
          if (typeCounters.doha) parts.push(`${toHindiDigits(typeCounters.doha)} दोहा`);
          if (typeCounters.shloka) parts.push(`${toHindiDigits(typeCounters.shloka)} श्लोक`);
          if (typeCounters.mantra) parts.push(`${toHindiDigits(typeCounters.mantra)} मन्त्र`);
          if (typeCounters.soratha) parts.push(`${toHindiDigits(typeCounters.soratha)} सोरठा`);

          if (parts.length > 0) {
            countEl.textContent = `📄 ${parts.join(', ')}`;
          } else if (totalVerses > 0) {
            countEl.textContent = `📄 ${toHindiDigits(totalVerses)} पद`;
          } else {
            countEl.style.display = 'none';
          }
        }
      }

      computeReadingStats();

      /* ── Background Screen Wake Lock (पठन के दौरान स्क्रीन ऑन रखें) ── */
      let screenWakeLock = null;
      let wakeLockIdleTimer = null;
      const WAKE_LOCK_IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

      async function requestScreenWakeLock() {
        if (!('wakeLock' in navigator)) return;
        if (isCoverScreenActive()) return;
        if (document.visibilityState !== 'visible') return;

        try {
          if (!screenWakeLock || screenWakeLock.released) {
            screenWakeLock = await navigator.wakeLock.request('screen');
            screenWakeLock.addEventListener('release', () => {
              screenWakeLock = null;
            });
          }
        } catch (err) {
          screenWakeLock = null;
        }
      }

      async function releaseScreenWakeLock() {
        if (screenWakeLock) {
          try {
            await screenWakeLock.release();
          } catch (e) {}
          screenWakeLock = null;
        }
      }

      function resetWakeLockActivityTimer() {
        clearTimeout(wakeLockIdleTimer);
        if (!isCoverScreenActive() && document.visibilityState === 'visible') {
          requestScreenWakeLock();
        }
        wakeLockIdleTimer = setTimeout(() => {
          releaseScreenWakeLock();
        }, WAKE_LOCK_IDLE_TIMEOUT_MS);
      }

      // Re-acquire lock when returning to the tab if reading
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          gyankoshScrollInstance?.flushScrollPosition();
        }
        if (document.visibilityState === 'visible') {
          if (!isCoverScreenActive()) {
            resetWakeLockActivityTimer();
          }
        } else {
          clearTimeout(wakeLockIdleTimer);
          releaseScreenWakeLock();
        }
      });

      // User activity events reset the 10-minute idle timer and keep screen awake
      const readerActivityEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
      readerActivityEvents.forEach((ev) => {
        window.addEventListener(ev, () => {
          if (!isCoverScreenActive()) {
            resetWakeLockActivityTimer();
          }
        }, { passive: true });
      });

      // Clean release on page navigation or tab close
      window.addEventListener('pagehide', () => {
        gyankoshScrollInstance?.flushScrollPosition();
        clearTimeout(wakeLockIdleTimer);
        releaseScreenWakeLock();
      });
      window.addEventListener('beforeunload', () => {
        gyankoshScrollInstance?.flushScrollPosition();
        clearTimeout(wakeLockIdleTimer);
        releaseScreenWakeLock();
      });

      // Initial check on load (if reader opened with cover already dismissed)
      if (!isCoverScreenActive()) {
        resetWakeLockActivityTimer();
      }

      /* ── Smart Back Navigation (वापस जाएं) ── */
      const readerBackBtn = document.getElementById('reader-back-btn');
      if (readerBackBtn) {
        // Pre-update fallback href if internal referrer is available
        const referrer = document.referrer;
        let isInternalReferrer = false;
        try {
          if (referrer && referrer.startsWith(window.location.origin)) {
            const refUrl = new URL(referrer);
            if (refUrl.pathname !== window.location.pathname) {
              isInternalReferrer = true;
              readerBackBtn.setAttribute('href', referrer);
            }
          }
        } catch {}

        if (!isInternalReferrer) {
          try {
            const lastCatalog = sessionStorage.getItem('gyankosh_last_catalog_url');
            if (lastCatalog && !lastCatalog.includes('/read/' + slug)) {
              readerBackBtn.setAttribute('href', lastCatalog);
            }
          } catch {}
        }

        readerBackBtn.addEventListener('click', (e) => {
          e.preventDefault();
          gyankoshScrollInstance?.flushScrollPosition();
          if (isFullscreenActive()) {
            exitFullscreen();
          }

          // If came from an internal page (category, tag, or home), navigate back in browser history
          if (isInternalReferrer && window.history.length > 1) {
            window.history.back();
            return;
          }

          // Otherwise, navigate to last saved catalog/tag page or fallback
          try {
            const lastCatalogUrl = sessionStorage.getItem('gyankosh_last_catalog_url');
            if (lastCatalogUrl && !lastCatalogUrl.includes('/read/' + slug)) {
              window.location.href = lastCatalogUrl;
              return;
            }
          } catch {}

          const destination = readerBackBtn.getAttribute('href') || `${base}/`;
          window.location.href = destination;
        });
      }

      // PWA Service Worker Registration
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register(`${base}/sw.js`, { scope: `${base}/` })
            .catch((err) => {
              console.warn('[Gyankosh PWA] Service Worker registration failed:', err);
            });
        });
      }
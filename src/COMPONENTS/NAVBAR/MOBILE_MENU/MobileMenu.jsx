import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

export const StaggeredMenu = ({
  position = 'right',
  colors = ['var(--bg-color)', 'var(--card-bg)'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = null,
  menuButtonColor = 'var(--text-color)',
  openMenuButtonColor = 'var(--text-color)',
  accentColor = 'var(--primary-color)',
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  showApplyButton = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);
  const location = useLocation();

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef(null);

  // Respect prefers-reduced-motion: scale every tween duration way down
  // instead of skipping animation logic entirely (keeps the code path
  // the same, just near-instant).
  const motionScale = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.05 : 1
  ).current;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map(el => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5 * motionScale, ease: 'power4.out' }, i * 0.07 * motionScale);
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 * motionScale : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 * motionScale : 0);
    const panelDuration = 0.65 * motionScale;
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1 * motionScale,
          ease: 'power4.out',
          stagger: { each: 0.1 * motionScale, from: 'start' }
        },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6 * motionScale,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.08 * motionScale, from: 'start' }
          },
          itemsStart + 0.1 * motionScale
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5 * motionScale,
            ease: 'power2.out'
          },
          socialsStart
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55 * motionScale,
            ease: 'power3.out',
            stagger: { each: 0.08 * motionScale, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [motionScale, position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32 * motionScale,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        busyRef.current = false;
      }
    });
  }, [position, motionScale]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8 * motionScale, ease: 'power4.out', overwrite: 'auto' });
    } else {
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35 * motionScale, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }, [motionScale]);

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18 * motionScale,
          duration: 0.3 * motionScale,
          ease: 'power2.out'
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen, motionScale]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: (0.5 + lineCount * 0.07) * motionScale,
      ease: 'power4.out'
    });
  }, [motionScale]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  // Close on outside click
  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = event => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = e => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeMenu]);

  // Lock body scroll while the drawer is open, so the page behind it
  // doesn't keep scrolling.
  React.useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [open]);

  // Move focus into the panel on open, and back to the toggle button on
  // close, so keyboard users land somewhere sensible.
  React.useEffect(() => {
    if (open) {
      const firstFocusable = panelRef.current?.querySelector('a, button');
      firstFocusable?.focus();
    } else {
      toggleBtnRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Close whenever the route changes (a nav click already closes it, but
  // this covers programmatic navigation too) and reset the accordion.
  const firstRender = useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (openRef.current) closeMenu();
    setOpenAccordion(null);
  }, [location.pathname, closeMenu]);

  const handleNavigate = useCallback(() => {
    if (openRef.current) closeMenu();
  }, [closeMenu]);

  const isActive = link => {
    const path = (link || '').split('#')[0];
    return path && path !== '/' && location.pathname.startsWith(path);
  };

  return (
    <div
      className={(className ? className + ' ' : '') + 'staggered-menu-wrapper' + (isFixed ? ' fixed-wrapper' : '')}
      style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      <button
        ref={toggleBtnRef}
        className="sm-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        onClick={toggleMenu}
        type="button"
      >
        <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
          <span ref={textInnerRef} className="sm-toggle-textInner">
            {textLines.map((l, i) => (
              <span className="sm-toggle-line" key={i}>
                {l}
              </span>
            ))}
          </span>
        </span>
        <span ref={iconRef} className="sm-icon" aria-hidden="true">
          <span ref={plusHRef} className="sm-icon-line" />
          <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
        </span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <>
          <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true" data-position={position}>
            {(() => {
              const raw = colors && colors.length ? colors.slice(0, 4) : ['var(--bg-color)', 'var(--card-bg)'];
              let arr = [...raw];
              if (arr.length >= 3) {
                const mid = Math.floor(arr.length / 2);
                arr.splice(mid, 1);
              }
              return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />);
            })()}
          </div>
          <aside
            id="staggered-menu-panel"
            ref={panelRef}
            className="staggered-menu-panel"
            role="dialog"
            aria-modal={open}
            aria-label="Site menu"
            aria-hidden={!open}
            data-position={position}
            {...(!open ? { inert: '' } : {})}
          >
            {/* Mobile Menu Header with Logo and Close Button */}
            <div className="sm-panel-header lg:hidden" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <Link
                to="/"
                onClick={closeMenu}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text-color)' }}
              >
                <div className="brand-crest" style={{ transform: 'scale(0.9)', margin: 0 }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                  <span style={{ fontWeight: 700, letterSpacing: '1.5px', fontSize: '1rem' }}>PRUDENTIA</span>
                  <span style={{ fontSize: '0.6rem', letterSpacing: '1.8px', opacity: 0.9 }}>COLLEGE OF LAW</span>
                </div>
              </Link>
              
              <button 
                onClick={closeMenu}
                style={{
                  background: 'rgba(128,128,128,0.1)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-color)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items && items.length ? (
              items.map((it, idx) => {
                const hasSub = it.subItems && it.subItems.length > 0;
                const accordionId = `sm-accordion-${idx}`;
                return (
                  <li className="sm-panel-itemWrap" key={it.label + idx}>
                    {hasSub ? (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <Link
                            to={it.link}
                            className="sm-panel-item"
                            style={{ flex: 1, paddingRight: '0.5em' }}
                            aria-label={it.ariaLabel}
                            aria-current={isActive(it.link) ? 'page' : undefined}
                            onClick={handleNavigate}
                          >
                            <span className="sm-panel-itemLabel">{it.label}</span>
                          </Link>
                          <button
                            type="button"
                            aria-expanded={openAccordion === idx}
                            aria-controls={accordionId}
                            aria-label={`Toggle ${it.label} submenu`}
                            onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 12px', color: 'inherit', display: 'inline-flex', alignSelf: 'flex-start', marginTop: '0.35em' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openAccordion === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <div id={accordionId} className={`sm-accordion-content${openAccordion === idx ? ' is-open' : ''}`}>
                          <ul className="sm-accordion-inner">
                            {it.subItems.map((sub, sIdx) => (
                              <li key={sIdx}>
                                <Link
                                  to={sub.link}
                                  className="sm-accordion-link"
                                  aria-current={isActive(sub.link) ? 'page' : undefined}
                                  onClick={handleNavigate}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <Link
                        className="sm-panel-item"
                        to={it.link}
                        aria-label={it.ariaLabel}
                        aria-current={isActive(it.link) ? 'page' : undefined}
                        onClick={handleNavigate}
                      >
                        <span className="sm-panel-itemLabel">{it.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>
          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Connect</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showApplyButton && (
            <div style={{ marginTop: '30px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <a
                href="/erp"
                onClick={handleNavigate}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '15px 0',
                  background: 'transparent',
                  border: '1px solid var(--primary-color)',
                  color: 'var(--primary-color)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                ERP Portal
              </a>
              <Link
                to="/apply"
                onClick={handleNavigate}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '15px 0',
                  background: 'var(--primary-color)',
                  color: '#000',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 10px 20px var(--primary-glow)'
                }}
              >
                Apply Now
              </Link>
            </div>
          )}
        </div>
      </aside>
      </>
      , document.body)}
    </div>
  );
};

export default StaggeredMenu;

(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    function initAOS() {
        if (__app.aosInit) return;
        __app.aosInit = true;

        if (typeof window.AOS !== 'undefined') {
            var avoidElements = document.querySelectorAll('[data-aos][data-avoid-layout="true"]');
            for (var i = 0; i < avoidElements.length; i++) {
                avoidElements[i].removeAttribute('data-aos');
            }

            window.AOS.init({
                once: false,
                duration: 600,
                easing: 'ease-out',
                offset: 120,
                mirror: false,
                disable: function() {
                    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                }
            });
        }

        __app.refreshAOS = function() {
            try {
                if (typeof window.AOS !== 'undefined') {
                    window.AOS.refresh();
                }
            } catch (e) {}
        };
    }

    function initNavigation() {
        if (__app.navInit) return;
        __app.navInit = true;

        var toggle = document.querySelector('.navbar-toggler');
        var collapse = document.querySelector('.navbar-collapse');
        var body = document.body;
        var navLinks = document.querySelectorAll('.nav-link');

        if (!toggle || !collapse) return;

        function openMenu() {
            collapse.style.maxHeight = 'calc(100vh - var(--header-h))';
            collapse.classList.add('show');
            toggle.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
        }

        function closeMenu() {
            collapse.style.maxHeight = '0';
            collapse.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        }

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (collapse.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && collapse.classList.contains('show')) {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (collapse.classList.contains('show') && !toggle.contains(e.target) && !collapse.contains(e.target)) {
                closeMenu();
            }
        });

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                closeMenu();
            });
        }

        var handleResize = debounce(function() {
            if (window.innerWidth >= 1024) {
                closeMenu();
            }
        }, 250);

        window.addEventListener('resize', handleResize, { passive: true });
    }

    function initAnchors() {
        if (__app.anchorsInit) return;
        __app.anchorsInit = true;

        var isHomepage = location.pathname === '/' || location.pathname.endsWith('/index.html');
        var header = document.querySelector('.l-header');

        if (!isHomepage) {
            var sectionLinks = document.querySelectorAll('a[href^="#"]');
            for (var i = 0; i < sectionLinks.length; i++) {
                var link = sectionLinks[i];
                var href = link.getAttribute('href');
                if (href !== '#' && href !== '#!') {
                    link.setAttribute('href', '/' + href);
                }
            }
        }

        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            if (isHomepage) {
                e.preventDefault();
                var targetId = href.substring(1);
                var target = document.getElementById(targetId);
                if (target) {
                    var headerHeight = header ? header.offsetHeight : 72;
                    var targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    function initScrollSpy() {
        if (__app.scrollSpyInit) return;
        __app.scrollSpyInit = true;

        var isHomepage = location.pathname === '/' || location.pathname.endsWith('/index.html');
        if (!isHomepage) return;

        var sections = document.querySelectorAll('.l-section[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        var header = document.querySelector('.l-header');
        var headerHeight = header ? header.offsetHeight : 72;

        if (sections.length === 0 || navLinks.length === 0) return;

        function updateActiveLink() {
            var scrollPos = window.scrollY + headerHeight + 100;
            var currentSection = null;

            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];
                var sectionTop = section.offsetTop;
                var sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    currentSection = section.id;
                    break;
                }
            }

            for (var j = 0; j < navLinks.length; j++) {
                var link = navLinks[j];
                var href = link.getAttribute('href');
                var targetId = href ? href.substring(1) : '';

                link.classList.remove('active');
                link.removeAttribute('aria-current');

                if (targetId === currentSection) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            }
        }

        var throttledUpdate = throttle(updateActiveLink, 100);
        window.addEventListener('scroll', throttledUpdate, { passive: true });
        updateActiveLink();
    }

    function initActiveMenu() {
        if (__app.activeMenuInit) return;
        __app.activeMenuInit = true;

        var navLinks = document.querySelectorAll('.nav-link');
        var currentPath = location.pathname;
        var isHomepage = currentPath === '/' || currentPath.endsWith('/index.html');

        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            var href = link.getAttribute('href');
            
            link.removeAttribute('aria-current');
            link.classList.remove('active');

            if ((isHomepage && (href === '/' || href === '/index.html')) ||
                (href === currentPath) ||
                (href && currentPath.endsWith(href) && href !== '/')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            }
        }
    }

    function initImages() {
        if (__app.imagesInit) return;
        __app.imagesInit = true;

        var images = document.querySelectorAll('img');
        
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            
            if (!img.hasAttribute('loading') && 
                !img.classList.contains('c-logo__img') && 
                !img.hasAttribute('data-critical')) {
                img.setAttribute('loading', 'lazy');
            }

            img.style.opacity = '0';
            img.style.transform = 'translateY(20px)';
            img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

            (function(image) {
                if (image.complete) {
                    setTimeout(function() {
                        image.style.opacity = '1';
                        image.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    image.addEventListener('load', function() {
                        image.style.opacity = '1';
                        image.style.transform = 'translateY(0)';
                    });
                }

                image.addEventListener('error', function() {
                    var failedImg = this;
                    var svgPlaceholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">' +
                        '<rect width="100%" height="100%" fill="#f8f9fa"/>' +
                        '<text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">Bild nicht verfügbar</text>' +
                        '</svg>'
                    );
                    
                    failedImg.src = svgPlaceholder;
                    failedImg.style.objectFit = 'contain';
                    failedImg.style.opacity = '1';
                    failedImg.style.transform = 'translateY(0)';
                });
            })(img);
        }
    }

    function initScrollAnimations() {
        if (__app.scrollAnimInit) return;
        __app.scrollAnimInit = true;

        var animatedElements = document.querySelectorAll('.card, .c-award-card, .c-service-category, .c-region-card, .c-support-card, .accordion-item');
        
        if (animatedElements.length === 0) return;

        var observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        for (var i = 0; i < animatedElements.length; i++) {
            var el = animatedElements[i];
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            el.style.transitionDelay = (i % 3) * 0.1 + 's';
            observer.observe(el);
        }
    }

    function initButtonEffects() {
        if (__app.buttonEffectsInit) return;
        __app.buttonEffectsInit = true;

        var buttons = document.querySelectorAll('.btn, .c-button, .nav-link, .card');

        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];

            btn.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease-out';
            });

            btn.addEventListener('mouseleave', function() {
                this.style.transition = 'all 0.3s ease-out';
            });

            btn.addEventListener('click', function(e) {
                var ripple = document.createElement('span');
                var rect = this.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s ease-out';
                ripple.style.pointerEvents = 'none';

                var style = document.createElement('style');
                if (!document.querySelector('#ripple-keyframes')) {
                    style.id = 'ripple-keyframes';
                    style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
                    document.head.appendChild(style);
                }

                if (this.style.position !== 'absolute' && this.style.position !== 'relative') {
                    this.style.position = 'relative';
                }
                this.style.overflow = 'hidden';

                this.appendChild(ripple);

                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        }
    }

    function initCountUp() {
        if (__app.countUpInit) return;
        __app.countUpInit = true;

        var statElements = document.querySelectorAll('[data-count]');
        if (statElements.length === 0) return;

        var observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    var target = parseInt(entry.target.getAttribute('data-count'));
                    var duration = 2000;
                    var start = 0;
                    var increment = target / (duration / 16);
                    var current = start;

                    var timer = setInterval(function() {
                        current += increment;
                        if (current >= target) {
                            entry.target.textContent = target;
                            clearInterval(timer);
                        } else {
                            entry.target.textContent = Math.floor(current);
                        }
                    }, 16);
                }
            });
        }, observerOptions);

        for (var i = 0; i < statElements.length; i++) {
            observer.observe(statElements[i]);
        }
    }

    function initForms() {
        if (__app.formsInit) return;
        __app.formsInit = true;

        var notificationContainer = document.createElement('div');
        notificationContainer.className = 'position-fixed top-0 end-0 p-3';
        notificationContainer.style.zIndex = '1070';
        document.body.appendChild(notificationContainer);

        __app.notify = function(message, type) {
            type = type || 'info';
            var alertClass = 'alert-' + (type === 'error' ? 'danger' : type);
            
            var alert = document.createElement('div');
            alert.className = 'alert ' + alertClass + ' alert-dismissible fade show';
            alert.style.animation = 'slideInRight 0.3s ease-out';
            alert.innerHTML = message + '<button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>';
            
            var style = document.createElement('style');
            if (!document.querySelector('#notification-keyframes')) {
                style.id = 'notification-keyframes';
                style.textContent = '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
                document.head.appendChild(style);
            }
            
            notificationContainer.appendChild(alert);
            
            setTimeout(function() {
                if (alert.parentNode) {
                    alert.style.animation = 'slideInRight 0.3s ease-out reverse';
                    setTimeout(function() {
                        alert.remove();
                    }, 300);
                }
            }, 5000);
        };

        var forms = document.querySelectorAll('form');
        
        var validators = {
            firstName: {
                pattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
                message: 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen, nur Buchstaben)'
            },
            lastName: {
                pattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
                message: 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen, nur Buchstaben)'
            },
            name: {
                pattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
                message: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben)'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
            },
            phone: {
                pattern: /^[\d\s+\-()]{10,20}$/,
                message: 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen)'
            },
            message: {
                minLength: 10,
                message: 'Die Nachricht muss mindestens 10 Zeichen lang sein'
            }
        };

        function validateField(field) {
            var fieldName = field.name || field.id;
            var value = field.value.trim();
            var errorElement = field.parentNode.querySelector('.invalid-feedback, .c-form__error');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = field.classList.contains('c-form__input') ? 'c-form__error' : 'invalid-feedback';
                field.parentNode.appendChild(errorElement);
            }

            field.classList.remove('is-invalid', 'has-error');
            errorElement.style.display = 'none';

            if (field.hasAttribute('required') && !value) {
                field.classList.add(field.classList.contains('c-form__input') ? 'has-error' : 'is-invalid');
                errorElement.textContent = 'Dieses Feld ist erforderlich';
                errorElement.style.display = 'block';
                return false;
            }

            if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                field.classList.add(field.classList.contains('c-form__checkbox') ? 'has-error' : 'is-invalid');
                errorElement.textContent = 'Bitte akzeptieren Sie die Datenschutzerklärung';
                errorElement.style.display = 'block';
                return false;
            }

            if (value && validators[fieldName]) {
                var validator = validators[fieldName];
                
                if (validator.pattern && !validator.pattern.test(value)) {
                    field.classList.add(field.classList.contains('c-form__input') ? 'has-error' : 'is-invalid');
                    errorElement.textContent = validator.message;
                    errorElement.style.display = 'block';
                    return false;
                }

                if (validator.minLength && value.length < validator.minLength) {
                    field.classList.add(field.classList.contains('c-form__input') ? 'has-error' : 'is-invalid');
                    errorElement.textContent = validator.message;
                    errorElement.style.display = 'block';
                    return false;
                }
            }

            return true;
        }

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            
            var inputs = form.querySelectorAll('input, textarea, select');
            for (var j = 0; j < inputs.length; j++) {
                inputs[j].addEventListener('blur', function() {
                    validateField(this);
                });

                inputs[j].addEventListener('input', function() {
                    if (this.classList.contains('is-invalid') || this.classList.contains('has-error')) {
                        validateField(this);
                    }
                });
            }

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var currentForm = this;
                var formInputs = currentForm.querySelectorAll('input, textarea, select');
                var isValid = true;

                for (var k = 0; k < formInputs.length; k++) {
                    if (!validateField(formInputs[k])) {
                        isValid = false;
                    }
                }

                if (!isValid) {
                    __app.notify('Bitte korrigieren Sie die Fehler im Formular', 'error');
                    return;
                }

                var submitBtn = currentForm.querySelector('button[type="submit"]');
                var originalText = submitBtn ? submitBtn.textContent : '';
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" style="width: 1rem; height: 1rem; border-width: 0.15em;"></span>Wird gesendet...';
                }

                setTimeout(function() {
                    __app.notify('Nachricht erfolgreich gesendet!', 'success');
                    
                    setTimeout(function() {
                        window.location.href = 'thank_you.html';
                    }, 1000);
                }, 1500);
            });
        }
    }

    function initAccordion() {
        if (__app.accordionInit) return;
        __app.accordionInit = true;

        var accordionButtons = document.querySelectorAll('.accordion-button');

        for (var i = 0; i < accordionButtons.length; i++) {
            accordionButtons[i].addEventListener('click', function() {
                var target = this.getAttribute('data-bs-target');
                var collapse = document.querySelector(target);
                var isExpanded = this.getAttribute('aria-expanded') === 'true';

                if (isExpanded) {
                    this.setAttribute('aria-expanded', 'false');
                    this.classList.add('collapsed');
                    collapse.classList.remove('show');
                } else {
                    var allButtons = document.querySelectorAll('.accordion-button');
                    var allCollapses = document.querySelectorAll('.accordion-collapse');
                    
                    for (var j = 0; j < allButtons.length; j++) {
                        allButtons[j].setAttribute('aria-expanded', 'false');
                        allButtons[j].classList.add('collapsed');
                    }
                    
                    for (var k = 0; k < allCollapses.length; k++) {
                        allCollapses[k].classList.remove('show');
                    }

                    this.setAttribute('aria-expanded', 'true');
                    this.classList.remove('collapsed');
                    collapse.classList.add('show');
                }
            });
        }
    }

    function initScrollToTop() {
        if (__app.scrollTopInit) return;
        __app.scrollTopInit = true;

        var scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '↑';
        scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
        scrollBtn.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; width: 50px; height: 50px; border-radius: 50%; background: var(--color-primary); color: white; border: none; cursor: pointer; opacity: 0; transform: translateY(100px); transition: all 0.3s ease-out; z-index: 1000; font-size: 1.5rem; box-shadow: var(--shadow-lg);';
        
        document.body.appendChild(scrollBtn);

        var handleScroll = throttle(function() {
            if (window.scrollY > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0)';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'translateY(100px)';
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        scrollBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(0) scale(1.1)';
        });

        scrollBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }

    function initMobileFlexGaps() {
        if (__app.flexGapsInit) return;
        __app.flexGapsInit = true;

        function updateFlexGaps() {
            var isMobile = window.innerWidth < 576;
            var flexElements = document.querySelectorAll('.d-flex');
            
            for (var i = 0; i < flexElements.length; i++) {
                var el = flexElements[i];
                var hasGap = el.className.match(/gap-\d+|g-\d+/);
                var hasMultipleChildren = el.children.length > 1;
                
                if (hasMultipleChildren && !hasGap) {
                    if (isMobile) {
                        el.classList.add('gap-3');
                        el.setAttribute('data-mobile-gap', 'true');
                    } else if (el.getAttribute('data-mobile-gap')) {
                        el.classList.remove('gap-3');
                        el.removeAttribute('data-mobile-gap');
                    }
                }
            }
        }

        updateFlexGaps();
        window.addEventListener('resize', debounce(updateFlexGaps, 250), { passive: true });
    }

    __app.init = function() {
        if (__app.initialized) return;
        __app.initialized = true;

        initAOS();
        initNavigation();
        initAnchors();
        initScrollSpy();
        initActiveMenu();
        initImages();
        initScrollAnimations();
        initButtonEffects();
        initCountUp();
        initForms();
        initAccordion();
        initScrollToTop();
        initMobileFlexGaps();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', __app.init);
    } else {
        __app.init();
    }

})();
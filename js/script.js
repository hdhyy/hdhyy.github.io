/**
 * Hardy Augustus Blog — Main Script (Vanilla JS, no jQuery)
 */
(function () {
  'use strict';

  // --- Utility ---
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return (ctx || document).querySelectorAll(sel); };

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', function () {

    // ========== Search ==========
    var searchWrap = $('#search-form-wrap');
    var searchBtn = $('#nav-search-btn');
    var searchInput = $('.search-form-input');
    var isSearchAnim = false;

    if (searchBtn && searchWrap && searchInput) {
      searchBtn.addEventListener('click', function () {
        if (isSearchAnim) return;
        isSearchAnim = true;
        searchWrap.classList.add('on');
        setTimeout(function () {
          searchInput.focus();
          isSearchAnim = false;
        }, 250);
      });

      searchInput.addEventListener('blur', function () {
        if (isSearchAnim) return;
        isSearchAnim = true;
        searchWrap.classList.remove('on');
        setTimeout(function () {
          isSearchAnim = false;
        }, 250);
      });
    }

    // ========== Share ==========
    document.addEventListener('click', function (e) {
      // Close all open share boxes
      var openBoxes = $$('.article-share-box.on');
      openBoxes.forEach(function (box) { box.classList.remove('on'); });

      // Share link click
      var shareLink = e.target.closest('.article-share-link');
      if (shareLink) {
        e.stopPropagation();
        var url = shareLink.getAttribute('data-url');
        var encodedUrl = encodeURIComponent(url);
        var id = 'article-share-box-' + shareLink.getAttribute('data-id');
        var box = document.getElementById(id);

        if (box) {
          box.classList.toggle('on');
        } else {
          box = document.createElement('div');
          box.id = id;
          box.className = 'article-share-box';
          box.innerHTML =
            '<input class="article-share-input" value="' + url + '" readonly>' +
            '<div class="article-share-links">' +
              '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" rel="noopener noreferrer" title="Twitter"></a>' +
              '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" rel="noopener noreferrer" title="Facebook"></a>' +
              '<a href="https://pinterest.com/pin/create/button/?url=' + encodedUrl + '" class="article-share-pinterest" target="_blank" rel="noopener noreferrer" title="Pinterest"></a>' +
            '</div>';
          document.body.appendChild(box);
          box.classList.add('on');
        }

        var rect = shareLink.getBoundingClientRect();
        box.style.top = (window.scrollY + rect.bottom + 8) + 'px';
        box.style.left = (rect.left - 80) + 'px';
        return;
      }

      // Click inside share box — don't close
      if (e.target.closest('.article-share-box')) {
        e.stopPropagation();
      }
    });

    // Select share input on click
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('article-share-input')) {
        e.target.select();
      }
    });

    // ========== Image Captions & Fancybox ==========
    $$('.article-entry').forEach(function (entry, i) {
      entry.querySelectorAll('img').forEach(function (img) {
        if (img.parentElement.classList.contains('fancybox')) return;
        var alt = img.alt || '';

        var link = document.createElement('a');
        link.href = img.src;
        link.title = alt;
        link.className = 'fancybox';
        link.setAttribute('rel', 'article' + i);
        img.parentNode.insertBefore(link, img);
        link.appendChild(img);

        if (alt) {
          var caption = document.createElement('span');
          caption.className = 'caption';
          caption.textContent = alt;
          link.parentNode.insertBefore(caption, link.nextSibling);
        }
      });
    });

    // Initialize Fancybox if available (jQuery plugin)
    if (typeof jQuery !== 'undefined' && jQuery.fn.fancybox) {
      jQuery('.fancybox').fancybox();
    }

    // ========== Mobile Navigation ==========
    var container = $('#container');
    var navToggle = $('#main-nav-toggle');
    var wrap = $('#wrap');
    var isMobileNavAnim = false;

    if (navToggle && container && wrap) {
      navToggle.addEventListener('click', function () {
        if (isMobileNavAnim) return;
        isMobileNavAnim = true;
        container.classList.toggle('mobile-nav-on');
        setTimeout(function () { isMobileNavAnim = false; }, 300);
      });

      wrap.addEventListener('click', function () {
        if (isMobileNavAnim || !container.classList.contains('mobile-nav-on')) return;
        container.classList.remove('mobile-nav-on');
      });
    }

    // ========== Back to Top ==========
    var backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.setAttribute('title', 'Back to top');
    document.body.appendChild(backToTop);

    var scrollThreshold = 400;
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > scrollThreshold) {
            backToTop.classList.add('visible');
          } else {
            backToTop.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

  });
})();

/**
 * AFTBot Website Embed Script
 * Apex Falcon Technologies - AI Website Lead Generation & Qualification System
 * 
 * Usage in your existing Angular website (https://apexfalcontechnologies.com):
 * Add this script to index.html or your main layout before </body>:
 * 
 * <script 
 *   src="https://<YOUR_BOT_UI_HOST>/aftbot-embed.js" 
 *   data-widget-url="https://<YOUR_BOT_UI_HOST>/widget"
 *   data-api-url="https://<YOUR_BOT_API_HOST>/api"
 *   defer>
 * </script>
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__AFTBOT_EMBED_INITIALIZED__) return;
  window.__AFTBOT_EMBED_INITIALIZED__ = true;

  // Find the current script tag
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Retrieve configuration from data attributes or defaults
  var widgetBaseUrl = (currentScript && currentScript.getAttribute('data-widget-url')) || 'http://localhost:4200/widget';
  var apiBaseUrl = (currentScript && currentScript.getAttribute('data-api-url')) || 'http://localhost:5000/api';

  // Construct iframe src with apiUrl query parameter
  var iframeSrc = widgetBaseUrl + (widgetBaseUrl.indexOf('?') === -1 ? '?' : '&') + 'apiUrl=' + encodeURIComponent(apiBaseUrl);

  // Create iframe container (starts compact so website interaction is completely unobstructed)
  var container = document.createElement('div');
  container.id = 'aftbot-embed-root';
  container.style.cssText = [
    'position: fixed',
    'bottom: 0',
    'right: 0',
    'width: 100px',
    'height: 100px',
    'max-width: 100vw',
    'max-height: 100vh',
    'z-index: 9999999',
    'overflow: hidden',
    'border: none',
    'background: transparent',
    'transition: width 0.25s ease, height 0.25s ease'
  ].join(';');

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.id = 'aftbot-iframe';
  iframe.title = 'AFTBot - Apex Falcon Technologies';
  iframe.style.cssText = [
    'width: 100%',
    'height: 100%',
    'border: none',
    'background: transparent'
  ].join(';');

  iframe.setAttribute('allow', 'clipboard-write');

  container.appendChild(iframe);

  // Listen for state changes (open/close) from the widget
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'AFTBOT_STATE_CHANGED') return;

    if (event.data.isOpen) {
      // Expanded chat window
      container.style.width = '440px';
      container.style.height = '660px';
    } else {
      // Collapsed floating button
      container.style.width = '100px';
      container.style.height = '100px';
    }
  });

  function mount() {
    if (document.body) {
      document.body.appendChild(container);
    } else {
      window.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(container);
      });
    }
  }

  mount();
})();


export const sanitizeGeneratedCode = (html: string): string => {
  if (!html) return "";
  
  let sanitized = html;

  // 1. Shadowing & Protection preamble
  const shadowPreamble = `<script>
    (function() {
      // 1. Suppress specific irritating errors and logs
      const _warn = console.warn;
      const _error = console.error;
      
      console.warn = function(...args) {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('[vite]') || args[0].includes('socket') || args[0].includes('fetch'))) return;
        _warn.apply(console, args);
      };

      console.error = function(...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('fetch') && args[0].includes('getter')) {
          _warn.call(console, "Mentari Guard: Prevented window.fetch overwrite attempt.");
          return;
        }
        _error.apply(console, args);
      };

      // 2. Global fetch shadowing and protection
      try {
        const originalFetch = window.fetch;
        window.__original_fetch = originalFetch.bind(window);
        
        // Use a Proxy-like behavior for Object.assign to filter out 'fetch' keys when target is window
        const originalAssign = Object.assign;
        Object.assign = function(target, ...sources) {
          try {
            if (target && (target === window || target === self || target === globalThis)) {
              const modifiedSources = sources.map(source => {
                if (source && typeof source === 'object' && 'fetch' in source) {
                  const clean = { ...source };
                  clean.__blocked_fetch = source.fetch;
                  delete clean.fetch;
                  return clean;
                }
                return source;
              });
              return originalAssign.apply(Object, [target, ...modifiedSources]);
            }
          } catch(e) {}
          return originalAssign.apply(Object, [target, ...sources]);
        };

        // Also protect Object.defineProperty
        const originalDefineProperty = Object.defineProperty;
        Object.defineProperty = function(obj, prop, descriptor) {
          try {
            if (obj && (obj === window || obj === self || obj === globalThis) && prop === 'fetch') {
              return originalDefineProperty.call(Object, obj, '__blocked_fetch', descriptor);
            }
          } catch(e) {}
          return originalDefineProperty.call(Object, obj, prop, descriptor);
        };

        // Protect Reflect operations
        if (typeof Reflect !== 'undefined') {
          const originalReflectSet = Reflect.set;
          Reflect.set = function(target, prop, value, receiver) {
            if (target && (target === window || target === self || target === globalThis) && prop === 'fetch') {
              return originalReflectSet.call(Reflect, target, '__blocked_fetch', value, receiver);
            }
            return originalReflectSet.call(Reflect, target, prop, value, receiver);
          };

          const originalReflectDefineProperty = Reflect.defineProperty;
          Reflect.defineProperty = function(target, prop, attributes) {
            if (target && (target === window || target === self || target === globalThis) && prop === 'fetch') {
              return originalReflectDefineProperty.call(Reflect, target, '__blocked_fetch', attributes);
            }
            return originalReflectDefineProperty.call(Reflect, target, prop, attributes);
          };
        }
      } catch(e) {}

      window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('fetch') && (e.message.includes('getter') || e.message.includes('read-only'))) {
          e.preventDefault();
          return true;
        }
      }, true);
    })();
    
    // Declare local fetch to capture bare assignments like 'fetch = ...'
    var fetch = window.fetch;
    var __blocked_fetch = window.fetch;
  </script>`;

  // Inject at the very beginning of the HTML to ensure it runs before other scripts
  // If there's a <!DOCTYPE html>, inject after it.
  if (sanitized.toLowerCase().includes('<!doctype html>')) {
    sanitized = sanitized.replace(/<!doctype html>/i, '$&' + shadowPreamble);
  } else if (sanitized.toLowerCase().includes('<html>')) {
    sanitized = sanitized.replace(/<html>/i, '$&' + shadowPreamble);
  } else if (sanitized.toLowerCase().includes('<head>')) {
    sanitized = sanitized.replace(/<head>/i, '$&' + shadowPreamble);
  } else {
    sanitized = shadowPreamble + sanitized;
  }

  // 2. Rename all HTML attributes that cause automatic window property shadowing
  // e.g., <div id="fetch"> or <form name="fetch"> creates window.fetch which conflicts with native fetch.
  sanitized = sanitized.replace(/\b(id|name)\s*=\s*(['"]?)fetch\b\2/gi, '$1=$2__blocked_fetch$2');

  // 3. Prevent direct assignments to 'fetch' and 'window.fetch'
  
  // 3a. Explicit global assignments: window.fetch = ..., self.fetch = ...
  const globalObjects = '(window|self|globalThis|parent|top|this|frames)';
  // Robust regex for window . fetch = ...
  sanitized = sanitized.replace(new RegExp(`\\b${globalObjects}\\s*\\.\\s*fetch\\s*=[^=]`, 'g'), '$1.__blocked_fetch =');
  sanitized = sanitized.replace(new RegExp(`\\b${globalObjects}\\s*\\[\\s*['"]fetch['"]\\s*\\]\\s*=[^=]`, 'g'), '$1["__blocked_fetch"] =');
  
  // 3b. Bare assignments: fetch = ...
  // Uses positive lookahead to find assignments
  sanitized = sanitized.replace(/(^|[^.\w])fetch\s*=[^=]/g, '$1__blocked_fetch =');

  // 4. Broad stroke for any object property assignment named fetch
  sanitized = sanitized.replace(/\.fetch\s*(?==[^=])/g, '.__blocked_fetch');
  sanitized = sanitized.replace(/\[\s*['"]fetch['"]\s*\]\s*(?==[^=])/g, '["__blocked_fetch"]');

  // 5. Declarations that shadow global fetch
  sanitized = sanitized.replace(/\b(var|let|const)\s+fetch\b/g, '$1 __blocked_fetch');
  sanitized = sanitized.replace(/\b(async\s+)?function\s+fetch\b/g, '$1function __blocked_fetch');

  // 6. Destructuring
  sanitized = sanitized.replace(/\{\s*([^}]*)\bfetch\b([^}]*)\}\s*=/g, '{ $1__blocked_fetch$2 } =');

  // 7. Event handlers in HTML (onclick="fetch=...")
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(['"])(.*?)\bfetch(\s*=[^=])(.*?)\1/gi, (match, quote, before, assign, after) => {
    return match.replace(/\bfetch(\s*=[^=])/, '__blocked_fetch$1');
  });

  // 8. Handle Object.defineProperty and Reflect.set
  sanitized = sanitized.replace(/Object\.(defineProperty|defineProperties)\s*\(\s*[^,]+,\s*['"]fetch['"]/g, (match) => match.replace('fetch', '__blocked_fetch'));
  sanitized = sanitized.replace(/Reflect\.set\s*\(\s*[^,]+,\s*['"]fetch['"]/g, (match) => match.replace('fetch', '__blocked_fetch'));
  
  // 9. Object.assign protection
  sanitized = sanitized.replace(/Object\.assign\s*\(\s*(window|self|globalThis|this|parent|top|self)\s*,\s*\{(?:[^{}]*)\bfetch\b/g, (match) => match.replace('fetch', '__blocked_fetch'));

  // 9. Remove attempts to load external fetch polyfills which might try to overwrite the native one
  sanitized = sanitized.replace(/<script[^>]*src=[^>]*(fetch|mock)[^>]*><\/script>/gi, '<!-- script removed by sanitizer -->');

  return sanitized;
};



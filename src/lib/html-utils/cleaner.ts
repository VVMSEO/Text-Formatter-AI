import DOMPurify from 'dompurify';

export const cleanHTML = (html: string, preset: 'word' | 'cms' | 'all-formatting' | 'semantic' | 'table'): string => {
  let cleaned = html;

  // Initial sanitization
  cleaned = DOMPurify.sanitize(cleaned, {
    ALLOW_UNKNOWN_PROTOCOLS: true,
    WHOLE_DOCUMENT: false,
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');

  if (preset === 'all-formatting') {
    const all = doc.body.querySelectorAll('*');
    all.forEach(el => {
      el.removeAttribute('style');
      el.removeAttribute('class');
      el.removeAttribute('id');
    });
  }

  if (preset === 'word' || preset === 'cms') {
    // Remove specific junk tags and comments
    const tagsToRemove = ['span', 'font', 'o:p', 'st1:personname', 'xml'];
    tagsToRemove.forEach(tag => {
      const elements = doc.body.querySelectorAll(tag);
      elements.forEach(el => {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        parent?.removeChild(el);
      });
    });

    // Remove empty tags (except br and img)
    const all = doc.body.querySelectorAll('*');
    all.forEach(el => {
      if (el.innerHTML.trim() === '' && !['BR', 'IMG', 'HR', 'IFRAME'].includes(el.tagName)) {
        el.parentNode?.removeChild(el);
      }
      el.removeAttribute('style');
      el.removeAttribute('class');
      el.removeAttribute('id');
    });
  }

  if (preset === 'semantic') {
    // Convert generic divs to sections or articles if they have specific meaning
    // (In this simple version, we just remove junk and keep semantic tags like p, h, ul, li)
    const tagsToKeep = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'strong', 'b', 'em', 'i', 'a', 'img', 'br'];
    const all = doc.body.querySelectorAll('*');
    all.forEach(el => {
      if (!tagsToKeep.includes(el.tagName.toLowerCase())) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
      } else {
        el.removeAttribute('style');
        el.removeAttribute('class');
        el.removeAttribute('id');
      }
    });

    // Merge adjacent identical tags (e.g., strong following strong)
    // This is more complex, leaving basic version for now
  }

  // Remove double spaces and non-breaking spaces if needed
  let result = doc.body.innerHTML;
  
  // Basic normalization
  result = result.replace(/&nbsp;/g, ' ');
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/<p>\s*<\/p>/g, '');

  return result;
};

export const transformStrong = (html: string, action: 'remove' | 'to-b' | 'b-to-strong'): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  if (action === 'remove') {
    const elements = doc.body.querySelectorAll('strong, b');
    elements.forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
    });
  } else if (action === 'to-b') {
    const elements = doc.body.querySelectorAll('strong');
    elements.forEach(el => {
      const b = doc.createElement('b');
      b.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(b, el);
    });
  } else if (action === 'b-to-strong') {
    const elements = doc.body.querySelectorAll('b');
    elements.forEach(el => {
      const strong = doc.createElement('strong');
      strong.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(strong, el);
    });
  }

  return doc.body.innerHTML;
};

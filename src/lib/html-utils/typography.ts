export const applyTypography = (text: string): string => {
  let result = text;

  // Quotes
  result = result.replace(/"([^"]+)"/g, '«$1»'); // Russian style quotes by default
  
  // Dashes
  result = result.replace(/ - /g, ' — '); // long dash
  result = result.replace(/(\d)-(\d)/g, '$1–$2'); // range dash

  // Spaces around punctuation
  result = result.replace(/\s+([.,!?;:])/g, '$1');
  result = result.replace(/([.,!?;:])(?=[^\s\d])/g, '$1 ');

  // Double spaces
  result = result.replace(/  +/g, ' ');

  // Non-breaking spaces after short words (prepositions etc)
  const shortWords = [' в ', ' и ', ' к ', ' о ', ' с ', ' у ', ' а ', ' но ', ' от ', ' на ', ' из ', ' по ', ' за ', ' до '];
  shortWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, word.replace(' ', '') + '\u00A0');
  });

  return result;
};

export const applyTypographyToHTML = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = applyTypography(node.nodeValue || '');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Don't modify content of these tags
      if (['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(node.nodeName)) return;
      
      for (let i = 0; i < node.childNodes.length; i++) {
        walk(node.childNodes[i]);
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
};

import React from 'react';

/**
 * Format inline markdown like **bold**, *italic*, and [link](url)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Pattern to match bold (**text**), italic (*text*), and links ([text](url))
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/;

  while (remaining.length > 0) {
    const match = remaining.match(regex);
    if (!match || match.index === undefined) {
      parts.push(remaining);
      break;
    }

    if (match.index > 0) {
      parts.push(remaining.substring(0, match.index));
    }

    const matchedStr = match[0];

    // Link: [label](url)
    if (matchedStr.startsWith('[') && matchedStr.includes('](')) {
      const linkMatch = matchedStr.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={keyIndex++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(matchedStr);
      }
    }
    // Bold: **text**
    else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      parts.push(
        <strong key={keyIndex++} className="font-bold text-slate-900">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    }
    // Italic: *text*
    else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      parts.push(
        <em key={keyIndex++} className="italic text-slate-600">
          {matchedStr.slice(1, -1)}
        </em>
      );
    } else {
      parts.push(matchedStr);
    }

    remaining = remaining.substring(match.index + matchedStr.length);
  }

  return parts.length === 1 ? parts[0] : <React.Fragment>{parts}</React.Fragment>;
}

/**
 * Renders multi-paragraph Markdown content including headings, images, blockquotes, and lists
 */
export function renderMarkdownBlocks(content: string): React.ReactNode {
  if (!content) return null;

  const paragraphs = content.split('\n\n');

  return paragraphs.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Heading 1 (# Heading)
    if (trimmed.startsWith('# ')) {
      const text = trimmed.replace('# ', '').trim();
      return (
        <h1
          key={index}
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight pt-6 pb-2"
        >
          {text}
        </h1>
      );
    }

    // Heading 2 (## Heading)
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace('## ', '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return (
        <h2
          key={index}
          id={id}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-6 pb-2"
        >
          {text}
        </h2>
      );
    }

    // Heading 3 (### Heading)
    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace('### ', '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return (
        <h3
          key={index}
          id={id}
          className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-4 pb-1"
        >
          {text}
        </h3>
      );
    }

    // Blockquote (> Quote)
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-red-500 bg-red-50/40 dark:bg-slate-800/40 pl-5 pr-4 py-3 italic text-slate-800 rounded-r-2xl my-6"
        >
          {renderInlineMarkdown(trimmed.replace(/^>\s*/gm, ''))}
        </blockquote>
      );
    }

    // Image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      return (
        <figure key={index} className="my-8">
          <img
            src={src}
            alt={alt || 'Article visual'}
            className="w-full rounded-2xl border border-slate-200 shadow-sm object-cover max-h-[550px]"
            loading="lazy"
          />
          {alt && alt !== 'image' && alt !== 'Image' && alt !== 'Article visual' && (
            <figcaption className="mt-2.5 text-center text-xs text-slate-500 italic font-sans">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    // Image with optional caption underneath or mixed block
    if (trimmed.includes('![') && trimmed.includes('](')) {
      const lines = trimmed.split('\n');
      return (
        <div key={index} className="my-6 space-y-3">
          {lines.map((line, lineIdx) => {
            const singleImg = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
            if (singleImg) {
              const alt = singleImg[1];
              const src = singleImg[2];
              return (
                <figure key={lineIdx} className="my-4">
                  <img
                    src={src}
                    alt={alt || 'Article visual'}
                    className="w-full rounded-2xl border border-slate-200 shadow-sm object-cover max-h-[550px]"
                    loading="lazy"
                  />
                  {alt && alt !== 'image' && alt !== 'Image' && (
                    <figcaption className="mt-2 text-center text-xs text-slate-500 italic">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              );
            }
            if (line.trim().startsWith('*') && line.trim().endsWith('*') && !line.trim().startsWith('**')) {
              return (
                <p key={lineIdx} className="text-center text-xs text-slate-500 italic -mt-1 mb-3">
                  {line.trim().slice(1, -1)}
                </p>
              );
            }
            return (
              <p key={lineIdx} className="text-slate-700 leading-relaxed font-normal">
                {renderInlineMarkdown(line.trim())}
              </p>
            );
          })}
        </div>
      );
    }

    // Standalone italic caption: *caption text*
    if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
      return (
        <p key={index} className="text-center text-xs text-slate-500 italic -mt-3 mb-6">
          {trimmed.slice(1, -1)}
        </p>
      );
    }

    // Bulleted list (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
      return (
        <ul key={index} className="list-disc list-inside space-y-2 text-slate-700 my-4 pl-2">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="leading-relaxed">
              {renderInlineMarkdown(item.replace(/^[-*]\s+/, ''))}
            </li>
          ))}
        </ul>
      );
    }

    // Standard paragraph
    return (
      <p key={index} className="text-slate-700 leading-relaxed font-normal">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });
}

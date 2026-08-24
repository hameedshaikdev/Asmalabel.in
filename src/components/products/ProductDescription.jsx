import { useMemo } from 'react';

/**
 * ProductDescription
 * Smartly formats product descriptions with auto-spacing, distinct section headings,
 * and clean bullet points without altering underlying database text.
 */
export default function ProductDescription({ description, className = '' }) {
  const formattedSections = useMemo(() => {
    if (!description || typeof description !== 'string') return [];

    // Normalize Windows/Mac line endings
    const normalized = description.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!normalized) return [];

    // Split by double newlines or single newlines with grouping
    const lines = normalized.split('\n');
    const sections = [];
    let currentParagraph = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.join('\n'),
        });
        currentParagraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty line -> flush paragraph to create spacing
      if (!line) {
        flushParagraph();
        continue;
      }

      // Check if it's a section heading:
      // 1. ALL CAPS line with at least 3 characters and no ending period (e.g. "KEY FEATURES", "PRODUCT SPECIFICATIONS")
      // 2. OR ends with a colon ":"
      const isHeading =
        (line.length >= 3 && line === line.toUpperCase() && /^[A-Z0-9\s/&–\-]+$/.test(line) && !line.startsWith('•') && !line.startsWith('-')) ||
        (line.endsWith(':') && line.length < 50 && !line.includes('•') && !line.includes('-'));

      if (isHeading) {
        flushParagraph();
        sections.push({
          type: 'heading',
          content: line,
        });
        continue;
      }

      // Check if it's a bullet point (starts with •, -, *, ✔, ✓, ★, or digit + .)
      const isBullet = /^[•\-*✔✓★]\s*/.test(line) || /^\d+\.\s+/.test(line);

      if (isBullet) {
        flushParagraph();
        // Check if previous section is a bullet list, append to it; otherwise start a new list
        const cleanBulletText = line.replace(/^[•\-*✔✓★]\s*/, '').replace(/^\d+\.\s+/, '');
        const lastSection = sections[sections.length - 1];
        if (lastSection && lastSection.type === 'list') {
          lastSection.items.push(cleanBulletText);
        } else {
          sections.push({
            type: 'list',
            items: [cleanBulletText],
          });
        }
        continue;
      }

      // Check if it's a spec line like "Brand: Jupiter" or "Size: 11 Inch"
      const specMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (specMatch && specMatch[1].length < 25) {
        flushParagraph();
        const lastSection = sections[sections.length - 1];
        if (lastSection && lastSection.type === 'specs') {
          lastSection.items.push({ label: specMatch[1].trim(), value: specMatch[2].trim() });
        } else {
          sections.push({
            type: 'specs',
            items: [{ label: specMatch[1].trim(), value: specMatch[2].trim() }],
          });
        }
        continue;
      }

      // Otherwise, add to current paragraph
      currentParagraph.push(line);
    }

    flushParagraph();
    return sections;
  }, [description]);

  if (!description) return null;

  return (
    <div className={`pd-formatted-description ${className}`} style={{
      color: '#334155',
      fontSize: '13.5px',
      lineHeight: 1.7,
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
    }}>
      {formattedSections.map((section, idx) => {
        if (section.type === 'heading') {
          return (
            <h4
              key={idx}
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                margin: idx === 0 ? '0 0 10px 0' : '20px 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '4px', height: '14px', background: '#0F172A', borderRadius: '2px', display: 'inline-block' }} />
              {section.content}
            </h4>
          );
        }

        if (section.type === 'list') {
          return (
            <ul
              key={idx}
              style={{
                margin: '0 0 16px 0',
                paddingLeft: '18px',
                listStyleType: 'disc',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ color: '#334155', lineHeight: 1.6 }}>
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (section.type === 'specs') {
          return (
            <div
              key={idx}
              style={{
                margin: '0 0 16px 0',
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{ display: 'flex', gap: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0F172A', minWidth: '80px' }}>{item.label}:</strong>
                  <span style={{ color: '#475569' }}>{item.value}</span>
                </div>
              ))}
            </div>
          );
        }

        return (
          <p
            key={idx}
            style={{
              margin: '0 0 14px 0',
              whiteSpace: 'pre-line',
              lineHeight: 1.7,
              color: '#334155',
            }}
          >
            {section.content}
          </p>
        );
      })}
    </div>
  );
}

interface TextSegment {
  type: 'text';
  content: string;
}

interface ListItemSegment {
  type: 'list-item';
  num: string;
  label: string | null;
  desc: string;
  color: string | null;
}

export type AISegment = TextSegment | ListItemSegment;

const TICKET_COLORS: Record<string, string> = {
  Epic: '#9F7AEA',
  Story: '#48BB78',
  Bug: '#F56565',
  Task: '#4299E1',
  Spike: '#ECC94B',
};

const CEREMONY_COLORS: Record<string, string> = {
  'Daily Standup': '#48BB78',
  'Sprint Planning': '#4299E1',
  'Sprint Retro': '#9F7AEA',
  'Dept Sprint Sync': '#ECC94B',
};

export function parseAIResponse(text: string): AISegment[] {
  const segments: AISegment[] = [];
  const lines = text.split('\n').filter((l) => l.trim());
  let currentGroup: string[] = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) {
      segments.push({ type: 'text', content: currentGroup.join(' ') });
      currentGroup = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      flushGroup();
      const body = numMatch[2];
      const colonIdx = body.indexOf(':');
      if (colonIdx > 0 && colonIdx < 40) {
        const label = body.substring(0, colonIdx).trim();
        const desc = body.substring(colonIdx + 1).trim();
        const color = TICKET_COLORS[label] ?? CEREMONY_COLORS[label] ?? null;
        segments.push({ type: 'list-item', num: numMatch[1], label, desc, color });
      } else {
        segments.push({
          type: 'list-item',
          num: numMatch[1],
          label: null,
          desc: body,
          color: null,
        });
      }
    } else {
      currentGroup.push(trimmed);
    }
  }
  flushGroup();
  return segments;
}

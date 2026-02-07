
export function getDaysAgo(timestamp: string): number {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatLastLogged(timestamp: string | undefined): string {
  if (!timestamp) {
    return 'Never logged';
  }

  const daysAgo = getDaysAgo(timestamp);

  if (daysAgo === 0) {
    return 'Last logged: today';
  } else if (daysAgo === 1) {
    return 'Last logged: 1 day ago';
  } else {
    return `Last logged: ${daysAgo} days ago`;
  }
}

export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr} at ${timeStr}`;
}

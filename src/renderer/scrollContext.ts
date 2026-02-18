export function resolveScrollablePreviewShell(rootElement: HTMLElement): HTMLElement | null {
  const previewShell = rootElement.closest(".preview-shell") as HTMLElement | null;
  if (!previewShell) return null;

  const style = window.getComputedStyle(previewShell);
  const overflowY = style.overflowY || style.overflow;
  const canScroll = overflowY === "auto" || overflowY === "scroll";
  const hasScrollableContent = previewShell.scrollHeight - previewShell.clientHeight > 1;
  return canScroll && hasScrollableContent ? previewShell : null;
}

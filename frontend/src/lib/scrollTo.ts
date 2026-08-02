export function scrollToSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function navigateAndScroll(
  sectionId: string,
  navigate: (path: string) => void,
  currentPath: string,
): void {
  if (currentPath === '/') {
    scrollToSection(sectionId);
  } else {
    navigate('/');
    setTimeout(() => scrollToSection(sectionId), 150);
  }
}

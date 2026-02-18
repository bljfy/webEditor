import type { PageConfig } from "./pageConfig";

export type DerivedNavItem = {
  id: string;
  label: string;
};

function stripLeadingOrder(text: string): string {
  return text.replace(/^\s*\d+\s*[.、-]?\s*/, "").trim();
}

export function formatNavLabel(title: string, navLabel: string | undefined, order: number): string {
  const source = navLabel?.trim() ? navLabel : title;
  const base = stripLeadingOrder(source) || `区块 ${order}`;
  return `${String(order).padStart(2, "0")} ${base}`;
}

export function deriveNavItemsFromSections(sections: PageConfig["sections"]): DerivedNavItem[] {
  return sections
    .filter((section) => section.includeInNav !== false)
    .map((section, index) => ({
      id: section.id,
      label: formatNavLabel(section.title ?? "", section.navLabel, index + 1)
    }));
}

export function syncNavFromSections(config: PageConfig): PageConfig {
  const next = structuredClone(config);
  next.sections = next.sections.map((section, index) => ({
    ...section,
    id: section.id?.trim() || `section-${index + 1}`
  }));

  next.nav.items = deriveNavItemsFromSections(next.sections).map((item) => ({
    id: item.id,
    label: item.label
  }));

  return next;
}

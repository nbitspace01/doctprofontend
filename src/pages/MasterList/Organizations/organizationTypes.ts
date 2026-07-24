/**
 * The master-list organisation types that share one set of pages.
 *
 * Adding a fourth type is one entry here plus a route and a sidebar link — the
 * list, modal and drawer are all driven by this config. Hospitals and clinics
 * keep their own pages and are deliberately not listed here.
 */
export const ORGANIZATION_TYPES = {
  pharmacy: {
    /** Singular, used in headings, buttons and confirmations. */
    label: "Pharmacy",
    /** Plural, used in the list title and the sidebar. */
    pluralLabel: "Pharmacies",
    /** React Query cache key, kept distinct so one type's list never shows another's. */
    queryKey: "pharmacy",
    /** Report file name stem for the table download. */
    reportName: "pharmacy",
  },
  laboratory: {
    label: "Laboratory",
    pluralLabel: "Laboratories",
    queryKey: "laboratory",
    reportName: "laboratory",
  },
  "pharma-manufacturer": {
    label: "Pharma Manufacturer",
    pluralLabel: "Pharma Manufacturers",
    queryKey: "pharma-manufacturer",
    reportName: "pharma-manufacturer",
  },
} as const;

export type OrganizationTypeSlug = keyof typeof ORGANIZATION_TYPES;

export type OrganizationTypeConfig =
  (typeof ORGANIZATION_TYPES)[OrganizationTypeSlug];

export const getOrganizationType = (
  slug: OrganizationTypeSlug,
): OrganizationTypeConfig => ORGANIZATION_TYPES[slug];

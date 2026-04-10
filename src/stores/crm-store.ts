import { create } from "zustand";
import type {
  Deal,
  Contact,
  CrmTask,
  SmartlyQProject,
  ContentItem,
} from "@/lib/crm-data";
import {
  MOCK_DEALS,
  MOCK_CONTACTS,
  MOCK_TASKS,
} from "@/lib/crm-data";

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface CrmState {
  deals: Deal[];
  contacts: Contact[];
  tasks: CrmTask[];

  // Derived — projects extracted from deals that have one
  projects: SmartlyQProject[];

  // Deal actions
  createDeal: (deal: Deal) => void;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  attachProjectToDeal: (dealId: string, project: SmartlyQProject) => void;

  // Project actions (syncs back to the owning deal)
  createProject: (project: SmartlyQProject, dealId?: string) => void;
  updateProject: (id: string, patch: Partial<SmartlyQProject>) => void;
  deleteProject: (id: string) => void;

  // Content-item actions (operate on a project inside a deal)
  addContentItem: (projectId: string, item: ContentItem) => void;
  removeContentItem: (projectId: string, itemId: string) => void;
  updateContentItemStatus: (
    projectId: string,
    itemId: string,
    status: ContentItem["status"],
  ) => void;

  // Contact actions
  createContact: (contact: Contact) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Task actions
  createTask: (task: CrmTask) => void;
  updateTask: (id: string, patch: Partial<CrmTask>) => void;
  deleteTask: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract all non-undefined projects from the deals array. */
function extractProjects(deals: Deal[]): SmartlyQProject[] {
  return deals.reduce<SmartlyQProject[]>((acc, d) => {
    if (d.project) acc.push(d.project);
    return acc;
  }, []);
}

/**
 * When a project is mutated we need to propagate the change into the deal
 * that owns it (if any).
 */
function syncProjectToDeals(
  deals: Deal[],
  projectId: string,
  updater: (p: SmartlyQProject) => SmartlyQProject,
): Deal[] {
  return deals.map((d) => {
    if (d.project?.id === projectId) {
      return { ...d, project: updater(d.project) };
    }
    return d;
  });
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCrmStore = create<CrmState>((set) => ({
  deals: MOCK_DEALS,
  contacts: MOCK_CONTACTS,
  tasks: MOCK_TASKS,
  projects: extractProjects(MOCK_DEALS),

  // -- Deals ----------------------------------------------------------------

  createDeal: (deal) =>
    set((s) => {
      const deals = [...s.deals, deal];
      return { deals, projects: extractProjects(deals) };
    }),

  updateDeal: (id, patch) =>
    set((s) => {
      const deals = s.deals.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      );
      return { deals, projects: extractProjects(deals) };
    }),

  attachProjectToDeal: (dealId, project) =>
    set((s) => {
      const deals = s.deals.map((d) =>
        d.id === dealId ? { ...d, project } : d,
      );
      return { deals, projects: extractProjects(deals) };
    }),

  // -- Projects -------------------------------------------------------------

  createProject: (project, dealId) =>
    set((s) => {
      let deals = s.deals;
      if (dealId) {
        deals = deals.map((d) =>
          d.id === dealId ? { ...d, project } : d,
        );
      }
      return { deals, projects: extractProjects(deals) };
    }),

  updateProject: (id, patch) =>
    set((s) => {
      const deals = syncProjectToDeals(s.deals, id, (p) => ({
        ...p,
        ...patch,
      }));
      return { deals, projects: extractProjects(deals) };
    }),

  deleteProject: (id) =>
    set((s) => {
      const deals = s.deals.map((d) =>
        d.project?.id === id ? { ...d, project: undefined } : d,
      );
      return { deals, projects: extractProjects(deals) };
    }),

  // -- Content items --------------------------------------------------------

  addContentItem: (projectId, item) =>
    set((s) => {
      const deals = syncProjectToDeals(s.deals, projectId, (p) => ({
        ...p,
        items: [...p.items, item],
      }));
      return { deals, projects: extractProjects(deals) };
    }),

  removeContentItem: (projectId, itemId) =>
    set((s) => {
      const deals = syncProjectToDeals(s.deals, projectId, (p) => ({
        ...p,
        items: p.items.filter((i) => i.id !== itemId),
      }));
      return { deals, projects: extractProjects(deals) };
    }),

  updateContentItemStatus: (projectId, itemId, status) =>
    set((s) => {
      const deals = syncProjectToDeals(s.deals, projectId, (p) => ({
        ...p,
        items: p.items.map((i) =>
          i.id === itemId ? { ...i, status } : i,
        ),
      }));
      return { deals, projects: extractProjects(deals) };
    }),

  // -- Contacts -------------------------------------------------------------

  createContact: (contact) =>
    set((s) => ({ contacts: [...s.contacts, contact] })),

  updateContact: (id, patch) =>
    set((s) => ({
      contacts: s.contacts.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })),

  deleteContact: (id) =>
    set((s) => ({
      contacts: s.contacts.filter((c) => c.id !== id),
    })),

  // -- Tasks ----------------------------------------------------------------

  createTask: (task) =>
    set((s) => ({ tasks: [...s.tasks, task] })),

  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, ...patch } : t,
      ),
    })),

  deleteTask: (id) =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
    })),
}));

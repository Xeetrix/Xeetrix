import { contacts, financeEntries, healthEntries, meetings, memoryItems, type LifeProject } from './shaikh-os-memory';

export type RelationshipEntityType =
  | 'project'
  | 'task'
  | 'meeting'
  | 'reminder'
  | 'contact'
  | 'note'
  | 'idea'
  | 'decision'
  | 'health_log'
  | 'finance_log'
  | 'personal';

export type Relationship = {
  id: string;
  source_type: RelationshipEntityType;
  source_id: string;
  target_type: RelationshipEntityType;
  target_id: string;
  relationship_type: string;
  created_at: string;
};

export type RelatedItem = {
  id: string;
  type: RelationshipEntityType;
  title: string;
  detail: string;
  href: string;
  relationshipType: string;
};

type EntityDescriptor = Omit<RelatedItem, 'relationshipType'>;

const createdAt = '2026-06-13T00:00:00+06:00';
const projectIds: LifeProject[] = ['KNLTC', 'Islamic School', 'Xeetrix', 'Investment', 'Personal', 'General'];

export const relationships: Relationship[] = [
  ...memoryItems.map((item) => ({
    id: `rel-${item.id}-project`,
    source_type: item.intent as RelationshipEntityType,
    source_id: item.id,
    target_type: item.project === 'Personal' ? 'personal' : 'project' as RelationshipEntityType,
    target_id: item.project,
    relationship_type: item.intent === 'task' ? 'belongs_to' : item.intent === 'finance_log' ? 'allocated_to' : 'context_for',
    created_at: item.createdAt,
  })),
  ...meetings.map((meeting) => ({
    id: `rel-${meeting.id}-project`,
    source_type: 'meeting' as RelationshipEntityType,
    source_id: meeting.id,
    target_type: 'project' as RelationshipEntityType,
    target_id: meeting.project,
    relationship_type: 'reviews',
    created_at: meeting.date,
  })),
  ...meetings.flatMap((meeting) => meeting.participants.map((participant) => {
    const contact = contacts.find((item) => item.name === participant);
    return {
      id: `rel-${meeting.id}-${contact?.id ?? participant.toLowerCase().replaceAll(' ', '-')}`,
      source_type: 'meeting' as RelationshipEntityType,
      source_id: meeting.id,
      target_type: 'contact' as RelationshipEntityType,
      target_id: contact?.id ?? participant,
      relationship_type: 'includes',
      created_at: meeting.date,
    };
  })),
  ...contacts.flatMap((contact) => contact.projects.map((project) => ({
    id: `rel-${contact.id}-${project}`,
    source_type: 'contact' as RelationshipEntityType,
    source_id: contact.id,
    target_type: project === 'Personal' ? 'personal' : 'project' as RelationshipEntityType,
    target_id: project,
    relationship_type: 'stakeholder_for',
    created_at: createdAt,
  }))),
  ...healthEntries.map((entry) => ({
    id: `rel-${entry.id}-personal`,
    source_type: 'health_log' as RelationshipEntityType,
    source_id: entry.id,
    target_type: 'personal' as RelationshipEntityType,
    target_id: 'Personal',
    relationship_type: 'wellbeing_signal',
    created_at: `${entry.date}T08:00:00+06:00`,
  })),
  ...financeEntries.map((entry) => ({
    id: `rel-${entry.id}-${entry.category}`,
    source_type: 'finance_log' as RelationshipEntityType,
    source_id: entry.id,
    target_type: entry.category === 'Personal' ? 'personal' : 'project' as RelationshipEntityType,
    target_id: entry.category,
    relationship_type: 'allocated_to',
    created_at: `${entry.date}T18:00:00+06:00`,
  })),
];

export function getRelatedItems(type: RelationshipEntityType, id: string): RelatedItem[] {
  const direct = relationships.filter((relationship) => relationship.source_type === type && relationship.source_id === id);
  const inverse = relationships.filter((relationship) => relationship.target_type === type && relationship.target_id === id);
  const sharedContext = direct.flatMap((context) =>
    relationships.filter((relationship) =>
      relationship.target_type === context.target_type &&
      relationship.target_id === context.target_id &&
      !(relationship.source_type === type && relationship.source_id === id),
    ),
  );

  return [...direct, ...inverse, ...sharedContext]
    .map((relationship) => {
      const relatedType = relationship.source_type === type && relationship.source_id === id ? relationship.target_type : relationship.source_type;
      const relatedId = relationship.source_type === type && relationship.source_id === id ? relationship.target_id : relationship.source_id;
      const entity = describeEntity(relatedType, relatedId);
      return entity ? { ...entity, relationshipType: relationship.relationship_type } : null;
    })
    .filter((item): item is RelatedItem => Boolean(item))
    .filter((item, index, all) => all.findIndex((candidate) => candidate.type === item.type && candidate.id === item.id) === index);
}

export function describeEntity(type: RelationshipEntityType, id: string): EntityDescriptor | null {
  if (type === 'project' || type === 'personal') {
    return { id, type, title: id, detail: type === 'personal' ? 'Personal wellbeing and capacity' : 'Operational project workspace', href: type === 'personal' ? '/os/personal' : `/os/operations#projects` };
  }
  const memory = memoryItems.find((item) => item.id === id);
  if (memory) return { id, type, title: memory.title, detail: memory.summary, href: memory.intent === 'task' ? '/os/operations#tasks' : '/os/memory' };
  const meeting = meetings.find((item) => item.id === id);
  if (meeting) return { id, type, title: meeting.title, detail: `${meeting.project} · ${meeting.participants.join(', ')}`, href: '/os/meetings' };
  const contact = contacts.find((item) => item.id === id);
  if (contact) return { id, type, title: contact.name, detail: `${contact.relation} · ${contact.organization}`, href: '/os/contacts' };
  const health = healthEntries.find((item) => item.id === id);
  if (health) return { id, type, title: `${health.date} health log`, detail: `${health.sleep} sleep · ${health.mood} mood · ${health.symptoms}`, href: '/os/health' };
  const finance = financeEntries.find((item) => item.id === id);
  if (finance) return { id, type, title: `${finance.category} ${finance.direction}`, detail: `৳${finance.amount} · ${finance.description}`, href: '/os/finance' };
  return projectIds.includes(id as LifeProject) ? { id, type, title: id, detail: 'Known workspace', href: '/os/operations#projects' } : null;
}

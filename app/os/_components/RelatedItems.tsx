import { getRelatedItems, type RelationshipEntityType } from '@/lib/shaikh-os-relationships';
import { styles } from './OsPage';

export default function RelatedItems({ type, id, title = 'Related Items' }: { type: RelationshipEntityType; id: string; title?: string }) {
  const relatedItems = getRelatedItems(type, id).slice(0, 6);

  return (
    <div>
      <p className={styles.cardMeta}>{title}</p>
      {relatedItems.length ? (
        <ul>
          {relatedItems.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <a className={styles.filterLink} href={item.href}>{item.title}</a>
              <br />
              <span>{item.relationshipType} · {item.detail}</span>
            </li>
          ))}
        </ul>
      ) : <p>No related items yet.</p>}
    </div>
  );
}

import { useState } from 'react';

export default function ResourceTagGroup({ group, selectedTags, onToggle }) {
  const [visible, setVisible] = useState(5);
  return (
    <details open className="resources-filter-group">
      <summary>{group.title}</summary>
      <div className="tag-container">
        {group.tags.slice(0, visible).map(tag => (
          <button key={tag} type="button" className="tag resources-filter-tag"
            aria-pressed={selectedTags.includes(tag)} onClick={() => onToggle(tag)}>{tag}</button>
        ))}
      </div>
      {visible < group.tags.length && (
        <button className="resources-button resource-tags-more" type="button"
          aria-label={`Show more ${group.title} tags`}
          onClick={() => setVisible(count => Math.min(count + 10, group.tags.length))}>Show more</button>
      )}
    </details>
  );
}

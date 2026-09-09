import { useParams } from 'react-router-dom';
import { Section } from '../components/doc/Section';
import { ComponentBlock } from '../components/doc/ComponentBlock';
import { CATEGORIES } from '../catalog/categories';

export function CategoryPage() {
  const { categoryId } = useParams();
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return <p className="text-sm text-gray-500 dark:text-gray-400">Not found.</p>;

  return (
    <Section id={cat.id} n={cat.n} title={cat.title} note={cat.note}>
      <div className="grid gap-5 md:grid-cols-2">
        {cat.items.map(item => (
          <ComponentBlock key={item.name} {...item} />
        ))}
      </div>
    </Section>
  );
}

import {
  Sparkles,
  Package,
  Scissors,
  CircleDot,
  SlidersHorizontal,
  Pin,
  Ruler,
  Wrench,
  Crown,
  Shirt,
  Layers,
  ShoppingBag,
  Tag,
  Grid,
  Box,
  Compass,
  Palette,
  Feather,
  Flame,
  Zap,
  Star,
  Bookmark,
  Cpu,
  Gift
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Package,
  Scissors,
  CircleDot,
  SlidersHorizontal,
  Pin,
  Ruler,
  Wrench,
  Crown,
  Shirt,
  Layers,
  ShoppingBag,
  Tag,
  Grid,
  Box,
  Compass,
  Palette,
  Feather,
  Flame,
  Zap,
  Star,
  Bookmark,
  Cpu,
  Gift
};

const CategoryFilter = ({ categories = [], selected, onSelect }) => (
  <div className="sh-subtabs-inner sh-scroll-hide">
    {categories.map((cat) => {
      const IconComp = typeof cat.icon === 'string' && ICON_MAP[cat.icon] ? ICON_MAP[cat.icon] : null;
      const isSelected = selected === cat.id;

      return (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`sh-subtab${isSelected ? ' active' : ''}`}
          type="button"
        >
          {IconComp ? (
            <IconComp size={14} className="sh-subtab-icon-svg" />
          ) : (
            <span className="sh-subtab-icon">{cat.icon}</span>
          )}
          <span>{cat.label}</span>
        </button>
      );
    })}
  </div>
);

export default CategoryFilter;

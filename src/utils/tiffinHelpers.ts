//----------------------------------------------
// Helpers
//----------------------------------------------
export const safeKey = (raw: any) => (typeof raw === 'string' ? raw : '');

export const extractMainKey = (key: string) => {
  return safeKey(key).replace('main_tiffin_', '').toLowerCase();
};

export const extractAddonKey = (key: string) =>
  safeKey(key).replace('ala_carte_', '').toLowerCase();

export const sortByOrder = (
  items: any[],
  orderList: string[],
  extractor: (k: string) => string,
) =>
  items.sort((a, b) => {
    const aKey = extractor(a.key);
    const bKey = extractor(b.key);

    const aIndex = orderList.indexOf(aKey);
    const bIndex = orderList.indexOf(bKey);

    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
export const filterItemsByTags = (items: any[], selectedTags: string[]) => {
  if (!selectedTags || selectedTags.length === 0) {
    return items; // Return all items if no tags selected
  }

  return items.filter(item => {
    let customTags = item?.metafields?.find(
      (mf: any) => mf && mf.key === 'dietary_tags',
    );
    if (customTags) {
      try {
        customTags = JSON.parse(customTags.value);
      } catch (error) {
        console.error('Error parsing dietary tags:', error);
        customTags = []; // Default to empty array if parsing fails
      }
    } else {
      customTags = []; // Default to empty array if no tags are found
    }
    if (!customTags || !Array.isArray(customTags)) {
      return false; // Skip items without tags
    }

    // Convert both item tags and selected tags to lowercase for case-insensitive comparison
    const itemTagsLower = customTags.map((tag: string) => tag.toLowerCase());
    const selectedTagsLower = selectedTags.map(tag => tag.toLowerCase());

    // Check if any of the selected tags match any of the item's tags
    return selectedTagsLower.some(selectedTag =>
      itemTagsLower.some((itemTag: any) => itemTag.includes(selectedTag)),
    );
  });
};

export const getDayWithSuffix = (day: number) => {
  if (!day || isNaN(day)) return ''; 
  const mod100 = day % 100;

  if (mod100 >= 11 && mod100 <= 13) return `${day}th`; // 11, 12, 13 → always "th"

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// Function to format the date
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  if (isNaN(dateObj.getTime())) return '';
 
  let formattedDate = `${getDayWithSuffix(day)} ${dateObj.toLocaleString(
    'en-US',
    { month: 'short' },
  )}, ${year} | ${dateObj.toLocaleString('en-US', {
    weekday: 'short',
  })}`;
  return formattedDate;
};

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
export const rotateFromToday = (arr: string[]) => {
  const i = arr.indexOf(todayName);
  if (i < 0) return arr;
  return [...arr.slice(i), ...arr.slice(0, i)];
};
const MAIN_CAT_ORDER = ['PROTEINS', 'VEGGIES', 'SIDES', 'PROBIOTICS'];

export const catRank = (c?: string) => {
  const i = MAIN_CAT_ORDER.indexOf(String(c ?? '').toUpperCase());
  return i === -1 ? 1e9 : i;
};

interface CategoriesProps {
  key: string;
  value: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    image: string;
    price: string | number;
    variantId: string;
  }[];
  _sectionType?: 'main' | 'addon';
}

export function applyPriceThresholds(
  categories: CategoriesProps[],
  thresholds: any[],
): CategoriesProps[] {
  // Create a map for thresholds based on category prefix (e.g., protein, veggies)
  const thresholdMap: Record<string, number> = {};

  // Process the thresholds to map them by category prefix (e.g., 'protein' -> 10)
  thresholds?.forEach(({ key, value }) => {
    const prefix = key.split('_')[0]?.trim();
    if (prefix) {
      const thresholdValue = parseFloat(value);
      if (Number.isFinite(thresholdValue)) {
        thresholdMap[prefix] = thresholdValue;
      }
    }
  });

  // Apply thresholds to categories
  return categories.map(category => {
    // Get the threshold for the category key (e.g., 'protein' for 'protein_price_threshold')
    let categoryTitle = category.key.replace('main_tiffin_', '');
    categoryTitle = categoryTitle === 'proteins' ? 'protein' : categoryTitle;
    const threshold = thresholdMap[categoryTitle];

    // If there's no valid threshold for the category, return the category unchanged
    if (!Number.isFinite(threshold)) return category;

    // Apply the threshold to each item in the category
    const updatedItems = category.value.map(item => {
      const itemPrice = parseFloat(String(item.price));

      // If the price is not a valid number, return the item unchanged
      if (!Number.isFinite(itemPrice)) return item;

      // Calculate the new price, ensuring it doesn't go below zero
      const newPrice = Math.max(itemPrice - threshold, 0);

      // Add a new attribute `priceAfterThreshold` to hold the calculated price
      return {
        ...item,
        priceAfterThreshold: keepDecimals(item.price, newPrice), // Add the new price attribute
      };
    });

    // Return the updated category with the modified items
    return { ...category, value: updatedItems };
  });
}

function keepDecimals(from: string | number, num: number) {
  const s = String(from);
  const decs = (s.split('.')[1] ?? '').length;
  return decs > 0 ? Number(num.toFixed(decs)) : Math.trunc(num);
}

export function updateCategoryTitle(
  category: string,
  priceThresholdData: any[],
) {
  // console.log('priceThresholdData', priceThresholdData, category);
  category = category == 'proteins' ? 'protein' : category;
  // Construct the key based on category
  const categoryKey = `${category}_title`;
  // console.log('categoryKey', categoryKey);

  // Find the matching item in priceThresholdData
  const matchedThreshold = priceThresholdData?.find(
    item => item.key === categoryKey,
  );
  // If found, return the corresponding title (e.g., protein_title for proteins)
  if (matchedThreshold) {
    const titleKey = `${category}_title`;
    const titleItem = priceThresholdData.find(item => item.key === titleKey);

    // Return the title if it exists
    if (titleItem) {
      return titleItem.value;
    }
  }

  // Return null or a fallback value if no title is found
  return category;
}

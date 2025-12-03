
//----------------------------------------------
// Helpers
//----------------------------------------------
export const safeKey = (raw: any) =>
  typeof raw === "string" ? raw : "";

export const extractMainKey = (key: string) =>
  safeKey(key).replace("main_tiffin_", "").toLowerCase();

export const extractAddonKey = (key: string) =>
  safeKey(key).replace("ala_carte_", "").toLowerCase();

export const sortByOrder = (items: any[], orderList: string[], extractor: (k: string) => string) =>
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

  return items.filter((item) => {
    let customTags = item?.metafields?.find(
      (mf: any) => mf && mf.key === "dietary_tags"
    );
    if (customTags) {
      try {
        customTags = JSON.parse(customTags.value);
      } catch (error) {
        console.error("Error parsing dietary tags:", error);
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
    const selectedTagsLower = selectedTags.map((tag) => tag.toLowerCase());

    // Check if any of the selected tags match any of the item's tags
    return selectedTagsLower.some((selectedTag) =>
      itemTagsLower.some((itemTag: any) => itemTag.includes(selectedTag))
    );
  });
};



const getDayWithSuffix = (day: number) => {
  const suffix = ['st', 'nd', 'rd', 'th'];
  const dayMod = day % 10;
  return (
    day +
    suffix[
      day % 100 >= 11 && day % 100 <= 13 ? 3 : dayMod <= 3 ? dayMod - 1 : 3
    ]
  );
};

// Function to format the date
export const formatDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  return `${getDayWithSuffix(dateObj.getDate())} ${dateObj.toLocaleString(
    'en-US',
    { month: 'short' },
  )}, ${dateObj.getFullYear()} | ${dateObj.toLocaleString('en-US', {
    weekday: 'long',
  })}`;
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
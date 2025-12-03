import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import PlusIcon from '../../assets/newicon/icon-plus.svg';
import RightArrowIcon from '../../assets/newicon/icon-right-arrow.svg';

import HeaderGreeting from "../../components/HeaderGreeting";
import OrderToggle from "../../components/OrderToggle";
import DayTabs from "../../components/DayTabs";
import Section from "../../components/Section";
import DishCard from "../../components/DishCard";
import AddonDishCard from "../../components/AddonDishCard";
import SkeletonLoading from "../../components/SkeletonLoading";
import EmptyState from "../../components/EmptyState";
import TagListFilter from "../../components/TagListFilter";
import CartSummaryModal from "../../components/CartSummaryModal";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { cartFLag } from "../../store/slice/cartSlice";
import { upsertDay } from "../../store/slice/catalogSlice";
import { setAll } from "../../store/slice/priceSlice";

import {
  getMetaObjectByHandle,
} from "../../shopify/queries/getMetaObject";
import { getProductsByIds } from "../../shopify/queries/getProducts";
import Toast, { SuccessToast } from "react-native-toast-message";
import { extractAddonKey, extractMainKey, filterItemsByTags, sortByOrder } from "../../utils/tiffinHelpers";
import { showToastInfo, showToastSuccess } from "../../config/ShowToastMessages";

const MAIN_ORDER = ["proteins", "veggies", "sides", "probiotics"];

const ALA_ORDER = [
  "protein",
  "veggies",
  "sides",
  "probiotics",
  "paranthas",
  "drinks",
  "desserts",
  "kids",
  "oatmeal",
];

//----------------------------------------------
// MAIN COMPONENT
//----------------------------------------------
const HomeScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { lines } = useAppSelector((state) => state.cart);
  const [previousTiffinPlan, setPreviousTiffinPlan] = useState<number>(1);
  const scrollRef = useRef<ScrollView | null>(null);

  const [tab, setTab] = useState<0 | 1>(0);
  const [currentDay, setCurrentDay] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [currentMetaId, setCurrentMetaId] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [addonCategories, setAddonCategories] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [menuDisabled, setMenuDisabled] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [filteredIndex, setFilteredIndex] = useState(0);

  const [openByKey, setOpenByKey] = useState<Record<string, boolean>>({});
  const isOpen = (k: string) => openByKey[k] ?? true;
  const setOpen = (k: string, v: boolean) =>
    setOpenByKey((s) => ({ ...s, [k]: v }));

  //---------------------------------------------------
  // Day change
  //---------------------------------------------------
  const handleDayChange = ({ id, day, date }: { id: string; day: string; date: string }) => {
    setCurrentDay(day);
    setCurrentDate(date);
    setCurrentMetaId(id);
    setMenuDisabled(false);
    openAllMain();
  };

  //---------------------------------------------------
  // Load Shopify MetaObjects
  //---------------------------------------------------
  async function expandCategoryFields(metaObjectId: string) {
    const single: any[] = await getMetaObjectByHandle(metaObjectId);

    return Promise.all(
      single
        .filter(
          (d) =>
            typeof d.value === "string" &&
            d.value.startsWith("[") &&
            d.value.endsWith("]")
        )
        .map(async (d) => {
          d.value = await getProductsByIds(d.value);
          return d;
        })
    );
  }

  //---------------------------------------------------
  // Fetch Menu
  //---------------------------------------------------
  const fetchMetaAndData = useCallback(async () => {
    if (!currentDay || !currentMetaId) return;

    setLoading(true);
    try {
      const mainCat = await expandCategoryFields(currentMetaId);

      // MAIN
      const mainItem = mainCat.filter(
        (item) =>
          item &&
          typeof item.key === "string" &&
          item.key.startsWith("main_tiffin_")
      );

      const mainItemSorted = sortByOrder(
        mainItem,
        MAIN_ORDER,
        extractMainKey
      );

      // ADDONS
      const addOnCat = mainCat.filter(
        (item) =>
          item &&
          typeof item.key === "string" &&
          item.key.startsWith("ala_carte_")
      );

      const addOnCatSorted = sortByOrder(
        addOnCat,
        ALA_ORDER,
        extractAddonKey
      );
      // Apply filtering by tags
      const filteredMainCategories = mainItemSorted.map((category) => ({
        ...category,
        value: filterItemsByTags(category.value, selectedTags), // Apply filter to main items
      }));

      const filteredAddonCategories = addOnCatSorted.map((category) => ({
        ...category,
        value: filterItemsByTags(category.value, selectedTags), // Apply filter to addon items
      }));
      // console.log('filteredAddonCategories', filteredAddonCategories)
      setCategories(filteredMainCategories);
      setAddonCategories(filteredAddonCategories);
    } catch (err) {
      console.log("Menu Load Error:", err);
      setCategories([]);
      setAddonCategories([]);
    } finally {
      setLoading(false);
    }
  }, [currentDay, currentMetaId, selectedTags]);


  //-------------------------------
  // TIFFIN LOGIC (FULL)
  //-------------------------------

  // 1. All main categories for current day
  const mainCategoryKeys = useMemo(
    () => categories.map(cat => extractMainKey(cat.key).toUpperCase()),
    [categories]
  );

  // 2. All main items selected today
  const dayMainItems = useMemo(
    () => lines.filter(i => i.day === currentDay && i.type === "main"),
    [lines, currentDay]
  );

  // 3. Get all tiffin plan numbers used today
  const dayTiffinPlans = useMemo(() => {
    const all = [...new Set(dayMainItems.map(i => i.tiffinPlan || 1))];
    return all.sort((a, b) => a - b);
  }, [dayMainItems]);

  // 4. Find incomplete tiffins
  const incompleteTiffinPlans = useMemo(() => {
    return dayTiffinPlans.filter(plan => {
      const items = dayMainItems.filter(i => i.tiffinPlan === plan);
      const selectedCats = items.map(i => i.category?.toUpperCase());

      // If ANY category missing → incomplete
      return !mainCategoryKeys.every(cat => selectedCats.includes(cat));
    });
  }, [dayTiffinPlans, dayMainItems, mainCategoryKeys]);

  // 5. Determine current tiffin plan
  const currentTiffinPlan = useMemo(() => {

    if (incompleteTiffinPlans.length > 0) return incompleteTiffinPlans[0];

    const max = dayTiffinPlans.length > 0 ? Math.max(...dayTiffinPlans) : 0;
    return max + 1; // start a new tiffin
  }, [incompleteTiffinPlans, dayTiffinPlans]);
  const isTiffinCompletePlan = useCallback((plan: number) => {
    const items = dayMainItems.filter(i => i.tiffinPlan === plan);
    const selectedCats = items
      .map(i => i.category?.toUpperCase())
      .filter(Boolean);

    return mainCategoryKeys.every(cat => selectedCats.includes(cat));
  }, [dayMainItems, mainCategoryKeys]);
  // 6. When tiffin changes → UX Toast
  useEffect(() => {
    if (!currentDay) return;

    const prevPlan = currentTiffinPlan - 1;

    // If previous tiffin exists & is incomplete → warn user
    if (prevPlan > 0 && !isTiffinCompletePlan(prevPlan)) {
      showToastInfo(`Please complete Tiffin ${prevPlan} first`);
      return;
    }

    // Otherwise proceed normally
    // Toast.show({
    //   type: "success",
    //   text1: `Using Tiffin ${currentTiffinPlan} for ${currentDay}`,
    //   position: "top",
    //   visibilityTime: 1500,
    // });
  }, [currentTiffinPlan, currentDay, isTiffinCompletePlan]);


  // 7. Helper to get selected item for a category
  const getSelectedForCategory = useCallback(
    (category: string) => {
      return dayMainItems.find(
        i =>
          i.category?.toLowerCase() === category.toLowerCase() &&
          i.tiffinPlan === currentTiffinPlan
      );
    },
    [dayMainItems, currentTiffinPlan]
  );


  useEffect(() => {
    dispatch(cartFLag());
    if (currentDay) fetchMetaAndData();
  }, [dispatch, fetchMetaAndData, currentDay]);
  const openNextMainSection = (currentKey: string, sortedCategories: any[], setOpen: any) => {
    const index = sortedCategories.findIndex(cat => cat.key === currentKey);
    const next = sortedCategories[index + 1];

    if (!next) return; // No next category

    const nextKey = `main:${next.key}`;
    setOpen(nextKey, true); // Open the next category
  };
  const isTiffinComplete = (
    selectedItems: any[],
    mainCategoryKeys: string[]
  ) => {
    const selectedCats = selectedItems
      .map(i => i?.category?.toUpperCase())
      .filter(Boolean);

    return mainCategoryKeys.every(cat => selectedCats.includes(cat));
  };

  const handleItemSelection = useCallback(
    (category: string) => {
      const key = `main:${category}`;
      setOpen(key, false); // Close current

      // Open next category
      openNextMainSection(category, categories, setOpen);

      // Get updated selection for this category
      const selectedNow = getSelectedForCategory(category);
      const updatedSelected = [...dayMainItems, selectedNow];

      // Check if tiffin complete
      const complete = isTiffinComplete(updatedSelected, mainCategoryKeys);
      if (complete) {
        showToastSuccess(`Tiffin ${currentTiffinPlan} completed!`);
      }
    },
    [
      categories,
      dayMainItems,
      mainCategoryKeys,
      currentTiffinPlan,
      getSelectedForCategory,
    ]
  );


  //---------------------------------------------------
  // Handle "Add Another Tiffin" logic
  //---------------------------------------------------
  const openAllMain = useCallback(() => {
    const next: Record<string, boolean> = {};
    categories.forEach((cat) => {
      const key = `main:${cat.key}`;
      next[key] = true; // Set all sections to open
    });
    setOpenByKey((s) => ({ ...s, ...next }));
  }, [categories]);

  const handleAddNewTiffin = useCallback(() => {
    const dayTiffinPlans = new Set(
      lines.filter(item => item.day === currentDay && item.type === "main").map(item => item.tiffinPlan || 1)
    );
    const nextTiffinPlan = Math.max(...Array.from(dayTiffinPlans)) + 1;

    // Show toast for adding a new tiffin
    showToastSuccess(`Switching to Tiffin ${nextTiffinPlan} for ${currentDay}`, 'top');
    setPreviousTiffinPlan(nextTiffinPlan);
    openAllMain();
    // scroll to top 
    scrollRef?.current?.scrollTo({ y: 0, animated: true });
  }, [lines, currentDay]);

  //---------------------------------------------------
  // Handle "Go to Next Day" logic
  //---------------------------------------------------
  const handleGoToNextDay = useCallback(() => {
    // const nextDayIndex = currentDate + 1;
    setFilteredIndex(prev => prev + 1);
    //scroll to top
    scrollRef?.current?.scrollTo({ y: 0, animated: true });

  }, []);

  //---------------------------------------------------
  // Tag filtering
  //---------------------------------------------------
  const handleTagChange = (tags: string[]) => setSelectedTags(tags);

  //---------------------------------------------------
  // Render
  //---------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: "#f6f6f8" }}>
      <ScrollView ref={scrollRef} bounces={false}>
        <HeaderGreeting name="Sam" />

        <View style={{ gap: 7, padding: 4 }}>
          <OrderToggle index={tab} onChange={setTab} />
          <DayTabs activeIndex={filteredIndex} onChange={handleDayChange} />
          <TagListFilter
            selectedTags={selectedTags}
            onChange={handleTagChange}
          />
        </View>

        {menuDisabled && (
          <EmptyState
            currentDay={currentDay || ""}
            message="Menu not available."
          />
        )}

        {!menuDisabled && isLoading && <SkeletonLoading count={5} />}

        {/* MAIN SECTION */}
        {!menuDisabled && currentDay && tab === 0 && (
          <View>
            {categories.length > 0 ? (
              categories.map((cat) => {
                if (cat.value.length === 0) return null;
                const k = `main:${cat.key}`;
                return (
                  <Section
                    key={k}
                    title={extractMainKey(cat.key).toUpperCase()}
                    note={'Choose your ' + cat.key.replace("main_tiffin_", "") + ' to continue'}
                    open={isOpen(k)}
                    setOpen={(v) => setOpen(k, v)}
                    onToggle={(v) => setOpen(k, v)}
                  >
                    <View style={styles.gridWrap}>
                      {cat.value.map((d: any) => (
                        <DishCard
                          key={`${d.id}-${d.variantId}-${cat.key}-${currentDay}`} // Ensure a unique key
                          category={cat.key.replace("main_tiffin_", "")}
                          day={currentDay}
                          date={currentDate}
                          tiffinPlan={currentTiffinPlan}
                          type="main"
                          item={d}
                          isLoading={isLoading}
                          onChange={(picked: any) => {
                            if (picked?.selected) {
                              handleItemSelection(cat.key);
                            }
                          }}
                        />
                      ))}
                    </View>
                  </Section>
                );
              })
            ) : (
              <EmptyState
                currentDay={currentDay}
                message="No dishes available"
              />
            )}

            {/* ADDONS */}
            {addonCategories.length > 0 && addonCategories[0].value.length > 0 && (

              <Section
                key="addons"
                title="Select Add ons"
                open={isOpen("addons")}
                setOpen={(v) => setOpen("addons", v)}
                onToggle={(v) => setOpen("addons", v)}
              >
                <View style={styles.gridWrap}>
                  {addonCategories.flatMap((cat) =>
                    cat.value.map((d: any) => (

                      <AddonDishCard
                        key={`${d.id}-${d.variantId}-${cat.key}-${currentDay}`} // Ensure a unique key
                        day={currentDay}
                        date={currentDate}
                        category={cat.key.replace("ala_carte_", "")}
                        type="addon"
                        item={d}
                        isLoading={isLoading}
                      />
                    ))
                  )}
                </View>
              </Section>
            )}
          </View>
        )}

        {/* A LA CARTE TAB */}
        {!menuDisabled && tab === 1 && (
          <View>
            {addonCategories.length > 0 ? (
              addonCategories.map((cat) => {
                if (cat.value.length === 0) return null;

                const k = `ala:${cat.key}`;
                return (
                  <Section
                    key={k}
                    title={extractAddonKey(cat.key).toUpperCase()}
                    open={isOpen(k)}
                    setOpen={(v) => setOpen(k, v)}
                  >
                    <View style={styles.gridWrap}>
                      {cat.value.map((d: any) => (
                        <AddonDishCard
                          key={`${d.id}-${d.variantId}-${cat.key}-${currentDay}`} // Ensure a unique key
                          date={currentDate}
                          day={currentDay || ""}
                          category={cat.key.replace("ala_carte_", "")}
                          type="addon"
                          item={d}
                          isLoading={isLoading}
                        />
                      ))}
                    </View>
                  </Section>
                );
              })
            ) : (
              <EmptyState
                currentDay={currentDay || ""}
                message="No add-ons available"
              />
            )}
          </View>
        )}

        {/* Add New Tiffin Button */}
        {/* Action Buttons */}
        <View style={styles.dualButtonWrap}>
          <TouchableOpacity
            onPress={handleAddNewTiffin}
            activeOpacity={0.8}
            style={[
              styles.buttonBase,
              styles.addNewTiffin,
              styles.halfButton,
            ]}
          >
            <PlusIcon width={16} height={16} fill="#0B5733" />
            <Text style={styles.newTiffinText}>Add another tiffin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoToNextDay}
            activeOpacity={0.8}
            style={[
              styles.buttonBase,
              styles.goToNextDay,
              menuDisabled ? styles.fullButton : styles.halfButton,
            ]}
          >
            <Text style={styles.goToNextText}>Go to next day</Text>
            <RightArrowIcon width={16} height={16} fill="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CART BAR */}
      <TouchableOpacity
        onPress={() => setShowCart(true)}
        style={styles.cartBar}
      >
        <View style={styles.cartNotch} />
        <View style={styles.cartBarContent}>
          <Text style={styles.cartLabel}>Cart Summary</Text>
          <Text style={styles.cartTotal}>
            Total $
            {lines
              .reduce((sum, i) => sum + Number(i.price || 0), 0)
              .toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>

      <CartSummaryModal
        visible={showCart}
        navigation={navigation}
        onClose={() => setShowCart(false)}
      />
    </View>
  );
};
export default HomeScreen;

//----------------------------------------------
// STYLES
//----------------------------------------------
const styles = StyleSheet.create({
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  dualButtonWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 70,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  halfButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
    width: '100%',
  },
  addNewTiffin: {
    borderColor: '#0B5733',
    backgroundColor: '#d0ece2',
  },
  newTiffinText: {
    color: '#22774fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  goToNextDay: {
    borderColor: '#0B5733',
    backgroundColor: '#32be84',
  },
  goToNextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#101010",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  cartNotch: {
    position: "absolute",
    top: 6,
    width: 40,
    height: 6,
    backgroundColor: "#ffffff",
    borderRadius: 3,
  },
  cartBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
  cartLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  cartTotal: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});


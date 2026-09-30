import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { Icon } from "../components/GameUI";
import { art, icons } from "../assets";
import { inventory, type Item } from "../data/inventory";
import { colors, fonts, ui } from "../theme";
import type { ScreenProps } from "../types";
type Category = "Equipment" | "Potions";
const loadout = [
  { item: inventory[2], label: "Accessory" },
  { item: inventory[1], label: "Weapon" },
  { item: inventory[0], label: "Armor" },
  { item: inventory[3], label: "Potion" },
];
export function InventoryScreen({
  owned = inventory.map((item) => item.name),
}: ScreenProps & { owned?: string[] }) {
  const scroll = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<Category>("Equipment");
  const [selected, setSelected] = useState<string>();
  const [sort, setSort] = useState("recent");
  const items = inventory
    .filter((item) => item.category === category && owned.includes(item.name))
    .sort((left, right) =>
      sort === "recent"
        ? owned.lastIndexOf(right.name) - owned.lastIndexOf(left.name)
        : left.name.localeCompare(right.name),
    );
  const selectedItem = items.find((item) => item.name === selected);
  function inspectItem(item: Item) {
    setCategory(item.category);
    setSelected(item.name);
    scroll.current?.scrollTo({ top: 0 });
  }
  return (
    <div className="inventory-screen">
      <div aria-label="Bag profile panel" className="equipment-stage">
        <div className="equipment-column">
          {loadout.slice(0, 2).map(({ item, label }) => (
            <div key={label} className="stack equipment-entry">
              <InventorySlot
                item={item}
                label={label + ": " + item.name}
                equipped={owned.includes(item.name)}
                selected={selected === item.name}
                onPress={() => inspectItem(item)}
              />
              <span style={styles.slotCaption} className="text">
                {label}
              </span>
            </div>
          ))}
        </div>
        <img
          src={art.character}
          alt="Nerd Mage character"
          className="inventory-character"
          draggable={false}
        />
        <div className="equipment-column">
          {loadout.slice(2).map(({ item, label }) => (
            <div key={label} className="stack equipment-entry">
              <InventorySlot
                item={item}
                label={label + ": " + item.name}
                equipped={owned.includes(item.name)}
                selected={selected === item.name}
                onPress={() => inspectItem(item)}
              />
              <span style={styles.slotCaption} className="text">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <section aria-label="Bag inventory panel" className="inventory-bag">
        <select
          className="backpack-handle"
          aria-label="Sort items"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            scroll.current?.scrollTo({ top: 0 });
          }}
        >
          <option value="recent">Last obtained</option>
          <option value="name">Name A–Z</option>
        </select>
        <div
          className="inventory-tabs"
          role="tablist"
          aria-label="Backpack categories"
          aria-orientation="vertical"
        >
          {(["Equipment", "Potions"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              id={`bag-tab-${value}`}
              aria-controls="bag-items-panel"
              aria-selected={category === value}
              onClick={() => {
                setCategory(value);
                setSelected(undefined);
                scroll.current?.scrollTo({ top: 0 });
              }}
            >
              <img
                src={value === "Equipment" ? icons.equipment : icons.potion}
                alt=""
              />
              <span>{value}</span>
            </button>
          ))}
        </div>
        <div
          ref={scroll}
          id="bag-items-panel"
          role="tabpanel"
          aria-labelledby={`bag-tab-${category}`}
          className="inventory-items-scroll"
          tabIndex={0}
          aria-label="Backpack contents"
        >
          {selectedItem && (
            <div
              aria-label="Selected item details"
              aria-live="polite"
              style={styles.inspector}
              className="stack"
            >
              <img
                src={selectedItem.image}
                style={{ width: 46, height: 60, objectFit: "contain" }}
                alt=""
              />
              <div style={{ flex: 1, gap: 3 }} className="stack">
                <span
                  style={{ ...ui.title, color: "#fff0d3" }}
                  className="text"
                >
                  {selectedItem.name}
                </span>
                <span style={styles.meta} className="text">
                  {selectedItem.category}
                </span>
                <span style={{ ...ui.body, color: "#e6c7a0" }} className="text">
                  Item preview
                </span>
              </div>
            </div>
          )}
          <div aria-label="Bag items" className="backpack-grid">
            {items.map((item) => (
              <div key={item.name} className="stack">
                <InventorySlot
                  item={item}
                  equipped={loadout.some((slot) => slot.item === item)}
                  selected={selected === item.name}
                  onPress={() => inspectItem(item)}
                />
              </div>
            ))}
            {Array.from(
              { length: Math.max(0, 12 - items.length) },
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="empty-backpack-slot"
                  aria-hidden="true"
                />
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
function InventorySlot({
  item,
  label = item.name,
  selected,
  equipped,
  onPress,
}: {
  item: Item;
  label?: string;
  selected: boolean;
  equipped?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      role="button"
      aria-label={label}
      aria-pressed={selected}
      title={
        equipped
          ? "In current loadout. View item details."
          : "View item details."
      }
      onClick={onPress}
      style={{
        ...styles.itemSlot,
        ...((selected && styles.selectedSlot) || {}),
      }}
      className="stack pressable"
      type="button"
    >
      <div aria-hidden={true} style={styles.slotStitch} className="stack" />
      <img
        src={item.image}
        style={{ ...styles.itemImage, objectFit: "contain" }}
        className="art-image"
        alt=""
        draggable={false}
      />
      {equipped && (
        <div aria-hidden={true} style={styles.equippedMark} className="stack">
          <Icon name="check" size={12} color={colors.white} />
        </div>
      )}
    </button>
  );
}
const styles = {
  slotCaption: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.wood,
    textAlign: "center",
    backgroundColor: "#fff7e6e6",
    borderRadius: 6,
    padding: "2px",
    whiteSpace: "nowrap",
    overflowWrap: "normal",
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: "16px",
    color: "#e6c7a0",
  },
  inspector: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#69462d",
    borderRadius: 12,
    marginBottom: 12,
  },
  itemSlot: {
    width: "100%",
    aspectRatio: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: "var(--slot-edge, #9c835e)",
    borderRadius: 13,
    backgroundColor: "var(--slot-fill, #f3e5c6)",
  },
  slotStitch: {
    position: "absolute",
    top: 4,
    right: 4,
    bottom: 4,
    left: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "var(--slot-stitch, #c3aa7b)",
    borderRadius: 7,
  },
  itemImage: { width: "80%", height: "80%" },
  selectedSlot: {
    borderColor: "var(--slot-selected-edge, #3c705f)",
    backgroundColor: "var(--slot-selected-fill, #d6e6d1)",
  },
  pressedSlot: { transform: "translateY(" + 2 + "px)" },
  equippedMark: {
    position: "absolute",
    right: 3,
    bottom: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal,
  },
} satisfies Record<string, CSSProperties>;

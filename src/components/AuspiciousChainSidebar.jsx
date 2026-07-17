import AuspiciousChainFishbone from "@/components/AuspiciousChainFishbone";
import styles from "@/styles/AuspiciousChainSidebar.module.scss";

export default function AuspiciousChainSidebar({
  components,
  palaceOptions,
  bodyPalaceFilter,
  usePalaceFilter,
  onBodyPalaceChange,
  onUsePalaceChange,
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.title}>吉化串連</div>
      <div className={styles.filters}>
        <select
          className={styles.select}
          value={bodyPalaceFilter}
          onChange={(e) => onBodyPalaceChange(e.target.value)}
        >
          <option value="">體宮（全部）</option>
          {palaceOptions.map((p) => (
            <option value={p} key={`body-${p}`}>
              {p}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={usePalaceFilter}
          onChange={(e) => onUsePalaceChange(e.target.value)}
        >
          <option value="">用宮（全部）</option>
          {palaceOptions.map((p) => (
            <option value={p} key={`use-${p}`}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.hint}>每條領軍（化祿出去的宮・坐祿星）獨立計祿權；圖上可在共同星曜匯合，但不同結構不一定能互相交祿。</div>
      <div className={styles.legend}>
        <span className={styles.legendLu}>祿（星上斜下）</span>
        <span className={styles.legendQuan}>權（星上斜下）</span>
        <span className={styles.legendJi}>化忌</span>
        <span className={styles.legendSelf}>虛線＝自化（宮位向外）</span>
        <span className={styles.legendCycle}>紫＝循環回到重複宮星</span>
      </div>
      <div className={styles.list}>
        {components.map((c) => (
          <AuspiciousChainFishbone key={c.id} component={c} />
        ))}
        {components.length === 0 ? <div className={styles.empty}>目前篩選條件下無串連結構</div> : null}
      </div>
    </aside>
  );
}

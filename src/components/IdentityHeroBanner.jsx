import styles from "@/styles/LifeProfile.module.scss";

/**
 * 核心身份卡：目前只顯示決策引擎（核心角色／思維動能暫隱藏，之後再寫）
 */
export default function IdentityHeroBanner({ identity }) {
  if (!identity) return null;

  const decisionLabel = identity.decision?.label || "";
  const debug = identity.decisionDebug;

  return (
    <article className={styles.identityCard} aria-label="核心身份卡">
      <div className={styles.identityCardGrid}>
        <div className={styles.identityAttr}>
          <div className={styles.identityCardLabel}>決策引擎</div>
          <div className={`${styles.identityAttrValue} ${styles.identityAttrValueWhite}`}>
            {decisionLabel}
          </div>
        </div>
      </div>

      {debug ? (
        <div className={styles.identityDebugPanel}>
          <div className={styles.identityDebugTitle}>Decision Engine 測試條件</div>

          <ul className={styles.identitySignalList}>
            {debug.signals?.map((signal) => (
              <li key={signal.id} className={signal.ok ? styles.debugOk : styles.debugNo}>
                {signal.label} == {signal.ok ? "true" : "false"}
                {signal.ok && signal.detail ? ` → ${signal.detail}` : ""}
              </li>
            ))}
          </ul>

          <div className={styles.identityDebugRoutes}>
            <div>命宮化忌轉忌：{debug.routes?.life || "—"}</div>
            <div>福德化忌轉忌：{debug.routes?.mental || "—"}</div>
          </div>

          {debug.order?.show ? (
            <div className={styles.identityDebugOrder}>
              先後次序：{debug.order.label}
            </div>
          ) : null}

          <div className={styles.identityDebugGrid}>
            {debug.rules.map((rule) => (
              <section key={rule.id} className={styles.identityDebugCard}>
                <div className={styles.identityDebugHead}>
                  <strong>{rule.label}</strong>
                  <span className={rule.matched ? styles.debugOk : styles.debugNo}>
                    {rule.matched ? "符合" : "不符合"}
                  </span>
                </div>
                <ul className={styles.identityDebugList}>
                  {rule.checks.map((check, idx) => (
                    <li key={`${rule.id}-${idx}`} className={check.ok ? styles.debugOk : styles.debugNo}>
                      {check.ok ? "✓" : "✗"} {check.label}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

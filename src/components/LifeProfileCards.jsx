import IdentityHeroBanner from "@/components/IdentityHeroBanner";
import styles from "@/styles/LifeProfile.module.scss";

function EntryChip({ entry, tone = "toneCore" }) {
  return (
    <span className={`${styles.entryChip} ${styles[tone]}`}>
      <strong>{entry.moduleTitle}</strong>
      <em>{entry.starShort}</em>
    </span>
  );
}

function ManifestBadge({ manifestation }) {
  if (!manifestation) return null;
  const isEmpty = manifestation.state === "NoManifestation";
  const toneClass = isEmpty
    ? styles.manifestMuted
    : styles[`manifestActive_${manifestation.state}`] || styles.manifestActive;

  return (
    <span className={`${styles.manifestNote} ${toneClass}`}>
      {manifestation.label}
    </span>
  );
}

function ZoneColumn({ zone }) {
  const toneByKind = {
    lu: "toneFlow",
    quan: "toneRisk",
    ji: "toneCore",
  };

  return (
    <div className={styles.zoneColumn}>
      <div className={styles.zoneHead}>{zone.title}</div>
      <div className={styles.zoneContent}>
        {zone.entries.length > 0 ? (
          zone.entries.map((entry) => (
            <EntryChip
              key={`${entry.palaceName}-${entry.starName}`}
              entry={entry}
              tone={toneByKind[zone.kind]}
            />
          ))
        ) : (
          <span className={styles.emptyEntry}>—</span>
        )}
        <ManifestBadge manifestation={zone.manifestation} />
      </div>
    </div>
  );
}

function PillarBoard({ board }) {
  return (
    <article className={styles.pillarBoard}>
      <header className={styles.pillarHeader}>
        <h3 className={styles.pillarTitle}>{board.title}</h3>
        {board.subtitle ? <span className={styles.pillarSubtitle}>{board.subtitle}</span> : null}
      </header>
      <div className={styles.pillarZones}>
        {board.zones.map((zone) => (
          <ZoneColumn key={zone.id} zone={zone} />
        ))}
      </div>
    </article>
  );
}

function InnateBoard({ board }) {
  const toneByMutagen = {
    祿: "toneFlow",
    權: "toneRisk",
    忌: "toneCore",
  };

  return (
    <article className={`${styles.pillarBoard} ${styles.innateBoard}`}>
      <header className={`${styles.pillarHeader} ${styles.innateHeader}`}>
        <h3 className={styles.pillarTitle}>{board.title}</h3>
      </header>
      <div className={styles.innateColumns}>
        {board.columns.map((col) => (
          <div key={col.id} className={styles.innateColumn}>
            <div className={styles.innateColHead}>{col.title}</div>
            <div className={styles.innateColBody}>
              {col.entry ? (
                <EntryChip entry={col.entry} tone={toneByMutagen[col.mutagen] || "toneCore"} />
              ) : (
                <span className={styles.emptyEntry}>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function LessonBoard({ board }) {
  return (
    <article className={`${styles.pillarBoard} ${styles.lessonBoard}`}>
      <header className={`${styles.pillarHeader} ${styles.lessonHeader}`}>
        <h3 className={styles.pillarTitle}>{board.title}</h3>
      </header>
      <div className={styles.lessonColumns}>
        {board.columns.map((col) => (
          <div key={col.id} className={styles.lessonColumn}>
            <div className={styles.lessonColHead}>{col.title}</div>
            <div className={styles.lessonColBody}>
              {col.entries.length > 0 ? (
                col.entries.map((entry) => (
                  <EntryChip
                    key={entry.palaceName}
                    entry={entry}
                    tone="toneCore"
                  />
                ))
              ) : (
                <span className={styles.emptyNone}>無</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function LifeProfileCards({ profile, identity }) {
  if (!profile) return null;

  return (
    <section className={styles.cardsSection}>
      <header className={styles.cardsHeader}>
        <h2 className={styles.cardsTitle}>生命檔案</h2>
      </header>

      <IdentityHeroBanner identity={identity} />

      <div className={styles.boardStack}>
        <div className={styles.pillarRow}>
          {profile.pillarBoards.map((board) => (
            <PillarBoard key={board.id} board={board} />
          ))}
        </div>
        <div className={styles.bottomRow}>
          <InnateBoard board={profile.innateBoard} />
          <LessonBoard board={profile.lessonBoard} />
        </div>
      </div>
    </section>
  );
}

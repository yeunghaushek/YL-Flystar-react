import { useMemo } from "react";
import { layoutGraphComponent } from "@/lib/auspiciousChainFishboneLayout";
import styles from "@/styles/AuspiciousChainSidebar.module.scss";

function SideNode({ node }) {
  const cls =
    node.type === "green" ? styles.greenNode : node.type === "red" ? styles.redNode : styles.blueNode;
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={6}
        className={`${cls} ${node.self ? styles.selfNode : ""}`}
      />
      <text x={node.x + node.w / 2} y={node.y + node.h / 2 + 4} className={styles.sideLabel}>
        {node.label}
      </text>
    </g>
  );
}

function CycleBadge({ node }) {
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={10}
        className={styles.cycleBadge}
      />
      <text x={node.cx} y={node.cy + 4} className={styles.cycleBadgeLabel}>
        {node.label}
      </text>
    </g>
  );
}

function StarNode({ node }) {
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={8}
        className={`${styles.starNode} ${node.cycle ? styles.cycleNode : ""}`}
      />
      <text x={node.cx} y={node.y + node.h / 2 + 4} className={styles.starLabel}>
        {node.label}
      </text>
    </g>
  );
}

function PalaceNode({ node }) {
  return (
    <g>
      <ellipse
        cx={node.cx}
        cy={node.cy}
        rx={node.w / 2}
        ry={node.h / 2}
        className={`${styles.palaceNode} ${node.cycle ? styles.cycleNode : ""}`}
      />
      <text x={node.cx} y={node.cy + 4} className={styles.palaceLabel}>
        {node.label}
      </text>
    </g>
  );
}

function Edge({ edge }) {
  const cls =
    edge.type === "lu" || edge.type === "lu-self"
      ? styles.edgeLu
      : edge.type === "quan" || edge.type === "quan-self"
      ? styles.edgeQuan
      : edge.type === "palace-star"
      ? styles.edgePalaceStar
      : edge.cycle
      ? styles.edgeJiCycle
      : styles.edgeJi;

  const isLuQuan =
    edge.type === "lu" ||
    edge.type === "quan" ||
    edge.type === "lu-self" ||
    edge.type === "quan-self";

  if (typeof edge.bendX === "number" && isLuQuan) {
    const path = `M ${edge.x1} ${edge.y1} L ${edge.bendX} ${edge.y1} L ${edge.bendX} ${edge.y2}`;
    return (
      <path
        d={path}
        className={cls}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  }

  if (typeof edge.bendY === "number" && isLuQuan) {
    const path = edge.intoStar
      ? `M ${edge.x1} ${edge.y1} L ${edge.x1} ${edge.bendY} L ${edge.x2} ${edge.bendY} L ${edge.x2} ${edge.y2}`
      : `M ${edge.x1} ${edge.y1} L ${edge.x1} ${edge.bendY} L ${edge.x2} ${edge.bendY}`;
    return (
      <path
        d={path}
        className={cls}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  }

  if (edge.type === "palace-star") {
    return <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} className={cls} />;
  }

  if (edge.type === "ji") {
    if (typeof edge.bendY === "number" && !edge.straight) {
      const path = `M ${edge.x1} ${edge.y1} L ${edge.x1} ${edge.bendY} L ${edge.x2} ${edge.bendY} L ${edge.x2} ${edge.y2}`;
      return (
        <path
          d={path}
          className={cls}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
    }
    return (
      <line
        x1={edge.x1}
        y1={edge.y1}
        x2={edge.x2}
        y2={edge.y2}
        className={cls}
        strokeLinecap="round"
        strokeDasharray={edge.cycle ? "5 4" : undefined}
      />
    );
  }

  return <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} className={cls} />;
}

export default function AuspiciousChainFishbone({ component, compact = false, fit = "contain" }) {
  const layout = useMemo(() => layoutGraphComponent(component), [component]);

  if (!layout || !component?.indices?.length) return null;

  const palaceStarEdges = layout.edges.filter((e) => e.type === "palace-star");
  const luQuanEdges = layout.edges.filter(
    (e) => e.type === "lu" || e.type === "quan" || e.type === "lu-self" || e.type === "quan-self"
  );
  const jiEdges = layout.edges.filter((e) => e.type === "ji");
  const scrollFit = fit === "scroll";

  return (
    <div className={compact ? styles.fishboneCardCompact : styles.fishboneCard}>
      <div className={styles.cardHeader}>
        {(layout.header.structures || [{ leader: layout.header.leader, counts: layout.header.counts }]).map(
          (s, i) => (
            <div key={`${s.leader}-${i}`} className={styles.structureHeader}>
              <span className={styles.leaderLine}>
                {s.leader}
                {s.counts ? <span className={styles.countsInline}>{s.counts}</span> : null}
              </span>
            </div>
          )
        )}
      </div>
      <div className={scrollFit ? styles.fishboneScroll : undefined}>
      <svg
        width={scrollFit ? layout.width : "100%"}
        height={layout.height}
        viewBox={layout.viewBox}
        preserveAspectRatio="xMidYMin meet"
        className={styles.fishboneSvg}
        role="img"
        aria-label={`吉化串連 ${layout.header.leader}`}
      >
        {palaceStarEdges.map((e) => (
          <Edge key={e.id} edge={e} />
        ))}
        {layout.nodes.map((n) => {
          if (n.type === "star") return <StarNode key={n.id} node={n} />;
          if (n.type === "palace") return <PalaceNode key={n.id} node={n} />;
          return null;
        })}
        {jiEdges.map((e) => (
          <Edge key={e.id} edge={e} />
        ))}
        {luQuanEdges.map((e) => (
          <Edge key={e.id} edge={e} />
        ))}
        {layout.nodes.map((n) => {
          if (n.type === "green" || n.type === "red" || n.type === "blue") {
            return <SideNode key={n.id} node={n} />;
          }
          if (n.type === "cycle-badge") {
            return <CycleBadge key={n.id} node={n} />;
          }
          return null;
        })}
      </svg>
      </div>
    </div>
  );
}

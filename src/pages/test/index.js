import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { addEdge, Background, Controls, MiniMap, MarkerType, Handle, Position, useEdgesState, useNodesState } from "reactflow";

const RED_PALACES = ["命宮", "福德宮", "遷移宮"];
const BLUE_PALACES = ["疾厄宮", "財帛宮", "交友宮", "子女宮", "夫妻宮", "事業宮", "兄弟宮", "父母宮"];


const SAMPLE_ROUTES = [
    ["遷移宮", "天機", "子女宮", "文昌", "福德宮"],
    ["疾厄宮", "文曲", "財帛宮", "天同", "交友宮"],
    ["財帛宮", "天同", "交友宮", "文曲", "財帛宮"],
    ["子女宮", "文昌", "福德宮", "廉貞", "自化忌"],
    ["夫妻宮", "武曲", "遷移宮", "天機", "子女宮"],
    ["兄弟宮", "貪狼", "事業宮", "天機", "子女宮"],
    ["命宮", "太陽", "疾厄宮", "文曲", "財帛宮"],
    ["父母宮", "太陰", "田宅宮", "巨門", "交友宮"],
    ["福德宮", "廉貞", "自化忌"],
    ["田宅宮", "巨門", "交友宮", "文曲", "財帛宮"],
    ["事業宮", "天機", "子女宮", "文昌", "福德宮"],
    ["交友宮", "文曲", "財帛宮", "天同", "交友宮"],
    ["生年忌", "太陰", "田宅宮", "巨門", "交友宮"],
];

/* function mergeRoutes(routes) {
  if (!Array.isArray(routes)) return [];
}

console.log(mergeRoutes(SAMPLE_ROUTES)); */
const STARS = ["太陽", "太陰", "巨門", "貪狼", "天機", "天同", "文昌", "文曲", "武曲", "廉貞"];
const PALACE_STAR_OFFSET = 40;
const STAR_PALACE_OFFSET = 2;
function generateRoutes(routes) {
    console.log(routes);
    const nodes = [];
    const edges = [];
    routes.forEach((route, routeIndex) => {
        const y = 80 * routeIndex;
        route.some((item, itemIndex) => {
            const id = `r${routeIndex}-${itemIndex}-${item}`;
            const type = item.startsWith("自化") ? "dashedBlue" : STARS.includes(item) ? "star" : "palace";

            // X - GAP Calculation
            const Lps = PALACE_WIDTH + PALACE_STAR_OFFSET; // 80 + 40 = 120
            const Lsp = STAR_WIDTH + STAR_PALACE_OFFSET; // 60 + 10 = 70
            const cycle = Lps + Lsp; // 190
            const x =
                type === "star"
                    ? Math.floor(itemIndex / 2) * cycle + Lps
                    : type === "dashedBlue"
                    ? Math.floor(itemIndex / 2) * cycle + Lps - PALACE_WIDTH
                    : Math.floor(itemIndex / 2) * cycle;

            // Skip duplicate nodes
            const existedNodeIndex = nodes.findIndex((node) => node.data.label === item);
            if (existedNodeIndex > -1) {
                if (type === "palace" && itemIndex > 0 && nodes[existedNodeIndex].id.split("-")[1] !== "0") {
                    // Make sure both the duplicated palace and the existed palace are not the first node
                    console.log("duplicate node", item);

                    // Move the new star to the bottom of the existed star, duplicated palace
                    nodes[nodes.length - 1].position.x = nodes[existedNodeIndex - 1].position.x;
                    nodes[nodes.length - 1].position.y = nodes[existedNodeIndex - 1].position.y + STAR_HEIGHT;

                    // Change the edge type to rightUpRight
                    edges[edges.length - 1].type = "rightUpRight";

                    // Move the following nodes to fit the new y-position of double star
                    let count = existedNodeIndex;
                    while (nodes[count].position.y === nodes[existedNodeIndex - 1].position.y) {
                        if (nodes[count].type === "palace") {
                            nodes[count].position.y += PALACE_HEIGHT / 2;
                        }
                        if (nodes[count].type === "star") {
                            nodes[count].position.y += STAR_HEIGHT / 2;
                        }
                        count++;
                    }

                    return true;
                }

                if (type === "star") {
                    console.log("duplicate node", item);
                    nodes[existedNodeIndex].data.handles.bottom = "target";

                    const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
                    edges.push({
                        id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`,
                        source: prevId,
                        target: nodes[existedNodeIndex].id,
                        targetHandle: "bottom",
                        type: "rightUp",
                    });

                    return true;
                }
            }

            nodes.push({
                id,
                type,
                position: { x, y: y + (type === "dashedBlue" ? 4 : 0) },
                data: {
                    label: item,
                    handles: {
                        left: type === "star" || type === "dashedBlue" ? "target" : null,
                        right: type === "palace" && itemIndex !== route.length - 1 ? "source" : null,
                        top: null,
                        bottom: null,
                    },
                },
            });

            if (type === "star") {
                const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
                edges.push({ id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`, source: prevId, target: id, targetHandle: "left" });
            }

            // Edge Handle for 自化忌
            if (type === "dashedBlue") {
                // Node Previous of 自化忌
                nodes[nodes.length - 2].data.handles.right = "source";
                const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
                edges.push({ id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`, source: prevId, target: id, targetHandle: "left" });
            }

            return false;
        });
    });

    console.log(nodes);
    console.log(edges);

    let node1Index = nodes.findIndex((node) => node.data.label === "財帛宮");
    let node2Index = nodes.findIndex((node) => node.data.label === "福德宮");
    nodes[node1Index].data.handles.bottom = "source";
    nodes[node2Index].data.handles.top = "target";
    edges.push({
        id: `r1-e${node1Index}-${node2Index}`,
        source: nodes[node1Index].id,
        target: nodes[node2Index].id,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "dashedArrowBoth",
    });

    let node3Index = nodes.findIndex((node) => node.data.label === "田宅宮");
    let node4Index = nodes.findIndex((node) => node.data.label === "子女宮");
    nodes[node3Index].data.handles.bottom = "source";
    nodes[node4Index].data.handles.top = "target";
    edges.push({
        id: `r1-e${node3Index}-${node4Index}`,
        source: nodes[node3Index].id,
        target: nodes[node4Index].id,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "dashedArrowBoth",
    });

    return { nodes, edges };
}

// Right → Up edge (two-segment orthogonal)
function RightUpEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
  // go horizontally to targetX, then vertically to targetY
  const p1x = targetX;
  const p1y = sourceY;
  const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${targetX},${targetY}`;
  const blue = '#3b82f6';
  const endId = `${id}-rup-end`;

  return (
    <g>
      <defs>
        <marker id={endId} markerWidth="4" markerHeight="4" viewBox="0 0 4 4" refX="3.2" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={blue} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={style?.stroke || blue}
        strokeWidth={style?.strokeWidth || 2}
        markerEnd={`url(#${endId})`}
      />
    </g>
  );
}

// Right → Up → Right edge (three-segment orthogonal)
function RightUpRightEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
  const horizontalOffset = 40; // final right width
  // Swap widths: first horizontal goes to (targetX - horizontalOffset), last horizontal = horizontalOffset
  const p1x = targetX - horizontalOffset;
  const p1y = sourceY;
  const p2x = p1x;
  const p2y = targetY; // vertical segment to align with target Y (up/down as needed)
  const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${targetX},${targetY}`;
  const blue = '#3b82f6';
  const endId = `${id}-rur-end`;

  return (
    <g>
      <defs>
        <marker id={endId} markerWidth="4" markerHeight="4" viewBox="0 0 4 4" refX="3.2" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={blue} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={style?.stroke || blue}
        strokeWidth={style?.strokeWidth || 2}
        markerEnd={`url(#${endId})`}
      />
    </g>
  );
}

// Straight blue edge with arrow end (replaces previous default styling)
function StraightBlueEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
  const d = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  const blue = '#3b82f6';
  const endId = `${id}-sbe-end`;
  return (
    <g>
      <defs>
        <marker id={endId} markerWidth="4" markerHeight="4" viewBox="0 0 4 4" refX="3.2" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={blue} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={style?.stroke || blue}
        strokeWidth={style?.strokeWidth || 2}
        strokeLinecap="round"
        markerEnd={`url(#${endId})`}
      />
    </g>
  );
}
// Animated dashed bidirectional arrow (straight)
function DashedArrowBothEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, markerStart, style = {} }) {
  const grey = '#babdc5'; // gray-500
  const startId = `${id}-marker-start`;
  const endId = `${id}-marker-end`;

  // Shorten the path near both ends to avoid being covered by handle dots
  const offset = 6; // px
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const sx = sourceX + ux * (offset + 4);
  const sy = sourceY + uy * (offset + 4);
  const ex = targetX - ux * (offset - 4);
  const ey = targetY - uy * (offset - 4);
  const d = `M ${sx},${sy} L ${ex},${ey}`;

  return (
    <g>
      <defs>
        {/* Start arrow */}
        <marker id={startId} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" viewBox="0 0 4 4" refX="0" refY="2" orient="auto-start-reverse">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={grey} />
        </marker>
        {/* End arrow */}
        <marker id={endId} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" viewBox="0 0 4 4" refX="4" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={grey} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={grey}
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeLinecap="butt"
        markerStart={`url(#${startId})`}
        markerEnd={`url(#${endId})`}
      >
        {/* <animate attributeName="stroke-dashoffset" from="2" to="22" dur="0.8s" repeatCount="indefinite" /> */}
      </path>
    </g>
  );
}
// DashedBlueNode: 自化忌
const DASHED_BLUE_WIDTH = 80;
const DASHED_BLUE_HEIGHT = 32;
function DashedBlueNode({ data }) {
    const handlesConfig = data?.handles || {
        left: "target",
        right: "source",
        top: null,
        bottom: null,
    };

    const color = "#3b82f6";
    const handleStyle = { width: 6, height: 6, borderRadius: 6, background: color, border: "1px solid #fff" };

    return (
        <div
            style={{
                width: DASHED_BLUE_WIDTH,
                height: DASHED_BLUE_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #93c5fd",
                borderRadius: 6,
                background: "#eff6ff",
                textAlign: "center",
            }}
        >
            {handlesConfig.top && <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />}
            {handlesConfig.right && <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />}
            {handlesConfig.bottom && <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />}
            {handlesConfig.left && <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />}
            <div style={{ fontWeight: 400, textAlign: "center", fontSize: "16px", lineHeight: "1.5" }}>{data.label}</div>
        </div>
    );
}

// PalaceNode: ellipse-like shape with fixed size and full rounding
const PALACE_WIDTH = 80;
const PALACE_HEIGHT = 40;
function PalaceNode({ data }) {
    const handlesConfig = data?.handles || {
        left: "target",
        right: "source",
        top: null,
        bottom: null,
    };

    const color = "#3b82f6";
    const handleStyle = { width: 6, height: 6, borderRadius: 6, background: color, border: "1px solid #fff" };

    return (
        <div
            style={{
                width: PALACE_WIDTH,
                height: PALACE_HEIGHT,
                borderRadius: 9999,
                border: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
        >
            {handlesConfig.top && <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />}
            {handlesConfig.right && <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />}
            {handlesConfig.bottom && <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />}
            {handlesConfig.left && <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />}
            <div style={{ fontWeight: 400, textAlign: "center", fontSize: "16px", lineHeight: "1.5" }}>{data.label}</div>
        </div>
    );
}

// StarNode: rounded rectangle with fixed size
const STAR_WIDTH = 60;
const STAR_HEIGHT = 40;
function StarNode({ data }) {
    const handlesConfig = data?.handles || {
        left: "target",
        right: "source",
        top: null,
        bottom: null,
    };

    const color = "#3b82f6";
    const handleStyle = { width: 6, height: 6, borderRadius: 6, background: color, border: "1px solid #fff" };

    return (
        <div
            style={{
                width: STAR_WIDTH,
                height: STAR_HEIGHT,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
        >
            {handlesConfig.top && <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />}
            {handlesConfig.right && <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />}
            {handlesConfig.bottom && <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />}
            {handlesConfig.left && <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />}
            <div style={{ fontWeight: 600, textAlign: "center", fontSize: "14px", lineHeight: "1.5" }}>{data.label}</div>
        </div>
    );
}

//const graph1 = [SAMPLE_ROUTES[0],SAMPLE_ROUTES[3],SAMPLE_ROUTES[4],SAMPLE_ROUTES[5],SAMPLE_ROUTES[6],SAMPLE_ROUTES[8],SAMPLE_ROUTES[10],SAMPLE_ROUTES[12]]
//const graph2 = [SAMPLE_ROUTES[0],SAMPLE_ROUTES[6],SAMPLE_ROUTES[8],SAMPLE_ROUTES[1],SAMPLE_ROUTES[2],SAMPLE_ROUTES[7],SAMPLE_ROUTES[9],SAMPLE_ROUTES[11],SAMPLE_ROUTES[12]]

const graph1 = [
    ["兄弟宮", "貪狼", "事業宮", "天機", "子女宮", "文昌", "福德宮", "廉貞", "自化忌"],
    ["夫妻宮", "武曲", "遷移宮", "天機", "子女宮", "文昌", "福德宮", "廉貞", "自化忌"],
    ["命宮", "太陽", "疾厄宮", "文曲", "財帛宮"],
    ["生年忌", "太陰", "田宅宮", "巨門", "交友宮"],
];

const graph2 = [
    ["生年忌", "太陰", "田宅宮", "巨門", "交友宮", "文曲", "財帛宮"],
    ["父母宮", "太陰", "田宅宮", "巨門", "交友宮", "文曲", "財帛宮"],
    ["財帛宮", "天同", "交友宮", "文曲", "財帛宮"],
    ["命宮", "太陽", "疾厄宮", "文曲", "財帛宮"],
    ["遷移宮", "天機", "子女宮", "文昌", "福德宮", "廉貞", "自化忌"],
];

const graph3 = [
    ["生年忌", "太陰", "田宅宮", "巨門", "交友宮", "文曲", "財帛宮"],
    ["父母宮", "太陰", "田宅宮", "巨門", "交友宮", "文曲", "財帛宮"],
    ["財帛宮", "天同", "交友宮", "文曲", "財帛宮"],
    ["命宮", "太陽", "疾厄宮", "文曲", "財帛宮"],
    ["兄弟宮", "貪狼", "事業宮", "天機", "子女宮", "文昌", "福德宮", "廉貞", "自化忌"],
    ["夫妻宮", "武曲", "遷移宮", "天機", "子女宮", "文昌", "福德宮", "廉貞", "自化忌"],
];

const graph4 = [
    ["生年忌", "太陰", "田宅宮", "廉貞", "事業宮", "巨門", "交友宮"],
    ["福德宮", "太陰", "田宅宮", "廉貞", "事業宮", "巨門", "交友宮"],
    ["命宮", "貪狼", "事業宮", "巨門", "交友宮"],
    ["兄弟宮", "武曲", "財帛宮", "文曲", "夫妻宮", "文昌", "福德宮"],
    ["遷移宮", "文曲", "夫妻宮", "文昌", "福德宮"],
];

const graph5 = [
    ["命宮", "文曲", "遷移宮", "太陰", "兄弟宮", "天機", "自化忌"],
    ["生年忌", "太陰", "兄弟宮", "天機", "自化忌"],
    ["田宅宮", "武曲", "財帛宮", "巨門", "父母宮"],
    ["福德宮", "文昌", "自化忌"],
];

const { nodes: initialNodes, edges: initialEdges } = generateRoutes(graph3);

export default function ReactFlowPlayground() {
  const [mounted, setMounted] = useState(false);
    const [selectedType, setSelectedType] = useState("dot");
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({ palace: PalaceNode, star: StarNode, dashedBlue: DashedBlueNode }), []);
    const edgeTypes = useMemo(
        () => ({  rightUp: RightUpEdge, rightUpRight: RightUpRightEdge, dashedArrowBoth: DashedArrowBothEdge, straightBlueEdge: StraightBlueEdge }),
        []
    );

  useEffect(() => {
    setMounted(true);
  }, []);

    const onConnect = useCallback((connection) => setEdges((currentEdges) => addEdge(connection, currentEdges)), [setEdges]);

    const defaultEdgeOptions = useMemo(
        () => ({
            type: "straightBlueEdge",
    animated: false,
        }),
        []
    );

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>React Flow Template</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ width: "100%", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultEdgeOptions={defaultEdgeOptions}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
        >
          <Controls />
          <Background gap={12} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    </>
  );
}

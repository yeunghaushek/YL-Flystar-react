import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";

const RED_PALACES = ["命宮","福德宮","遷移宮"];
const BLUE_PALACES = ["疾厄宮","財帛宮","交友宮","子女宮","夫妻宮","事業宮","兄弟宮","父母宮"];
const STARS = ["太陽","太陰","巨門","貪狼","天機","天同","文昌","文曲","武曲","廉貞"];


const SAMPLE_ROUTES = [
  [
      "遷移宮",
      "天機",
      "子女宮",
      "文昌",
      "福德宮"
  ],
  [
      "疾厄宮",
      "文曲",
      "財帛宮",
      "天同",
      "交友宮"
  ],
  [
      "財帛宮",
      "天同",
      "交友宮",
      "文曲",
      "財帛宮"
  ],
  [
      "子女宮",
      "文昌",
      "福德宮",
      "廉貞",
      "自化忌"
  ],
  [
      "夫妻宮",
      "武曲",
      "遷移宮",
      "天機",
      "子女宮"
  ],
  [
      "兄弟宮",
      "貪狼",
      "事業宮",
      "天機",
      "子女宮"
  ],
  [
      "命宮",
      "太陽",
      "疾厄宮",
      "文曲",
      "財帛宮"
  ],
  [
      "父母宮",
      "太陰",
      "田宅宮",
      "巨門",
      "交友宮"
  ],
  [
      "福德宮",
      "廉貞",
      "自化忌"
  ],
  [
      "田宅宮",
      "巨門",
      "交友宮",
      "文曲",
      "財帛宮"
  ],
  [
      "事業宮",
      "天機",
      "子女宮",
      "文昌",
      "福德宮"
  ],
  [
      "交友宮",
      "文曲",
      "財帛宮",
      "天同",
      "交友宮"
  ],
  [
    "生年忌",
    "太陰",
    "田宅宮",
    "巨門",
    "交友宮"
]
]

/* function mergeRoutes(routes) {
  if (!Array.isArray(routes)) return [];
}

console.log(mergeRoutes(SAMPLE_ROUTES)); */


const PALACE_STAR_OFFSET = 40;
const STAR_PALACE_OFFSET = 10;

function generateRoutes(routes) {
  console.log(routes)
  const nodes = [];
  const edges = [];
  routes.forEach((route, routeIndex) => {
    const y = 100 * routeIndex;
    route.forEach((item, itemIndex) => {
      const id = `r${routeIndex}-${itemIndex}-${item}`;
      const type = item.startsWith("自化") ? "dashedBlue" : STARS.includes(item) ? "star" : "palace";

      // X - GAP Calculation
      const Lps = PALACE_WIDTH + PALACE_STAR_OFFSET; // 80 + 40 = 120
      const Lsp = STAR_WIDTH + STAR_PALACE_OFFSET;   // 60 + 10 = 70
      const cycle = Lps + Lsp;                       // 190
      const x = type === "star"
        ? Math.floor(itemIndex / 2) * cycle + Lps
        : type === "dashedBlue"
          ? Math.floor(itemIndex / 2) * cycle + Lps - PALACE_WIDTH
          : Math.floor(itemIndex / 2) * cycle;
      
      nodes.push({
        id,
        type,
        position: { x, y: y + (type === "dashedBlue" ? 4 : 0) },
        data: { label: item, handles: { left: type === "star" || type === "dashedBlue" ? "target" : null, right: (type === "palace" && itemIndex !== route.length - 1)  ? "source" : null, top: null, bottom: null } },
      });

      if (type === "star") {
        const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
        edges.push({ id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`, source: prevId, target: id });
      }

      // Edge Handle for 自化忌
      if (type === "dashedBlue") {
        // Node Previous of 自化忌
        nodes[nodes.length - 2].data.handles.right = "source";
        const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
        edges.push({ id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`, source: prevId, target: id });
      }



      
    });
  });

//console.log(nodes);

  return { nodes, edges };
}


function RightUpLeftDownEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
  const horizontalOffset = 40;
  const verticalGap = 20;

  const p1x = sourceX + horizontalOffset;
  const p1y = sourceY;
  const p2x = p1x;
  const p2y = targetY - verticalGap;
  const p3x = targetX;
  const p3y = p2y;

  const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${p3x},${p3y} L ${targetX},${targetY}`;

  return (
    <path
      id={id}
      d={d}
      fill="none"
      stroke={style?.stroke || "#3b82f6"}
      strokeWidth={style?.strokeWidth || 2}
      markerEnd={markerEnd}
    />
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
    <div style={{ width: DASHED_BLUE_WIDTH, height: DASHED_BLUE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px dashed #93c5fd", borderRadius: 6, background: "#eff6ff", textAlign: 'center' }}>
      {handlesConfig.top && (
        <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />
      )}
      {handlesConfig.right && (
        <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />
      )}
      {handlesConfig.bottom && (
        <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />
      )}
      {handlesConfig.left && (
        <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />
      )}
      <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
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
    <div style={{ width: PALACE_WIDTH, height: PALACE_HEIGHT, borderRadius: 9999, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
      {handlesConfig.top && (
        <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />
      )}
      {handlesConfig.right && (
        <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />
      )}
      {handlesConfig.bottom && (
        <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />
      )}
      {handlesConfig.left && (
        <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />
      )}
      <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
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
    <div style={{ width: STAR_WIDTH, height: STAR_HEIGHT, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
      {handlesConfig.top && (
        <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />
      )}
      {handlesConfig.right && (
        <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />
      )}
      {handlesConfig.bottom && (
        <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />
      )}
      {handlesConfig.left && (
        <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />
      )}
      <div style={{ fontWeight: 600, textAlign: 'center', fontSize: '14px', lineHeight: '1.5' }}>{data.label}</div>
    </div>
  );
}

const StarPalaceRoute =  () => 
  {
    return [
      { id: "r1-p0", type: "palace", position: { x: 0, y: 0 }, data: { label: "命宮", handles: { left: null, right: null, top: null, bottom: null } } },
      { id: "r1-s1", type: "star", position: { x: 90, y: 0 }, data: { label: "太陽", handles: { left: null, right: "source", top: "target", bottom: null } } },
      { id: "r1-p1", type: "palace", position: { x: 250, y: 0 }, data: { label: "田宅宮", handles: { left: "target", right: null, top: null, bottom: null } } },
      { id: "r1-s2", type: "star", position: { x: 340, y: 0 }, data: { label: "太陰", handles: { left: null, right: "source", top: null, bottom: null } } },
      { id: "r1-p2", type: "palace", position: { x: 500, y: 0 }, data: { label: "福德宮", handles: { left: "target", right: "source", top: null, bottom: null } } },
      { id: "r2-p0", type: "palace", position: { x: 0, y: 100 }, data: { label: "命宮", handles: { left: null, right: null, top: null, bottom: null } } },
      { id: "r2-s1", type: "star", position: { x: 90, y: 100 }, data: { label: "太陽", handles: { left: null, right: "source", top: "target", bottom: null } } },
      { id: "r2-p1", type: "palace", position: { x: 250, y: 100 }, data: { label: "田宅宮", handles: { left: "target", right: null, top: null, bottom: null } } },
      { id: "r2-s2", type: "star", position: { x: 340, y: 100 }, data: { label: "太陰", handles: { left: null, right: "source", top: null, bottom: null } } },
      { id: "r2-p2", type: "palace", position: { x: 500, y: 100 }, data: { label: "福德宮", handles: { left: "target", right: "source", top: null, bottom: null } } },
      { id: "r2-db1", type: "dashedBlue", position: { x: 680, y: 100 + 4 }, data: { label: "自化忌", handles: { left: "target", right: null, top: null, bottom: null } } },
    ];
  }


const graph1 = [SAMPLE_ROUTES[0],SAMPLE_ROUTES[3],SAMPLE_ROUTES[4],SAMPLE_ROUTES[5],SAMPLE_ROUTES[6],SAMPLE_ROUTES[8],SAMPLE_ROUTES[10],SAMPLE_ROUTES[12]]
const graph2 = [SAMPLE_ROUTES[0],SAMPLE_ROUTES[6],SAMPLE_ROUTES[8],SAMPLE_ROUTES[1],SAMPLE_ROUTES[2],SAMPLE_ROUTES[7],SAMPLE_ROUTES[9],SAMPLE_ROUTES[11],SAMPLE_ROUTES[12]]

const { nodes: initialNodes, edges: initialEdges } = generateRoutes(graph1);

export default function ReactFlowPlayground() {
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState("dot");
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ palace: PalaceNode, star: StarNode, dashedBlue: DashedBlueNode }), []);
  const edgeTypes = useMemo(() => ({ rightUpLeftDown: RightUpLeftDownEdge }), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onConnect = useCallback(
    (connection) => setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "straight",
      animated: false,
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: "#3b82f6",
      },
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



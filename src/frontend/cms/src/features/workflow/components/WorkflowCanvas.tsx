'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Department, WorkflowEdge, WorkflowNode, WorkflowNodeType } from '../../../shared/types';
import { useTranslation } from '../../../shared/i18n';
import {
  PlayCircle,
  Flag,
  CheckSquare,
  GitFork,
  ShieldCheck,
  Award,
  Webhook,
  CheckCircle,
  Clock,
  Lock,
  FileCheck,
  DollarSign,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hand,
  MousePointer,
  HelpCircle,
} from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  zoom: number;
  onZoomChange?: (newZoom: number) => void;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  onAddNode: (type: WorkflowNodeType, x: number, y: number) => void;
  onConnectNodes: (
    sourceNodeId: string,
    targetNodeId: string,
    sourceHandle: 'right' | 'bottom',
    targetHandle: 'left' | 'top'
  ) => void;
  onDeleteEdge: (edgeId: string) => void;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 110;

export function WorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  zoom,
  onZoomChange,
  onSelectNode,
  onUpdateNodePosition,
  onAddNode,
  onConnectNodes,
  onDeleteEdge,
}: WorkflowCanvasProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Pan offset state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Edge Connecting State
  const [connectingSource, setConnectingSource] = useState<{
    nodeId: string;
    handle: 'right' | 'bottom';
    startX: number;
    startY: number;
  } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keyboard Space listener for Pan Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Compute node center / port positions
  const getNodePortPos = (node: WorkflowNode, handle?: 'left' | 'right' | 'top' | 'bottom' | string) => {
    switch (handle) {
      case 'left':
        return { x: node.x, y: node.y + NODE_HEIGHT / 2 };
      case 'top':
        return { x: node.x + NODE_WIDTH / 2, y: node.y };
      case 'bottom':
        return { x: node.x + NODE_WIDTH / 2, y: node.y + NODE_HEIGHT };
      case 'right':
      default:
        return { x: node.x + NODE_WIDTH, y: node.y + NODE_HEIGHT / 2 };
    }
  };

  // Generate Bezier path string
  const getBezierPath = (x1: number, y1: number, x2: number, y2: number, sourceHandle?: string) => {
    const dx = Math.abs(x2 - x1) * 0.55;
    const dy = Math.abs(y2 - y1) * 0.55;

    if (sourceHandle === 'bottom') {
      return `M ${x1} ${y1} C ${x1} ${y1 + Math.max(dy, 40)}, ${x2} ${y2 - Math.max(dy, 40)}, ${x2} ${y2}`;
    }
    return `M ${x1} ${y1} C ${x1 + Math.max(dx, 40)} ${y1}, ${x2 - Math.max(dx, 40)} ${y2}, ${x2} ${y2}`;
  };

  // Convert client coordinates to canvas world coordinates
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  // Wheel Event: Smooth Pan in 4 directions OR Ctrl+Wheel Zoom around mouse pointer
  const handleWheel = (e: React.WheelEvent) => {
    // 1. Pinch-to-Zoom OR Ctrl / Meta + Wheel -> Zoom centered at mouse pointer
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(2.0, Math.max(0.3, parseFloat((zoom * zoomFactor).toFixed(2))));

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Keep point under mouse steady
        const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
        const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

        setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
        if (onZoomChange) onZoomChange(newZoom);
      }
    } else {
      // 2. Normal 2-finger scroll or mouse wheel -> Pan in 4 directions
      // Supports Shift + Wheel for horizontal panning
      const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
      const deltaY = e.shiftKey ? 0 : e.deltaY;

      setPan((prev) => ({
        x: Math.round(prev.x - deltaX),
        y: Math.round(prev.y - deltaY),
      }));
    }
  };

  // Handle Drag Over Canvas (from Palette)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle Drop on Canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/mibid-node-type') as WorkflowNodeType;
    if (!nodeType) return;

    const pos = clientToCanvas(e.clientX, e.clientY);
    onAddNode(nodeType, Math.round(pos.x - NODE_WIDTH / 2), Math.round(pos.y - NODE_HEIGHT / 2));
  };

  // Mouse Down on Canvas -> Start Panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle button (button 1) or right click (button 2) or left click on background or Spacebar active
    const isMiddleOrRight = e.button === 1 || e.button === 2;
    const isBackgroundTarget =
      e.target === canvasRef.current ||
      (e.target as HTMLElement).tagName === 'svg' ||
      (e.target as HTMLElement).classList.contains('canvas-bg');

    if (isMiddleOrRight || isBackgroundTarget || isSpacePressed) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      if (isBackgroundTarget && !isSpacePressed) {
        onSelectNode(null);
      }
    }
  };

  // Mouse Move on Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const pos = clientToCanvas(e.clientX, e.clientY);
    setMouseCanvasPos(pos);

    if (isPanning) {
      setPan({ x: Math.round(e.clientX - startPan.x), y: Math.round(e.clientY - startPan.y) });
    } else if (draggingNodeId) {
      const newX = Math.round(pos.x - dragOffset.x);
      const newY = Math.round(pos.y - dragOffset.y);
      onUpdateNodePosition(draggingNodeId, newX, newY);
    }
  };

  // Mouse Up on Canvas
  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingSource(null);
  };

  // Start dragging a Node
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (isSpacePressed) return; // If holding Space, allow canvas panning instead
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    const pos = clientToCanvas(e.clientX, e.clientY);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
  };

  // Start connecting an edge from a handle
  const handlePortMouseDown = (e: React.MouseEvent, node: WorkflowNode, handle: 'right' | 'bottom') => {
    e.stopPropagation();
    const portPos = getNodePortPos(node, handle);
    setConnectingSource({
      nodeId: node.id,
      handle,
      startX: portPos.x,
      startY: portPos.y,
    });
  };

  // Complete connection on a target handle
  const handlePortMouseUp = (e: React.MouseEvent, targetNode: WorkflowNode, targetHandle: 'left' | 'top') => {
    e.stopPropagation();
    if (connectingSource && connectingSource.nodeId !== targetNode.id) {
      onConnectNodes(connectingSource.nodeId, targetNode.id, connectingSource.handle, targetHandle);
    }
    setConnectingSource(null);
  };

  // Fit all nodes into screen view
  const handleFitView = () => {
    if (!nodes.length || !canvasRef.current) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + NODE_WIDTH);
      maxY = Math.max(maxY, n.y + NODE_HEIGHT);
    });

    const rect = canvasRef.current.getBoundingClientRect();
    const padding = 80;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const scaleX = rect.width / contentWidth;
    const scaleY = rect.height / contentHeight;
    const fitZoom = Math.min(1.2, Math.max(0.4, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetPanX = rect.width / 2 - centerX * fitZoom;
    const targetPanY = rect.height / 2 - centerY * fitZoom;

    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
    if (onZoomChange) onZoomChange(parseFloat(fitZoom.toFixed(2)));
  };

  // Reset to default coordinates
  const handleResetCenter = () => {
    setPan({ x: 60, y: 60 });
    if (onZoomChange) onZoomChange(1.0);
  };

  const getNodeIcon = (type: WorkflowNodeType | string): React.ElementType => {
    switch (type) {
      case WorkflowNodeType.START:
      case 'START':
        return PlayCircle;
      case WorkflowNodeType.STAGE:
      case 'STAGE':
        return Flag;
      case WorkflowNodeType.TASK:
      case 'TASK':
        return CheckSquare;
      case WorkflowNodeType.CONDITION:
      case 'CONDITION':
        return GitFork;
      case WorkflowNodeType.GATEKEEPER:
      case 'GATEKEEPER':
        return ShieldCheck;
      case WorkflowNodeType.APPROVAL:
      case 'APPROVAL':
        return Award;
      case WorkflowNodeType.WEBHOOK:
      case 'WEBHOOK':
        return Webhook;
      case WorkflowNodeType.END:
      case 'END':
        return CheckCircle;
      default:
        return Flag;
    }
  };

  const getDeptColor = (dept: Department) => {
    switch (dept) {
      case Department.TECHNICAL:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800';
      case Department.COMMERCIAL:
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      case Department.FINANCE:
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800';
      case Department.LEGAL:
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div
      ref={canvasRef}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex-1 h-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 select-none canvas-bg ${
        isPanning || isSpacePressed ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, 0.28) 1.5px, transparent 1.5px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoom / Pan Infinite Canvas World */}
      <div
        className="absolute origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '6000px',
          height: '6000px',
        }}
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
            </marker>
            <marker
              id="arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563eb" />
            </marker>
            <marker
              id="arrow-success"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker
              id="arrow-warning"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Render Existing Edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.sourceNodeId);
            const targetNode = nodes.find((n) => n.id === edge.targetNodeId);
            if (!sourceNode || !targetNode) return null;

            const p1 = getNodePortPos(sourceNode, edge.sourceHandle || 'right');
            const p2 = getNodePortPos(targetNode, edge.targetHandle || 'left');
            const pathD = getBezierPath(p1.x, p1.y, p2.x, p2.y, edge.sourceHandle);

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            const strokeColor = edge.color || '#94a3b8';
            let markerUrl = 'url(#arrow-default)';
            if (edge.color === '#10b981') markerUrl = 'url(#arrow-success)';
            else if (edge.color === '#f59e0b') markerUrl = 'url(#arrow-warning)';
            else if (edge.color === '#3b82f6') markerUrl = 'url(#arrow-selected)';

            return (
              <g key={edge.id} className="pointer-events-auto group">
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  className="cursor-pointer"
                  onClick={() => onDeleteEdge(edge.id)}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeDasharray={edge.conditionExpression ? '4 3' : 'none'}
                  markerEnd={markerUrl}
                  className="group-hover:stroke-red-500 transition-colors"
                />

                {/* Edge Label Pill */}
                {edge.label && (
                  <foreignObject
                    x={midX - 70}
                    y={midY - 14}
                    width={140}
                    height={28}
                    className="overflow-visible"
                  >
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm whitespace-nowrap">
                        {edge.label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEdge(edge.id);
                          }}
                          className="text-slate-400 hover:text-red-500 ml-1"
                        >
                          &times;
                        </button>
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Rubberband Edge during Port Dragging */}
          {connectingSource && (
            <path
              d={getBezierPath(
                connectingSource.startX,
                connectingSource.startY,
                mouseCanvasPos.x,
                mouseCanvasPos.y,
                connectingSource.handle
              )}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              markerEnd="url(#arrow-selected)"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const Icon = getNodeIcon(node.type);
          const deptClass = getDeptColor(node.data.department);
          const gk = node.data.gatekeeper;
          const activeGkCount = [
            gk.layer1DocChecklist.enabled,
            gk.layer2Financial.enabled,
            gk.layer3Approval.enabled,
            gk.layer4DistributedLock.enabled,
          ].filter(Boolean).length;

          return (
            <div
              key={node.id}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                width: `${NODE_WIDTH}px`,
                height: `${NODE_HEIGHT}px`,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className={`absolute rounded-2xl border bg-white dark:bg-slate-900 p-3 shadow-md hover:shadow-xl transition-all cursor-move flex flex-col justify-between select-none pointer-events-auto z-10 ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-blue-500/15'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Node Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400">
                      {node.data.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${deptClass}`}>
                    {node.data.department}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    {node.data.slaDays}d
                  </span>
                </div>
              </div>

              {/* Node Title */}
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                  {node.data.title}
                </h4>
                {node.data.subtitle && (
                  <p className="text-[10px] text-slate-400 line-clamp-1 leading-none">{node.data.subtitle}</p>
                )}
              </div>

              {/* Node Footer: Gatekeeper badges */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                <div className="flex items-center gap-1">
                  {gk.layer1DocChecklist.enabled && (
                    <span title="Lớp 1: Doc Checklist" className="p-0.5 rounded text-blue-600 bg-blue-50 dark:bg-blue-950">
                      <FileCheck className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {gk.layer2Financial.enabled && (
                    <span title="Lớp 2: Ngân sách" className="p-0.5 rounded text-emerald-600 bg-emerald-50 dark:bg-emerald-950">
                      <DollarSign className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {gk.layer3Approval.enabled && (
                    <span title="Lớp 3: Approval" className="p-0.5 rounded text-purple-600 bg-purple-50 dark:bg-purple-950">
                      <Award className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {gk.layer4DistributedLock.enabled && (
                    <span title="Lớp 4: Khóa An Toàn Đồng Thời" className="p-0.5 rounded text-cyan-600 bg-cyan-50 dark:bg-cyan-950">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <span className="text-[9px] font-semibold text-slate-400">
                  {activeGkCount} GK Rules
                </span>
              </div>

              {/* Connection Port Handles */}
              {/* Left Input Port */}
              <div
                title="Cổng nhận luồng (Input)"
                onMouseUp={(e) => handlePortMouseUp(e, node, 'left')}
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 hover:bg-blue-600 hover:scale-125 transition-all cursor-pointer z-20"
              />

              {/* Right Output Port */}
              <div
                title="Kéo cổng xuất để nối bước tiếp theo"
                onMouseDown={(e) => handlePortMouseDown(e, node, 'right')}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 hover:bg-blue-600 hover:scale-125 transition-all cursor-pointer z-20 shadow-sm"
              />

              {/* Bottom Output Port for Decisions */}
              {node.type === 'CONDITION' && (
                <div
                  title="Kéo cổng dưới cho nhánh rẽ"
                  onMouseDown={(e) => handlePortMouseDown(e, node, 'bottom')}
                  className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900 hover:bg-purple-600 hover:scale-125 transition-all cursor-pointer z-20 shadow-sm"
                />
              )}

              {/* Top Input Port */}
              <div
                title="Cổng nhận nhánh rẽ (Top Input)"
                onMouseUp={(e) => handlePortMouseUp(e, node, 'top')}
                className="absolute left-1/2 -top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 hover:bg-blue-600 hover:scale-125 transition-all cursor-pointer z-20"
              />
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Navigation & Fit View Controls (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={handleFitView}
          title="Căn vừa toàn bộ màn hình (Fit View)"
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-[11px] font-semibold"
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Vừa màn hình</span>
        </button>

        <button
          type="button"
          onClick={handleResetCenter}
          title="Đưa về vị trí gốc ban đầu"
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Quick Pan Hint */}
        <div className="hidden md:flex items-center gap-1 px-2 text-[10.5px] text-slate-400">
          <Hand className="w-3 h-3 text-slate-400" />
          <span>Cuộn chuột để di chuyển (Trái-Phải-Trên-Dưới) &bull; Ctrl+Cuộn: Thu phóng</span>
        </div>
      </div>

      {/* Empty State Banner if no nodes */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center space-y-2">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl">
            <PlayCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {t.workflowDesigner.canvasEmptyTitle}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {t.workflowDesigner.canvasEmptySubtitle}
          </p>
        </div>
      )}
    </div>
  );
}

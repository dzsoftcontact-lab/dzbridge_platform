import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SchemaTableDef, SchemaRelation } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Link2,
  Info,
  Pin,
  Activity,
  LayoutGrid,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ErdNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category?: string;
  tableDef: SchemaTableDef;
  width: number;
  height: number;
  inboundCount: number;
  outboundCount: number;
  isLocked: boolean;
}

interface ErdLink extends d3.SimulationLinkDatum<ErdNode> {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  onDelete: string;
  label?: string;
}

interface InteractiveErdGraphProps {
  tables: SchemaTableDef[];
  relations: SchemaRelation[];
  onSelectTable?: (tableId: string) => void;
  selectedTableId?: string;
}

export const InteractiveErdGraph: React.FC<InteractiveErdGraphProps> = ({
  tables,
  relations,
  onSelectTable,
  selectedTableId,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredRelation, setHoveredRelation] = useState<SchemaRelation | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(selectedTableId || null);

  // Position control: Fixed (locked absolute coordinates) vs Dynamic (D3 force physics)
  const [isFixedPositions, setIsFixedPositions] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dz_erd_fixed_positions') === 'true';
    } catch {
      return false;
    }
  });

  // Track individually locked tables
  const [lockedTableNames, setLockedTableNames] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('dz_erd_locked_tables');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // fallback
    }
    // By default, pin all tables to prevent chaotic drift
    return new Set(tables.map((t) => t.name));
  });

  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const zoomGRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const simulationRef = useRef<d3.Simulation<ErdNode, ErdLink> | null>(null);

  useEffect(() => {
    if (selectedTableId) {
      setSelectedNodeId(selectedTableId);
    }
  }, [selectedTableId]);

  useEffect(() => {
    try {
      localStorage.setItem('dz_erd_fixed_positions', String(isFixedPositions));
      localStorage.setItem('dz_erd_locked_tables', JSON.stringify(Array.from(lockedTableNames)));
    } catch {
      // ignore
    }
  }, [isFixedPositions, lockedTableNames]);

  // Count incoming & outgoing relations per table
  const relationCounts = new Map<string, { inbound: number; outbound: number }>();
  tables.forEach((t) => relationCounts.set(t.name, { inbound: 0, outbound: 0 }));
  relations.forEach((r) => {
    if (relationCounts.has(r.sourceTable)) {
      relationCounts.get(r.sourceTable)!.outbound++;
    }
    if (relationCounts.has(r.targetTable)) {
      relationCounts.get(r.targetTable)!.inbound++;
    }
  });

  const orphanTablesCount = tables.filter((t) => {
    const counts = relationCounts.get(t.name) || { inbound: 0, outbound: 0 };
    return counts.inbound === 0 && counts.outbound === 0;
  }).length;

  const toggleTableLock = (tableName: string) => {
    setLockedTableNames((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const handleLockAll = () => {
    setLockedTableNames(new Set(tables.map((t) => t.name)));
    setIsFixedPositions(true);
  };

  const handleUnlockAll = () => {
    setLockedTableNames(new Set());
    setIsFixedPositions(false);
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || tables.length === 0) return;

    const width = containerRef.current.clientWidth || 980;
    const height = 580;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Arrowhead markers
    defs
      .append('marker')
      .attr('id', 'erd-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#C89B3C');

    defs
      .append('marker')
      .attr('id', 'erd-arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#3B0D2C');

    defs
      .append('marker')
      .attr('id', 'erd-arrow-inbound')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#2563EB');

    // Drop shadow filter
    const filter = defs
      .append('filter')
      .attr('id', 'node-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '6')
      .attr('flood-color', '#3B0D2C')
      .attr('flood-opacity', '0.08');

    // Zoom container group
    const g = svg.append('g').attr('class', 'erd-main-group');
    zoomGRef.current = g;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    const NODE_WIDTH = 220;
    const HEADER_HEIGHT = 38;
    const ROW_HEIGHT = 20;
    const FOOTER_HEIGHT = 24;

    // Build nodes with grid initial layout if not yet saved
    const colsCount = 4;
    const nodes: ErdNode[] = tables.map((tbl, i) => {
      const visibleColsCount = Math.min(tbl.columns.length, 6);
      const totalHeight = HEADER_HEIGHT + visibleColsCount * ROW_HEIGHT + FOOTER_HEIGHT;

      const col = i % colsCount;
      const row = Math.floor(i / colsCount);
      const defaultGridX = 140 + col * 270;
      const defaultGridY = 90 + row * 220;

      const saved = nodePositionsRef.current.get(tbl.name);
      const initialX = saved ? saved.x : defaultGridX;
      const initialY = saved ? saved.y : defaultGridY;

      const counts = relationCounts.get(tbl.name) || { inbound: 0, outbound: 0 };
      const isLocked = isFixedPositions || lockedTableNames.has(tbl.name);

      const node: ErdNode = {
        id: tbl.name,
        name: tbl.name,
        category: tbl.category || 'Core',
        tableDef: tbl,
        width: NODE_WIDTH,
        height: totalHeight,
        inboundCount: counts.inbound,
        outboundCount: counts.outbound,
        isLocked,
        x: initialX,
        y: initialY,
      };

      if (isLocked) {
        node.fx = initialX;
        node.fy = initialY;
      }

      return node;
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const links: ErdLink[] = relations
      .filter((r) => nodeMap.has(r.sourceTable) && nodeMap.has(r.targetTable))
      .map((r) => ({
        id: r.id,
        source: r.sourceTable,
        target: r.targetTable,
        sourceTable: r.sourceTable,
        sourceColumn: r.sourceColumn,
        targetTable: r.targetTable,
        targetColumn: r.targetColumn,
        onDelete: r.onDelete,
        label: r.label,
      }));

    const simulation = d3
      .forceSimulation<ErdNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<ErdNode, ErdLink>(links)
          .id((d) => d.id)
          .distance(260)
          .strength(isFixedPositions ? 0 : 0.4),
      )
      .force('charge', d3.forceManyBody().strength(isFixedPositions ? 0 : -800))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(isFixedPositions ? 0 : 0.03))
      .force(
        'collide',
        d3.forceCollide<ErdNode>().radius((d) => Math.max(d.width, d.height) * 0.65 + 20),
      );

    simulationRef.current = simulation;

    const linkGroup = g.append('g').attr('class', 'links-layer');
    const linkPaths = linkGroup
      .selectAll<SVGPathElement, ErdLink>('path')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'erd-link')
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (selectedNodeId) {
          const selTbl = tables.find((t) => t.id === selectedNodeId)?.name;
          if (d.sourceTable === selTbl) return '#C89B3C';
          if (d.targetTable === selTbl) return '#2563EB';
        }
        return '#C89B3C';
      })
      .attr('stroke-width', (d) => {
        if (selectedNodeId) {
          const selTbl = tables.find((t) => t.id === selectedNodeId)?.name;
          if (d.sourceTable === selTbl || d.targetTable === selTbl) return 3;
        }
        return 1.8;
      })
      .attr('stroke-opacity', (d) => {
        if (selectedNodeId) {
          const selTbl = tables.find((t) => t.id === selectedNodeId)?.name;
          if (d.sourceTable === selTbl || d.targetTable === selTbl) return 1;
          return 0.25;
        }
        return 0.7;
      })
      .attr('marker-end', (d) => {
        if (selectedNodeId) {
          const selTbl = tables.find((t) => t.id === selectedNodeId)?.name;
          if (d.targetTable === selTbl) return 'url(#erd-arrow-inbound)';
          if (d.sourceTable === selTbl) return 'url(#erd-arrow-active)';
        }
        return 'url(#erd-arrow)';
      })
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .attr('stroke', '#3B0D2C')
          .attr('stroke-width', 3.5)
          .attr('stroke-opacity', 1)
          .attr('marker-end', 'url(#erd-arrow-active)');
        setHoveredRelation({
          id: d.id,
          sourceTable: d.sourceTable,
          sourceColumn: d.sourceColumn,
          targetTable: d.targetTable,
          targetColumn: d.targetColumn,
          onDelete: d.onDelete as any,
          label: d.label,
        });
      })
      .on('mouseleave', function (event, d) {
        const selTbl = tables.find((t) => t.id === selectedNodeId)?.name;
        const isConnected = selTbl && (d.sourceTable === selTbl || d.targetTable === selTbl);
        d3.select(this)
          .attr('stroke', isConnected ? (d.targetTable === selTbl ? '#2563EB' : '#C89B3C') : '#C89B3C')
          .attr('stroke-width', isConnected ? 3 : 1.8)
          .attr('stroke-opacity', selectedNodeId ? (isConnected ? 1 : 0.25) : 0.7)
          .attr('marker-end', isConnected && d.targetTable === selTbl ? 'url(#erd-arrow-inbound)' : 'url(#erd-arrow)');
        setHoveredRelation(null);
      });

    const nodeGroup = g.append('g').attr('class', 'nodes-layer');
    const nodeG = nodeGroup
      .selectAll<SVGGElement, ErdNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'erd-node-group')
      .style('cursor', 'grab')
      .call(
        d3
          .drag<SVGGElement, ErdNode>()
          .on('start', (event, d) => {
            if (!isFixedPositions && !lockedTableNames.has(d.name)) {
              if (!event.active) simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
            d.x = event.x;
            d.y = event.y;
            nodePositionsRef.current.set(d.id, { x: event.x, y: event.y });
            updateVisualElements();
          })
          .on('end', (event, d) => {
            nodePositionsRef.current.set(d.id, { x: event.x, y: event.y });
            if (!isFixedPositions && !lockedTableNames.has(d.name)) {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            } else {
              d.fx = event.x;
              d.fy = event.y;
            }
          }),
      )
      .on('click', (event, d) => {
        setSelectedNodeId(d.tableDef.id);
        if (onSelectTable) {
          onSelectTable(d.tableDef.id);
        }
      });

    // Card background
    nodeG
      .append('rect')
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('x', (d) => -d.width / 2)
      .attr('y', (d) => -d.height / 2)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', '#FFFFFF')
      .attr('stroke', (d) => {
        if (d.tableDef.id === selectedNodeId) return '#3B0D2C';
        if (d.isLocked) return '#C89B3C';
        return '#E2E8F0';
      })
      .attr('stroke-width', (d) => (d.tableDef.id === selectedNodeId ? 2.5 : d.isLocked ? 1.8 : 1.2))
      .attr('filter', 'url(#node-shadow)');

    // Header bar
    nodeG
      .append('path')
      .attr('d', (d) => {
        const x = -d.width / 2;
        const y = -d.height / 2;
        const w = d.width;
        const h = HEADER_HEIGHT;
        const r = 12;
        return `M${x + r},${y} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - r} h${-w} v${-(h - r)} a${r},${r} 0 0 1 ${r},${-r} Z`;
      })
      .attr('fill', (d) => {
        if (d.tableDef.category === 'Academic') return '#1e293b';
        if (d.tableDef.category === 'Audit') return '#3B0D2C';
        if (d.tableDef.category === 'Collaborations') return '#064e3b';
        return '#3B0D2C';
      });

    // Header Icon Badge
    nodeG
      .append('rect')
      .attr('x', (d) => -d.width / 2 + 10)
      .attr('y', (d) => -d.height / 2 + 10)
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', '#C89B3C');

    nodeG
      .append('text')
      .attr('x', (d) => -d.width / 2 + 19)
      .attr('y', (d) => -d.height / 2 + 22)
      .attr('text-anchor', 'middle')
      .attr('fill', '#3B0D2C')
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .text('T');

    // Header Table Name
    nodeG
      .append('text')
      .attr('x', (d) => -d.width / 2 + 34)
      .attr('y', (d) => -d.height / 2 + 23)
      .attr('fill', '#FFFFFF')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'ui-monospace, monospace')
      .text((d) => (d.name.length > 17 ? d.name.slice(0, 16) + '…' : d.name));

    // Lock/Pin Toggle Button on Header
    const lockBtnG = nodeG
      .append('g')
      .attr('transform', (d) => `translate(${d.width / 2 - 24}, ${-d.height / 2 + 9})`)
      .style('cursor', 'pointer')
      .on('click', function (event, d) {
        event.stopPropagation();
        toggleTableLock(d.name);
      });

    lockBtnG
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', (d) => (d.isLocked ? '#C89B3C' : 'rgba(255,255,255,0.15)'));

    lockBtnG
      .append('text')
      .attr('x', 9)
      .attr('y', 13)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text((d) => (d.isLocked ? '🔒' : '🔓'));

    // Columns
    nodeG.each(function (d) {
      const gNode = d3.select(this);
      const startY = -d.height / 2 + HEADER_HEIGHT + 14;
      const visibleCols = d.tableDef.columns.slice(0, 6);

      visibleCols.forEach((col, idx) => {
        const yPos = startY + idx * ROW_HEIGHT;
        if (col.isPrimary) {
          gNode
            .append('text')
            .attr('x', -d.width / 2 + 12)
            .attr('y', yPos)
            .attr('fill', '#C89B3C')
            .attr('font-size', '9px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'ui-monospace, monospace')
            .text('PK');
        } else if (col.isForeign) {
          gNode
            .append('text')
            .attr('x', -d.width / 2 + 12)
            .attr('y', yPos)
            .attr('fill', '#2563EB')
            .attr('font-size', '9px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'ui-monospace, monospace')
            .text('FK');
        } else {
          gNode
            .append('circle')
            .attr('cx', -d.width / 2 + 16)
            .attr('cy', yPos - 3)
            .attr('r', 2)
            .attr('fill', '#94A3B8');
        }

        gNode
          .append('text')
          .attr('x', -d.width / 2 + 32)
          .attr('y', yPos)
          .attr('fill', col.isPrimary ? '#0F172A' : '#334155')
          .attr('font-size', '10px')
          .attr('font-weight', col.isPrimary ? 'bold' : 'normal')
          .attr('font-family', 'ui-monospace, monospace')
          .text(col.name.length > 14 ? col.name.slice(0, 13) + '…' : col.name);

        const simplifiedType = col.type.replace('WITH TIME ZONE', '').replace('(255)', '').trim();
        gNode
          .append('text')
          .attr('x', d.width / 2 - 12)
          .attr('y', yPos)
          .attr('text-anchor', 'end')
          .attr('fill', '#64748B')
          .attr('font-size', '9px')
          .attr('font-family', 'ui-monospace, monospace')
          .text(simplifiedType.length > 12 ? simplifiedType.slice(0, 11) + '…' : simplifiedType);
      });

      // Bottom constraint status bar inside card
      const footerY = d.height / 2 - 10;
      gNode
        .append('line')
        .attr('x1', -d.width / 2 + 10)
        .attr('x2', d.width / 2 - 10)
        .attr('y1', footerY - 10)
        .attr('y2', footerY - 10)
        .attr('stroke', '#F1F5F9');

      gNode
        .append('text')
        .attr('x', -d.width / 2 + 12)
        .attr('y', footerY)
        .attr('fill', '#059669')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`🔗 ${d.inboundCount} in · ${d.outboundCount} out`);

      gNode
        .append('text')
        .attr('x', d.width / 2 - 12)
        .attr('y', footerY)
        .attr('text-anchor', 'end')
        .attr('fill', d.isLocked ? '#8C6514' : '#64748B')
        .attr('font-size', '9px')
        .attr('font-weight', d.isLocked ? 'bold' : 'normal')
        .text(d.isLocked ? 'Locked' : 'Floating');
    });

    function updateVisualElements() {
      linkPaths.attr('d', (d: any) => {
        const source = d.source as ErdNode;
        const target = d.target as ErdNode;
        if (
          !source ||
          !target ||
          source.x === undefined ||
          target.x === undefined ||
          source.y === undefined ||
          target.y === undefined
        ) {
          return '';
        }

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);

        const sx = source.x + (Math.cos(angle) * source.width) / 2;
        const sy = source.y + (Math.sin(angle) * source.height) / 2;
        const tx = target.x - (Math.cos(angle) * target.width) / 2;
        const ty = target.y - (Math.sin(angle) * target.height) / 2;

        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const curveOffset = Math.sin((d.id.charCodeAt(0) % 5) - 2) * 18;
        const cx = mx - Math.sin(angle) * curveOffset;
        const cy = my + Math.cos(angle) * curveOffset;

        return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`;
      });

      nodeG.attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`);
    }

    simulation.on('tick', updateVisualElements);

    // Initial positioning render
    updateVisualElements();

    return () => {
      simulation.stop();
    };
  }, [tables, relations, selectedNodeId, isFixedPositions, lockedTableNames]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 980;
    const height = 580;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.scale(0.8).translate(width * 0.05, height * 0.05),
      );
  };

  const handleAutoArrangeGrid = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 980;
    const colsCount = width > 1100 ? 4 : 3;
    const colSpacing = 280;
    const rowSpacing = 230;
    const startX = 140;
    const startY = 100;

    tables.forEach((tbl, idx) => {
      const col = idx % colsCount;
      const row = Math.floor(idx / colsCount);
      const x = startX + col * colSpacing;
      const y = startY + row * rowSpacing;
      nodePositionsRef.current.set(tbl.name, { x, y });
    });

    // Re-lock all in this clean grid
    setLockedTableNames(new Set(tables.map((t) => t.name)));
    setIsFixedPositions(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header and Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#3B0D2C] text-[#C89B3C] flex items-center justify-center font-bold text-xs shadow-xs">
            ERD
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>Interactive Relational ERD Graph</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>100% Relational Locked ({orphanTablesCount === 0 ? '0 Orphan Tables' : `${orphanTablesCount} Unlinked`})</span>
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {tables.length} tables · {relations.length} foreign key constraints · Click any 🔒 to toggle individual table lock or drag to reposition.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Lock / Unlock All */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={handleLockAll}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                isFixedPositions || lockedTableNames.size === tables.length
                  ? 'bg-[#3B0D2C] text-[#C89B3C]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Lock/Pin all table nodes in their current coordinates"
            >
              <Lock className="w-3 h-3" />
              <span>Lock All</span>
            </button>
            <button
              onClick={handleUnlockAll}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                !isFixedPositions && lockedTableNames.size === 0
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Unlock all tables for live D3 dynamic physics simulation"
            >
              <Unlock className="w-3 h-3" />
              <span>Unlock All</span>
            </button>
          </div>

          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition"
            title="Reset Canvas View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleAutoArrangeGrid}
            className="p-2 rounded-xl bg-[#3B0D2C] text-white hover:bg-[#4A1238] shadow-2xs transition flex items-center gap-1.5 text-xs font-bold px-2.5"
            title="Auto-Arrange into Organized Relational Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Clean Grid</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full h-[580px] bg-gradient-to-br from-slate-50/50 via-white to-amber-50/20 relative select-none cursor-grab active:cursor-grabbing"
      >
        <svg ref={svgRef} className="w-full h-full block" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-md text-[11px] font-mono text-slate-700 space-y-1.5 pointer-events-none">
          <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
            <Info className="w-3.5 h-3.5 text-[#3B0D2C]" />
            <span>ERD Graph Legend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#C89B3C] font-bold text-[10px]">PK</span>
            <span>Primary Key (UUID v4)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#2563EB] font-bold text-[10px]">FK</span>
            <span>Foreign Key Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#C89B3C]"></span>
            <span>Foreign Key Relational Constraint</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-sans">
            <span>Locked Tables:</span>
            <strong className="text-amber-700 font-mono">
              {lockedTableNames.size} / {tables.length}
            </strong>
          </div>
        </div>

        {/* Relation constraint tooltip on hover */}
        {hoveredRelation && (
          <div className="absolute top-4 right-4 bg-slate-900 text-white rounded-xl p-3.5 shadow-xl border border-slate-700 max-w-sm text-xs animate-in fade-in duration-100 z-10">
            <div className="font-bold text-[#C89B3C] flex items-center gap-1.5 mb-1 font-mono">
              <Link2 className="w-3.5 h-3.5" />
              <span>Foreign Key Constraint</span>
            </div>
            <div className="font-mono text-emerald-300 font-bold">
              {hoveredRelation.sourceTable}.{hoveredRelation.sourceColumn} →{' '}
              {hoveredRelation.targetTable}.{hoveredRelation.targetColumn}
            </div>
            <div className="text-[11px] text-slate-300 mt-1.5 flex items-center justify-between">
              <span>On Delete: <strong className="text-amber-300">{hoveredRelation.onDelete}</strong></span>
              {hoveredRelation.label && <span className="italic text-slate-400">{hoveredRelation.label}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

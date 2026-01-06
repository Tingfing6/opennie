import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { Asset } from "~/types/assets";

interface SankeyFlowChartProps {
  assets: Asset[];
}

export function SankeyFlowChart({ assets }: SankeyFlowChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const getSankeyOption = () => {
    if (assets.length === 0) {
      return {
        title: {
          text: "暂无资产数据",
          left: "center",
          top: "center",
          textStyle: { color: "#999", fontSize: 16 },
        },
      };
    }

    // 按资产类型分组
    const assetByType = assets.reduce(
      (acc, asset) => {
        if (!acc[asset.type]) {
          acc[asset.type] = {
            name: getAssetTypeName(asset.type),
            value: 0,
            assets: [],
          };
        }
        acc[asset.type].value += asset.balance;
        acc[asset.type].assets.push(asset);
        return acc;
      },
      {} as Record<string, { name: string; value: number; assets: Asset[] }>,
    );

    const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0);

    // 构建节点 - 确保名称唯一
    const nodes: Array<{
      name: string;
      itemStyle?: { color: string };
      value?: number;
    }> = [
      { name: "总资产", itemStyle: { color: "#3B82F6" }, value: totalAssets },
    ];

    // 添加资产类型节点
    const typeNodes = Object.entries(assetByType).map(
      ([type, data], index) => ({
        name: data.name,
        itemStyle: { color: getAssetTypeColor(type) },
        value: data.value,
      }),
    );
    nodes.push(...typeNodes);

    // 添加具体资产节点（确保名称唯一）
    const assetNodeNames = new Set<string>();
    const assetNodes = assets.slice(0, 10).map((asset, index) => {
      let uniqueName = asset.name;
      let counter = 1;
      while (assetNodeNames.has(uniqueName)) {
        uniqueName = `${asset.name}_${counter}`;
        counter++;
      }
      assetNodeNames.add(uniqueName);
      return {
        name: uniqueName,
        originalName: asset.name,
        balance: asset.balance,
        value: asset.balance,
        type: asset.type,
        itemStyle: { color: "#E5E7EB" },
      };
    });
    nodes.push(
      ...assetNodes.map((node) => ({
        name: node.name,
        itemStyle: node.itemStyle,
        value: node.value,
      })),
    );

    // 构建链接
    const links: Array<{
      source: string;
      target: string;
      value: number;
    }> = [];

    // 总资产到资产类型的链接
    typeNodes.forEach((typeNode) => {
      if (typeNode.name) {
        const foundEntry = Object.entries(assetByType).find(
          ([_, data]) => data.name === typeNode.name,
        );
        const foundKey = foundEntry?.[0];
        if (foundKey && assetByType[foundKey]?.value > 0) {
          links.push({
            source: "总资产",
            target: typeNode.name,
            value: assetByType[foundKey]?.value || 0,
          });
        }
      }
    });

    // 资产类型到具体资产的链接（只显示前10个）
    assetNodes.forEach((assetNode) => {
      const typeName = assetByType[assetNode.type]?.name;
      if (typeName && assetNode.balance > 0) {
        // 找到对应的类型节点
        const targetNodeName = typeNodes.find(
          (node) => node.name === typeName,
        )?.name;
        if (targetNodeName) {
          links.push({
            source: targetNodeName,
            target: assetNode.name,
            value: assetNode.balance,
          });
        }
      }
    });

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          if (!params || !params.data) {
            return "";
          }
          if (params.dataType === "edge") {
            const value = params.data.value || 0;
            const source = params.data.source || "未知";
            const target = params.data.target || "未知";

            // 如果目标节点是资产节点，显示原始名称
            let displayName = target;
            const assetNode = assetNodes.find((node) => node.name === target);
            if (assetNode) {
              displayName = assetNode.originalName;
            }

            return `${source} → ${displayName}<br/>金额: ¥${value.toLocaleString("zh-CN")}`;
          } else {
            const value = params.data.value || 0;
            let displayName = params.name || "未知";

            // 如果是资产节点，显示原始名称
            const assetNode = assetNodes.find(
              (node) => node.name === displayName,
            );
            if (assetNode) {
              displayName = assetNode.originalName;
            }

            return `${displayName}<br/>金额: ¥${value.toLocaleString("zh-CN")}`;
          }
        },
      },
      series: [
        {
          type: "sankey",
          layout: "none",
          emphasis: {
            focus: "adjacency",
          },
          data: nodes,
          links: links,
          orient: "horizontal",
          label: {
            position: "top",
            formatter: (params: any) => {
              const value = params.data.value || 0;
              let displayName = params.name;

              // 如果是资产节点，显示原始名称
              const assetNode = assetNodes.find(
                (node) => node.name === displayName,
              );
              if (assetNode) {
                displayName = assetNode.originalName;
              }

              if (value >= 10000) {
                return `${displayName}\n${(value / 10000).toFixed(0)}万`;
              }
              return `${displayName}\n${value.toLocaleString("zh-CN")}`;
            },
          },
          lineStyle: {
            color: "source",
            curveness: 0.5,
          },
          itemStyle: {
            color: "#3B82F6",
            borderColor: "#fff",
          },
        },
      ],
    };
  };

  const getAssetTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      bank_card: "银行存款",
      investment: "投资理财",
      real_estate: "房产价值",
      fund: "基金投资",
      stock: "股票资产",
      alipay: "支付宝",
      wechat: "微信钱包",
      cash: "现金",
    };
    return typeMap[type] || "其他";
  };

  const getAssetTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      bank_card: "#3B82F6",
      investment: "#8B5CF6",
      real_estate: "#EF4444",
      fund: "#10B981",
      stock: "#F59E0B",
      alipay: "#1677FF",
      wechat: "#52C41A",
      cash: "#6B7280",
    };
    return colorMap[type] || "#6B7280";
  };

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 设置图表配置
      chartInstance.current.setOption(getSankeyOption());

      // 响应式处理
      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [assets]);

  // 处理数据变化时的图表更新
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getSankeyOption(), true);
    }
  }, [assets]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div
        ref={chartRef}
        className="w-full h-96"
        style={{ minHeight: "384px" }}
        onWheel={(e) => {
          // 禁用容器内的滚动，防止与图表缩放冲突
          e.stopPropagation();
        }}
      />
    </div>
  );
}

"use client";

import { format, subMonths } from "date-fns";
import { Wallet, BadgeDollarSign, Clock } from "lucide-react";
import { Area, AreaChart, Line, LineChart, Bar, BarChart, XAxis, Label, Pie, PieChart, FunnelChart, Funnel, LabelList } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, cn } from "@/lib/utils";

import {
  leadsChartData,
  leadsChartConfig,
  proposalsChartData,
  proposalsChartConfig,
  revenueChartData,
  revenueChartConfig,
  leadsBySourceChartData,
  leadsBySourceChartConfig,
  salesPipelineChartData,
  salesPipelineChartConfig,
  actionItems,
} from "./crm.config";

const lastMonth = format(subMonths(new Date(), 1), "LLLL");

export function OverviewCards() {
  const totalLeads = leadsBySourceChartData.reduce((acc, curr) => acc + curr.leads, 0);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>New Leads</CardTitle>
          <CardDescription>Last Month</CardDescription>
        </CardHeader>
        <CardContent className="size-full">
          <ChartContainer className="size-full min-h-24" config={leadsChartConfig}>
            <BarChart accessibilityLayer data={leadsChartData} barSize={8}>
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${lastMonth}: ${label}`} />} />
              <Bar
                background={{ fill: "var(--color-background)", radius: 4, opacity: 0.07 }}
                dataKey="newLeads"
                stackId="a"
                fill="var(--color-newLeads)"
                radius={[0, 0, 0, 0]}
              />
              <Bar dataKey="disqualified" stackId="a" fill="var(--color-disqualified)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="text-xl font-semibold tabular-nums">635</span>
          <span className="text-sm font-medium text-green-500">+54.6%</span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="size-full">
          <ChartContainer config={salesPipelineChartConfig} className="size-full">
            <FunnelChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <Funnel className="stroke-card stroke-2" dataKey="value" data={salesPipelineChartData}>
                <LabelList className="fill-foreground stroke-0 text-xs" dataKey="stage" position="right" offset={8} />
                <LabelList className="fill-foreground stroke-0 text-xs" dataKey="value" position="left" offset={8} />
              </Funnel>
            </FunnelChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">Leads increased by 18.2% since last month.</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {actionItems.slice(0, 3).map((item) => (
              <li key={item.id} className="space-y-1.5 rounded-md border px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked={item.checked} className="size-3" />
                  <span className="text-xs font-medium">{item.title}</span>
                  <span
                    className={cn(
                      "w-fit rounded-md px-1.5 py-0.5 text-xs font-medium",
                      item.priority === "High" && "text-destructive bg-destructive/20",
                      item.priority === "Medium" && "bg-yellow-500/20 text-yellow-500",
                      item.priority === "Low" && "bg-green-500/20 text-green-500",
                    )}
                  >
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="text-muted-foreground size-2.5" />
                  <span className="text-muted-foreground text-xs font-medium">{item.due}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Leads by Source</CardTitle>
        </CardHeader>
        <CardContent className="max-h-40">
          <ChartContainer config={leadsBySourceChartConfig} className="size-full">
            <PieChart
              className="m-0"
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={leadsBySourceChartData}
                dataKey="leads"
                nameKey="source"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                cornerRadius={4}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg font-bold tabular-nums"
                          >
                            {totalLeads.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 16} className="fill-muted-foreground text-xs">
                            Leads
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                content={() => (
                  <ul className="ml-4 flex flex-col gap-1.5">
                    {leadsBySourceChartData.map((item) => (
                      <li key={item.source} className="flex w-24 items-center justify-between">
                        <span className="flex items-center gap-1.5 capitalize">
                          <span className="size-2 rounded-full" style={{ background: item.fill }} />
                          <span className="text-xs">{leadsBySourceChartConfig[item.source].label}</span>
                        </span>
                        <span className="tabular-nums text-xs">{item.leads}</span>
                      </li>
                    ))}
                  </ul>
                )}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="gap-1">
          <Button size="sm" variant="outline" className="basis-1/2 text-xs">
            Report
          </Button>
          <Button size="sm" variant="outline" className="basis-1/2 text-xs">
            Export
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
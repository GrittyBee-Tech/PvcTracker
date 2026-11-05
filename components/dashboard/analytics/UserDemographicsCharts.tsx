"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DemographicDatum {
  name: string;
  value: number;
}

interface UserDemographicsChartsProps {
  gender: DemographicDatum[];
  zones: DemographicDatum[];
  ageRanges: DemographicDatum[];
}

const GENDER_COLORS = ["#2563EB", "#DB2777", "#9CA3AF"];

function NoDataMessage() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      No data available
    </div>
  );
}

export default function UserDemographicsCharts({
  gender,
  zones,
  ageRanges,
}: UserDemographicsChartsProps) {
  const hasGenderData = gender.some((item) => item.value > 0);
  const hasZoneData = zones.some((item) => item.value > 0);
  const hasAgeData = ageRanges.some((item) => item.value > 0);

  return (
    <section aria-labelledby="user-demographics-heading" className="space-y-4">
      <div>
        <h2 id="user-demographics-heading" className="text-xl font-semibold tracking-tight">
          User demographics
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Breakdown of registered users by gender, geopolitical zone, and age.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="px-6 pb-3 pt-5">
            <CardTitle className="text-base">Gender breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {hasGenderData ? (
              <>
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gender}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {gender.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [Number(value).toLocaleString(), "Users"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pb-2 text-xs text-gray-600">
                  {gender.map((item, index) => (
                    <span key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length] }}
                      />
                      {item.name}: {item.value.toLocaleString()}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[260px]">
                <NoDataMessage />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="px-6 pb-3 pt-5">
            <CardTitle className="text-base">Users by geopolitical zone</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] px-4 pb-4 pt-0">
            {hasZoneData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={zones}
                  layout="vertical"
                  margin={{ top: 4, right: 18, bottom: 4, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={92}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value).toLocaleString(), "Users"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" fill="#1A5C38" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage />
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="px-6 pb-3 pt-5">
            <CardTitle className="text-base">Users by age range</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-4 pb-4 pt-0 sm:px-6">
            {hasAgeData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageRanges}
                  margin={{ top: 8, right: 12, bottom: 8, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value).toLocaleString(), "Users"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" fill="#1A5C38" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage />
            )}
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-gray-400">
        Users without a recognized state of origin are not included in the geopolitical zone totals.
      </p>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Search,
  AlertTriangle,
  Mail,
  ClipboardCheck,
  BarChart3,
  Users,
  Building2,
  Factory,
  Beaker,
  Settings,
  ChevronRight,
  Activity,
  FileWarning,
  Shield,
  Package
} from "lucide-react";

export default function FDATrackerPage() {
  const [activeTab, setActiveTab] = useState("Top Subsystems");

  const tabs = [
    "Top Subsystems",
    "Quality Unit",
    "Packaging & Labelling",
    "Production",
    "Materials",
    "Laboratory",
    "Facilities & Equipment"
  ];

  const subsystems = [
    {
      id: 1,
      name: "Contamination Control",
      subtitle: "#1 CONTAMINATION CONTROL",
      icon: Activity,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      form483s: 220,
      warnings: 25,
      total: 245
    },
    {
      id: 2,
      name: "Environmental Monitoring",
      subtitle: "#2 ENVIRONMENTAL MONITORING",
      icon: FileText,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-400/10",
      form483s: 192,
      warnings: 20,
      total: 212
    },
    {
      id: 3,
      name: "Cleaning Validation",
      subtitle: "#3 CLEANING VALIDATION",
      icon: AlertTriangle,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-400/10",
      form483s: 145,
      warnings: 19,
      total: 164
    },
    {
      id: 4,
      name: "Document Management",
      subtitle: "#4 DOCUMENT MANAGEMENT",
      icon: FileWarning,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-400/10",
      form483s: 140,
      warnings: 20,
      total: 160
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-auto">
      {/* Top Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">FDA</span>
            </div>
            <div>
              <div className="font-bold text-white">FDA</div>
              <div className="text-xs text-gray-400">TRACKER</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300">
            <span className="text-green-400">●</span>
            New 483
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            N
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-52 bg-slate-800 border-r border-slate-700 min-h-screen">
          <nav className="p-4 space-y-6">
            {/* Analytics Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Analytics</div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <ClipboardCheck className="w-4 h-4" />
                  Custom Checklists
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <Search className="w-4 h-4" />
                  Advanced Search
                </button>
              </div>
            </div>

            {/* FDA Actions Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">FDA Actions</div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  Form 483s
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                  Warning Letters
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <Shield className="w-4 h-4" />
                  Inspections
                </button>
              </div>
            </div>

            {/* Audit Readiness Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Audit Readiness</div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm bg-slate-700 text-blue-400">
                  <BarChart3 className="w-4 h-4" />
                  Six Systems
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <Users className="w-4 h-4" />
                  Investigators
                </button>
              </div>
            </div>

            {/* Companies Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Companies</div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <Building2 className="w-4 h-4" />
                  Companies
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors">
                  <Factory className="w-4 h-4" />
                  Facilities
                </button>
              </div>
            </div>

            {/* Software Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Software</div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    Manufacturing
                  </div>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4" />
                    Quality
                  </div>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-300 hover:bg-slate-700 transition-colors justify-between">
                  <div className="flex items-center gap-3">
                    <Beaker className="w-4 h-4" />
                    Laboratory
                  </div>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-400 mb-6">
            Dashboard <span className="mx-2">›</span> <span className="text-white">Six Systems</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-slate-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Top Subsystems</h1>
            <p className="text-gray-400 text-sm">Highest impact subsystems across FDA inspections</p>
          </div>

          {/* Subsystems List */}
          <div className="space-y-4">
            {subsystems.map((subsystem) => {
              const Icon = subsystem.icon;
              return (
                <Card key={subsystem.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${subsystem.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${subsystem.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{subsystem.name}</h3>
                          <p className="text-xs text-gray-500">{subsystem.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-400">{subsystem.form483s}</div>
                          <div className="text-xs text-gray-500">Form 483s</div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-orange-400">{subsystem.warnings}</div>
                          <div className="text-xs text-gray-500">Warnings</div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-yellow-400">{subsystem.total}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

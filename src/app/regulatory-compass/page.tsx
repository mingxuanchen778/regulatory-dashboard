"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Beaker,
  Pill,
  Activity,
  ChevronRight,
  ArrowRight
} from "lucide-react";

type ProductCategory = "Medical Device" | "Drug" | "Biologic" | null;
type ActiveTab = "Product Intake" | "Gap Analysis" | "Pathway Wizard" | "Checklists & Resources" | "Translation" | "Writing Assistant" | "Warning Letters" | "Citations & Audit";

interface FormData {
  productCategory: ProductCategory;
  productName: string;
  selectedMarkets: string[];
  developmentStage: string;
}

const STORAGE_KEY = "regulatory-compass-form";

export default function RegulatoryCompassPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Product Intake");
  const [productCategory, setProductCategory] = useState<ProductCategory>(null);
  const [productName, setProductName] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [developmentStage, setDevelopmentStage] = useState("");

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: FormData = JSON.parse(saved);
        setProductCategory(data.productCategory);
        setProductName(data.productName);
        setSelectedMarkets(data.selectedMarkets);
        setDevelopmentStage(data.developmentStage);
      } catch (error) {
        console.error("Failed to load form data:", error);
      }
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    const data: FormData = {
      productCategory,
      productName,
      selectedMarkets,
      developmentStage,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [productCategory, productName, selectedMarkets, developmentStage]);

  const tabs: ActiveTab[] = [
    "Product Intake",
    "Gap Analysis",
    "Pathway Wizard",
    "Checklists & Resources",
    "Translation",
    "Writing Assistant",
    "Warning Letters",
    "Citations & Audit"
  ];

  const markets = [
    { code: "US", name: "United States", authority: "FDA", flag: "🇺🇸" },
    { code: "EU", name: "European Union", authority: "EMA", flag: "🇪🇺" },
    { code: "CN", name: "China", authority: "NMPA", flag: "🇨🇳" },
    { code: "JP", name: "Japan", authority: "PMDA", flag: "🇯🇵" },
    { code: "CA", name: "Canada", authority: "Health Canada", flag: "🇨🇦" },
    { code: "UK", name: "United Kingdom", authority: "MHRA", flag: "🇬🇧" },
    { code: "AU", name: "Australia", authority: "TGA", flag: "🇦🇺" },
    { code: "BR", name: "Brazil", authority: "ANVISA", flag: "🇧🇷" },
    { code: "IN", name: "India", authority: "CDSCO", flag: "🇮🇳" },
    { code: "KR", name: "South Korea", authority: "MFDS", flag: "🇰🇷" },
    { code: "MX", name: "Mexico", authority: "COFEPRIS", flag: "🇲🇽" },
    { code: "RU", name: "Russia", authority: "Roszdravnadzor", flag: "🇷🇺" },
    { code: "ZA", name: "South Africa", authority: "SAHPRA", flag: "🇿🇦" },
    { code: "SA", name: "Saudi Arabia", authority: "SFDA", flag: "🇸🇦" },
    { code: "AE", name: "UAE", authority: "MOHAP", flag: "🇦🇪" },
    { code: "SG", name: "Singapore", authority: "HSA", flag: "🇸🇬" },
    { code: "MY", name: "Malaysia", authority: "NPRA", flag: "🇲🇾" },
    { code: "TH", name: "Thailand", authority: "Thai FDA", flag: "🇹🇭" },
    { code: "ID", name: "Indonesia", authority: "BPOM", flag: "🇮🇩" },
    { code: "PH", name: "Philippines", authority: "FDA", flag: "🇵🇭" },
    { code: "VN", name: "Vietnam", authority: "DAV", flag: "🇻🇳" },
    { code: "TW", name: "Taiwan", authority: "TFDA", flag: "🇹🇼" },
    { code: "HK", name: "Hong Kong", authority: "HKDH", flag: "🇭🇰" },
    { code: "NZ", name: "New Zealand", authority: "Medsafe", flag: "🇳🇿" },
    { code: "AR", name: "Argentina", authority: "ANMAT", flag: "🇦🇷" },
    { code: "CL", name: "Chile", authority: "ISP", flag: "🇨🇱" },
    { code: "CO", name: "Colombia", authority: "INVIMA", flag: "🇨🇴" },
    { code: "PE", name: "Peru", authority: "DIGEMID", flag: "🇵🇪" },
    { code: "TR", name: "Turkey", authority: "TITCK", flag: "🇹🇷" },
    { code: "IL", name: "Israel", authority: "MOH", flag: "🇮🇱" },
    { code: "EG", name: "Egypt", authority: "EDA", flag: "🇪🇬" },
    { code: "NG", name: "Nigeria", authority: "NAFDAC", flag: "🇳🇬" },
    { code: "KE", name: "Kenya", authority: "PPB", flag: "🇰🇪" },
    { code: "NO", name: "Norway", authority: "NOMA", flag: "🇳🇴" },
    { code: "CH", name: "Switzerland", authority: "Swissmedic", flag: "🇨🇭" },
    { code: "SE", name: "Sweden", authority: "MPA", flag: "🇸🇪" },
    { code: "DK", name: "Denmark", authority: "DKMA", flag: "🇩🇰" },
    { code: "FI", name: "Finland", authority: "Fimea", flag: "🇫🇮" },
    { code: "NL", name: "Netherlands", authority: "CBG-MEB", flag: "🇳🇱" },
    { code: "BE", name: "Belgium", authority: "FAMHP", flag: "🇧🇪" },
    { code: "AT", name: "Austria", authority: "BASG", flag: "🇦🇹" },
    { code: "PL", name: "Poland", authority: "URPL", flag: "🇵🇱" },
    { code: "ES", name: "Spain", authority: "AEMPS", flag: "🇪🇸" },
    { code: "IT", name: "Italy", authority: "AIFA", flag: "🇮🇹" },
    { code: "FR", name: "France", authority: "ANSM", flag: "🇫🇷" },
    { code: "DE", name: "Germany", authority: "BfArM", flag: "🇩🇪" },
    { code: "IE", name: "Ireland", authority: "HPRA", flag: "🇮🇪" },
    { code: "PT", name: "Portugal", authority: "INFARMED", flag: "🇵🇹" },
    { code: "GR", name: "Greece", authority: "EOF", flag: "🇬🇷" },
    { code: "CZ", name: "Czech Republic", authority: "SUKL", flag: "🇨🇿" }
  ];

  const developmentStages = [
    "Concept/Ideation",
    "Research & Development",
    "Preclinical Testing",
    "Clinical Trials Phase I",
    "Clinical Trials Phase II",
    "Clinical Trials Phase III",
    "Regulatory Submission",
    "Market Authorization",
    "Post-Market Surveillance"
  ];

  const toggleMarket = (code: string) => {
    setSelectedMarkets(prev =>
      prev.includes(code)
        ? prev.filter(m => m !== code)
        : [...prev, code]
    );
  };

  const handleStartAnalysis = () => {
    if (!productCategory || !productName || selectedMarkets.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    alert(`Starting analysis for ${productName} in ${selectedMarkets.length} markets`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Regulatory Compass</h1>
              <p className="text-xs text-gray-400">End-to-end regulatory strategy for devices, drugs, and biologics</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-teal-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-8">
        {activeTab === "Product Intake" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Intake</h2>
                <p className="text-gray-600">Let's start by understanding your product and regulatory goals</p>
              </div>

              {/* Product Category */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Product Category</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setProductCategory("Medical Device")}
                    className={`p-6 border-2 rounded-xl transition-all ${
                      productCategory === "Medical Device"
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Activity className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                    <div className="font-semibold text-gray-900">Medical Device</div>
                    <div className="text-xs text-gray-500 mt-1">Class I, II, III devices</div>
                  </button>

                  <button
                    onClick={() => setProductCategory("Drug")}
                    className={`p-6 border-2 rounded-xl transition-all ${
                      productCategory === "Drug"
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Pill className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                    <div className="font-semibold text-gray-900">Drug</div>
                    <div className="text-xs text-gray-500 mt-1">Pharmaceutical products</div>
                  </button>

                  <button
                    onClick={() => setProductCategory("Biologic")}
                    className={`p-6 border-2 rounded-xl transition-all ${
                      productCategory === "Biologic"
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Beaker className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                    <div className="font-semibold text-gray-900">Biologic</div>
                    <div className="text-xs text-gray-500 mt-1">Biological therapies</div>
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter your product name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Target Markets */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Markets <span className="text-gray-500 font-normal">(50 Major Regulatory Authorities)</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-white">
                  <div className="grid grid-cols-2 gap-2">
                    {markets.map((market) => (
                      <label
                        key={market.code}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMarkets.includes(market.code)}
                          onChange={() => toggleMarket(market.code)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{market.flag}</span>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{market.name}</div>
                            <div className="text-xs text-gray-500">{market.authority}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {selectedMarkets.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMarkets.map(code => {
                      const market = markets.find(m => m.code === code);
                      return (
                        <Badge key={code} className="bg-teal-100 text-teal-800">
                          {market?.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Development Stage */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Development Stage</label>
                <select
                  value={developmentStage}
                  onChange={(e) => setDevelopmentStage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">Select current stage</option>
                  {developmentStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Analysis Button */}
              <Button
                onClick={handleStartAnalysis}
                disabled={!productCategory || !productName || selectedMarkets.length === 0}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "Gap Analysis" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChevronRight className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gap Analysis</h2>
              <p className="text-gray-600">AI-powered identification of regulatory gaps and requirements</p>
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                Start Gap Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "Pathway Wizard" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pathway Wizard</h2>
              <p className="text-gray-600">Navigate regulatory pathways across global markets</p>
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                Launch Wizard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add more tab content as needed */}
        {!["Product Intake", "Gap Analysis", "Pathway Wizard"].includes(activeTab) && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeTab}</h2>
              <p className="text-gray-600">This feature is coming soon</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

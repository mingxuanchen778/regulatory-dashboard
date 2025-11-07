"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, FileText } from "lucide-react";

export default function AlertsPage() {
  const alerts = [
    {
      id: 1,
      title: "FDA 510(k) GAMP Framework Updated",
      description: "New premarket submission requirements for AI-enabled medical devices with enhanced cybersecurity provisions",
      date: "2 hours ago",
      isNew: true,
      severity: "high",
      region: "🇺🇸 United States"
    },
    {
      id: 2,
      title: "EMA Digital Health Technology Guidance",
      description: "European Medicines Agency published comprehensive guidance on digital health technologies",
      date: "1 day ago",
      isNew: false,
      severity: "medium",
      region: "🇪🇺 European Union"
    },
    {
      id: 3,
      title: "ISO 13485 Clinical Investigation Amendment",
      description: "Updated clinical investigation requirements for medical devices - Amendment 7 2024 published",
      date: "3 days ago",
      isNew: false,
      severity: "medium",
      region: "🌍 Global"
    },
    {
      id: 4,
      title: "China NMPA Class II Device Registration Update",
      description: "New requirements for Class II medical device registration and technical documentation",
      date: "5 days ago",
      isNew: false,
      severity: "high",
      region: "🇨🇳 China"
    },
    {
      id: 5,
      title: "Japan PMDA Software as Medical Device Guidelines",
      description: "Updated guidelines for software as medical device (SaMD) approval pathway",
      date: "1 week ago",
      isNew: false,
      severity: "medium",
      region: "🇯🇵 Japan"
    },
    {
      id: 6,
      title: "Health Canada Medical Device Regulations Amendment",
      description: "Amendments to medical device regulations for Class III and IV devices",
      date: "1 week ago",
      isNew: false,
      severity: "medium",
      region: "🇨🇦 Canada"
    },
    {
      id: 7,
      title: "FDA Cybersecurity in Medical Devices - Final Guidance",
      description: "Final guidance on cybersecurity for networked medical devices",
      date: "2 weeks ago",
      isNew: false,
      severity: "high",
      region: "🇺🇸 United States"
    },
    {
      id: 8,
      title: "MHRA Post-Brexit Medical Device Regulation",
      description: "Updated UK medical device regulation framework post-Brexit transition",
      date: "2 weeks ago",
      isNew: false,
      severity: "medium",
      region: "🇬🇧 United Kingdom"
    }
  ];

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Alerts</h1>
          <p className="text-sm sm:text-base text-gray-600">Stay updated with regulatory changes</p>
        </div>

        <Card className="transition-all hover:shadow-lg duration-300">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 ${alert.severity === 'high' ? 'bg-red-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <FileText className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      {alert.isNew && <Badge className="bg-red-500 flex-shrink-0">NEW</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{alert.region}</span>
                      <span>•</span>
                      <span>{alert.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

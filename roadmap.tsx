"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Target, TrendingUp, Download } from "lucide-react"
import FaspayRoadmap from "./roadmap/roadmap-timeline"
import FeaturePriorities from "./roadmap/feature-priorities"

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState("timeline")

  const downloadRoadmap = () => {
    // In a real app, this would generate and download a PDF
    alert("Roadmap PDF download would start here!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <span className="text-black font-bold text-2xl">F</span>
          </div>
          <h1 className="text-4xl font-bold gold-text-gradient">Faspay Product Roadmap</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Strategic development plan for building the next-generation digital banking platform
          </p>
          <Button onClick={downloadRoadmap} className="bg-primary hover:bg-primary/90 text-black">
            <Download className="h-4 w-4 mr-2" />
            Download Roadmap PDF
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">12 Months</div>
              <p className="text-sm text-muted-foreground">Development Timeline</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Target className="h-8 w-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">20 Features</div>
              <p className="text-sm text-muted-foreground">Core Functionalities</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">4 Phases</div>
              <p className="text-sm text-muted-foreground">Development Stages</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="priorities">Priority Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <FaspayRoadmap />
          </TabsContent>

          <TabsContent value="priorities" className="space-y-6">
            <FeaturePriorities />
          </TabsContent>
        </Tabs>

        {/* Executive Summary */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Executive Summary</CardTitle>
            <CardDescription>Key insights and strategic recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Strategic Goals</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Launch MVP within 12 weeks with core banking features</li>
                  <li>• Achieve 99.9% uptime and sub-2s load times</li>
                  <li>• Implement bank-level security from day one</li>
                  <li>• Build scalable architecture for 1M+ users</li>
                  <li>• Establish competitive advantage through AI and UX</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Success Metrics</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• User acquisition: 100K users in first 6 months</li>
                  <li>• Transaction volume: $10M monthly by end of year</li>
                  <li>• Customer satisfaction: 4.5+ app store rating</li>
                  <li>• Security: Zero major security incidents</li>
                  <li>• Performance: 95%+ feature adoption rate</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-primary mb-2">Investment Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Estimated development cost: $2.5M - $3.5M over 12 months, including team of 8-12 developers,
                infrastructure costs, compliance requirements, and third-party integrations. ROI expected within 18
                months through transaction fees and premium features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

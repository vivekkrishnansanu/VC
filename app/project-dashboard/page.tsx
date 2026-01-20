'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  TrendingUp,
  TrendingDown,
  Bell,
  Moon,
  Search,
  Calendar,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Clock
} from 'lucide-react'
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie, 
  Cell 
} from 'recharts'

const revenueData = [
  { name: 'Oct 25', Mobile: 329, Desktop: 166 },
  { name: 'Oct 31', Mobile: 380, Desktop: 200 },
  { name: 'Nov 7', Mobile: 420, Desktop: 250 },
  { name: 'Nov 14', Mobile: 380, Desktop: 220 },
  { name: 'Nov 21', Mobile: 450, Desktop: 280 },
  { name: 'Nov 28', Mobile: 400, Desktop: 240 },
  { name: 'Dec 5', Mobile: 480, Desktop: 300 },
  { name: 'Dec 12', Mobile: 520, Desktop: 320 },
  { name: 'Dec 19', Mobile: 490, Desktop: 310 },
  { name: 'Dec 26', Mobile: 550, Desktop: 350 },
  { name: 'Jan 2', Mobile: 510, Desktop: 330 },
  { name: 'Jan 9', Mobile: 580, Desktop: 380 },
  { name: 'Jan 18', Mobile: 600, Desktop: 400 }
]

const pieData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'In Progress', value: 25, color: '#3b82f6' },
  { name: 'Pending', value: 10, color: '#f59e0b' }
]

const navItems = [
  {
    title: 'Dashboards',
    items: [
      { title: 'Classic Dashboard', icon: LayoutDashboard },
      { title: 'E-commerce', icon: ShoppingCart },
      { title: 'Payment Dashboard', icon: BarChart3 },
      { title: 'Hotel Dashboard', icon: FileText }
    ]
  },
  {
    title: 'Project Management',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, active: true },
      { title: 'Project List', icon: FolderKanban }
    ]
  },
  {
    title: 'Sales',
    items: []
  },
  {
    title: 'CRM',
    items: []
  },
  {
    title: 'Website Analytics',
    items: []
  },
  {
    title: 'File Manager',
    items: []
  },
  {
    title: 'Crypto',
    items: []
  },
  {
    title: 'Academy/School',
    items: []
  },
  {
    title: 'Hospital Management',
    items: []
  },
  {
    title: 'Finance Dashboard',
    items: []
  },
  {
    title: 'Apps',
    items: [
      { title: 'Kanban', icon: FolderKanban }
    ]
  }
]

export default function ProjectDashboard() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Dashboards', 'Project Management'])

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar className="border-r bg-white">
          <SidebarContent>
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-4 border-b mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-lg">Shaden UI Kit</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4">
              {navItems.map((section) => (
                <div key={section.title} className="mb-4">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <span>{section.title}</span>
                    {section.items.length > 0 && (
                      expandedSections.includes(section.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    )}
                  </button>
                  {expandedSections.includes(section.title) && section.items.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon || LayoutDashboard
                        return (
                          <button
                            key={item.title}
                            className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                              item.active
                                ? 'bg-gray-100 text-gray-900 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Download Section */}
            <div className="px-4 py-4 border-t">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <CardTitle className="text-sm font-semibold mb-2">Download</CardTitle>
                  <CardDescription className="text-xs text-gray-600 mb-3">
                    Unlock lifetime access to all dashboards, templates and components.
                  </CardDescription>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm">
                    Get Shaden UI Kit
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* User Profile */}
            <div className="px-4 py-4 border-t">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">TB</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Toby Belhome</p>
                  <p className="text-xs text-gray-500 truncate">hello@tobybelhome.com</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="h-9 w-9" />
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 h-9 bg-gray-50 border-gray-200 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Moon className="h-5 w-5" />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">U</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">22 Dec 2025 - 18 Jan 2026</span>
                </div>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6 space-y-6">
              {/* Title and Tabs */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Dashboard</h1>
                <div className="flex gap-4 border-b border-gray-200">
                  <button className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
                    Overview
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                    Reports
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                    Activities
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <CardDescription className="text-sm font-medium text-gray-600">Total Revenue</CardDescription>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">$45,231.89</CardTitle>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+20.1% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <CardDescription className="text-sm font-medium text-gray-600">Active Projects</CardDescription>
                      <FolderKanban className="h-4 w-4 text-blue-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">1,423</CardTitle>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+5.02% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <CardDescription className="text-sm font-medium text-gray-600">New Leads</CardDescription>
                      <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">3,500</CardTitle>
                    <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      <span>-3.58% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <CardDescription className="text-sm font-medium text-gray-600">Time Spent</CardDescription>
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">168h 40m</CardTitle>
                    <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      <span>-3.58% from last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Projects Overview Chart */}
                <div className="lg:col-span-2">
                  <Card className="bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <CardTitle className="text-lg font-semibold">Projects Overview</CardTitle>
                          <CardDescription className="text-sm text-gray-500 mt-1">Total for the last 3 months.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="bg-gray-100 text-gray-900 border-gray-300">Last 3 months</Button>
                          <Button variant="outline" size="sm" className="text-gray-600">Last 30 days</Button>
                          <Button variant="outline" size="sm" className="text-gray-600">Last 7 days</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip />
                          <Area type="monotone" dataKey="Mobile" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMobile)" />
                          <Area type="monotone" dataKey="Desktop" stroke="#10b981" fillOpacity={1} fill="url(#colorDesktop)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Professionals & Highlights */}
                <div className="space-y-6">
                  <Card className="bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">Professionals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold mb-6">357</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-3">Today&apos;s Heroes</p>
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Avatar key={i} className="h-10 w-10 border-2 border-white">
                              <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                {String.fromCharCode(65 + i)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Avg. Client Rating</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">7.8/10</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Avg. Quotes</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">730</span>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Avg. Agent Earnings</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">$2,309</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bottom Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Reminder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full mb-6 bg-gray-900 hover:bg-gray-800 text-white">
                      Set Reminder
                    </Button>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                        <span className="text-sm text-gray-600">Low</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                        <span className="text-sm text-gray-600">Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                        <span className="text-sm text-gray-600">High</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Achievement by Year</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-6">
                      You completed more projects per day on average this year than last year.
                    </p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-gray-900">57</span>
                      <span className="text-sm text-gray-600">projects</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">2024</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Project Efficiency</CardTitle>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        January <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <CardDescription className="text-xs text-gray-500 mt-1">
                      January - June 2026
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={60}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

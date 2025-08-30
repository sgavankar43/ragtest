import React, { useState } from "react";
import {
  Menu,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Package,
  FileBarChart,
  Users,
  Settings,
  Bell,
  Receipt,
  LogOut,
  Search,
  Sun,
  Moon,
} from "lucide-react";

const Sidebar = ({ darkMode, setDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItemsMain = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Payments", icon: CreditCard },
    { label: "Analytics", icon: BarChart3 },
    { label: "Products", icon: Package },
    { label: "Reports", icon: FileBarChart },
    { label: "Customers", icon: Users },
  ];

  const navItemsSettings = [
    { label: "Settings", icon: Settings },
    { label: "Billing", icon: Receipt },
    { label: "Notifications", icon: Bell },
  ];

  const neumorph =
    darkMode
      ? "shadow-[inset_4px_4px_10px_#1a1a1a,inset_-4px_-4px_10px_#2c2c2c]"
      : "shadow-[inset_4px_4px_10px_#d1d9e6,inset_-4px_-4px_10px_#ffffff]";

  const bgColor = darkMode ? "bg-[#1e1e1e] text-white" : "bg-[#f1f3f6] text-gray-800";
  const cardColor = darkMode ? "bg-[#252525]" : "bg-[#e2e8f0]";
  const borderColor = darkMode ? "border-[#2c2c2c]" : "border-gray-300";

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } h-screen ${bgColor} p-4 transition-all duration-300 flex flex-col justify-between border-r ${borderColor}`}
    >
      <div>
        {/* Top controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-inherit rounded-full p-2 ${cardColor} hover:${neumorph}`}
          >
            <Menu />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`text-inherit rounded-full p-2 ${cardColor} hover:${neumorph}`}
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="text-xl font-bold">{!collapsed && "Astra"}</div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div
            className={`relative mb-6 rounded-full ${cardColor} p-2 ${neumorph}`}
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="w-full pl-10 pr-4 py-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="space-y-6">
          {/* Main */}
          <div>
            {!collapsed && <div className="text-xs text-gray-400 mb-2">MAIN</div>}
            <ul className="space-y-1">
              {navItemsMain.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${cardColor} hover:${neumorph}`}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span>{item.label}</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Settings */}
          <div>
            {!collapsed && <div className="text-xs text-gray-400 mb-2">SETTINGS</div>}
            <ul className="space-y-1">
              {navItemsSettings.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${cardColor} hover:${neumorph}`}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span>{item.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div
        className={`mt-6 p-3 rounded-xl ${cardColor} flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } ${neumorph}`}
      >
        <img
          src="https://i.pravatar.cc/40"
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        {!collapsed && (
          <div className="ml-3">
            <div className="text-sm font-medium">Joe Doe</div>
            <div className="text-xs text-gray-400">joe.doe@atheros.ai</div>
          </div>
        )}
        <button className="ml-auto text-gray-400 hover:text-red-500">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

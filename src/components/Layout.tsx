import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Calendar, 
  PieChart, 
  Settings,
  LogOut,
  Bell,
  Search,
  Kanban as KanbanIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen w-screen bg-white">
      {children}
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href="#" 
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100/50' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

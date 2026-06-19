/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Settings, Calendar, Mail, LayoutTemplate } from 'lucide-react';
import ContentPlan from './components/ContentPlan';
import Newsletters from './components/Newsletters';
import SettingsPanel from './components/SettingsPanel';
import { TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('content-plan');

  const renderContent = () => {
    switch (activeTab) {
      case 'content-plan':
        return <ContentPlan />;
      case 'newsletters':
        return <Newsletters />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <ContentPlan />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f5f5f5] font-sans text-gray-900">
      {/* Left Sidebar */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-gray-900" />
            AI Content Maker
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Startup School</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem
            icon={<Calendar className="w-5 h-5" />}
            label="1️⃣ Контент-план"
            isActive={activeTab === 'content-plan'}
            onClick={() => setActiveTab('content-plan')}
          />
          <NavItem
            icon={<Mail className="w-5 h-5" />}
            label="2️⃣ Рассылки"
            isActive={activeTab === 'newsletters'}
            onClick={() => setActiveTab('newsletters')}
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavItem
            icon={<Settings className="w-5 h-5" />}
            label="⚙ Настройки"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${
        isActive
          ? 'bg-gray-900 text-white shadow-md'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-gray-400'}>{icon}</span>
      {label}
    </button>
  );
}


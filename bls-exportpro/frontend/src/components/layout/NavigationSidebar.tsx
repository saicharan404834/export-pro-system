import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  FileText,
  PackageCheck,
  Shield,
  Boxes,
  ShoppingCart,
  BarChart3,
  Receipt,
  Plus,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Orders', path: '/orders', icon: <Package className="w-5 h-5" /> },
  { name: 'Create Order', path: '/create-order', icon: <Plus className="w-5 h-5" /> },
  { name: 'Invoices', path: '/invoices', icon: <FileText className="w-5 h-5" /> },
  { name: 'Invoice Generator', path: '/invoice-generator', icon: <Receipt className="w-5 h-5" /> },
  { name: 'Packing Lists', path: '/packing-lists', icon: <PackageCheck className="w-5 h-5" /> },
  { name: 'Regulatory', path: '/regulatory', icon: <Shield className="w-5 h-5" /> },
  { name: 'Inventory', path: '/inventory', icon: <Boxes className="w-5 h-5" /> },
  { name: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
];

export const NavigationSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40',
          isCollapsed ? 'w-16' : 'w-64',
          'h-screen',
          'bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/20',
          'flex flex-col',
          'transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          "p-4 border-b border-white/10",
          isCollapsed ? "flex flex-col items-center" : ""
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  BLS ExportPro
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Export Management</p>
              </div>
            )}
          </div>
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden lg:flex justify-center p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200",
              isCollapsed ? "mt-3 w-8" : "mt-4 w-full"
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className={cn("w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200", isCollapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1", isCollapsed ? "p-2" : "p-4")}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg transition-all duration-200',
                  isCollapsed ? 'justify-center px-2 py-2' : 'space-x-3 px-4 py-2.5',
                  'hover:bg-gray-200/50 dark:hover:bg-white/10',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 dark:border-white/20 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    'transition-colors flex-shrink-0',
                    isActive && 'text-blue-400'
                  )}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Controls */}
        <div className={cn("p-2 space-y-2 border-t border-gray-200 dark:border-white/10 mt-auto", isCollapsed && "px-1")}>
          {/* User Info */}
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 px-2 py-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={cn("flex gap-1", isCollapsed && "flex-col items-center")}>
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center justify-center gap-1 px-1 py-1 rounded transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                isCollapsed ? "w-6 h-6" : "flex-1"
              )}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3 h-3" />
                  {!isCollapsed && <span className="text-xs">Light</span>}
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3" />
                  {!isCollapsed && <span className="text-xs">Dark</span>}
                </>
              )}
            </button>
            
            <button
              onClick={logout}
              className={cn(
                "flex items-center justify-center gap-1 px-1 py-1 rounded transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-red-400",
                isCollapsed ? "w-6 h-6" : "flex-1"
              )}
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
              {!isCollapsed && <span className="text-xs">Sign Out</span>}
            </button>
          </div>

          {/* Version */}
          {!isCollapsed && (
            <div className="px-1 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">© 2024 BLS Pharma v1.0.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
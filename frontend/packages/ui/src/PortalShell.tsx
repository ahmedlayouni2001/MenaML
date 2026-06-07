import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface PortalShellProps {
  /** Portal name shown in the sidebar header, e.g. "Travel Agency". */
  portalName: string;
  nav: NavItem[];
  /** Currently active href (for highlight). */
  activeHref?: string;
  user?: { name?: string; email: string };
  onLogout?: () => void;
  children: ReactNode;
}

/** The shared app shell (sidebar + content) every portal reuses. */
export function PortalShell({ portalName, nav, activeHref, user, onLogout, children }: PortalShellProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-brand-700">MenaML</h1>
          <p className="text-xs text-gray-400">{portalName}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeHref === item.href ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
        {user && (
          <div className="p-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name ?? user.email}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            {onLogout && (
              <button onClick={onLogout} className="mt-2 text-xs text-gray-500 hover:text-gray-800">
                Sign out
              </button>
            )}
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

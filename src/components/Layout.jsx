import { NavLink, Outlet } from 'react-router-dom';
import InstallPrompt from './InstallPrompt';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/flashcards', label: 'Library' },
  { to: '/mistakes', label: 'Still learning' },
];

export default function Layout() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-sun/80">Portuguese Companion</p>
              <h1 className="font-display text-4xl text-white sm:text-5xl">European Portuguese for everyday life.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Explore Portuguese across a variety of topics and keep track of the phrases you've learned along the way.
              </p>
              <InstallPrompt />
            </div>
          </div>
        </header>

        <nav className="sticky bottom-3 z-10 mt-6">
          <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto rounded-full border border-white/10 bg-slate-950/80 p-2 shadow-soft backdrop-blur">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex-1 rounded-full px-4 py-3 text-center text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-r from-coral to-sun text-slate-950'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <main className="mt-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

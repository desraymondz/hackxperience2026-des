"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Settings2,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import styles from "./AdminShell.module.css";
import { useSettings } from "@/lib/hooks/use-settings";

export type AdminMetricTone = "neutral" | "amber" | "emerald" | "red";

export type AdminMetric = {
  key: string;
  label: string;
  value: string;
  helper: string;
  tone: AdminMetricTone;
  suffix?: string;
};

export type AdminShellState = {
  metrics: AdminMetric[];
};

const toneClassNames: Record<AdminMetricTone, string> = {
  neutral: styles.toneNeutral,
  amber: styles.toneAmber,
  emerald: styles.toneEmerald,
  red: styles.toneRed,
};

const defaultShellState: AdminShellState = {
  metrics: [
    {
      key: "total_submissions",
      label: "TOTAL_SUBMISSIONS",
      value: "0",
      helper: "received",
      tone: "neutral",
    },
    {
      key: "pending",
      label: "PENDING",
      value: "0",
      helper: "awaiting review",
      tone: "amber",
    },
    {
      key: "approved",
      label: "APPROVED",
      value: "0",
      helper: "cleared for showcase",
      tone: "emerald",
    },
    {
      key: "rejected",
      label: "REJECTED",
      value: "0",
      helper: "returned to team",
      tone: "red",
    },
    {
      key: "deadline_countdown",
      label: "DEADLINE_COUNTDOWN",
      value: "00.00.00",
      suffix: "s",
      helper: "until close",
      tone: "neutral",
    },
  ],
};

function formatDeadlineCountdown(value: Date | null, nowMs: number): {
  value: string;
  helper: string;
  tone: AdminMetricTone;
} {
  if (!value) {
    return {
      value: "00.00.00.00",
      helper: "until close",
      tone: "neutral",
    };
  }

  const diff = value.getTime() - nowMs;
  if (diff <= 0) {
    return {
      value: "00.00.00.00",
      helper: "closed",
      tone: "red",
    };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return {
    value: [days, hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join("."),
    helper: "until close",
    tone: "neutral",
  };
}

type AdminShellContextValue = {
  state: AdminShellState;
  setShell: (next: Partial<AdminShellState>) => void;
  resetShell: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

function useAdminShellContext() {
  const context = useContext(AdminShellContext);

  if (!context) {
    throw new Error("Admin shell context is unavailable.");
  }

  return context;
}

export function useAdminShell() {
  return useAdminShellContext();
}

export function AdminShellConfig({ value }: { value: Partial<AdminShellState> }) {
  const { setShell, resetShell } = useAdminShellContext();
  const signature = JSON.stringify(value);

  useEffect(() => {
    setShell(JSON.parse(signature) as Partial<AdminShellState>);
    return () => {
      resetShell();
    };
  }, [resetShell, setShell, signature]);

  return null;
}

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(defaultShellState);

  const setShell = useCallback((next: Partial<AdminShellState>) => {
    setState((prev) => ({
      ...prev,
      ...next,
      metrics: next.metrics ?? prev.metrics,
    }));
  }, []);

  const resetShell = useCallback(() => {
    setState(defaultShellState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      setShell,
      resetShell,
    }),
    [state, setShell, resetShell],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

const navGroups = [
  {
    heading: "MAIN",
    items: [
      { key: "dashboard", href: "/admin/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
      { key: "submissions", href: "/admin/submissions", label: "SUBMISSIONS", icon: List },
      { key: "results", href: "/admin/results", label: "AGGREGATE SCORES", icon: Sigma },
    ],
  },
  {
    heading: "SYSTEM",
    items: [
      { key: "settings", href: "/admin/settings", label: "SETTINGS", icon: Settings2 },
    ],
  },
] as const;

function getActiveNav(pathname: string) {
  if (pathname.startsWith("/admin/submissions")) return "submissions";
  if (pathname.startsWith("/admin/results")) return "results";
  if (pathname.startsWith("/admin/settings")) return "settings";
  return "dashboard";
}

function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ""}`}
      onClick={onClick}
    >
      <Icon className={styles.sidebarIcon} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function MetricCard({ metric }: { metric: AdminMetric }) {
  return (
    <article className={`${styles.metricCard} ${toneClassNames[metric.tone]}`}>
      <div className={styles.metricLabel}>{metric.label}</div>
      <div className={styles.metricValueRow}>
        <span className={styles.metricValue}>{metric.value}</span>
        {metric.suffix ? <span className={styles.metricSuffix}>{metric.suffix}</span> : null}
      </div>
      <div className={styles.metricHelper}>{metric.helper}</div>
    </article>
  );
}

function CountdownMetricCard({ metric }: { metric: AdminMetric }) {
  const parts = metric.value.split(".");
  const [d, h, m, s] = parts.length === 4 ? parts : ["00", "00", "00", "00"];

  return (
    <article className={`${styles.metricCard} ${toneClassNames[metric.tone]}`}>
      <div className={styles.metricLabel}>{metric.label}</div>
      <div className={styles.countdownRow}>
        <div className={styles.countdownSegment}>
          <span className={styles.metricValue}>{d}</span>
          <span className={styles.countdownUnit}>DAYS</span>
        </div>
        <span className={styles.metricValue} aria-hidden="true">:</span>
        <div className={styles.countdownSegment}>
          <span className={styles.metricValue}>{h}</span>
          <span className={styles.countdownUnit}>HRS</span>
        </div>
        <span className={styles.metricValue} aria-hidden="true">:</span>
        <div className={styles.countdownSegment}>
          <span className={styles.metricValue}>{m}</span>
          <span className={styles.countdownUnit}>MIN</span>
        </div>
        <span className={styles.metricValue} aria-hidden="true">:</span>
        <div className={styles.countdownSegment}>
          <span className={styles.metricValue}>{s}</span>
          <span className={styles.countdownUnit}>SEC</span>
        </div>
      </div>
      <div className={styles.metricHelper}>{metric.helper}</div>
    </article>
  );
}

export function AdminShellFrame({ children }: { children: ReactNode }) {
  const { settings, deadlineAt } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useAdminShellContext();
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState("admin");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const deadlineMetric = useMemo(
    () => formatDeadlineCountdown(deadlineAt, nowMs),
    [deadlineAt, nowMs],
  );
  const metrics = useMemo(
    () => state.metrics.map((metric) => (
      metric.key === "deadline_countdown" || metric.key === "deadline"
        ? {
          ...metric,
          value: deadlineMetric.value,
          suffix: undefined,
          helper: deadlineMetric.helper,
          tone: deadlineMetric.tone,
        }
        : metric
    )),
    [state.metrics, deadlineMetric.helper, deadlineMetric.tone, deadlineMetric.value],
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors and still force local redirect.
    }
    router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    if (pathname === "/admin/login" || pathname === "/admin") return;
    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = await response.json();
        if (cancelled) return;

        if (payload?.session?.role !== "admin") {
          router.replace("/admin/login");
          return;
        }
        if (typeof payload?.session?.username === "string") {
          setSessionUser(payload.session.username);
        }
      } catch {
        if (!cancelled) router.replace("/admin/login");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (pathname === "/admin/login" || pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className={styles.root}>
      <header className={`${styles.topbar} lg:ml-64`}>
        <div className={styles.topbarInner}>
          <Link href="/admin/dashboard" className={styles.brandLink} aria-label="HackX Admin home">
            <span className={styles.brandMark}>
              <span>HACK</span>
              <span className={styles.brandAccent}>X</span>
              <span>ADMIN</span>
            </span>
            <span className={styles.brandDivider} aria-hidden="true" />
            <span className={styles.commandText}>COMMAND_CENTER · 2026</span>
          </Link>

          <div className={styles.topbarRight}>
            <span className={styles.statusText}>
              SUBMISSION: <span className={styles.brandAccent}>{settings.submission_status ? "OPEN" : "CLOSED"}</span>
            </span>
            <span className={styles.handleText}>&gt; {sessionUser}</span>
            <button type="button" className={`${styles.topbarButton} ${styles.logoutButton}`} onClick={handleLogout}>
              <LogOut className={styles.buttonIcon} aria-hidden="true" />
              <span>LOGOUT</span>
            </button>
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileNavOpen}
            >
              <Menu className={styles.buttonIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <section className={`${styles.hero} lg:ml-64`}>
        <div className={styles.heroInner}>
          <h1 className={`${styles.heroTitle} ${styles.displayFont}`}>
            PROJECT <span className={styles.brandAccent}>SUBMISSION</span> PORTAL
          </h1>
        </div>
      </section>

      <section className={`${styles.metrics} lg:ml-64`} aria-label="Portal metrics">
        {metrics.map((metric) =>
          metric.key === "deadline_countdown" || metric.key === "deadline"
            ? <CountdownMetricCard key={metric.key} metric={metric} />
            : <MetricCard key={metric.key} metric={metric} />
        )}
      </section>

      <div className={styles.body}>
        <aside className={`${styles.sidebar} fixed top-0 left-0 h-screen overflow-hidden w-64 z-20`} aria-label="Admin navigation">
          <div className={styles.sidebarNav}>
            {navGroups.map((group) => (
              <section key={group.heading} className={styles.sidebarGroup}>
                <h2 className={styles.sidebarHeading}>// {group.heading}</h2>
                <nav className={styles.navList}>
                  {group.items.map((item) => {
                    const isActive = activeNav === item.key;
                    return (
                      <SidebarItem
                        key={item.key}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={isActive}
                      />
                    );
                  })}
                </nav>
              </section>
            ))}
          </div>
          <div className={styles.sidebarProfile}>
            <div className={styles.sidebarProfileInfo}>
              <span className={styles.sidebarProfileName}>&gt; {sessionUser}</span>
              <span className={styles.sidebarProfileRole}>// ADMIN</span>
            </div>
            <button
              type="button"
              className={styles.sidebarLogoutBtn}
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className={styles.buttonIcon} aria-hidden="true" />
            </button>
          </div>
        </aside>

        <main className={`${styles.main} lg:ml-64`}>{children}</main>
      </div>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={`${styles.mobileDrawerBackdrop} ${mobileNavOpen ? styles.mobileDrawerBackdropOpen : ""}`}
        aria-hidden="true"
        onClick={() => setMobileNavOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <nav
        className={`${styles.mobileDrawer} ${mobileNavOpen ? styles.mobileDrawerOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileNavOpen}
      >
        {/* Drawer header */}
        <div className={styles.mobileDrawerHeader}>
          <span className={styles.brandMark}>
            <span>HACK</span>
            <span className={styles.brandAccent}>X</span>
            <span>ADMIN</span>
          </span>
          <button
            type="button"
            className={styles.mobileDrawerClose}
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        {/* Nav groups */}
        <div className={styles.mobileDrawerNav}>
          {navGroups.map((group) => (
            <section key={group.heading} className={styles.sidebarGroup}>
              <h2 className={styles.sidebarHeading}>// {group.heading}</h2>
              <nav className={styles.navList}>
                {group.items.map((item) => {
                  const isActive = activeNav === item.key;
                  return (
                    <SidebarItem
                      key={item.key}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive}
                      onClick={() => setMobileNavOpen(false)}
                    />
                  );
                })}
              </nav>
            </section>
          ))}
        </div>

        {/* Logout at bottom */}
        <div className={styles.mobileDrawerFooter}>
          <button
            type="button"
            className={`${styles.topbarButton} ${styles.logoutButton} ${styles.mobileDrawerLogout}`}
            onClick={handleLogout}
          >
            <LogOut className={styles.buttonIcon} aria-hidden="true" />
            <span>LOGOUT</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

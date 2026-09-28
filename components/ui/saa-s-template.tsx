"use client";

import React from "react";
import { ArrowRight, CalendarDays, ChartNoAxesCombined, Menu, ShieldCheck, X } from "lucide-react";

type AionLandingProps = {
  signInHref: string;
  dashboardHref: string;
  signedIn: boolean;
  displayName?: string;
  signOutHref?: string;
};

const actionClass = "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-white via-white to-white/70 px-7 text-sm font-semibold text-black shadow-[0_16px_50px_rgba(255,255,255,.12)] transition duration-200 hover:scale-[1.035] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black";
const ghostClass = "inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium text-white/60 transition hover:bg-white/[.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

function AionMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`relative grid ${compact ? "h-9 w-9" : "h-10 w-10"} place-items-center rounded-full border border-white/12 bg-white/[.04]`}>
      <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true">
        <circle cx="32" cy="32" r="24" fill="none" stroke="#78e7c7" strokeWidth="5" strokeDasharray="98 55" strokeLinecap="round" />
        <path d="M23 43 32 18l9 25-9-7z" fill="#fff" />
      </svg>
    </span>
  );
}

function DashboardPreview() {
  const bars = [42, 61, 53, 76, 67, 89, 81, 96];
  return (
    <div id="painel" className="relative mx-auto w-full max-w-5xl pb-16">
      <div className="pointer-events-none absolute left-1/2 top-[-18%] h-[480px] w-[92%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(120,231,199,.16),rgba(119,114,232,.08)_38%,transparent_72%)] blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[430px] w-[82%] -translate-x-1/2 rounded-[50%] border border-white/[.07] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-[#0f1013] p-2 shadow-[0_48px_140px_rgba(0,0,0,.7)]">
        <div className="grid min-h-[440px] grid-cols-[76px_1fr] overflow-hidden rounded-[16px] bg-[#f1f2f5] md:grid-cols-[178px_1fr]">
          <aside className="flex flex-col bg-[#0b0c0f] px-4 py-5 text-white">
            <div className="flex items-center gap-2.5"><AionMark compact /><span className="hidden text-xs font-semibold md:block">Aion Finance</span></div>
            <div className="mt-10 grid gap-2">
              {["Visão geral", "Movimentações", "Orçamentos", "Agenda"].map((label, index) => (
                <div key={label} className={`flex h-9 items-center gap-2 rounded-lg px-2 ${index === 0 ? "bg-white/[.09] text-white" : "text-white/35"}`}><span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#78e7c7]" : "bg-white/20"}`} /><span className="hidden text-[10px] font-medium md:block">{label}</span></div>
              ))}
            </div>
          </aside>
          <div className="p-5 text-[#111216] md:p-8">
            <div className="mb-7 flex items-start justify-between gap-3">
              <div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#8b8f98]">Seu ritmo financeiro</p><h3 className="mt-1 text-lg font-semibold tracking-[-.03em] md:text-2xl">Tudo no tempo certo.</h3></div>
              <span className="rounded-lg bg-[#111216] px-3 py-2 text-[9px] font-semibold text-white shadow-lg">+ Nova movimentação</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 rounded-2xl bg-[#111216] p-4 text-white md:p-5"><span className="text-[9px] text-white/45">Patrimônio total</span><strong className="mt-3 block text-xl tracking-[-.04em] md:text-3xl">R$ 42.680,90</strong><small className="mt-2 block text-[9px] text-[#78e7c7]">↗ 4,8% este mês</small></div>
              <div className="rounded-2xl border border-black/[.04] bg-white p-4 md:p-5"><span className="text-[9px] text-[#8b8f98]">Saúde</span><strong className="mt-3 block text-2xl md:text-3xl">82</strong><small className="text-[9px] text-[#238269]">ritmo muito bom</small></div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_.6fr]">
              <div className="rounded-2xl border border-black/[.04] bg-white p-4 md:p-5">
                <div className="mb-6 flex items-center justify-between"><strong className="text-[11px]">Balanço do período</strong><span className="rounded-md bg-black/[.04] px-2 py-1 text-[8px] text-[#7772e8]">6 meses</span></div>
                <div className="flex h-24 items-end gap-2 md:h-28">{bars.map((height, index) => <span key={`${height}-${index}`} className="flex-1 rounded-t-md bg-gradient-to-t from-[#111216] to-[#7772e8]" style={{ height: `${height}%`, opacity: .5 + index * .055 }} />)}</div>
              </div>
              <div className="hidden rounded-2xl bg-[#dcf8ef] p-5 md:block"><CalendarDays className="h-4 w-4 text-[#20866a]" /><strong className="mt-7 block text-[11px] text-[#164c3d]">Hoje na agenda</strong><p className="mt-3 text-[9px] leading-5 text-[#397565]">09:30 · Revisar fatura<br />18:30 · Treino funcional</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Component({ signInHref, dashboardHref, signedIn, displayName, signOutHref }: AionLandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const actionHref = signedIn ? dashboardHref : signInHref;
  const actionText = signedIn ? "Abrir meu painel" : "Começar agora";

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] font-['Poppins','Segoe_UI',sans-serif] text-white selection:bg-[#78e7c7] selection:text-black">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-black/75 backdrop-blur-xl">
        <nav className="relative mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">
          <a href="#inicio" className="flex items-center gap-3" aria-label="Aion Finance — início"><AionMark compact /><span className="text-sm font-semibold tracking-[-.02em]">Aion Finance</span></a>
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"><a href="#recursos" className="text-sm text-white/45 transition hover:text-white">Recursos</a><a href="#painel" className="text-sm text-white/45 transition hover:text-white">Seu painel</a><a href="#seguranca" className="text-sm text-white/45 transition hover:text-white">Segurança</a></div>
          <div className="hidden items-center gap-2 md:flex">{signedIn && signOutHref ? <a href={signOutHref} target="_top" className={ghostClass}>Sair</a> : <a href={signInHref} target="_top" className={ghostClass}>Entrar</a>}<a href={actionHref} target="_top" className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/85">{signedIn ? "Continuar" : "Criar conta"}</a></div>
          <button type="button" className="rounded-lg p-2 text-white md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Abrir menu">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </nav>
        {mobileMenuOpen && <div className="border-t border-white/[.07] bg-black/95 px-6 py-5 md:hidden"><div className="flex flex-col gap-3"><a href="#recursos" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-white/60">Recursos</a><a href="#seguranca" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-white/60">Segurança</a><a href={actionHref} target="_top" className={`${actionClass} mt-2`}>{actionText}</a></div></div>}
      </header>

      <section id="inicio" className="relative flex min-h-screen flex-col items-center px-6 pb-8 pt-32 text-center md:pt-36">
        <div className="pointer-events-none absolute left-1/2 top-[-13rem] h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-white/[.035] blur-3xl" />
        <div className="relative z-10 mb-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[.045] px-4 py-2 text-xs text-white/48 backdrop-blur-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#78e7c7] shadow-[0_0_12px_#78e7c7]" />{signedIn ? `Tudo pronto para você, ${displayName?.split(" ")[0]}.` : "Sua vida financeira em uma única conta"}<ArrowRight className="h-3 w-3" /></div>
        <h1 className="relative z-10 max-w-4xl bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-[clamp(2.8rem,7vw,5.9rem)] font-medium leading-[1.02] tracking-[-.065em] text-transparent">Organize seu dinheiro.<br />Ganhe tempo para viver.</h1>
        <p className="relative z-10 mt-7 max-w-2xl text-sm leading-7 text-white/48 md:text-base">Finanças, metas, compromissos e mercado em um painel claro. Seus dados ficam salvos na sua conta e acompanham você com segurança.</p>
        <div className="relative z-10 mb-20 mt-9 flex flex-wrap items-center justify-center gap-4"><a href={actionHref} target="_top" className={actionClass}>{actionText}<ArrowRight className="h-4 w-4" /></a>{!signedIn && <a href={signInHref} target="_top" className={ghostClass}>Já tenho conta</a>}</div>
        <DashboardPreview />
      </section>

      <section id="recursos" className="border-y border-white/[.07] bg-white/[.018] px-6 py-20"><div className="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.08] md:grid-cols-3">
        {[{icon:ChartNoAxesCombined,title:"Veja o que muda",copy:"Gráficos, orçamento e metas mostram o efeito das suas escolhas."},{icon:CalendarDays,title:"Planeje o que vem",copy:"Compromissos e lembretes ficam ao lado da sua vida financeira."},{icon:ShieldCheck,title:"Entre com segurança",copy:"Sua senha é protegida e cada conta mantém os próprios dados separados."}].map(({icon:Icon,title,copy}) => <article key={title} className="bg-[#08090b] p-8 text-left"><Icon className="h-5 w-5 text-[#78e7c7]" /><h2 className="mt-8 text-lg font-medium tracking-[-.025em]">{title}</h2><p className="mt-3 text-sm leading-6 text-white/42">{copy}</p></article>)}
      </div></section>
      <footer id="seguranca" className="px-6 py-12 text-center text-xs text-white/28">Aion Finance · Dados separados por conta · Sessão protegida</footer>
    </main>
  );
}

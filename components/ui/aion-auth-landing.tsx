"use client";

import React from "react";
import { ArrowRight, CalendarDays, ChartNoAxesCombined, Menu, ShieldCheck, X } from "lucide-react";

type AionAuthLandingProps = {
  signInHref: string;
  dashboardHref: string;
  signedIn: boolean;
  displayName?: string;
  signOutHref?: string;
};

const linkButton = {
  ghost: "inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e7c7]",
  solid: "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#78e7c7] px-6 text-sm font-bold text-[#11162b] shadow-[0_10px_30px_rgba(120,231,199,.2)] transition hover:-translate-y-0.5 hover:bg-[#8ff0d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e7c7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1226]",
};

function AionMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
      <circle cx="32" cy="32" r="25" fill="none" stroke="#78e7c7" strokeWidth="5" strokeDasharray="106 52" strokeLinecap="round" />
      <path d="M23 43 32 18l9 25-9-7z" fill="#fff" />
    </svg>
  );
}

function DashboardPreview() {
  const bars = [44, 61, 52, 76, 66, 88, 80];
  return (
    <div className="relative mx-auto w-full max-w-[690px] [perspective:1200px]">
      <div className="absolute -inset-10 rounded-full bg-[#7772e8]/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[#f4f6fb] p-3 shadow-[0_45px_120px_rgba(0,0,0,.48)] md:rotate-[1.5deg]">
        <div className="grid min-h-[390px] grid-cols-[78px_1fr] overflow-hidden rounded-[22px] bg-[#e9edf6]">
          <aside className="flex flex-col items-center gap-5 bg-[#11162b] py-5">
            <AionMark />
            {[0, 1, 2, 3, 4].map((item) => (
              <span key={item} className={`h-7 w-7 rounded-lg ${item === 0 ? "bg-[#78e7c7]/20 ring-1 ring-[#78e7c7]/40" : "bg-white/7"}`} />
            ))}
          </aside>
          <div className="p-5 md:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#79829b]">Seu ritmo financeiro</p><h3 className="mt-1 font-serif text-xl font-bold text-[#11162b]">Tudo no tempo certo.</h3></div>
              <span className="rounded-full bg-white px-3 py-2 text-[9px] font-bold text-[#11162b] shadow-sm">+ Nova movimentação</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 rounded-2xl bg-[#11162b] p-4 text-white"><span className="text-[9px] text-white/55">Patrimônio total</span><strong className="mt-2 block text-xl">R$ 42.680,90</strong><small className="text-[9px] text-[#78e7c7]">↗ 4,8% este mês</small></div>
              <div className="rounded-2xl bg-white p-4"><span className="text-[9px] text-[#79829b]">Saúde</span><strong className="mt-2 block text-2xl text-[#11162b]">82</strong><small className="text-[9px] text-[#4d9fff]">ritmo muito bom</small></div>
            </div>
            <div className="mt-3 grid grid-cols-[1.35fr_.65fr] gap-3">
              <div className="rounded-2xl bg-white p-4">
                <div className="mb-5 flex items-center justify-between"><strong className="text-[11px] text-[#11162b]">Balanço do período</strong><span className="text-[9px] text-[#7772e8]">6 meses</span></div>
                <div className="flex h-24 items-end gap-2">
                  {bars.map((height, index) => <span key={height} className="flex-1 rounded-t-md bg-gradient-to-t from-[#7772e8] to-[#a4a0ff]" style={{ height: `${height}%`, opacity: .55 + index * .06 }} />)}
                </div>
              </div>
              <div className="rounded-2xl bg-[#e1f8ef] p-4"><CalendarDays className="h-4 w-4 text-[#20866a]" /><strong className="mt-4 block text-[11px] text-[#164c3d]">Agenda</strong><p className="mt-2 text-[9px] leading-4 text-[#397565]">09:30 · Revisar fatura<br />18:30 · Treino</p></div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-3 -top-9 hidden h-28 w-28 animate-[spin_16s_linear_infinite] rounded-full border border-dashed border-[#78e7c7]/60 md:block"><span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[#78e7c7] shadow-[0_0_22px_#78e7c7]" /></div>
    </div>
  );
}

export default function AionAuthLanding({ signInHref, dashboardHref, signedIn, displayName, signOutHref }: AionAuthLandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const actionHref = signedIn ? dashboardHref : signInHref;
  const actionText = signedIn ? "Abrir meu painel" : "Criar conta grátis";

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d1226] text-white selection:bg-[#78e7c7] selection:text-[#11162b]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(119,114,232,.24),transparent_34rem),radial-gradient(circle_at_14%_68%,rgba(120,231,199,.10),transparent_28rem)]" />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0d1226]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">
          <a href="#inicio" className="flex items-center gap-3" aria-label="Aion Finance — início"><AionMark /><span><b className="block font-serif text-lg leading-none">Aion Finance</b><small className="mt-1 block text-[9px] uppercase tracking-[.18em] text-white/45">Tempo & dinheiro</small></span></a>
          <div className="hidden items-center gap-8 md:flex"><a href="#por-que-aion" className="text-sm text-white/55 transition hover:text-white">Por que Aion</a><a href="#seguranca" className="text-sm text-white/55 transition hover:text-white">Segurança</a><a href="#painel" className="text-sm text-white/55 transition hover:text-white">Seu painel</a></div>
          <div className="hidden items-center gap-2 md:flex">
            {signedIn && signOutHref ? <a href={signOutHref} target="_top" className={linkButton.ghost}>Sair</a> : <a href={signInHref} target="_top" className={linkButton.ghost}>Entrar</a>}
            <a href={actionHref} target="_top" className={linkButton.solid}>{signedIn ? "Continuar" : "Criar conta"}<ArrowRight className="h-4 w-4" /></a>
          </div>
          <button type="button" className="rounded-full p-2 text-white md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Abrir menu">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </nav>
        {mobileMenuOpen && <div className="border-t border-white/8 bg-[#0d1226] px-6 py-5 md:hidden"><div className="flex flex-col gap-3"><a href="#por-que-aion" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70">Por que Aion</a><a href="#seguranca" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70">Segurança</a><a href={actionHref} target="_top" className={`${linkButton.solid} mt-2`}>{actionText}</a></div></div>}
      </header>

      <section id="inicio" className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 pb-20 pt-32 lg:grid-cols-[.85fr_1.15fr] lg:pt-24">
        <div className="relative z-10 animate-[aionRise_.65s_ease-out_both]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#78e7c7]/25 bg-[#78e7c7]/8 px-4 py-2 text-xs font-semibold text-[#9af0d5]"><span className="h-2 w-2 rounded-full bg-[#78e7c7] shadow-[0_0_14px_#78e7c7]" />Conta, finanças e agenda no mesmo ritmo</div>
          {signedIn && <p className="mb-3 text-sm font-semibold text-[#78e7c7]">Bom ter você de volta, {displayName?.split(" ")[0]}.</p>}
          <h1 className="max-w-[670px] font-serif text-[clamp(3.25rem,7vw,6.7rem)] font-medium leading-[.88] tracking-[-.065em]">Seu dinheiro.<br /><span className="text-white/38">Seu tempo.</span><br />Seu Aion.</h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-white/56 md:text-lg">Organize movimentações, compromissos, metas e o mercado em um painel que entende que cada decisão tem a sua hora.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3"><a href={actionHref} target="_top" className={`${linkButton.solid} h-13 px-8 text-base`}>{actionText}<ArrowRight className="h-4 w-4" /></a>{!signedIn && <span className="text-xs text-white/40">Sem nova senha. Entrada protegida pelo ChatGPT.</span>}</div>
        </div>
        <div id="painel" className="relative animate-[aionRise_.75s_.12s_ease-out_both]"><DashboardPreview /></div>
      </section>

      <section id="por-que-aion" className="relative border-t border-white/8 bg-white/[.025] px-6 py-20"><div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
        {[{ icon: ChartNoAxesCombined, title: "Dinheiro em movimento", copy: "Lançamentos e compromissos ficam salvos na sua conta, acessíveis de onde você entrar." },{ icon: CalendarDays, title: "Tempo no mesmo lugar", copy: "Sua agenda conversa com o financeiro para você enxergar o que vem pela frente." },{ icon: ShieldCheck, title: "Acesso com proteção", copy: "O Aion não recebe nem guarda a sua senha. A entrada é confirmada pelo ChatGPT." }].map(({icon: Icon,title,copy}) => <article key={title} className="rounded-[24px] border border-white/8 bg-white/[.035] p-7"><Icon className="h-5 w-5 text-[#78e7c7]" /><h2 className="mt-7 font-serif text-2xl">{title}</h2><p className="mt-3 text-sm leading-6 text-white/48">{copy}</p></article>)}
      </div></section>
      <section id="seguranca" className="relative px-6 py-14 text-center text-xs text-white/35">Aion Finance · Seus dados separados por conta · Sessão protegida</section>
    </main>
  );
}

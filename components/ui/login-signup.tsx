"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginCardSectionProps = {
  mode: "login" | "register";
  error?: string;
};

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  placeholder: string;
};

function PasswordField({ id, name, label, autoComplete, placeholder }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm text-white/65">{label}</label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/28"/>
        <Input id={id} name={name} type={visible ? "text" : "password"} required minLength={8} maxLength={128} autoComplete={autoComplete} placeholder={placeholder} className="h-11 rounded-xl border-white/10 bg-black/30 pl-10 pr-11 text-white placeholder:text-white/20 focus-visible:border-[#78e7c7]/60 focus-visible:ring-[#78e7c7]/15"/>
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`} aria-pressed={visible} className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-white/35 transition hover:bg-white/[.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e7c7]/70">
          {visible ? <EyeOff className="size-4" aria-hidden="true"/> : <Eye className="size-4" aria-hidden="true"/>}
        </button>
      </div>
    </div>
  );
}

function AionMark() {
  return <span className="relative block size-10 overflow-hidden rounded-xl border border-white/12 bg-white/[.045] shadow-[0_0_28px_rgba(31,196,255,.12)]"><Image src="/aion-logo.png" alt="" aria-hidden="true" fill sizes="40px" className="scale-[1.9] object-contain"/></span>;
}

export default function LoginCardSection({ mode, error }: LoginCardSectionProps) {
  const registering = mode === "register";
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050506] font-['Poppins','Segoe_UI',sans-serif] text-white selection:bg-[#78e7c7] selection:text-black">
      <style>{`.aion-grid-line{position:absolute;background:rgba(255,255,255,.07);transform-origin:center}.aion-grid-line[data-axis=x]{left:0;right:0;height:1px;transform:scaleX(0);animation:drawX .9s cubic-bezier(.22,.61,.36,1) forwards}.aion-grid-line[data-axis=y]{top:0;bottom:0;width:1px;transform:scaleY(0);animation:drawY 1s cubic-bezier(.22,.61,.36,1) forwards}.aion-login-card{opacity:0;transform:translateY(18px) scale(.985);animation:cardIn .7s cubic-bezier(.22,.61,.36,1) .2s forwards}.aion-stars{background-image:radial-gradient(circle,rgba(237,255,249,.28) 0 1px,transparent 1.3px);background-size:83px 71px;mask-image:radial-gradient(circle at center,black,transparent 78%)}@keyframes drawX{to{transform:scaleX(1)}}@keyframes drawY{to{transform:scaleY(1)}}@keyframes cardIn{to{opacity:1;transform:translateY(0) scale(1)}}@media(prefers-reduced-motion:reduce){.aion-grid-line,.aion-login-card{animation-duration:.01ms!important;animation-delay:0ms!important}}`}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_30%,rgba(255,255,255,.065),transparent_62%)]"/>
      <div className="aion-stars pointer-events-none absolute inset-0 opacity-60" aria-hidden="true"/>
      <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden="true"><span data-axis="x" className="aion-grid-line top-[18%]"/><span data-axis="x" className="aion-grid-line top-1/2 [animation-delay:.12s]"/><span data-axis="x" className="aion-grid-line top-[82%] [animation-delay:.24s]"/><span data-axis="y" className="aion-grid-line left-[22%] [animation-delay:.32s]"/><span data-axis="y" className="aion-grid-line left-1/2 [animation-delay:.4s]"/><span data-axis="y" className="aion-grid-line left-[78%] [animation-delay:.48s]"/></div>
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/[.075] bg-black/35 backdrop-blur-xl"><div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6"><Link href="/" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e7c7]"><Image src="/aion-logo.png" alt="Aion Finance" width={136} height={64} className="h-16 w-[136px] object-contain" priority/></Link><Link href="/" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[.035] px-4 text-sm text-white/60 transition hover:bg-white/[.07] hover:text-white"><ArrowLeft className="size-4"/><span className="hidden sm:inline">Voltar</span></Link></div></header>
      <section className="relative z-10 grid min-h-dvh place-items-center overflow-y-auto px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-28">
        <div className="w-full max-w-[440px]">
          <div className="mb-4 flex items-center justify-between px-1 text-[.72rem] font-medium uppercase tracking-[.16em] text-white/30"><span>Acesso seguro</span><span className="flex items-center gap-1.5"><ShieldCheck className="size-3"/> Dados protegidos</span></div>
          <Card className="aion-login-card relative gap-0 overflow-hidden rounded-[22px] border-white/[.11] bg-[#0d0e11]/90 py-0 shadow-[0_40px_120px_rgba(0,0,0,.65)] backdrop-blur-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#78e7c7]/65 to-transparent"/>
            <CardHeader className="gap-3 px-6 pb-5 pt-7 sm:px-8"><div className="grid grid-cols-2 rounded-xl border border-white/[.08] bg-black/25 p-1" role="tablist" aria-label="Escolha entre entrar e criar conta"><a href="/entrar" role="tab" aria-selected={!registering} className={`grid h-9 place-items-center rounded-lg text-sm font-medium transition ${!registering ? "bg-white text-black shadow-sm" : "text-white/45 hover:text-white"}`}>Entrar</a><a href="/entrar?mode=register" role="tab" aria-selected={registering} className={`grid h-9 place-items-center rounded-lg text-sm font-medium transition ${registering ? "bg-white text-black shadow-sm" : "text-white/45 hover:text-white"}`}>Criar conta</a></div><div className="mt-2 flex size-10 items-center justify-center rounded-xl border border-[#78e7c7]/20 bg-[#78e7c7]/[.075] text-[#78e7c7]"><LockKeyhole className="size-5"/></div><CardTitle className="text-[1.55rem] font-medium leading-tight tracking-[-.04em]">{registering ? "Comece com tudo zerado." : "Bem-vindo de volta."}</CardTitle><CardDescription className="text-[.9rem] leading-6 text-white/45">{registering ? "Crie sua conta e monte seu painel com os seus próprios números." : "Entre para continuar de onde parou."}</CardDescription></CardHeader>
            <CardContent className="px-6 pb-6 sm:px-8"><form className="grid gap-4" action={registering ? "/api/auth/register" : "/api/auth/login"} method="post">
              {registering && <div className="grid gap-2"><label htmlFor="name" className="text-sm text-white/65">Nome</label><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/28"/><Input id="name" name="name" required minLength={2} autoComplete="name" placeholder="Como você quer ser chamado" className="h-11 rounded-xl border-white/10 bg-black/30 pl-10 text-white placeholder:text-white/20 focus-visible:border-[#78e7c7]/60 focus-visible:ring-[#78e7c7]/15"/></div></div>}
              <div className="grid gap-2"><label htmlFor="email" className="text-sm text-white/65">E-mail</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/28"/><Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" className="h-11 rounded-xl border-white/10 bg-black/30 pl-10 text-white placeholder:text-white/20 focus-visible:border-[#78e7c7]/60 focus-visible:ring-[#78e7c7]/15"/></div></div>
              <PasswordField id="password" name="password" label="Senha" autoComplete={registering ? "new-password" : "current-password"} placeholder="Mínimo de 8 caracteres"/>
              {registering && <PasswordField id="confirmPassword" name="confirmPassword" label="Confirmar senha" autoComplete="new-password" placeholder="Digite a senha novamente"/>}
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/45"><input name="remember" value="on" type="checkbox" defaultChecked className="size-4 accent-[#78e7c7]"/>Manter conectado neste dispositivo</label>
              {error && <div role="alert" className="rounded-xl border border-[#ff8f81]/20 bg-[#ff8f81]/[.07] px-3.5 py-3 text-sm text-[#ffb4aa]">{error}</div>}
              <button type="submit" className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black shadow-[0_14px_40px_rgba(255,255,255,.09)] transition hover:scale-[1.01] hover:bg-white/90 active:scale-[.99]">{registering ? "Criar minha conta" : "Entrar na minha conta"}<ArrowRight className="size-4"/></button>
            </form></CardContent>
            <CardFooter className="justify-center border-t border-white/[.07] bg-white/[.018] px-6 py-4 text-xs text-white/32">{registering ? "Já tem uma conta?" : "Ainda não tem conta?"}<a href={registering ? "/entrar" : "/entrar?mode=register"} className="ml-1.5 font-medium text-[#78e7c7] hover:underline">{registering ? "Entrar" : "Criar agora"}</a></CardFooter>
          </Card>
          <p className="mt-4 text-center text-xs leading-5 text-white/25">Sua senha é protegida e nunca é armazenada em texto aberto.</p>
        </div>
      </section>
    </main>
  );
}

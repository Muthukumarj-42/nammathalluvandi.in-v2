import Image from "next/image";

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fffdf7] text-ink">
      <div className="text-center">
        <Image src="/brand/full-logo-with-background.webp" alt="Thalluvandi loading" width={180} height={180} sizes="180px" className="mx-auto animate-pulse drop-shadow-[0_0_32px_rgba(255,107,0,0.35)]" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-primary">Thalluvandi</p>
      </div>
    </div>
  );
}

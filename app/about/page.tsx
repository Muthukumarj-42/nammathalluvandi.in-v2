import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WA_PUBLISH, buildWAUrl } from "@/config/whatsapp";

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

const values = [
  [Wallet, "Affordable Start", "செலவு குறைந்த தொடக்கம்", "No big investment needed to begin your business", "பெரிய முதலீடு இல்லாமல் தள்ளுவண்டி வாடகை மூலம் எளிதாக தொழில் தொடங்கலாம்"],
  [MapPin, "Local Trust", "கோவை நம்பிக்கை", "We are from Coimbatore, we understand your needs", "நாங்க கோவையிலிருந்து தான். இங்குள்ள வியாபாரிகளுக்கு என்ன தேவை என்பதை நாங்கள் நன்கு அறிவோம்"],
  [HeartHandshake, "Vendor First", "வியாபாரி முதலில்", "Your success is our growth", "உங்கள் வெற்றியே எங்களது வளர்ச்சி, வியாபாரிகளுக்கு முன்னுரிமை அளிக்கிறோம்"]
];

export default function AboutPage() {
  return (
    <main className="bg-[#F8F6F2] pt-16 md:pt-28">
      <section className="pb-16 pt-24 md:pb-20 md:pt-0">
        <div className="site-container grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Text en="About Thalluvandi" ta="தள்ளுவண்டி பற்றி" />
            </p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-none text-ink md:text-7xl">
              <Text en="Serving entrepreneurs in Coimbatore" ta="கோவை வியாபாரிகளுக்காக உருவான சேவை" />
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted">
              <Text en="NammaThalluvandi.in helps people begin food businesses with less risk, better presentation, and practical local support." ta="குறைந்த முதலீட்டில் உணவு தொழில் தொடங்க விரும்பும் அனைவருக்கும் தள்ளுவண்டி வாடகை மூலம் எளிய முறையில் வழிகாட்டுகிறோம்." />
            </p>
          </div>
          <div className="relative rounded-2xl border border-black/10 bg-white p-6 shadow-premium">
            <div className="absolute inset-8 rounded-full bg-primary/15 blur-3xl" />
            <Image src="/brand/full-logo-with-background.webp" alt="Thalluvandi food cart rentals Coimbatore Tamil Nadu" width={640} height={640} sizes="(max-width: 768px) 100vw, 640px" className="relative w-full drop-shadow-[0_0_48px_rgba(255,107,0,0.22)]" />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="site-container">
          <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Text en="Our Story" ta="எங்கள் கதை" />
            </h2>
            <p className="mt-4 max-w-[680px] text-lg leading-8 text-muted">
              <span className="en">
                Thalluvandi was started by a family that has been in the food cart business for over a decade in Coimbatore. We saw how hard it was for new vendors to afford a cart upfront, so we built a rental system that lets anyone start with minimal investment. Today we manage a growing fleet of carts across Coimbatore, focusing entirely on helping local vendors establish successful businesses.
              </span>
              <span className="ta tamil-text">
                தள்ளுவண்டி என்பது கோவையில் தள்ளுவண்டி உற்பத்தி மற்றும் வாடகை சேவையில் ஒரு தசாப்த காலமாக ஈடுபட்டுள்ள ஒரு குடும்பத்தினால் தொடங்கப்பட்ட எளிய வாடகை சேவை. புதிய வியாபாரிகள் முதலீடு இன்றி சுலபமாக தொழிலைத் தொடங்க ஒரு நாள் வாடகையில் பல்வேறு வண்டிகளை வழங்குகிறோம்.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="site-container">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Text en="Our Values" ta="எங்கள் நம்பிக்கை" />
          </h2>
          <div className="mt-6 grid items-stretch gap-4 md:grid-cols-3 md:gap-6">
            {values.map(([Icon, title, tamilTitle, copy, tamilCopy]) => (
              <div key={title as string} className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <Icon className="text-primary" size={30} />
                <h3 className="mt-5 font-display text-4xl uppercase text-ink">
                  <Text en={title as string} ta={tamilTitle as string} />
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  <Text en={copy as string} ta={tamilCopy as string} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="site-container grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
            <h2 className="font-display text-5xl uppercase leading-none text-ink">
              <Text en="Who We Serve" ta="யாருக்கு உதவுகிறோம்?" />
            </h2>
            <p className="mt-4 max-w-[680px] text-lg leading-8 text-muted">
              <Text
                en="We serve tea vendors, juice sellers, fast food starters, snack cart operators, and anyone wanting to run a street food business in Coimbatore. No experience needed — just your passion and our cart."
                ta="டீ, ஜூஸ், ஃபாஸ்ட் ஃபுட், ஸ்நாக்ஸ் — கோவையில் தள்ளுவண்டி வியாபாரம் தொடங்க நினைக்கும் அனைவருக்கும் நாங்க வண்டி தருகிறோம். தொழில் தொடங்க ஆர்வம் இருந்தால் போதும், எளிய முறையில் தொடங்கலாம்."
              />
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-white p-6 md:p-8">
            <h2 className="font-display text-5xl uppercase leading-none text-ink">
              <Text en="Get In Touch" ta="தொடர்பு கொள்ள" />
            </h2>
            <p className="mt-4 max-w-[680px] text-lg leading-8 text-muted">
              <Text 
                en="Ready to start your business or want to know more about our food cart rental options? Contact us today!" 
                ta="தொழில் தொடங்க தயாரா? அல்லது எங்கள் தள்ளுவண்டி வாடகை சேவைகளைப் பற்றி மேலும் அறிய வேண்டுமா? இன்றே எங்களைத் தொடர்பு கொள்ளுங்கள்!" 
              />
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#20ba5a] text-white">
                <Link href="/contact" className="en">
                  Contact Us
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#20ba5a] text-white ta tamil-text">
                <Link href="/contact">
                  தொடர்பு கொள்ள
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

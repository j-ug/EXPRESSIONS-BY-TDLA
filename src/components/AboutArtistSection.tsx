import React, { useState } from 'react';
import { ARTIST_INFO } from '../data/artworks';
import { Phone, Mail, MessageSquare, MapPin, Sparkles, Send, CheckCircle2 } from 'lucide-react';

interface AboutArtistSectionProps {
  scrollProgress: number;
  onReturnToGallery: () => void;
}

export const AboutArtistSection: React.FC<AboutArtistSectionProps> = ({
  scrollProgress,
  onReturnToGallery,
}) => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Fade in when scroll reaches the final exit threshold (> 0.86)
  const isVisible = scrollProgress >= 0.85;
  const opacity = Math.min(1, Math.max(0, (scrollProgress - 0.85) / 0.08));

  if (!isVisible && opacity <= 0.01) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      try {
        const mailtoUrl = `mailto:${ARTIST_INFO.email}?subject=Botanical%20Art%20Commission%20from%20${encodeURIComponent(
          inquiryName
        )}&body=${encodeURIComponent(inquiryMessage + '\n\nContact: ' + inquiryEmail)}`;
        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        // Fallback for strict sandbox
      }
    }, 1200);
  };

  return (
    <section
      style={{ opacity }}
      className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-8 overflow-y-auto pointer-events-auto bg-[#f7f2eb]/88 backdrop-blur-xl transition-opacity duration-700"
    >
      <div className="w-full max-w-4xl mx-auto my-auto bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Background ambient sunbeam flare */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#f0ba65]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#c49258]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Artist Bio & Heritage */}
          <div className="md:col-span-7 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5ecdf] border border-[#ded0be] text-[#78573a] text-xs uppercase tracking-widest mb-4 w-fit shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#9e6d3d]" />
              <span>The Atelier & Botanical Vision</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-[#2d1f14] tracking-tight mb-2">
              {ARTIST_INFO.name}
            </h2>

            <p className="font-serif italic text-lg text-[#6e5138] mb-4">
              {ARTIST_INFO.discipline}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#7d6148] mb-6">
              <MapPin className="w-3.5 h-3.5 text-[#8c5e34]" />
              <span>{ARTIST_INFO.location}</span>
            </div>

            <p className="text-sm text-[#5c4634] leading-relaxed mb-4">
              {ARTIST_INFO.statement}
            </p>

            <p className="text-xs sm:text-sm text-[#735b47] leading-relaxed mb-8">
              {ARTIST_INFO.background}
            </p>

            {/* Direct Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <a
                href={ARTIST_INFO.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f9f3e9] hover:bg-[#f3e9dc] border border-[#ded0be] hover:border-[#bda58c] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#ede0ce] flex items-center justify-center text-[#85582f] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7d6148]">
                    WhatsApp Direct
                  </div>
                  <div className="text-xs font-semibold text-[#2d1f14]">
                    {ARTIST_INFO.phone}
                  </div>
                </div>
              </a>

              <a
                href={ARTIST_INFO.social.emailLink}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f9f3e9] hover:bg-[#f3e9dc] border border-[#ded0be] hover:border-[#bda58c] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#ede0ce] flex items-center justify-center text-[#85582f] group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7d6148]">
                    Email Atelier
                  </div>
                  <div className="text-xs font-semibold text-[#2d1f14] truncate">
                    {ARTIST_INFO.email}
                  </div>
                </div>
              </a>
            </div>

            <div>
              <button
                onClick={onReturnToGallery}
                className="text-xs font-mono tracking-wider uppercase text-[#7d6148] hover:text-[#2d1f14] transition-colors underline underline-offset-4 cursor-pointer"
              >
                ← Return to 3D Gallery Walk
              </button>
            </div>
          </div>

          {/* Right Column: Acquisition & Commission Inquiry */}
          <div className="md:col-span-5 bg-[#f8f2e6] border border-[#ded0be] rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-serif text-xl text-[#2d1f14] mb-1">
              Private Commission & Acquisition
            </h3>
            <p className="text-xs text-[#6e543f] mb-4 leading-relaxed">
              Dr. Ophylia accepts select commissions for botanical architectural installations, pressed leaf herbaria, and custom floral landscape panels.
            </p>

            {submitted ? (
              <div className="py-8 text-center flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-[#85582f] mb-3 animate-bounce" />
                <h4 className="font-serif text-lg text-[#2d1f14] mb-1">Inquiry Prepared</h4>
                <p className="text-xs text-[#6e543f] max-w-xs">
                  Opening your default email client to connect directly with Dr. Ophylia Vinodhini.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-wider text-[#7d6148] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Collector / Curator"
                    className="w-full px-3 py-2 rounded-lg bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#96683b] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-wider text-[#7d6148] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="curator@collection.org"
                    className="w-full px-3 py-2 rounded-lg bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#96683b] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-wider text-[#7d6148] mb-1">
                    Message / Specimen Interest
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Inquiring about artwork acquisition or private botanical leaf commission..."
                    className="w-full px-3 py-2 rounded-lg bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#96683b] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-xs font-semibold border border-[#9e6d3d] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Commission Inquiry</span>
                </button>

                <div className="text-center pt-1">
                  <a
                    href={`tel:${ARTIST_INFO.phone}`}
                    className="inline-flex items-center gap-1.5 text-[11px] text-[#7d6148] hover:text-[#2d1f14] transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Direct phone: {ARTIST_INFO.phone}</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

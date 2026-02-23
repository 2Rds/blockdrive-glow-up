import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ScrollReveal";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Programmed Incompleteness?",
    answer: "Programmed Incompleteness is our breakthrough security approach where critical bytes are extracted from your encrypted files before storage. Without these bytes, the remaining data is mathematically unreadable — even if someone gains access to the storage servers, they cannot reconstruct your files.",
  },
  {
    question: "How is this different from traditional encryption?",
    answer: "Traditional encryption relies on keeping keys secret. If keys are compromised, all your data is exposed. With BlockDrive, even if encryption is somehow broken or our system is breached, attackers only get incomplete data that's useless without the separated critical bytes stored elsewhere.",
  },
  {
    question: "Can BlockDrive access my files?",
    answer: "No. Your files are encrypted client-side using keys derived from your wallet before they ever leave your device. We never have access to your encryption keys or the complete file data. Only you can decrypt and reconstruct your files.",
  },
  {
    question: "What happens if I lose access to my account?",
    answer: "BlockDrive uses Dynamic's embedded wallet infrastructure — backed by Fireblocks — with built-in account recovery. You can recover your account through email, phone, or passkeys — no seed phrases to lose. Recovery is secured by MPC key splitting, so your data remains safe while still being recoverable.",
  },
  {
    question: "Is my data really on the blockchain?",
    answer: "Your encrypted file data is stored on distributed storage (IPFS and Cloudflare R2) for efficiency and cost. The blockchain (Solana) stores an immutable record of your files, access controls, and audit trail — providing transparency and verification without blockchain storage costs.",
  },
  {
    question: "How fast is file retrieval?",
    answer: "File retrieval is near-instant. Critical bytes are fetched from our low-latency edge network while encrypted data streams from IPFS. Client-side reconstruction and decryption happens in milliseconds, so you experience speeds comparable to traditional cloud storage.",
  },
];

const FAQItem = ({ item, isOpen, onToggle }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 md:gap-4 py-4 md:py-6 text-left group"
      >
        <span className={cn(
          "text-sm md:text-base font-medium transition-colors duration-200",
          isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {item.question}
        </span>
        <span className={cn(
          "flex-shrink-0 mt-0.5 transition-colors duration-200",
          isOpen ? "text-primary" : "text-muted-foreground"
        )}>
          {isOpen ? (
            <Minus className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] pb-4 md:pb-6" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed pr-8 md:pr-12">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 md:py-28 px-4 md:px-6">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10 md:mb-16">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-foreground">
              Frequently Asked{" "}
              <span className="text-gradient">Questions</span>
            </h2>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={200}>
          <div className="rounded-xl md:rounded-2xl glass-card p-2 md:p-4">
            <div className="px-3 md:px-6">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  item={faq}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

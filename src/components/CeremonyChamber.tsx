import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../store/useUIStore';
import { getDailyPrompt } from '../utils/prompts';
import { feedback } from '../utils/feedback';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '../utils';

import { EnclaveStore, generateRecoveryPhrase, deriveKeyFromPhrase, encryptData } from '../utils/crypto';

export function CeremonyChamber() {
  const { ceremonyState, setCeremonyState } = useUIStore();
  const [journalText, setJournalText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [recoveryPhraseVisible, setRecoveryPhraseVisible] = useState<string | null>(null);

  useEffect(() => {
    if (ceremonyState === 'entering') {
      setPrompt(getDailyPrompt());
      // Auto move to ritual after a brief pause
      const t = setTimeout(() => {
        setCeremonyState('ritual');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [ceremonyState, setCeremonyState]);

  // Calculate opacity based on typing (weight transfer)
  // Max opacity reduction at 200 characters
  const fogOpacity = Math.max(0.2, 1 - Math.min(200, journalText.length) / 200);

  const handleSeal = async () => {
    if (journalText.length < 10) return; // Prevent accidental empty seals
    
    // Crypto Enclave Execution
    let phrase = await EnclaveStore.loadKeyReference();
    if (!phrase) {
        phrase = await generateRecoveryPhrase();
        await EnclaveStore.saveKeyReference(phrase);
        setRecoveryPhraseVisible(phrase);
    }
    
    const key = await deriveKeyFromPhrase(phrase);
    const { cipher, iv } = await encryptData(journalText, key);
    
    // Fake Backend Sync
    console.log("[Iterum Secure Enclave] Encrypted Payload Sent via E2EE:", { cipher, iv });
    
    feedback.celebrate();
    setCeremonyState('sealed');
    
    // In a real app we'd trigger the supabase mutation here
    // But we don't auto-close the UI, 'sealed' remains active forever to lock the app
  };

  if (ceremonyState === 'idle') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="ceremony-chamber"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1.5 } }}
        className={cn(
          "fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 sm:p-12 transition-colors duration-1000",
          ceremonyState === 'sealed' ? "bg-[#f5efe6] text-[#2c1f14] dark:bg-[#e6dccf]" : "bg-[#0C0C0C] text-[#ede0d0]"
        )}
      >
        {ceremonyState === 'sealed' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 2 }}
            className="text-center max-w-2xl"
          >
            <h1 className="font-sans text-2xl font-bold tracking-[0.2em] mb-4 uppercase text-[#2c1f14]">
              [ DESCANSA. LA FORJA TE ESPERA MAÑANA. ]
            </h1>
            {recoveryPhraseVisible && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="mt-12 bg-[#2c1f14] text-[#ede0d0] p-8 rounded-[32px] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#c9935a]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#c9935a] mb-4">
                  Tu Clave Maestra de Recuperación
                </h3>
                <p className="text-sm opacity-80 mb-6 max-w-md mx-auto">
                  Tu diario ha sido sellado con criptografía Zero-Knowledge (AES-GCM). Solo esta frase puede descifrar la Bóveda en caso de perder este dispositivo. Copíala en un lugar seguro.
                </p>
                <div className="bg-[#1a120b] p-4 rounded-xl flex flex-wrap gap-2 justify-center font-mono">
                  {recoveryPhraseVisible.split(' ').map((word: string, i: number) => (
                    <span key={i} className="text-xs bg-[#0C0C0C] px-3 py-1 rounded-md text-white/90">
                      {i + 1}. {word}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Dynamic Fog Background */}
            <motion.div
              className="absolute inset-0 bg-[#0C0C0C] pointer-events-none"
              animate={{ opacity: fogOpacity }}
              transition={{ duration: 0.5 }}
            />

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center flex-1 py-20">
              {/* Daily Prompt */}
              <motion.h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center mb-16 font-sans text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: ceremonyState === 'ritual' ? 1 : 0.4, y: 0 }}
                transition={{ duration: 1.5 }}
              >
                {prompt}
              </motion.h2>

              {/* Cognitive Unload Area */}
              <AnimatePresence>
                {ceremonyState === 'ritual' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="w-full flex-1 flex flex-col relative"
                  >
                    <textarea
                      autoFocus
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Escribe en el vacío..."
                      className="w-full h-full bg-transparent text-lg md:text-xl text-white/90 placeholder:text-white/20 resize-none outline-none font-serif leading-relaxed"
                      spellCheck={false}
                    />

                    {/* Seal Sequence trigger */}
                    {journalText.length >= 10 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -bottom-10 left-0 right-0 flex justify-center"
                      >
                        <button
                          onClick={handleSeal}
                          className="flex items-center gap-3 text-[#c9935a] hover:text-white transition-colors group px-6 py-4"
                        >
                          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Swipe para Sellar</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

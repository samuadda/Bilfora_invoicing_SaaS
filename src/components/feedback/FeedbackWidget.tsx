"use client";

import { useEffect, useState } from "react";
import { MessageSquare, X, Send, Loader2, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { supabasePersistent } from "@/lib/supabase-clients";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/Button";

interface FeedbackUser {
  id: string;
  name: string;
  email: string;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<FeedbackUser | null>(null);
  
  // Wizard state
  const [step, setStep] = useState(1);
  const [uiRating, setUiRating] = useState<number | null>(null);
  const [likedMost, setLikedMost] = useState("");
  const [hatedMost, setHatedMost] = useState("");
  const [missingFeatures, setMissingFeatures] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initFeedbackState = async () => {
      try {
        const { data: { user } } = await supabasePersistent.auth.getUser();
        if (!user) return;

        if (mounted) {
          setCurrentUser({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
            email: user.email || "",
          });
        }

        const { data, error } = await supabasePersistent
          .from("profiles")
          .select("has_submitted_feedback")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (mounted && data) {
          setHasSubmitted(data.has_submitted_feedback);
        }
      } catch (err) {
        console.error("Error loading feedback state:", err);
      }
    };

    initFeedbackState();

    const handleInvoiceCreated = () => {
      if (!hasSubmitted) {
        setTimeout(() => setIsOpen(true), 1500);
      }
    };

    window.addEventListener("invoice-created", handleInvoiceCreated);

    return () => {
      mounted = false;
      window.removeEventListener("invoice-created", handleInvoiceCreated);
    };
  }, [hasSubmitted]);

  const handleSubmit = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      // 1. Send Email via Edge Function
      const { data, error: invokeError } = await supabasePersistent.functions.invoke("send-feedback", {
        body: {
          name: currentUser.name,
          email: currentUser.email,
          uiRating,
          likedMost: likedMost.trim(),
          hatedMost: hatedMost.trim(),
          missingFeatures: missingFeatures.trim(),
        },
      });

      if (invokeError) {
        throw new Error(`Edge Function Error: ${invokeError.message || JSON.stringify(invokeError)}`);
      }

      if (data?.error) {
        const errorDetails = typeof data.error === 'object' && data.error.message ? data.error.message : JSON.stringify(data.error);
        throw new Error(`Resend Refused: ${errorDetails}`);
      }

      // 2. Insert into database
      const { error: dbError } = await supabasePersistent.from("feedback").insert({
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_email: currentUser.email,
        ui_rating: uiRating,
        liked_most: likedMost.trim(),
        hated_most: hatedMost.trim(),
        missing_features: missingFeatures.trim(),
      });

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);

      // 3. Update profile to prevent future popups
      const { error: profileError } = await supabasePersistent
        .from("profiles")
        .update({ has_submitted_feedback: true })
        .eq("id", currentUser.id);

      if (profileError) throw new Error(`Profile Update Error: ${profileError.message}`);

      setHasSubmitted(true);
      setShowSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setShowSuccess(false);
          setStep(1);
          setUiRating(null);
          setLikedMost("");
          setHatedMost("");
          setMissingFeatures("");
        }, 500); 
      }, 3000);
      
    } catch (err) {
      console.error("Feedback submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "لم نتمكن من إرسال ملاحظاتك، يرجى المحاولة لاحقاً.";
      toast({
        title: "عذراً، حدث خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sticky button in the bottom left
  const StickyButton = (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-3 bg-[#7f2dfb] hover:bg-[#6c26d9] text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group"
        aria-label="شاركني رأيك"
      >
        <MessageSquare className="w-5 h-5 md:ml-2" />
        <span className="hidden md:block font-medium">شاركني رأيك</span>
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">كيف تقيم تصميم الواجهة؟</h3>
            <p className="text-gray-500 mb-6 text-sm">أريد أن أعرف مدى سهولة استخدامك للنظام وشعورك العام نحو التصميم.</p>
            <div className="flex justify-center flex-row-reverse gap-4 my-8">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setUiRating(rating)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all font-bold text-2xl border-2 ${
                    uiRating === rating 
                      ? "bg-[#7f2dfb] text-white scale-110 shadow-md border-[#7f2dfb]" 
                      : "bg-white text-gray-400 border-gray-100 hover:border-[#7f2dfb]/50 hover:text-[#7f2dfb]"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ما أكثر شيء أعجبك؟</h3>
            <p className="text-gray-500 mb-4 text-sm">أخبرني عن الميزات أو الأجزاء التي نالت إعجابك وتجدها مفيدة.</p>
            <textarea
              rows={4}
              value={likedMost}
              onChange={(e) => setLikedMost(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all resize-none outline-none"
            />
          </div>
        );
      case 3:
        return (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ما أكثر شيء أزعجك أو لم يعجبك؟</h3>
            <p className="text-gray-500 mb-4 text-sm">أنا أقدر صراحتك. ما الذي يسبب لك إحباطاً أو صعوبة في الاستخدام؟</p>
            <textarea
              rows={4}
              value={hatedMost}
              onChange={(e) => setHatedMost(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all resize-none outline-none"
            />
          </div>
        );
      case 4:
        return (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">هل هناك ميزة تمنيت وجودها ولم تجدها؟</h3>
            <p className="text-gray-500 mb-4 text-sm">إذا كان هناك أداة أو ميزة ستجعل حياتك أسهل، أخبرني بها!</p>
            <textarea
              rows={4}
              value={missingFeatures}
              onChange={(e) => setMissingFeatures(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all resize-none outline-none"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!isOpen && StickyButton}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !isSubmitting && !showSuccess && setIsOpen(false)}
          />

          <div 
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all"
            role="dialog"
            aria-modal="true"
            dir="rtl"
          >
            {showSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">شكراً لك!</h3>
                <p className="text-gray-500 text-lg">
                  ملاحظاتك تهمني وتساعدني في تحسين بلفورا باستمرار.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#7f2dfb] bg-[#7f2dfb]/10 px-3 py-1 rounded-full">الخطوة {step} من 4</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  {renderStepContent()}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-2xl">
                  {step > 1 ? (
                    <Button
                      variant="ghost"
                      onClick={() => setStep(s => s - 1)}
                      disabled={isSubmitting}
                      className="text-gray-500 hover:text-gray-900 flex items-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                      رجوع
                    </Button>
                  ) : (
                    <div></div> // spacer
                  )}

                  {step < 4 ? (
                    <Button
                      onClick={() => {
                        if (step === 1 && !uiRating) {
                          toast({
                            title: "تنبيه (مطلوب)",
                            description: "يرجى اختيار تقييم من 1 إلى 5 للمتابعة نحو الخطوة التالية.",
                          });
                          return;
                        }
                        setStep(s => s + 1);
                      }}
                      className="bg-[#7f2dfb] hover:bg-[#6c26d9] text-white rounded-xl px-6 flex items-center gap-1"
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (!likedMost && !hatedMost && !missingFeatures) {
                          toast({
                            title: "تنبيه",
                            description: "يرجى كتابة ملاحظة في أحد الحقول على الأقل قبل الإرسال النهائي.",
                          });
                          return;
                        }
                        handleSubmit();
                      }}
                      disabled={isSubmitting}
                      className="bg-[#7f2dfb] hover:bg-[#6c26d9] text-white rounded-xl px-6 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>إرسال التقييم النهائي</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

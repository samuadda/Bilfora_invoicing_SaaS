"use client";

import { useEffect, useState } from "react";
import { MessageSquare, X, Send, Loader2, CheckCircle2 } from "lucide-react";
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
  const [message, setMessage] = useState("");
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
        // slight delay to let the invoice success toast show first
        setTimeout(() => {
          setIsOpen(true);
        }, 1500);
      }
    };

    window.addEventListener("invoice-created", handleInvoiceCreated);

    return () => {
      mounted = false;
      window.removeEventListener("invoice-created", handleInvoiceCreated);
    };
  }, [hasSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      // 1. Send Email via Edge Function
      const { data, error: invokeError } = await supabasePersistent.functions.invoke("send-feedback", {
        body: {
          name: currentUser.name,
          email: currentUser.email,
          message: message.trim(),
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
        message: message.trim(),
      });

      if (dbError) {
         throw new Error(`Database Error: ${dbError.message}`);
      }

      // 3. Update profile to prevent future popups
      const { error: profileError } = await supabasePersistent
        .from("profiles")
        .update({ has_submitted_feedback: true })
        .eq("id", currentUser.id);

      if (profileError) {
          throw new Error(`Profile Update Error: ${profileError.message}`);
      }

      setHasSubmitted(true);
      setShowSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => setShowSuccess(false), 500); // reset state after closing
      }, 3000);
      
    } catch (err: any) {
      console.error("Feedback submission error:", err);
      toast({
        title: "عذراً، حدث خطأ",
        description: err.message || "لم نتمكن من إرسال ملاحظاتك، يرجى المحاولة لاحقاً.",
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
        aria-label="شاركنا رأيك"
      >
        <MessageSquare className="w-5 h-5 md:ml-2" />
        <span className="hidden md:block font-medium">شاركنا رأيك</span>
      </button>
    </div>
  );

  return (
    <>
      {!hasSubmitted && !isOpen && StickyButton}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !isSubmitting && !showSuccess && setIsOpen(false)}
          />

          {/* Modal Content */}
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
                  ملاحظاتك تهمنا وتساعدنا في تحسين بلفورا باستمرار.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">ما رأيك في بلفورا؟</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      نحن سعداء لانضمامك إلينا! كيف كانت تجربتك حتى الآن؟ هل هناك ميزة تتمنى إضافتها أو شيء يمكننا تحسينه؟
                    </p>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب ملاحظاتك، اقتراحاتك، أو واجهتك مشكلة هنا..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all resize-none outline-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isSubmitting}
                      className="rounded-xl px-6"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !message.trim()}
                      className="rounded-xl px-6 bg-[#7f2dfb] hover:bg-[#6c26d9] text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 ml-2" />
                          إرسال التقييم
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

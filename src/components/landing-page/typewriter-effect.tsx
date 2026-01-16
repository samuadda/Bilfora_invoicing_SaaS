"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";

// Helper: detect if a word contains Arabic characters
const isArabic = (text: string) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
};

export const TypewriterEffect = ({
    words,
    className,
    cursorClassName,
}: {
    words: {
        text: string;
        className?: string;
    }[];
    className?: string;
    cursorClassName?: string;
}) => {
    const wordsArray = words.map(word => {
        return {
            ...word,
            text: isArabic(word.text) ? [word.text] : word.text.split(""),
            isArabic: isArabic(word.text),
        };
    });

    const [scope, animate] = useAnimate();
    const isInView = useInView(scope);

    useEffect(() => {
        if (isInView) {
            animate(
                "span",
                {
                    display: "inline-block",
                    opacity: 1,
                    width: "fit-content",
                },
                {
                    duration: 0.5,
                    delay: stagger(0.1),
                    ease: "easeInOut",
                }
            );
        }
    }, [isInView, animate]);

    const renderWords = () => {
        return (
            <m.div ref={scope} className="inline" dir="rtl">
                {wordsArray.map((word, idx) => (
                    <div key={`word-${idx}`} className="inline-block">
                        {word.text.map((char, index) => (
                            <m.span initial={{}} key={`char-${idx}-${index}`} className={cn(`dark:text-white text-black opacity-0 hidden`, word.className)}>
                                {char}
                            </m.span>
                        ))}
                        &nbsp;
                    </div>
                ))}
            </m.div>
        );
    };

    return (
        <div className={cn("text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center", className)} dir="rtl">
            {renderWords()}
            <m.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
                className={cn("inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500", cursorClassName)}
            ></m.span>
        </div>
    );
};

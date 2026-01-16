"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { ReactNode } from "react";

/**
 * MotionProvider wraps children with LazyMotion to reduce framer-motion bundle size.
 * Using domAnimation feature set (~15KB) instead of full motion (~50KB+).
 * 
 * Usage: Wrap your layout or page with this provider, then use `m.div` instead of `motion.div`
 * throughout your components for the same animations with smaller bundle.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <LazyMotion features={domAnimation} strict>
            {children}
        </LazyMotion>
    );
}

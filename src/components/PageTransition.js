"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ position: 'relative', zIndex: 1, width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

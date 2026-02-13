import { useState, useEffect, useRef } from 'react';

/**
 * Robust typewriter hook that avoids common closure issues with setInterval/functional updates.
 * Uses string slicing for exact results.
 */
export const useTypewriter = (text: string, speed: number = 20, active: boolean = true) => {
    const [displayedText, setDisplayedText] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Reset state immediately on any dependency change
        setDisplayedText("");

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!active || !text) return;

        let i = 0;

        const tick = () => {
            if (i < text.length) {
                // Use slice for absolute positioning instead of relative concatenation
                setDisplayedText(text.slice(0, i + 1));
                i++;
                timerRef.current = setTimeout(tick, speed);
            }
        };

        timerRef.current = setTimeout(tick, speed);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [text, speed, active]);

    return displayedText;
};

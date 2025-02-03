import React, { useState, useEffect } from "react";

const ScrollbarAnimation = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / maxScroll) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className="fixed bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-tr-full transition-all duration-300 ease-out z-[100]"
            style={{ width: `${scrollProgress}%` }}
        />
    );
};

export default ScrollbarAnimation;

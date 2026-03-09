"use client";
import { useEffect, useRef } from 'react';

export default function ArchitectureBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let width, height;
        const nodes = [];
        const maxDistance = 150;
        const dotGridSpacing = 40;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', resize);
        resize();

        // Initialize nodes
        for (let i = 0; i < 60; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // 1. Draw architectural dot grid
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            for (let x = 0; x < width; x += dotGridSpacing) {
                for (let y = 0; y < height; y += dotGridSpacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 2. Update and draw nodes & connections
            ctx.lineWidth = 0.5;

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];

                // Move
                node.x += node.vx;
                node.y += node.vy;

                // Bounce
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 255, 1, 0.3)'; // ua-lime with opacity
                ctx.fill();

                // Connect
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dx = node.x - nodeB.x;
                    const dy = node.y - nodeB.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        // Opacity based on distance
                        const opacity = 1 - (dist / maxDistance);
                        ctx.strokeStyle = `rgba(0, 164, 181, ${opacity * 0.3})`; // ua-teal
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
}

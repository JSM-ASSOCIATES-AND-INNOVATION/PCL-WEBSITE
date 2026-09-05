import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

export default function Globe() {
  const canvasRef = useRef();
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [{ width }, setWidth] = useState({ width: 0 });

  useEffect(() => {
    let phi = 0;
    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
        setWidth({ width });
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2 || 600,
      height: width * 2 || 600,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 8, // Brighter map
      baseColor: [0.25, 0.25, 0.25], // Lighter base
      markerColor: [0.117, 0.996, 0.631], // Neon green
      glowColor: [0.15, 0.15, 0.15],
      markers: [
        { location: [17.3850, 78.4867], size: 0.1 } // Hyderabad
      ],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.003;
        }
        state.phi = phi + pointerInteractionMovement.current;
        state.width = width * 2;
        state.height = width * 2;
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          aspectRatio: "1/1",
          opacity: 1,
          transition: "opacity 1s ease",
          cursor: "grab"
        }}
      />
    </div>
  );
}

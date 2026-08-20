import { useEffect, useRef, useState } from "react";
import { CONFIG } from "./config.ts";
import { NamePrism } from "./components/NamePrism.tsx";
import { LinkCube } from "./components/LinkCube.tsx";
import { AboutModal } from "./components/AboutModal.tsx";
import { GridScan } from "./components/GridScan.tsx";
import { useSceneLoop } from "./hooks/useSceneLoop.ts";

export default function App() {
  const [aboutOpen, setAboutOpen] = useState(false);

  const sceneWrapRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  /* apply theme accent from CONFIG */
  useEffect(() => {
    const a = CONFIG.theme.accent;
    const r = parseInt(a.slice(1, 3), 16),
      g = parseInt(a.slice(3, 5), 16),
      b = parseInt(a.slice(5, 7), 16);
    const root = document.documentElement.style;
    root.setProperty("--accent", a);
    root.setProperty("--accent-bright", CONFIG.theme.accentBright);
    root.setProperty("--accent-soft", `rgba(${r}, ${g}, ${b}, 0.16)`);
    root.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.10)`);
  }, []);

  useSceneLoop({ sceneWrapRef, sceneRef, lightRef });

  return (
    <>
      <GridScan
        sensitivity={CONFIG.gridScan.sensitivity}
        lineThickness={CONFIG.gridScan.lineThickness}
        linesColor={CONFIG.gridScan.linesColor}
        gridScale={CONFIG.gridScan.gridScale}
        scanColor={CONFIG.gridScan.scanColor}
        scanOpacity={CONFIG.gridScan.scanOpacity}
        enablePost
        bloomIntensity={CONFIG.gridScan.bloomIntensity}
        chromaticAberration={CONFIG.gridScan.chromaticAberration}
        noiseIntensity={CONFIG.gridScan.noiseIntensity}
        scanDuration={CONFIG.gridScan.scanDuration}
        scanDelay={CONFIG.gridScan.scanDelay}
      />

      <div className="cursor-light" ref={lightRef} aria-hidden="true" />

      <main className="scene-wrap" ref={sceneWrapRef} id="sceneWrap">
        <div className="scene" ref={sceneRef}>
          <div className="main-stack">
            <NamePrism paused={aboutOpen} onOpenAbout={() => setAboutOpen(true)} />
            <div className="links-row">
              {CONFIG.links.map((link, i) => (
                <LinkCube key={link.id} link={link} index={i} total={CONFIG.links.length} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

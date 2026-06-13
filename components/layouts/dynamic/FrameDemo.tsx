
import React from 'react';
import { Frame } from './Frame';
import LayoutBig from '../BaseContent';
import BasePage from '../base-page';

export default function FrameDemo() {
  return (
    <LayoutBig
          children =  {
            <BasePage
              sidebar="null"
              main={
                <div className="h-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
                  <div className="max-w-7xl mx-auto space-y-12">
                    
                    {/* Titre principal */}
                    <div className="text-center space-y-4 mb-16">
                      <h1 className="text-5xl font-black text-transparent bg-membre-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                        Frame Component System
                      </h1>
                      <p className="text-white/60 text-lg">
                        Composants sci-fi avec bordures détaillées sur les 4 côtés (haut, bas, gauche, droite)
                      </p>
                      <p className="text-white/40 text-sm max-w-2xl mx-auto">
                        Chaque variante possède des découpes géométriques uniques sur tout le périmètre, 
                        créant des cadres technologiques immersifs pour vos interfaces
                      </p>
                    </div>

                    {/* Grid des variantes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Variant: Default */}
                      <Frame 
                        variant="default" 
                        theme="cyan"
                        glowIntensity="medium"
                        borderWidth={2}
                      >
                        <Frame.Header gradient>
                          <div>
                            <h3 className="text-cyan-400 font-bold text-lg">DEFAULT</h3>
                            <p className="text-white/40 text-sm">Découpes sur les 4 coins</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
                          </div>
                        </Frame.Header>
                        
                        <Frame.Body p="lg">
                          <div className="space-y-2">
                            <p className="text-white/80 text-sm">
                              Design épuré avec découpes diagonales sur chaque coin. Les 4 angles sont coupés à 45° pour un look moderne et uniforme.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mt-3">
                              <div>↖ Coin haut-gauche : 18px</div>
                              <div>↗ Coin haut-droit : 18px</div>
                              <div>↙ Coin bas-gauche : 18px</div>
                              <div>↘ Coin bas-droit : 18px</div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <div className="h-1 flex-1 bg-cyan-400/20" />
                              <div className="h-1 w-8 bg-cyan-400" />
                              <div className="h-1 flex-1 bg-cyan-400/20" />
                            </div>
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer transparent>
                          <span className="text-white/40 text-xs">Status: Active</span>
                          <span className="text-cyan-400 text-xs font-mono">v2.0.1</span>
                        </Frame.Footer>
                      </Frame>

                      {/* Variant: Tech Corners */}
                      <Frame 
                        variant="tech-corners" 
                        theme="blue"
                        glowIntensity="high"
                        borderWidth={2}
                        animated
                      >
                        <Frame.Header gradient height="lg">
                          <div>
                            <h3 className="text-blue-400 font-bold text-lg">TECH-CORNERS</h3>
                            <p className="text-white/40 text-sm">Découpes tech sur 4 côtés</p>
                          </div>
                          <div className="w-8 h-8 border border-blue-400/50 rounded flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping" />
                          </div>
                        </Frame.Header>
                        
                        <Frame.Body p="lg" layout="stack" gap="md">
                          <div className="text-white/80 text-sm">
                            Découpes techniques sophistiquées sur chaque bord. Parfait pour interfaces HUD et tableaux de bord futuristes.
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-blue-400/80">
                            <div className="p-2 bg-blue-400/5 rounded border border-blue-400/20">
                              <div className="font-mono mb-1">⬆ Haut</div>
                              <div className="text-white/40">3 découpes tech</div>
                            </div>
                            <div className="p-2 bg-blue-400/5 rounded border border-blue-400/20">
                              <div className="font-mono mb-1">➡ Droite</div>
                              <div className="text-white/40">3 découpes tech</div>
                            </div>
                            <div className="p-2 bg-blue-400/5 rounded border border-blue-400/20">
                              <div className="font-mono mb-1">⬇ Bas</div>
                              <div className="text-white/40">3 découpes tech</div>
                            </div>
                            <div className="p-2 bg-blue-400/5 rounded border border-blue-400/20">
                              <div className="font-mono mb-1">⬅ Gauche</div>
                              <div className="text-white/40">3 découpes tech</div>
                            </div>
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-blue-400 rounded-full animate-pulse" />
                            <span className="text-white/60 text-xs">System Online</span>
                          </div>
                          <span className="text-blue-400 text-xs font-mono">12 POINTS</span>
                        </Frame.Footer>
                      </Frame>

                      {/* Variant: Angular */}
                      <Frame 
                        variant="angular" 
                        theme="purple"
                        glowIntensity="medium"
                        borderWidth={3}
                      >
                        <Frame.Header>
                          <div>
                            <h3 className="text-purple-400 font-bold text-lg">ANGULAR</h3>
                            <p className="text-white/40 text-sm">Multi-angles géométriques</p>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="w-1 h-6 bg-purple-400" style={{ opacity: 0.2 + (i * 0.2) }} />
                            ))}
                          </div>
                        </Frame.Header>
                        
                        <Frame.Body p="lg">
                          <div className="space-y-4">
                            <p className="text-white/80 text-sm">
                              Conception angulaire avec découpes multiples formant un périmètre complexe. Look aggressif et dynamique pour interfaces gaming ou high-tech.
                            </p>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              <div className="space-y-1">
                                <div className="text-purple-400 font-mono">⬆</div>
                                <div className="text-white/40">4 angles</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-purple-400 font-mono">➡</div>
                                <div className="text-white/40">4 angles</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-purple-400 font-mono">⬇</div>
                                <div className="text-white/40">4 angles</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-purple-400 font-mono">⬅</div>
                                <div className="text-white/40">4 angles</div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <div className="text-xs text-purple-400 font-mono">POWER</div>
                              <div className="flex-1 mx-4 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-purple-600 to-purple-400" />
                              </div>
                              <div className="text-xs text-white/60">75%</div>
                            </div>
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer transparent>
                          <span className="text-white/40 text-xs">Total: 16 Points Angulaires</span>
                          <span className="text-purple-400 text-xs">Symétrique</span>
                        </Frame.Footer>
                      </Frame>

                      {/* Variant: Notched */}
                      <Frame 
                        variant="notched" 
                        theme="emerald"
                        glowIntensity="low"
                        borderWidth={2}
                      >
                        <Frame.Header gradient>
                          <div>
                            <h3 className="text-emerald-400 font-bold text-lg">NOTCHED</h3>
                            <p className="text-white/40 text-sm">Encoches sur 4 bords</p>
                          </div>
                          <div className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/50 rounded text-emerald-400 text-xs font-bold">
                            NEW
                          </div>
                        </Frame.Header>
                        
                        <Frame.Body p="lg" layout="flex" direction="col" gap="lg">
                          <p className="text-white/80 text-sm">
                            Pattern d'encoches régulières créant un design industriel modulaire. 4 encoches sur chaque bord pour un total de 16 points de découpe.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-lg">
                              <div className="text-emerald-400 text-xs font-bold mb-1">Haut + Bas</div>
                              <div className="text-white/60 text-xs">8 encoches</div>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-lg">
                              <div className="text-emerald-400 text-xs font-bold mb-1">Gauche + Droite</div>
                              <div className="text-white/60 text-xs">8 encoches</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1 h-px bg-emerald-400/30" />
                            <span className="text-emerald-400/60 font-mono">PATTERN RÉGULIER</span>
                            <div className="flex-1 h-px bg-emerald-400/30" />
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer>
                          <span className="text-white/40 text-xs">Design: Modulaire</span>
                          <span className="text-emerald-400 text-xs">16 Encoches</span>
                        </Frame.Footer>
                      </Frame>

                      {/* Variant: Circuit */}
                      <Frame 
                        variant="circuit" 
                        theme="amber"
                        glowIntensity="high"
                        borderWidth={2}
                        animated
                      >
                        <Frame.Header height="lg">
                          <div>
                            <h3 className="text-amber-400 font-bold text-lg">CIRCUIT</h3>
                            <p className="text-white/40 text-sm">Pattern circuit 360°</p>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div 
                                key={i} 
                                className="w-1 h-8 bg-amber-400"
                                style={{ opacity: 0.2 + (i * 0.2) }}
                              />
                            ))}
                          </div>
                        </Frame.Header>
                        
                        <Frame.Body p="lg" scrollable maxHeight="200px">
                          <div className="space-y-3">
                            <p className="text-white/80 text-sm">
                              Découpes inspirées des circuits imprimés sur tout le périmètre. 28 points de connexion créent un effet électronique authentique.
                            </p>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {['⬆ 7', '➡ 7', '⬇ 7', '⬅ 7'].map((side, i) => (
                                <div key={i} className="p-2 bg-amber-400/5 border border-amber-400/20 rounded text-center">
                                  <div className="text-amber-400 text-xs font-mono">{side}</div>
                                  <div className="text-white/40 text-[10px]">points</div>
                                </div>
                              ))}
                            </div>
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                                <span className="text-white/60 text-xs flex-1">Circuit Node {i}</span>
                                <span className="text-amber-400 text-xs font-mono">ACTIVE</span>
                              </div>
                            ))}
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer transparent>
                          <span className="text-white/40 text-xs">Total: 28 Connection Points</span>
                          <span className="text-amber-400 text-xs">PCB Style</span>
                        </Frame.Footer>
                      </Frame>

                      {/* Variant: Beveled */}
                      <Frame 
                        variant="beveled" 
                        theme="red"
                        glowIntensity="medium"
                        borderWidth={3}
                      >
                        <Frame.Header gradient>
                          <div>
                            <h3 className="text-red-400 font-bold text-lg">BEVELED</h3>
                            <p className="text-white/40 text-sm">Biseaux variés sur 4 côtés</p>
                          </div>
                          <div className="w-6 h-6 border-2 border-red-400 transform rotate-45" />
                        </Frame.Header>
                        
                        <Frame.Body p="lg">
                          <div className="space-y-4">
                            <p className="text-white/80 text-sm">
                              Biseaux élégants avec variations de taille sur chaque bord. 3 niveaux de découpes (petites, moyennes, grandes) créent une hiérarchie visuelle sophistiquée.
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-red-400">Petits biseaux</span>
                                <div className="flex-1 mx-3 h-px bg-red-400/20" />
                                <span className="text-white/40">8px</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-red-400">Moyens biseaux</span>
                                <div className="flex-1 mx-3 h-px bg-red-400/30" />
                                <span className="text-white/40">16px</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-red-400">Grands biseaux</span>
                                <div className="flex-1 mx-3 h-px bg-red-400/40" />
                                <span className="text-white/40">20px</span>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              {['ALERT', 'WARNING', 'ERROR'].map((status) => (
                                <div key={status} className="flex-1 p-2 bg-red-400/10 border border-red-400/30 rounded text-center">
                                  <span className="text-red-400 text-xs font-bold">{status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer transparent>
                          <span className="text-white/40 text-xs">12 Biseaux Total</span>
                          <span className="text-red-400 text-xs font-bold">⚠ Élégant</span>
                        </Frame.Footer>
                      </Frame>

                      {/* Variant: Sliced */}
                      <Frame 
                        variant="sliced" 
                        theme="cyan"
                        glowIntensity="low"
                        borderWidth={2}
                      >
                        <Frame.Header>
                          <div>
                            <h3 className="text-cyan-400 font-bold text-lg">SLICED</h3>
                            <p className="text-white/40 text-sm">Tranches diagonales 360°</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-px bg-cyan-400 transform -rotate-45" />
                            <div className="w-4 h-px bg-cyan-400 transform rotate-45" />
                          </div>
                        </Frame.Header>
                        
                        <Frame.Body p="lg" layout="flex" direction="col" gap="md">
                          <p className="text-white/80 text-sm">
                            Tranches diagonales créant un effet asymétrique audacieux. 8 points de découpe formant des angles dynamiques sur tout le périmètre.
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div className="p-2 bg-cyan-400/5 border border-cyan-400/20 rounded">
                              <div className="text-cyan-400 font-mono mb-1">Haut ↗</div>
                              <div className="text-white/40">2 tranches</div>
                            </div>
                            <div className="p-2 bg-cyan-400/5 border border-cyan-400/20 rounded">
                              <div className="text-cyan-400 font-mono mb-1">Droite ↘</div>
                              <div className="text-white/40">2 tranches</div>
                            </div>
                            <div className="p-2 bg-cyan-400/5 border border-cyan-400/20 rounded">
                              <div className="text-cyan-400 font-mono mb-1">Bas ↙</div>
                              <div className="text-white/40">2 tranches</div>
                            </div>
                            <div className="p-2 bg-cyan-400/5 border border-cyan-400/20 rounded">
                              <div className="text-cyan-400 font-mono mb-1">Gauche ↖</div>
                              <div className="text-white/40">2 tranches</div>
                            </div>
                          </div>
                          <div className="relative h-24 bg-gradient-to-br from-cyan-400/10 via-transparent to-cyan-600/10 rounded overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-4xl text-cyan-400/30 font-black transform -skew-x-12">SLICED</div>
                            </div>
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer>
                          <span className="text-white/40 text-xs">Style: Asymétrique</span>
                          <span className="text-cyan-400 text-xs">8 Découpes ↗</span>
                        </Frame.Footer>
                      </Frame>

                      {/* Variant: Paneled */}
                      <Frame 
                        variant="paneled" 
                        theme="purple"
                        glowIntensity="medium"
                        borderWidth={2}
                      >
                        <Frame.Header gradient height="lg">
                          <div>
                            <h3 className="text-purple-400 font-bold text-lg">PANELED</h3>
                            <p className="text-white/40 text-sm">Panneaux découpes 4 côtés</p>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="w-2 h-2 bg-purple-400/50" />
                            ))}
                          </div>
                        </Frame.Header>
                        
                        <Frame.Body p="lg" layout="stack" gap="md">
                          <p className="text-white/80 text-sm">
                            Design segmenté avec 5 panneaux sur chaque bord. 20 points de découpe créent une interface modulaire et structurée, idéale pour dashboards complexes.
                          </p>
                          <div className="grid grid-cols-4 gap-2 text-xs text-center">
                            {['⬆ 5', '➡ 5', '⬇ 5', '⬅ 5'].map((label, i) => (
                              <div key={i} className="p-2 bg-purple-400/5 border border-purple-400/20 rounded">
                                <div className="text-purple-400 font-mono">{label}</div>
                                <div className="text-white/40 text-[10px]">panels</div>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {['System', 'Network', 'Security', 'Data'].map((item) => (
                              <div key={item} className="p-3 bg-white/5 rounded border border-purple-400/20 text-center">
                                <div className="text-purple-400 text-xs font-bold">{item}</div>
                                <div className="text-white/40 text-xs mt-1">Online</div>
                              </div>
                            ))}
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer transparent>
                          <span className="text-white/40 text-xs">20 Panneaux Actifs</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                          </div>
                        </Frame.Footer>
                      </Frame>

                    </div>

                    {/* Section démo des couleurs */}
                    <div className="mt-20">
                      <h2 className="text-3xl font-bold text-white mb-8 text-center">Variantes de Couleurs</h2>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {(['cyan', 'blue', 'purple', 'emerald', 'amber', 'red'] as const).map((color) => (
                          <Frame 
                            key={color}
                            variant="default" 
                            theme={color}
                            glowIntensity="medium"
                            borderWidth={2}
                          >
                            <Frame.Body p="md" layout="flex" direction="col" alignItems="center" gap="xs">
                              <div className={`w-12 h-12 bg-${color}-400/20 rounded-full flex items-center justify-center`}>
                                <div className={`w-6 h-6 bg-${color}-400 rounded-full`} />
                              </div>
                              <span className={`text-${color}-400 text-sm font-bold capitalize`}>{color}</span>
                            </Frame.Body>
                          </Frame>
                        ))}
                      </div>
                    </div>

                    {/* Section demo personnalisée */}
                    <div className="mt-20">
                      <h2 className="text-3xl font-bold text-white mb-8 text-center">Couleur Personnalisée</h2>
                      
                      <Frame 
                        variant="tech-corners" 
                        theme="custom"
                        customColor="#ff00ff"
                        glowIntensity="high"
                        borderWidth={3}
                        animated
                        maxWidth="2xl"
                        className="mx-auto"
                      >
                        <Frame.Header gradient height="lg">
                          <div>
                            <h3 className="font-bold text-lg" style={{ color: '#ff00ff' }}>CUSTOM COLOR</h3>
                            <p className="text-white/40 text-sm">Utilisez n'importe quelle couleur hex</p>
                          </div>
                          <div className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #ff00ff, #00ffff)' }} />
                        </Frame.Header>
                        
                        <Frame.Body p="xl" layout="flex" direction="col" alignItems="center" gap="lg">
                          <p className="text-white/80 text-center text-lg max-w-md">
                            Le système de Frame supporte des couleurs personnalisées via la prop <code className="px-2 py-1 bg-white/10 rounded text-sm font-mono">customColor</code>
                          </p>
                          <div className="flex gap-4">
                            <code className="px-4 py-2 bg-white/5 rounded border border-white/10 text-white/60 font-mono text-sm">
                              customColor="#ff00ff"
                            </code>
                          </div>
                        </Frame.Body>
                        
                        <Frame.Footer>
                          <span className="text-white/40 text-xs">Hex Code Support</span>
                          <span className="text-xs" style={{ color: '#ff00ff' }}>Full RGB Range</span>
                        </Frame.Footer>
                      </Frame>
                    </div>

                    {/* Documentation rapide */}
                    <div className="mt-20 mb-12">
                      <Frame 
                        variant="beveled" 
                        theme="blue"
                        glowIntensity="low"
                        borderWidth={2}
                        maxWidth="4xl"
                        className="mx-auto"
                      >
                        <Frame.Header gradient height="lg">
                          <h3 className="text-blue-400 font-bold text-xl">Documentation Rapide</h3>
                        </Frame.Header>
                        
                        <Frame.Body p="xl" layout="stack" gap="lg">
                          <div>
                            <h4 className="text-white font-semibold mb-2">Props Principales</h4>
                            <div className="space-y-1 text-sm text-white/60">
                              <div><code className="text-blue-400">variant</code>: 'default' | 'tech-corners' | 'angular' | 'notched' | 'circuit' | 'beveled' | 'sliced' | 'paneled'</div>
                              <div><code className="text-blue-400">theme</code>: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber' | 'red' | 'custom'</div>
                              <div><code className="text-blue-400">glowIntensity</code>: 'none' | 'low' | 'medium' | 'high'</div>
                              <div><code className="text-blue-400">borderWidth</code>: 1 | 2 | 3 | 4</div>
                              <div><code className="text-blue-400">animated</code>: boolean</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-white font-semibold mb-2">Découpes par Variante</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">default:</span> 4 coins (4 points)
                              </div>
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">tech-corners:</span> 4 côtés (12 points)
                              </div>
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">angular:</span> 4 côtés (16 points)
                              </div>
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">notched:</span> 4 côtés (16 encoches)
                              </div>
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">circuit:</span> 4 côtés (28 points)
                              </div>
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">beveled:</span> 4 côtés (12 biseaux)
                              </div>
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">sliced:</span> 4 côtés (8 tranches)
                              </div>
                              <div className="p-2 bg-white/5 rounded">
                                <span className="text-blue-400 font-mono">paneled:</span> 4 côtés (20 panneaux)
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-white font-semibold mb-2">Exemple d'Utilisation</h4>
                            <pre className="bg-black/40 p-4 rounded border border-white/10 text-xs text-white/80 overflow-x-auto">
            {`<Frame variant="tech-corners" theme="cyan" glowIntensity="high" animated>
              <Frame.Header gradient>
                <h3>Mon Titre</h3>
              </Frame.Header>
              
              <Frame.Body p="lg">
                <p>Contenu principal...</p>
              </Frame.Body>
              
              <Frame.Footer transparent>
                <span>Footer info</span>
              </Frame.Footer>
            </Frame>`}
                            </pre>
                          </div>
                        </Frame.Body>
                      </Frame>
                    </div>

                    {/* Section de comparaison visuelle des bordures */}
                    <div className="mt-20">
                      <h2 className="text-3xl font-bold text-white mb-4 text-center">Comparaison Visuelle des Bordures</h2>
                      <p className="text-white/60 text-center mb-8 max-w-2xl mx-auto">
                        Chaque variante possède des découpes uniques sur les 4 côtés (haut, bas, gauche, droite)
                      </p>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { variant: 'default', name: 'Default', color: 'cyan', points: '4' },
                          { variant: 'tech-corners', name: 'Tech', color: 'blue', points: '12' },
                          { variant: 'angular', name: 'Angular', color: 'purple', points: '16' },
                          { variant: 'notched', name: 'Notched', color: 'emerald', points: '16' },
                          { variant: 'circuit', name: 'Circuit', color: 'amber', points: '28' },
                          { variant: 'beveled', name: 'Beveled', color: 'red', points: '12' },
                          { variant: 'sliced', name: 'Sliced', color: 'cyan', points: '8' },
                          { variant: 'paneled', name: 'Paneled', color: 'purple', points: '20' },
                        ].map(({ variant, name, color, points }) => (
                          <Frame 
                            key={variant}
                            variant={variant as any}
                            theme={color as any}
                            glowIntensity="medium"
                            borderWidth={2}
                          >
                            <Frame.Body p="md" layout="flex" direction="col" alignItems="center" gap="xs">
                              <div className="h-20 w-full flex items-center justify-center">
                                <div className={`text-${color}-400 text-3xl font-black opacity-20`}>
                                  {points}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className={`text-${color}-400 text-sm font-bold`}>{name}</div>
                                <div className="text-white/40 text-xs">{points} points</div>
                              </div>
                            </Frame.Body>
                          </Frame>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              }
              rightPanel="null"
              sidebarWidth={0}
              sidebarMinWidth={0}
              sidebarMaxWidth={0}
              rightPanelWidth={0}
              rightPanelMinWidth={0}
              rightPanelMaxWidth={0}
              mainMinWidth={600}
              background={
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center -z-20"
                    style={{
                      backgroundImage: "url('/landscape.png')",
                      opacity: 0.7,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/30 -z-10"></div>
                </>
              }
            />
          } 
        />
  );
}
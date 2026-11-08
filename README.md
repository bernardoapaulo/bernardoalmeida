# Portfólio Bernardo Almeida (@bernardoapaulo)

Site de uma página, mobile-first, com Vite + JS puro + GSAP/ScrollTrigger + Lenis.

## Comandos
```bash
npm install
npm run dev            # desenvolvimento (reinicie ao adicionar arquivos em assets/)
npm run build          # gera dist/
npm run preview        # serve o dist/
npm run check-assets   # lista slots de imagem/vídeo pendentes
npm run optimize       # gera WebP 800w/1600w das fotos (srcset)
npm run og             # regenera assets/og.png (1200x630)
```

## Conteúdo
Tudo (textos, números, links) está em `src/data/content.json`. Campos `null` ou `show:false`
não renderizam e geram aviso no build. Preencha `copy.deliver.packages` quando decidir os pacotes.
Mascote: `mascot.enabled: false` desliga tudo.

## Imagens e vídeos
Solte em `assets/` com os nomes de `npm run check-assets` (fotos `photos/hero.jpg`, `video/pillar-*.mp4` etc.).
Enquanto faltar arquivo, aparece um placeholder com o nome do slot.
PNGs do mascote: `assets/lego/lego-jaqueta.png` e `lego-camisa.png`; originais em `assets/lego/source/` não vão para o dist.

## Deploy
- **Vercel / Netlify:** build `npm run build`, pasta de saída `dist`.
- **GitHub Pages:** publique o conteúdo de `dist/` (o site usa caminhos relativos).
- Para o preview de link (Open Graph) funcionar, troque `./og.png` por URL absoluta no `index.html` após definir o domínio.

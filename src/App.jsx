import { useCallback, useEffect, useMemo, useState } from 'react'

// ✏️ EDIT THESE
const PROFILE = {
  name: 'Hexzeus',
  tagline: 'Selected recent work',
  bio: 'I make art full-time in spirit and in practice. This is a selection of my recent work, submitted for the Gumroad Creator-in-Residence program.',
  email: 'you@example.com',
  github: 'https://github.com/hexzeus',
}

// Every image dropped into src/assets/photos is picked up automatically.
const modules = import.meta.glob('./assets/photos/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

function useLightbox(count) {
  const [index, setIndex] = useState(null)
  const close = useCallback(() => setIndex(null), [])
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % count)), [count])
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + count) % count)), [count])

  useEffect(() => {
    if (index === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, close, next, prev])

  return { index, setIndex, close, next, prev }
}

export default function App() {
  const photos = useMemo(
    () =>
      Object.entries(modules)
        .sort(([a], [b]) => collator.compare(a, b))
        .map(([path, src], i) => ({ src, id: path, n: i + 1 })),
    []
  )
  const lb = useLightbox(photos.length)
  const hero = photos[0]

  return (
    <>
      <header className="nav">
        <a href="#top" className="brand">{PROFILE.name}</a>
        <nav>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          {hero && <img className="hero-img" src={hero.src} alt="" aria-hidden="true" />}
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow">Creator-in-Residence Application</p>
            <h1>{PROFILE.tagline}</h1>
            <p className="sub">{PROFILE.name} · {photos.length} {photos.length === 1 ? 'piece' : 'pieces'}</p>
            <a className="btn" href="#work">View the work</a>
          </div>
        </section>

        <section id="work" className="section">
          <div className="section-head">
            <h2>Work</h2>
            <span>{photos.length} pieces</span>
          </div>

          {photos.length === 0 ? (
            <p className="empty">Add images to <code>src/assets/photos</code> and they will appear here.</p>
          ) : (
            <ul className="grid">
              {photos.map((p, i) => (
                <li key={p.id}>
                  <button className="tile" onClick={() => lb.setIndex(i)} aria-label={`Open piece ${p.n}`}>
                    <img src={p.src} alt={`Artwork ${p.n} by ${PROFILE.name}`} loading={i < 6 ? 'eager' : 'lazy'} decoding="async" />
                    <span className="num">{String(p.n).padStart(2, '0')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="about" className="section about">
          <h2>About</h2>
          <p>{PROFILE.bio}</p>
        </section>

        <section id="contact" className="section contact">
          <h2>Contact</h2>
          <p>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            {' · '}
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} {PROFILE.name}. All work shown is original.</footer>

      {lb.index !== null && photos[lb.index] && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={lb.close}>
          <button className="lb-btn lb-close" onClick={lb.close} aria-label="Close">×</button>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); lb.prev() }} aria-label="Previous">‹</button>
          <img src={photos[lb.index].src} alt={`Artwork ${photos[lb.index].n} by ${PROFILE.name}`} onClick={(e) => e.stopPropagation()} />
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); lb.next() }} aria-label="Next">›</button>
          <span className="lb-count">{lb.index + 1} / {photos.length}</span>
        </div>
      )}
    </>
  )
}

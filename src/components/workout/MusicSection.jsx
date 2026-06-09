const MusicSection = () => {
  return (
    <div className="card p-4">
      <h3 className="text-sm text-[#6e6e73] mb-3">🎵 Músicas para Treino</h3>
      <div className="flex gap-3">
        {/* Spotify */}
        <a
          href="https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-2xl bg-[#1DB954] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </a>
        
        {/* Apple Music */}
        <a
          href="https://music.apple.com/br/playlist/treino/pl.u-55b22ff92c36"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-2xl bg-[#FC3C44] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

export default MusicSection

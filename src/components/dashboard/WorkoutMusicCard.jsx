import { Music, Headphones } from 'lucide-react'

const MusicCard = ({ title, icon, playlists }) => {
  const handleSpotifyClick = (spotifyUri) => {
    try {
      window.location.href = spotifyUri
    } catch (error) {
      const playlistId = spotifyUri.split(':')[2]
      window.open(`https://open.spotify.com/playlist/${playlistId}`, '_blank')
    }
  }

  const handleAppleMusicClick = (appleMusicUrl) => {
    window.open(appleMusicUrl, '_blank')
  }

  return (
    <div className="premium-card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <div className="space-y-3">
        {playlists.map((playlist, index) => (
          <div
            key={index}
            className="p-3 bg-[#2C2C2E] rounded-xl hover:bg-[#3C3C3E] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#84CC16] to-[#65A30D] flex items-center justify-center">
                <Headphones size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{playlist.nome}</h3>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSpotifyClick(playlist.spotify)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#1DB954] text-white font-medium text-xs hover:opacity-90 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </button>
              <button
                onClick={() => handleAppleMusicClick(playlist.appleMusic)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#FA243C] text-white font-medium text-xs hover:opacity-90 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                Apple Music
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const WorkoutMusicCard = () => {
  const musicCategories = [
    {
      title: 'Hipertrofia',
      icon: '💪',
      playlists: [
        {
          nome: 'Gym Beast Mode',
          spotify: 'spotify:playlist:37i9dQZF1DX76Wlfdnj7AP',
          appleMusic: 'https://music.apple.com/us/playlist/gym-beast-mode/pl.u-8aVb1a4a4a4a'
        },
        {
          nome: 'Heavy Lifting',
          spotify: 'spotify:playlist:37i9dQZF1DX0XUsuxWHRQd',
          appleMusic: 'https://music.apple.com/us/playlist/heavy-lifting/pl.u-8aVb1a4a4a4a'
        }
      ]
    },
    {
      title: 'Cardio',
      icon: '🏃',
      playlists: [
        {
          nome: 'Running Energy Mix',
          spotify: 'spotify:playlist:37i9dQZF1DX4FP3aTRSN66',
          appleMusic: 'https://music.apple.com/us/playlist/running-energy/pl.u-8aVb1a4a4a4a'
        },
        {
          nome: 'HIIT Workout',
          spotify: 'spotify:playlist:37i9dQZF1DX5trt9i14X7j',
          appleMusic: 'https://music.apple.com/us/playlist/hiit-workout/pl.u-8aVb1a4a4a4a'
        }
      ]
    },
    {
      title: 'Recuperação',
      icon: '🧘',
      playlists: [
        {
          nome: 'Deep Recovery',
          spotify: 'spotify:playlist:37i9dQZF1DWZqd5JICZI0u',
          appleMusic: 'https://music.apple.com/us/playlist/deep-recovery/pl.u-8aVb1a4a4a4a'
        },
        {
          nome: 'Stretch & Relax',
          spotify: 'spotify:playlist:37i9dQZF1DX4sSSpwq3NiO',
          appleMusic: 'https://music.apple.com/us/playlist/stretch-relax/pl.u-8aVb1a4a4a4a'
        }
      ]
    },
    {
      title: 'Sono',
      icon: '😴',
      playlists: [
        {
          nome: 'Sleep Sounds',
          spotify: 'spotify:playlist:37i9dQZF1DX4Oz6guBvCpa',
          appleMusic: 'https://music.apple.com/us/playlist/sleep-sounds/pl.u-8aVb1a4a4a4a'
        },
        {
          nome: 'Relaxation',
          spotify: 'spotify:playlist:37i9dQZF1DX4UD7UzV7YYa',
          appleMusic: 'https://music.apple.com/us/playlist/relaxation/pl.u-8aVb1a4a4a4a'
        }
      ]
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Music size={20} className="text-[#84CC16]" />
        <h2 className="text-lg font-bold">Músicas para Treino</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {musicCategories.map((category, index) => (
          <MusicCard
            key={index}
            title={category.title}
            icon={category.icon}
            playlists={category.playlists}
          />
        ))}
      </div>
    </div>
  )
}

export default WorkoutMusicCard

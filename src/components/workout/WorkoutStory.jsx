import { useRef, useState, useEffect } from 'react'

const WorkoutStory = ({ workout }) => {
  const canvasRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)

  // Abrir câmera
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // câmera traseira
        audio: false
      })
      setStream(mediaStream)
      videoRef.current.srcObject = mediaStream
    } catch (err) {
      console.error('Câmera não disponível:', err)
      // Fallback: usar imagem padrão
      renderStory()
    }
  }

  // Capturar foto
  const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    setPhoto(canvas.toDataURL('image/jpeg', 0.9))
    // Parar câmera
    stream.getTracks().forEach(track => track.stop())
    setStream(null)
  }

  // Renderizar story final no canvas
  const renderStory = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Dimensões story (9:16)
    canvas.width = 1080
    canvas.height = 1920

    // 1. Fundo (foto ou gradiente)
    if (photo) {
      const img = new Image()
      img.src = photo
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        addOverlay(ctx, canvas, workout)
      }
    } else {
      // Gradiente padrão
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#0a0a0f')
      gradient.addColorStop(1, '#1a1a2e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      addOverlay(ctx, canvas, workout)
    }
  }

  const addOverlay = (ctx, canvas, workout) => {
    // Overlay escuro no bottom (legibilidade)
    const overlayGrad = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height)
    overlayGrad.addColorStop(0, 'rgba(0,0,0,0)')
    overlayGrad.addColorStop(1, 'rgba(0,0,0,0.85)')
    ctx.fillStyle = overlayGrad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // "TREINO CONCLUÍDO"
    ctx.fillStyle = '#c8f04a'
    ctx.font = 'bold 52px Syne, sans-serif'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '0.2em'
    ctx.fillText('TREINO CONCLUÍDO', canvas.width / 2, canvas.height * 0.62)

    // Nome do treino
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 96px Syne, sans-serif'
    ctx.shadowBlur = 20
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.fillText(workout?.nome?.toUpperCase() || 'TREINO', canvas.width / 2, canvas.height * 0.70)
    ctx.shadowBlur = 0

    // Linha divisória
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width * 0.2, canvas.height * 0.76)
    ctx.lineTo(canvas.width * 0.8, canvas.height * 0.76)
    ctx.stroke()

    // Métricas: KCAL | MIN
    // KCAL
    ctx.fillStyle = '#c8f04a'
    ctx.font = 'bold 120px Syne, sans-serif'
    ctx.fillText(workout?.kcal || '0', canvas.width * 0.30, canvas.height * 0.84)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '40px DM Sans, sans-serif'
    ctx.fillText('KCAL', canvas.width * 0.30, canvas.height * 0.87)
    ctx.fillText('QUEIMADAS', canvas.width * 0.30, canvas.height * 0.895)

    // Separador |
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = 'bold 100px sans-serif'
    ctx.fillText('|', canvas.width * 0.50, canvas.height * 0.845)

    // MIN
    ctx.fillStyle = '#c8f04a'
    ctx.font = 'bold 120px Syne, sans-serif'
    ctx.fillText(workout?.duration || '0', canvas.width * 0.70, canvas.height * 0.84)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '40px DM Sans, sans-serif'
    ctx.fillText('MIN', canvas.width * 0.70, canvas.height * 0.87)
    ctx.fillText('DURAÇÃO', canvas.width * 0.70, canvas.height * 0.895)

    // Marca d'água PeakOS
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px Syne, sans-serif'
    ctx.fillText('Peak', canvas.width * 0.40, canvas.height * 0.95)
    ctx.fillStyle = '#c8f04a'
    ctx.fillText('OS', canvas.width * 0.57, canvas.height * 0.95)
  }

  // Compartilhar
  const shareStory = async () => {
    renderStory()
    setTimeout(async () => {
      canvasRef.current.toBlob(async (blob) => {
        const file = new File([blob], 'peakos-treino.jpg', { type: 'image/jpeg' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Treino Concluído! 💪',
            text: `${workout?.nome || 'Treino'} - ${workout?.kcal || 0}kcal em ${workout?.duration || 0}min #PeakOS`,
            files: [file]
          })
        } else {
          // Fallback: download
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'peakos-treino.jpg'
          a.click()
        }
      }, 'image/jpeg', 0.9)
    }, 500)
  }

  // Renderizar story inicial
  useEffect(() => {
    if (!stream && !photo) {
      renderStory()
    }
  }, [photo, stream])

  return (
    <div className="space-y-4">
      {/* Preview da story */}
      <div className="relative aspect-[9/16] max-h-96 bg-gray-900 rounded-2xl overflow-hidden">
        {stream ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        {!stream && !photo && (
          <button onClick={openCamera} className="flex-1 bg-[#84CC16] hover:bg-[#65A30D] text-white font-medium py-3 px-4 rounded-xl transition-colors">
            📷 Tirar Foto
          </button>
        )}
        {stream && (
          <button onClick={capturePhoto} className="flex-1 bg-[#84CC16] hover:bg-[#65A30D] text-white font-medium py-3 px-4 rounded-xl transition-colors">
            ⭕ Capturar
          </button>
        )}
        <button onClick={shareStory} className="flex-1 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white font-medium py-3 px-4 rounded-xl transition-colors">
          📤 Compartilhar
        </button>
      </div>
    </div>
  )
}

export default WorkoutStory

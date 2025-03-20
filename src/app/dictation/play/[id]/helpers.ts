export const incrementPlayCount = async (gameId: string) => {
    try {
        const response = await fetch(`/api/dictation/play/${gameId}`, {
          method: 'POST',
        })
        if (!response.ok) {
          console.error('Failed to increment play count')
        }
      } catch (error) {
        console.error('Error incrementing play count:', error)
      }
}
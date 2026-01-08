import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface FavoriteProcess {
  id: string
  process_number: string
  tribunal?: string
  classe?: string
  assunto?: string
  notes?: string
  data_favorited: string
}

export function useProcessFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<FavoriteProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load all favorites for the user
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadFavorites = async () => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('favorite_processes')
          .select('*')
          .eq('user_id', userId)
          .order('data_favorited', { ascending: false })

        if (err) throw err
        setFavorites(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading favorites')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [userId, supabase])

  // Check if a specific process is favorited
  const isFavorited = useCallback(
    (processNumber: string): boolean => {
      return favorites.some((fav) => fav.process_number === processNumber)
    },
    [favorites]
  )

  // Get a favorite by process number
  const getFavorite = useCallback(
    (processNumber: string): FavoriteProcess | undefined => {
      return favorites.find((fav) => fav.process_number === processNumber)
    },
    [favorites]
  )

  // Add or update a favorite
  const toggleFavorite = useCallback(
    async (
      processNumber: string,
      data?: { tribunal?: string; classe?: string; assunto?: string; notes?: string }
    ): Promise<boolean> => {
      if (!userId) {
        setError('User not authenticated')
        return false
      }

      try {
        const existing = favorites.find((fav) => fav.process_number === processNumber)

        if (existing) {
          // Update existing
          const { error: err } = await supabase
            .from('favorite_processes')
            .update({ notes: data?.notes || existing.notes })
            .eq('id', existing.id)

          if (err) throw err
          setFavorites(favorites.filter((fav) => fav.process_number !== processNumber))
          return false // Was removed
        } else {
          // Add new
          const { data: newFavorite, error: err } = await supabase
            .from('favorite_processes')
            .insert([
              {
                user_id: userId,
                process_number: processNumber,
                tribunal: data?.tribunal,
                classe: data?.classe,
                assunto: data?.assunto,
                notes: data?.notes || '',
              },
            ])
            .select()
            .single()

          if (err) throw err
          setFavorites([newFavorite, ...favorites])
          return true // Was added
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error toggling favorite'
        setError(errorMsg)
        return false
      }
    },
    [userId, favorites, supabase]
  )

  // Update notes for a favorite
  const updateNotes = useCallback(
    async (processNumber: string, notes: string): Promise<boolean> => {
      if (!userId) {
        setError('User not authenticated')
        return false
      }

      try {
        const favorite = favorites.find((fav) => fav.process_number === processNumber)
        if (!favorite) {
          setError('Favorite not found')
          return false
        }

        const { error: err } = await supabase
          .from('favorite_processes')
          .update({ notes })
          .eq('id', favorite.id)

        if (err) throw err

        // Update local state
        setFavorites(
          favorites.map((fav) =>
            fav.process_number === processNumber ? { ...fav, notes } : fav
          )
        )
        setError(null)
        return true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error updating notes'
        setError(errorMsg)
        return false
      }
    },
    [userId, favorites, supabase]
  )

  // Remove a favorite
  const removeFavorite = useCallback(
    async (processNumber: string): Promise<boolean> => {
      if (!userId) {
        setError('User not authenticated')
        return false
      }

      try {
        const favorite = favorites.find((fav) => fav.process_number === processNumber)
        if (!favorite) {
          setError('Favorite not found')
          return false
        }

        const { error: err } = await supabase
          .from('favorite_processes')
          .delete()
          .eq('id', favorite.id)

        if (err) throw err

        setFavorites(favorites.filter((fav) => fav.process_number !== processNumber))
        setError(null)
        return true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error removing favorite'
        setError(errorMsg)
        return false
      }
    },
    [userId, favorites, supabase]
  )

  return {
    favorites,
    loading,
    error,
    isFavorited,
    getFavorite,
    toggleFavorite,
    updateNotes,
    removeFavorite,
  }
}

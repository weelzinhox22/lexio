import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SearchHistoryItem {
  id: string
  process_number: string
  tribunal?: string
  search_query: string
  results_count: number
  found_at: boolean
  searched_at: string
}

export function useSearchHistory(userId: string | undefined) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load search history for the user
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadHistory = async () => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('search_history')
          .select('*')
          .eq('user_id', userId)
          .order('searched_at', { ascending: false })
          .limit(50) // Last 50 searches

        if (err) throw err
        setHistory(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading history')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [userId, supabase])

  // Add a search to history
  const addToHistory = useCallback(
    async (
      processNumber: string,
      resultsCount: number,
      tribunal?: string,
      searchQuery?: string
    ): Promise<boolean> => {
      if (!userId) {
        setError('User not authenticated')
        return false
      }

      try {
        const { error: err } = await supabase.from('search_history').insert([
          {
            user_id: userId,
            process_number: processNumber,
            tribunal: tribunal,
            search_query: searchQuery || processNumber,
            results_count: resultsCount,
            found_at: resultsCount > 0,
          },
        ])

        if (err) throw err
        setError(null)
        return true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error adding to history'
        setError(errorMsg)
        return false
      }
    },
    [userId, supabase]
  )

  // Get unique processes from history (no duplicates, latest first)
  const getUniqueProcesses = useCallback((): SearchHistoryItem[] => {
    const seen = new Set<string>()
    const unique: SearchHistoryItem[] = []

    for (const item of history) {
      if (!seen.has(item.process_number)) {
        unique.push(item)
        seen.add(item.process_number)
      }
    }

    return unique
  }, [history])

  // Get recent searches (last N searches, might have duplicates)
  const getRecentSearches = useCallback((limit: number = 10): SearchHistoryItem[] => {
    return history.slice(0, limit)
  }, [history])

  // Get most searched processes
  const getMostSearched = useCallback(
    (limit: number = 10): SearchHistoryItem[] => {
      const grouped = new Map<string, number>()

      for (const item of history) {
        grouped.set(item.process_number, (grouped.get(item.process_number) || 0) + 1)
      }

      return Array.from(grouped.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map((entry) => {
          const item = history.find((h) => h.process_number === entry[0])
          return item || ({} as SearchHistoryItem)
        })
        .filter((item) => item.id)
    },
    [history]
  )

  // Get today's searches
  const getTodaySearches = useCallback((): SearchHistoryItem[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return history.filter((item) => {
      const searchDate = new Date(item.searched_at)
      searchDate.setHours(0, 0, 0, 0)
      return searchDate.getTime() === today.getTime()
    })
  }, [history])

  // Get searches from this week
  const getWeekSearches = useCallback((): SearchHistoryItem[] => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return history.filter((item) => {
      const searchDate = new Date(item.searched_at)
      return searchDate >= sevenDaysAgo
    })
  }, [history])

  // Clear all history
  const clearHistory = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setError('User not authenticated')
      return false
    }

    try {
      const { error: err } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId)

      if (err) throw err
      setHistory([])
      setError(null)
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error clearing history'
      setError(errorMsg)
      return false
    }
  }, [userId, supabase])

  // Clear a specific search from history
  const removeFromHistory = useCallback(
    async (searchId: string): Promise<boolean> => {
      if (!userId) {
        setError('User not authenticated')
        return false
      }

      try {
        const { error: err } = await supabase
          .from('search_history')
          .delete()
          .eq('id', searchId)

        if (err) throw err
        setHistory(history.filter((item) => item.id !== searchId))
        setError(null)
        return true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error removing from history'
        setError(errorMsg)
        return false
      }
    },
    [userId, history, supabase]
  )

  return {
    history,
    loading,
    error,
    addToHistory,
    getUniqueProcesses,
    getRecentSearches,
    getMostSearched,
    getTodaySearches,
    getWeekSearches,
    clearHistory,
    removeFromHistory,
  }
}

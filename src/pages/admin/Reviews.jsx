
import React, { useEffect, useMemo, useState } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Search, RefreshCw, Star as StarIcon } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')

  const url = (localStorage.getItem('url') || '') + 'customer.php'

  const toNumber = (v) => {
    if (v === null || v === undefined || v === '' || v === 'null') return null
    const num = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
    return isNaN(num) ? null : num
  }

  const getText = (r) => {
    return (r.customersreviews ?? r.customersreviews_comment ?? '').toString()
  }

  const getOverall = (r) => {
    const overall = toNumber(r.customersreviews_rating)
    const hospitality = toNumber(r.customersreviews_hospitality_rate)
    const behavior = toNumber(r.customersreviews_behavior_rate)
    const facilities = toNumber(r.customersreviews_facilities_rate)
    const cleanliness = toNumber(r.customersreviews_cleanliness_rate)
    const foods = toNumber(r.customersreviews_foods_rate)
    const parts = [hospitality, behavior, facilities, cleanliness, foods].filter((x) => x !== null)
    if (parts.length > 0) {
      const avg = parts.reduce((a, b) => a + b, 0) / parts.length
      return Math.round(avg * 10) / 10
    }
    return overall !== null ? overall : null
  }

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('operation', 'getFeedbacks')
      const res = await axios.post(url, formData)
      const data = Array.isArray(res.data) ? res.data : (res.data !== 0 ? res.data : [])
      setReviews(data)
    } catch (err) {
      console.error('getFeedbacks error', err)
      toast.error('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const filtered = useMemo(() => {
    let list = Array.isArray(reviews) ? reviews.slice() : []
    const term = searchTerm.trim().toLowerCase()
    if (term) {
      list = list.filter((r) => {
        const name = (r.customer_fullname || '').toLowerCase()
        const text = getText(r).toLowerCase()
        return name.includes(term) || text.includes(term)
      })
    }
    if (ratingFilter !== 'all') {
      const min = parseInt(ratingFilter, 10)
      list = list.filter((r) => {
        const overall = getOverall(r)
        return overall !== null ? overall >= min : false
      })
    }
    return list
  }, [reviews, searchTerm, ratingFilter])

  // Format counts like 14K, 6K, etc
  const fmtCount = (n) => {
    const num = Number(n || 0)
    if (num >= 1000000) return `${Math.round(num / 100000) / 10}M`
    if (num >= 1000) return `${Math.round(num / 100) / 10}K`
    return String(num)
  }

  // Build 1–5 star distribution for filtered reviews
  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    filtered.forEach((r) => {
      const o = getOverall(r)
      if (o !== null) {
        const bucket = Math.max(1, Math.min(5, Math.round(o)))
        counts[bucket] += 1
      }
    })
    const max = Math.max(1, ...Object.values(counts))
    return { counts, max }
  }, [filtered])

  // Render star icons for a rating value
  const renderStars = (value, size = 16) => {
    const filled = Math.max(0, Math.min(5, Math.round(Number(value || 0))))
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className={"" + (i < filled ? "text-violet-600" : "text-muted-foreground")} style={{ width: size, height: size }} />
        ))}
      </div>
    )
  }

  // Relative time (e.g., 4 months ago)
  const relativeTime = (dt) => {
    try {
      const d = new Date(dt)
      const diff = Date.now() - d.getTime()
      const sec = Math.floor(diff / 1000)
      const min = Math.floor(sec / 60)
      const hr = Math.floor(min / 60)
      const day = Math.floor(hr / 24)
      const month = Math.floor(day / 30)
      const year = Math.floor(day / 365)
      if (year > 0) return `${year} year${year > 1 ? 's' : ''} ago`
      if (month > 0) return `${month} month${month > 1 ? 's' : ''} ago`
      if (day > 0) return `${day} day${day > 1 ? 's' : ''} ago`
      if (hr > 0) return `${hr} hour${hr > 1 ? 's' : ''} ago`
      if (min > 0) return `${min} minute${min > 1 ? 's' : ''} ago`
      return `${sec} second${sec !== 1 ? 's' : ''} ago`
    } catch {
      return dt ? formatDateTime(dt) : '—'
    }
  }

  const summary = useMemo(() => {
    const total = filtered.length
    const cats = {
      hospitality: [],
      behavior: [],
      facilities: [],
      cleanliness: [],
      foods: [],
    }
    filtered.forEach((r) => {
      const h = toNumber(r.customersreviews_hospitality_rate)
      const b = toNumber(r.customersreviews_behavior_rate)
      const f = toNumber(r.customersreviews_facilities_rate)
      const c = toNumber(r.customersreviews_cleanliness_rate)
      const o = toNumber(r.customersreviews_foods_rate)
      if (h !== null) cats.hospitality.push(h)
      if (b !== null) cats.behavior.push(b)
      if (f !== null) cats.facilities.push(f)
      if (c !== null) cats.cleanliness.push(c)
      if (o !== null) cats.foods.push(o)
    })
    const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null)
    return {
      total,
      hospitality: avg(cats.hospitality),
      behavior: avg(cats.behavior),
      facilities: avg(cats.facilities),
      cleanliness: avg(cats.cleanliness),
      foods: avg(cats.foods),
      overall: avg(filtered.map(getOverall).filter((x) => x !== null)),
    }
  }, [filtered])

  return (
    <div className="min-h-screen bg-background md:ml-72">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReviews} disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span>Reviews Summary</span>
              <div className="flex w-full md:w-auto items-center gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or review"
                    className="pl-8"
                  />
                </div>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
              {/* Left: big rating */}
              <div className="space-y-2">
                {isLoading ? (
                  <Skeleton className="h-20 w-32" />
                ) : (
                  <>
                    <div className="text-5xl font-bold">{summary.overall ?? '—'}</div>
                    <div className="flex items-center gap-2">
                      {renderStars(summary.overall, 18)}
                      <span className="text-muted-foreground text-sm">{fmtCount(summary.total)} ratings</span>
                    </div>
                  </>
                )}
              </div>

              {/* Right: distribution bars */}
              <div className="grid gap-2">
                {[5,4,3,2,1].map((star) => {
                  const count = distribution.counts[star]
                  const pct = Math.round((count / distribution.max) * 100)
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="w-6 text-sm font-medium">{star}.0</div>
                      <div className="flex-1 h-2 rounded-full bg-violet-200/60">
                        <div className="h-2 rounded-full bg-violet-600" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-28 text-right text-muted-foreground text-sm">{fmtCount(count)} reviews</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category badges removed per request */}
          </CardContent>
        </Card>

        {/* Reviews list */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">No reviews found.</div>
            ) : (
              <div className="space-y-6">
                {filtered.map((r, idx) => {
                  const overall = getOverall(r)
                  const date = r.customersreviews_date || r.created_at || r.updated_at
                  const name = r.customer_fullname || 'Anonymous'
                  const initial = (name || 'A').slice(0,1).toUpperCase()
                  return (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage alt={name} />
                            <AvatarFallback>{initial}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium leading-none">{name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{relativeTime(date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{overall ?? '—'}</div>
                          {renderStars(overall)}
                        </div>
                      </div>
                      <div className="mt-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {getText(r) || '—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-6">
              <Button variant="link" className="text-violet-700">Read all reviews</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminReviews
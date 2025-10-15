
import React, { useEffect, useMemo, useState } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
          <h1 className="text-2xl font-semibold tracking-tight">Customer Reviews</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReviews} disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle>Total Reviews</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-6 w-24" /> : <div className="text-3xl font-bold">{summary.total}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle>Overall Avg</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-6 w-24" /> : (
                <div className="flex items-center text-3xl font-bold">
                  <StarIcon className="w-6 h-6 text-yellow-500 mr-2" />
                  {summary.overall ?? '—'}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle>Hospitality Avg</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-6 w-24" /> : <div className="text-3xl font-bold">{summary.hospitality ?? '—'}</div>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span>Reviews List</span>
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
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">No reviews found.</div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Ratings</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r, idx) => {
                      const hospitality = toNumber(r.customersreviews_hospitality_rate)
                      const behavior = toNumber(r.customersreviews_behavior_rate)
                      const facilities = toNumber(r.customersreviews_facilities_rate)
                      const cleanliness = toNumber(r.customersreviews_cleanliness_rate)
                      const foods = toNumber(r.customersreviews_foods_rate)
                      const overall = getOverall(r)
                      const date = r.customersreviews_date || r.created_at || r.updated_at
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{r.customer_fullname || '—'}</TableCell>
                          <TableCell>
                            <div className="max-w-xl whitespace-pre-wrap">{getText(r) || '—'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {overall !== null && (
                                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Overall: {overall}</Badge>
                              )}
                              {hospitality !== null && (<Badge variant="secondary">Hospitality: {hospitality}</Badge>)}
                              {behavior !== null && (<Badge variant="secondary">Behavior: {behavior}</Badge>)}
                              {facilities !== null && (<Badge variant="secondary">Facilities: {facilities}</Badge>)}
                              {cleanliness !== null && (<Badge variant="secondary">Cleanliness: {cleanliness}</Badge>)}
                              {foods !== null && (<Badge variant="secondary">Foods: {foods}</Badge>)}
                            </div>
                          </TableCell>
                          <TableCell>{date ? formatDateTime(date) : '—'}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminReviews
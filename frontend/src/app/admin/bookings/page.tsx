'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { bookingApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plane, 
  Building, 
  Calendar, 
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface BookingData {
  id: string
  _id?: string
  bookingId?: string
  type: 'flight' | 'hotel'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  contact?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      country: string
      postalCode: string
    }
  }
  pricing?: {
    finalPrice: number
    currency: string
  }
  bookingDate?: string
  // Allow any additional properties from the API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  flightData?: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    airline: string
    flightNumber: string
  }
  hotelData?: {
    name: string
    address: {
      city: string
      country: string
    }
    checkIn: string
    checkOut: string
    nights: number
  }
  passengers?: Array<{
    firstName: string
    lastName: string
    nationality: string
  }>
  guests?: Array<{
    firstName: string
    lastName: string
    isMainGuest: boolean
  }>
  userId?: {
    firstName: string
    lastName: string
    email: string
  }
}

interface BookingStats {
  totalBookings: number
  flightBookings: number
  hotelBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
  recentBookings: BookingData[]
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  })

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit
      }
      
      if (filters.type !== 'all') params.type = filters.type
      if (filters.status !== 'all') params.status = filters.status
      
      const result = await bookingApi.admin.getAllBookings(params)
      // Type assertion to match our component's expected type
      setBookings(result.bookings as BookingData[])
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.total
      })
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [filters.page, filters.limit, filters.type, filters.status])

  const fetchStats = async () => {
    try {
      const statsData = await bookingApi.admin.getStats()
      // Type assertion to match our component's expected type
      setStats(statsData as unknown as BookingStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchStats()
  }, [fetchBookings])

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await bookingApi.admin.updateStatus(bookingId, newStatus)
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const handlePaymentUpdate = async (bookingId: string, paymentStatus: string) => {
    try {
      await bookingApi.admin.updatePayment(bookingId, paymentStatus)
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
      case 'paid':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      case 'refunded':
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><CreditCard className="w-3 h-3 mr-1" />Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const searchTerm = filters.search.toLowerCase()
    return (
      (booking.bookingId?.toLowerCase().includes(searchTerm) || false) ||
      (booking.contact?.firstName?.toLowerCase().includes(searchTerm) || false) ||
      (booking.contact?.lastName?.toLowerCase().includes(searchTerm) || false) ||
      (booking.contact?.email?.toLowerCase().includes(searchTerm) || false)
    )
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <Button onClick={() => fetchBookings()} variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Flight Bookings</p>
                  <p className="text-2xl font-bold">{stats.flightBookings}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Plane className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hotel Bookings</p>
                  <p className="text-2xl font-bold">{stats.hotelBookings}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-full">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search bookings..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.bookingId || booking.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {booking.type === 'flight' ? (
                            <><Plane className="w-3 h-3 mr-1" />Flight</>
                          ) : (
                            <><Building className="w-3 h-3 mr-1" />Hotel</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.contact?.firstName || 'N/A'} {booking.contact?.lastName || ''}</p>
                          <p className="text-sm text-gray-600">{booking.contact?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.type === 'flight' && booking.flightData ? (
                          <div className="text-sm">
                            <p>{booking.flightData.origin} → {booking.flightData.destination}</p>
                            <p className="text-gray-600">{booking.flightData.airline} {booking.flightData.flightNumber}</p>
                          </div>
                        ) : booking.type === 'hotel' && booking.hotelData ? (
                          <div className="text-sm">
                            <p>{booking.hotelData.name}</p>
                            <p className="text-gray-600">{booking.hotelData.address.city}, {booking.hotelData.address.country}</p>
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{getPaymentBadge(booking.paymentStatus || 'pending')}</TableCell>
                      <TableCell className="font-medium">
                        {booking.pricing ? formatCurrency(booking.pricing.finalPrice, booking.pricing.currency) : 'N/A'}
                      </TableCell>
                      <TableCell>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                                <Eye className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Booking Details - {booking.bookingId}</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Customer Information</h4>
                                      <p><strong>Name:</strong> {selectedBooking.contact?.firstName || 'N/A'} {selectedBooking.contact?.lastName || ''}</p>
                                      <p><strong>Email:</strong> {selectedBooking.contact?.email || 'N/A'}</p>
                                      <p><strong>Phone:</strong> {selectedBooking.contact?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Booking Information</h4>
                                      <p><strong>Type:</strong> {selectedBooking.type}</p>
                                      <p><strong>Status:</strong> {selectedBooking.status}</p>
                                      <p><strong>Payment:</strong> {selectedBooking.paymentStatus || 'pending'}</p>
                                      <p><strong>Amount:</strong> {selectedBooking.pricing ? formatCurrency(selectedBooking.pricing.finalPrice, selectedBooking.pricing.currency) : 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Select onValueChange={(value) => handleStatusUpdate(selectedBooking.bookingId || selectedBooking.id, value)}>
                                      <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Update Status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select onValueChange={(value) => handlePaymentUpdate(selectedBooking.bookingId || selectedBooking.id, value)}>
                                      <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Update Payment" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

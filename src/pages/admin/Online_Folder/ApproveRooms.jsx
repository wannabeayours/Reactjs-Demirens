// src/admin/approval/ApproveRooms.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react"; // Add ChevronDown import

const currency = (n) => `₱${Number(n || 0).toLocaleString()}`;

export default function ApproveRooms() {
  const APIConn = `${localStorage.url}admin.php`;
  const { bookingId: bookingIdParam } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useApproval();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkIn, setCheckIn] = useState(state.checkIn || "");
  const [checkOut, setCheckOut] = useState(state.checkOut || "");

  const bookingId = state.bookingId || Number(bookingIdParam);

  useEffect(() => {
    // Basic guard if someone opens URL directly without context
    if (!state.bookingId) {
      // You could redirect back:
      navigate("/admin/online");
      // But we'll allow it; just proceed to fetch and let them pick.
    }
  }, [state.bookingId]);

  const fetchAvailableRooms = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      // If your API supports filtering by types, send JSON here:
      // fd.append("json", JSON.stringify({ roomtype_ids: state.requestedRoomTypes.map(t => t.id) }));
      fd.append("method", "viewRooms");
      const res = await axios.post(APIConn, fd);
      const data = Array.isArray(res.data) ? res.data : [];

      setRooms(data);
    } catch (err) {
      console.error("Error fetching available rooms:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter: only requested types (if provided) and date-available; ignore status
  const requestedTypeNames = useMemo(
    () => new Set((state.requestedRoomTypes || []).map((t) => (t?.name || "").toLowerCase())),
    [state.requestedRoomTypes]
  );

  const finalList = useMemo(() => {
    const q = search.toLowerCase();
    return rooms
      .filter((room) =>
        requestedTypeNames.size
          ? requestedTypeNames.has((room.roomtype_name || "").toLowerCase())
          : true
      )
      .filter((room) =>
        room.roomtype_name?.toLowerCase().includes(q) ||
        room.roomtype_description?.toLowerCase().includes(q)
      )
      .filter((room) => isAvailable(room, checkIn, checkOut));
  }, [rooms, requestedTypeNames, search, checkIn, checkOut]);

  // Availability helpers
  const parseDate = (str) => (str ? new Date(str + "T00:00:00") : null);
  const rangesOverlap = (startA, endA, startB, endB) => startA < endB && endA > startB; // half-open
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const fmt = (date) => (date ? date.toISOString().slice(0, 10) : "");
  const tomorrow = fmt(addDays(new Date(), 1));
  const isAvailable = (room, startStr, endStr) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return true;
    const bookings = Array.isArray(room.bookings) ? room.bookings : [];
    for (const b of bookings) {
      const bStart = parseDate(b.checkin_date);
      const bEnd = parseDate(b.checkout_date);
      if (!bStart || !bEnd) continue;
      if (rangesOverlap(start, end, bStart, bEnd)) return false;
    }
    return true;
  };

  // Date input handlers with validation
  const handleCheckInChange = (value) => {
    const inDate = parseDate(value);
    const outDate = parseDate(checkOut);
    // enforce earliest check-in as tomorrow
    if (value && value < tomorrow) {
      const t = parseDate(tomorrow);
      const next = addDays(t, 1);
      setCheckIn(tomorrow);
      if (!outDate || t >= outDate) setCheckOut(fmt(next));
      return;
    }
    if (inDate && outDate && inDate >= outDate) {
      const next = addDays(inDate, 1);
      setCheckIn(value);
      setCheckOut(fmt(next));
    } else {
      setCheckIn(value);
    }
  };

  const handleCheckOutChange = (value) => {
    const inDate = parseDate(checkIn);
    const outDate = parseDate(value);
    if (inDate && outDate && outDate <= inDate) {
      const next = addDays(inDate, 1);
      setCheckOut(fmt(next));
    } else {
      setCheckOut(value);
    }
  };

  // Selected rooms (limit: requestedRoomCount)
  const [selected, setSelected] = useState(state.selectedRooms || []);
  const maxSelect = state.requestedRoomCount || 1;
  const remaining = Math.max(0, maxSelect - selected.length);

  const toggle = (room) => {
    // prevent selecting rooms that conflict with dates
    if (!isAvailable(room, checkIn, checkOut)) return;
    const exists = selected.some((r) => r.id === room.roomnumber_id);
    if (exists) {
      setSelected((prev) => prev.filter((r) => r.id !== room.roomnumber_id));
    } else {
      if (selected.length >= maxSelect) return; // enforce limit
      setSelected((prev) => [
        ...prev,
        {
          id: room.roomnumber_id,
          roomtype_name: room.roomtype_name,
          price: Number(room.roomtype_price || 0),
        },
      ]);
    }
  };

  const proceed = () => {
    if (!checkIn || !checkOut) {
      alert("Please set both Check-In and Check-Out.");
      return;
    }
    if (selected.length !== maxSelect) {
      alert(`Please select exactly ${maxSelect} room(s).`);
      return;
    }
    setState((prev) => ({ ...prev, selectedRooms: selected, checkIn, checkOut }));
    navigate(`/admin/receipt/${bookingId}`);
  };

  // Floating scroll-to-bottom handler
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <>
      <AdminHeader />
      <div className="p-6 max-w-6xl mx-auto relative">
        {/* Floating Button */}
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={28} />
        </button>

        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Approve Booking #{bookingId} — Step 1: Choose Available Rooms
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Customer: <span className="font-medium">{state.customerName || "-"}</span> • Dates:{" "}
          <span className="font-medium">{state.checkIn}</span> →{" "}
          <span className="font-medium">{state.checkOut}</span> • Nights:{" "}
          <span className="font-medium">{state.nights}</span>
        </p>

        {/* Date controls (allow override) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground">Check-In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={tomorrow}
              className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Check-Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              min={checkIn ? fmt(addDays(parseDate(checkIn), 1)) : fmt(new Date())}
              className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
            />
          </div>
        </div>

        {/* Requested Summary */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            Requested Rooms: <span className="font-semibold">{maxSelect}</span>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            Remaining to select:{" "}
            <span className="font-semibold">{remaining}</span>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
            Types:{" "}
            {(state.requestedRoomTypes || []).map((t) => t.name).join(", ") || "-"}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading rooms…</p>
        ) : finalList.length === 0 ? (
          <p className="text-center text-red-500 font-semibold">No Available Rooms</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finalList.map((room, i) => {
              const imgs = room.images ? room.images.split(",").map((s) => s.trim()) : [];
              const isPicked = selected.some((r) => r.id === room.roomnumber_id);
              const available = isAvailable(room, checkIn, checkOut);

              return (
                <div
                  key={`${room.roomnumber_id}-${i}`}
                  className={`border rounded-xl shadow-sm bg-card overflow-hidden ${
                    isPicked ? "ring-2 ring-green-500" : ""
                  }`}
                >
                  <Carousel className="relative">
                    <CarouselContent>
                      {imgs.length ? (
                        imgs.map((img, idx) => (
                          <CarouselItem key={idx}>
                            <img
                              src={`http://localhost/demirenAPI/images/${img}`}
                              alt={room.roomtype_name}
                              className="w-full h-56 object-cover"
                            />
                          </CarouselItem>
                        ))
                      ) : (
                        <CarouselItem>
                          <div className="w-full h-56 flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">No Image</span>
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">
                        {room.roomtype_name} — Room #{room.roomnumber_id} (Floor {room.roomfloor})
                      </h2>
                      <span className="font-bold text-green-600">
                        {currency(room.roomtype_price)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {room.roomtype_description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Capacity: {room.roomtype_capacity}
                    </p>

                    {/* Availability indicator */}
                    {checkIn && checkOut && (
                      <div className="mt-2">
                        {available ? (
                          <span className="inline-block text-xs px-2 py-1 rounded bg-green-100 text-green-700">Available</span>
                        ) : (
                          <span className="inline-block text-xs px-2 py-1 rounded bg-red-100 text-red-700">Conflict on selected dates</span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => toggle(room)}
                      className={`mt-3 px-4 py-2 rounded text-white ${isPicked ? "bg-green-600 hover:bg-green-700" : !available ? "bg-gray-400 cursor-not-allowed" : selected.length >= maxSelect ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90"}`}
                      disabled={!available || (!isPicked && selected.length >= maxSelect)}
                    >
                      {isPicked ? "Selected" : "Select Room"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => navigate("/admin/online")}
            className="px-4 py-2 rounded border border-border bg-card hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={proceed}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            disabled={selected.length !== maxSelect}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </>
  );
}

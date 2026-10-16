"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { columns, SessionDetailsModal } from "./columns";
import { DataTable } from "./data-table";
import { VerificationSessionRecord } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";

function VerificationSessionsContent() {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId") || "";
  const urlSearch = searchParams.get("search") || urlUserId;
  const shouldOpenLatest = searchParams.get("openLatest") === "true";

  const [sessions, setSessions] = useState<VerificationSessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<VerificationSessionRecord | null>(null);
  const [autoOpened, setAutoOpened] = useState(false);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({
    status: "all",
    search: urlSearch,
  });

  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });

  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pagination = useMemo(
    () => ({
      page: currentPage,
      limit,
      total: totalFiltered,
      totalPages,
    }),
    [currentPage, limit, totalFiltered, totalPages],
  );

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search.trim() && { search: filters.search.trim() }),
        ...(urlUserId && { userId: urlUserId }),
      });

      const response = await fetch(
        `/api/admin/verification-sessions?${queryParams.toString()}`,
      );
      const data = await response.json();

      if (response.ok) {
        setSessions(data.sessions || []);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.pagination) {
          setTotalFiltered(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }

        // Auto-open modal if requested via URL
        if (
          shouldOpenLatest &&
          !autoOpened &&
          data.sessions &&
          data.sessions.length > 0
        ) {
          setAutoOpened(true);
          const target = urlUserId
            ? data.sessions.find(
                (s: VerificationSessionRecord) => s.user_id === urlUserId,
              ) || data.sessions[0]
            : data.sessions[0];
          setSelectedSession(target);
        }
      } else {
        console.error("Failed to fetch sessions:", data.message || data.error);
      }
    } catch (error) {
      console.error("Error fetching verification sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters.status, filters.search, urlUserId, shouldOpenLatest, autoOpened]);

  // Fetch when page or status filter changes
  useEffect(() => {
    fetchSessions();
  }, [currentPage, filters.status, fetchSessions]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchSessions();
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleCardFilter = (selectedStatus: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      status: prev.status === selectedStatus ? "all" : selectedStatus,
    }));
  };

  return (
    <div className="space-y-6 text-black pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Verification Sessions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor NIN identity verification requests, provider responses, and field mismatch discrepancies.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Card */}
        <Card
          onClick={() => handleCardFilter("all")}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
            filters.status === "all"
              ? "ring-2 ring-primary border-primary bg-emerald-50/20"
              : "border-slate-200 bg-white"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Sessions
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.total.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Verified Card */}
        <Card
          onClick={() => handleCardFilter("verified")}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
            filters.status === "verified"
              ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Verified
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.verified.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card
          onClick={() => handleCardFilter("pending")}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
            filters.status === "pending"
              ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Pending
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.pending.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Rejected Card */}
        <Card
          onClick={() => handleCardFilter("rejected")}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
            filters.status === "rejected"
              ? "ring-2 ring-rose-500 border-rose-500 bg-rose-50/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Rejected
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.rejected.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns(fetchSessions)}
        data={sessions}
        loading={loading}
        pagination={pagination}
        onPageChange={setCurrentPage}
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={fetchSessions}
      />

      {/* Auto-opened modal when navigated from users table */}
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          onRefresh={fetchSessions}
        />
      )}
    </div>
  );
}

export default function VerificationSessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <VerificationSessionsContent />
    </Suspense>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Stethoscope,
    Eye,
    CheckCircle2,
    Inbox,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Calendar,
    Phone,
    Mail,
    Search,
    MapPin,
    Loader2,
    Star,
    CircleDot,
    CreditCard,
    Ban,
    Clock,
    Award,
    Video,
    Building2,
    Home,
    Activity,
    FileText,
    Sparkles
} from "lucide-react";

// Exact API path
import AdminAPI from "../../../../services/AdminAPI";

// Cancelled Independent Doctor Appointments/Orders Modal
import CancelledIndependentDoctorOrdersModal from "./CancelledIndependentDoctorOrdersModal";

export default function IndependentDoctorAppointments() {
    // ----------------- DOCTORS TABLE STATE -----------------
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [specialityFilter, setSpecialityFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalActiveDoctors, setTotalActiveDoctors] = useState(0);

    // ----------------- CANCELLED ORDERS MODAL STATE -----------------
    const [showCancelledModal, setShowCancelledModal] = useState(false);

    // ----------------- DOCTOR APPOINTMENTS HISTORY MODAL STATE -----------------
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [modalDoctor, setModalDoctor] = useState(null);
    const [modalAppointments, setModalAppointments] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSearch, setModalSearch] = useState("");
    const [modalStatus, setModalStatus] = useState("");
    const [modalConsultationType, setModalConsultationType] = useState("");
    const [modalPage, setModalPage] = useState(1);
    const [modalTotalPages, setModalTotalPages] = useState(1);
    const [totalAssociatedAppointments, setTotalAssociatedAppointments] = useState(0);

    const modalRef = useRef(null);

    // ========================================================
    // 1. FETCH APPROVED DOCTORS (DASHBOARD TABLE)
    // ========================================================
    const fetchDoctors = useCallback(async () => {
        try {
            setLoadingDoctors(true);
            const params = {
                page: currentPage,
                limit: 10,
                ...(searchQuery.trim() && { search: searchQuery.trim() }),
                ...(cityFilter.trim() && { city: cityFilter.trim() }),
                ...(specialityFilter.trim() && { speciality: specialityFilter.trim() })
            };

            const response = await AdminAPI.getApprovedDoctorsWithAppointments(params);

            if (response && response.success) {
                setDoctors(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalActiveDoctors(response.totalActiveDoctors || response.count || 0);
            }
        } catch (error) {
            console.error("Error fetching approved doctors:", error);
            setDoctors([]);
        } finally {
            setLoadingDoctors(false);
        }
    }, [currentPage, searchQuery, cityFilter, specialityFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchDoctors();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchDoctors]);

    // ========================================================
    // 2. FETCH DOCTOR APPOINTMENTS (MODAL POPUP)
    // ========================================================
    const fetchDoctorAppointments = useCallback(async (doctorId, page = 1) => {
        if (!doctorId) return;
        try {
            setModalLoading(true);
            const params = {
                page: page,
                limit: 50,
                ...(modalSearch.trim() && { search: modalSearch.trim() }),
                ...(modalStatus && { status: modalStatus }),
                ...(modalConsultationType && { consultationType: modalConsultationType })
            };

            const response = await AdminAPI.getDoctorAppointmentsById(doctorId, params);

            if (response && response.success) {
                if (response.doctor) setModalDoctor(response.doctor);
                setModalAppointments(response.appointments || []);
                setModalTotalPages(response.totalPages || 1);
                setModalPage(response.currentPage || 1);
                setTotalAssociatedAppointments(response.totalAssociatedAppointments || response.count || 0);
            }
        } catch (error) {
            console.error("Error fetching doctor appointments:", error);
            setModalAppointments([]);
        } finally {
            setModalLoading(false);
        }
    }, [modalSearch, modalStatus, modalConsultationType]);

    // Open Doctor Appointments Modal
    const handleViewAppointments = (doc) => {
        setSelectedDoctorId(doc._id);
        setModalDoctor({
            _id: doc._id,
            name: doc.doctorName,
            email: doc.email,
            phone: doc.phone,
            speciality: doc.speciality,
            qualification: doc.qualification,
            profileImage: doc.profileImage,
            rating: doc.rating,
            city: doc.city
        });
        setModalSearch("");
        setModalStatus("");
        setModalConsultationType("");
        setModalPage(1);
        setShowModal(true);
        fetchDoctorAppointments(doc._id, 1);
    };

    // Close modal on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };
        if (showModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showModal]);

    // Helper: Appointment Status Badges styling
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "confirmed":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "in progress":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "rescheduled":
                return "bg-purple-50 text-purple-700 border-purple-200";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    // Helper: Consultation Type Badge Icon & Style
    const getConsultationTypeBadge = (type) => {
        switch (type?.toLowerCase()) {
            case "video consult":
                return {
                    icon: <Video className="w-2.5 h-2.5 text-indigo-600" />,
                    style: "bg-indigo-50 text-indigo-700 border-indigo-200"
                };
            case "clinic visit":
                return {
                    icon: <Building2 className="w-2.5 h-2.5 text-amber-600" />,
                    style: "bg-amber-50 text-amber-700 border-amber-200"
                };
            case "home visit":
                return {
                    icon: <Home className="w-2.5 h-2.5 text-emerald-600" />,
                    style: "bg-emerald-50 text-emerald-700 border-emerald-200"
                };
            default:
                return {
                    icon: <Activity className="w-2.5 h-2.5 text-slate-500" />,
                    style: "bg-slate-50 text-slate-700 border-slate-200"
                };
        }
    };

    return (
        <div className="space-y-5">
            {/* 1. TOP HEADER WITH CANCELLED APPOINTMENTS BUTTON & FILTERS */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Approved Independent Doctors</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> {totalActiveDoctors} Active
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Manage and audit verified doctors & patient appointments</p>
                    </div>
                </div>

                {/* Right Actions: Cancelled Orders Button + Search & Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* CANCELLED DOCTOR APPOINTMENTS BUTTON */}
                    <button
                        onClick={() => setShowCancelledModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all shadow-xs focus:outline-none"
                    >
                        <Ban className="w-4 h-4 text-rose-600" />
                        <span>Cancelled Appointments</span>
                    </button>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search doctor, email, phone..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-44 sm:w-52"
                        />
                    </div>

                    {/* Speciality Filter Input */}
                    {/* <div className="relative">
                        <Award className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Speciality..."
                            value={specialityFilter}
                            onChange={(e) => {
                                setSpecialityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-28 sm:w-32"
                        />
                    </div> */}

                    {/* City Filter Input */}
                    <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="City filter..."
                            value={cityFilter}
                            onChange={(e) => {
                                setCityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-28 sm:w-32"
                        />
                    </div>
                </div>
            </div>

            {/* 2. DOCTORS DATA TABLE */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[950px] table-auto align-middle">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 border-b border-slate-100">
                                <th className="text-center px-5 py-4 w-14">Photo</th>
                                <th className="text-left px-5 py-4">Doctor Info</th>
                                <th className="text-left px-5 py-4">Contact Info</th>
                                <th className="text-left px-5 py-4">Location</th>
                                <th className="text-center px-5 py-4">Appointment Metrics</th>
                                <th className="text-center px-5 py-4">Status & Status</th>
                                <th className="text-center px-5 py-4 w-36">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loadingDoctors ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-7 h-7 text-[#3D3F96] animate-spin" />
                                            <span className="text-xs font-bold text-slate-500">Loading doctors list...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : doctors.length > 0 ? (
                                doctors.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Photo */}
                                        <td className="px-5 py-4 text-center">
                                            {doc.profileImage ? (
                                                <img
                                                    src={doc.profileImage}
                                                    alt={doc.doctorName}
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 mx-auto shadow-xs"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/100x100?text=Doctor";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96] text-white font-black text-sm flex items-center justify-center mx-auto shadow-xs">
                                                    {doc.doctorName?.replace("Dr.", "").trim().charAt(0) || "D"}
                                                </div>
                                            )}
                                        </td>

                                        {/* Doctor Name, Speciality & Qualification */}
                                        <td className="px-5 py-4">
                                            <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                                {doc.doctorName}
                                                {doc.isOnline && (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Online" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3D3F96] bg-[#3D3F96]/10 px-2 py-0.5 rounded capitalize">
                                                    {doc.speciality || "General"}
                                                </span>
                                                {doc.qualification && (
                                                    <span className="text-[10px] text-slate-500 font-semibold">
                                                        {doc.qualification}
                                                    </span>
                                                )}
                                                {doc.experienceYears > 0 && (
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        • {doc.experienceYears} yrs exp
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-slate-400" /> {doc.email}
                                            </div>
                                            <div className="text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3 h-3 text-slate-400" /> {doc.phone}
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-slate-700 block">{doc.city}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{doc.state || "State"}</span>
                                        </td>

                                        {/* Metrics */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="text-[11px] font-extrabold text-slate-800" title="Total Appointments">
                                                    {doc.totalAppointments || 0} Total
                                                </span>
                                                <span className="text-slate-300">&bull;</span>
                                                <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" title="Active Appointments">
                                                    {doc.activeAppointments || 0} Active
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                                                <CircleDot className="w-2.5 h-2.5 text-emerald-500" />
                                                {doc.verification || "APPROVED"}
                                            </span>
                                        </td>

                                        {/* View Appointments Action */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleViewAppointments(doc)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none shadow-xs"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Appointments
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2.5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                <Inbox className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-700">No Independent Doctors Found</h4>
                                            <p className="text-[11px] text-slate-400">Try adjusting your search query, speciality, or city filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION BAR */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 flex-wrap gap-3">
                    <button
                        disabled={currentPage <= 1 || loadingDoctors}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <span className="text-xs font-extrabold text-slate-500">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage >= totalPages || loadingDoctors}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                    >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ========================================================
                3. EXTRA-LARGE DOCTOR APPOINTMENTS DETAIL MODAL
            ======================================================== */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
                    >
                        {/* Big Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/70">
                            <div className="flex items-center gap-4">
                                <div className="w-13 h-13 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Direct Doctor Appointments</h3>
                                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/20">
                                            {totalAssociatedAppointments} Total Bookings
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                                        <span>Doctor: <strong className="text-slate-800 font-extrabold">{modalDoctor?.name}</strong></span>
                                        <span>&bull;</span>
                                        <span className="text-[#3D3F96] font-extrabold">{modalDoctor?.speciality} ({modalDoctor?.qualification || "MBBS"})</span>
                                        <span>&bull;</span>
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {modalDoctor?.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all focus:outline-none shadow-xs"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top Filters for Modal */}
                        <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
                            <div className="relative flex-1 min-w-[240px] max-w-md">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by Booking ID, Patient Name, Phone..."
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") fetchDoctorAppointments(selectedDoctorId, 1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                                {/* Consultation Type Filter */}
                                <select
                                    value={modalConsultationType}
                                    onChange={(e) => {
                                        setModalConsultationType(e.target.value);
                                        fetchDoctorAppointments(selectedDoctorId, 1);
                                    }}
                                    className="text-xs font-bold rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700"
                                >
                                    <option value="">All Consultations</option>
                                    <option value="Video Consult">Video Consult</option>
                                    <option value="Clinic Visit">Clinic Visit</option>
                                    <option value="Home Visit">Home Visit</option>
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={modalStatus}
                                    onChange={(e) => {
                                        setModalStatus(e.target.value);
                                        fetchDoctorAppointments(selectedDoctorId, 1);
                                    }}
                                    className="text-xs font-bold rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rescheduled">Rescheduled</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                                <button
                                    onClick={() => fetchDoctorAppointments(selectedDoctorId, 1)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-xs"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Expanded Table & Detailed Cards */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                                <table className="w-full text-xs text-left align-middle">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                            <th className="px-5 py-4">Booking ID & Type</th>
                                            <th className="px-5 py-4">Patient Details</th>
                                            <th className="px-5 py-4">Appointment Slot</th>
                                            <th className="px-5 py-4 w-1/4">Reason for Visit</th>
                                            <th className="px-5 py-4">Payment Info</th>
                                            <th className="px-5 py-4 text-right">Fee / Amount</th>
                                            <th className="px-5 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {modalLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2.5">
                                                        <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                                                        <span className="text-xs font-bold text-slate-500">Loading appointment details...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : modalAppointments.length > 0 ? (
                                            modalAppointments.map((item) => {
                                                const consultTypeInfo = getConsultationTypeBadge(item.consultationType);
                                                return (
                                                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                                                        {/* Booking ID & Type */}
                                                        <td className="px-5 py-4 align-top">
                                                            <span className="font-mono font-black text-sm text-[#3D3F96] block">
                                                                {item.bookingId}
                                                            </span>
                                                            <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded border ${consultTypeInfo.style}`}>
                                                                {consultTypeInfo.icon}
                                                                {item.consultationType || "General"}
                                                            </span>
                                                        </td>

                                                        {/* Patient Profile */}
                                                        <td className="px-5 py-4 align-top">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs">
                                                                    <User className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-extrabold text-slate-900 text-xs">
                                                                        {item.patient?.name || "Patient"}
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                                        <Phone className="w-3 h-3 text-slate-400" /> {item.patient?.phone || "N/A"}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                        {item.patient?.gender || "N/A"} &bull; {item.patient?.age ? `${item.patient.age} yrs` : ""}
                                                                        {item.patient?.relation && ` • (${item.patient.relation})`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Appointment Date & Time */}
                                                        <td className="px-5 py-4 align-top">
                                                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                {item.appointmentDate}
                                                            </div>
                                                            <div className="text-[11px] text-[#3D3F96] font-bold flex items-center gap-1 mt-1">
                                                                <Clock className="w-3 h-3 text-[#3D3F96]" />
                                                                {item.appointmentTime}
                                                            </div>
                                                        </td>

                                                        {/* Reason for Visit */}
                                                        <td className="px-5 py-4 align-top">
                                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-700 break-words leading-relaxed max-w-xs">
                                                                {item.patient?.reasonForVisit ? (
                                                                    <span className="line-clamp-2" title={item.patient.reasonForVisit}>
                                                                        {item.patient.reasonForVisit}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 italic">No specific reason mentioned</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Payment Info */}
                                                        <td className="px-5 py-4 align-top">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                                {item.payment?.paymentMethod || "Online"}
                                                            </div>
                                                            <div className="mt-1">
                                                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                                    item.payment?.paymentStatus === "Paid"
                                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                                                }`}>
                                                                    {item.payment?.paymentStatus || "Paid"}
                                                                </span>
                                                            </div>
                                                            {item.payment?.razorpayPaymentId && (
                                                                <div className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[120px]" title={item.payment.razorpayPaymentId}>
                                                                    ID: {item.payment.razorpayPaymentId}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Amount */}
                                                        <td className="px-5 py-4 align-top text-right">
                                                            <span className="font-black text-slate-900 text-sm block">
                                                                ₹{(item.amount || item.payment?.totalAmount || 0).toLocaleString("en-IN")}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold">Consultation fee</span>
                                                        </td>

                                                        {/* Status Badge */}
                                                        <td className="px-5 py-4 align-top text-center">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                                                                {item.status || "Confirmed"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-semibold">
                                                    No direct appointments found matching the filter criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Footer & Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    disabled={modalPage <= 1 || modalLoading}
                                    onClick={() => fetchDoctorAppointments(selectedDoctorId, modalPage - 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                </button>
                                <span className="text-xs font-extrabold text-slate-600">
                                    Page {modalPage} of {modalTotalPages}
                                </span>
                                <button
                                    disabled={modalPage >= modalTotalPages || modalLoading}
                                    onClick={() => fetchDoctorAppointments(selectedDoctorId, modalPage + 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all focus:outline-none shadow-xs"
                            >
                                Close Modal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                4. CANCELLED DOCTOR APPOINTMENTS MODAL
            ======================================================== */}
            {showCancelledModal && (
                <CancelledIndependentDoctorOrdersModal 
                    isOpen={showCancelledModal} 
                    onClose={() => setShowCancelledModal(false)} 
                />
            )}
        </div>
    );
}
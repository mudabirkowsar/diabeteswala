"use client";

import { useState } from "react";
import { FaUserMd, FaHospital } from "react-icons/fa";
import IndependentDoctors from "./components/IndependentDoctors";
import ClinicDoctors from "./components/ClinicDoctors";

export default function ManageDoctors() {
    const [activeTab, setActiveTab] = useState("independent"); // "independent" | "clinic"

    return (
        <div className="space-y-8 max-w-7xl mx-auto select-none">

            {/* Nav Tabs Switcher */}
            <div className="flex items-center gap-2 bg-gray-100/70 p-1.5 rounded-2xl w-fit border border-gray-200/50">
                <button
                    onClick={() => setActiveTab("independent")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${activeTab === "independent"
                            ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/20"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    <FaUserMd className="text-sm" />
                    Independent Doctors
                </button>

                <button
                    onClick={() => setActiveTab("clinic")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${activeTab === "clinic"
                            ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/20"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    <FaHospital className="text-sm" />
                    Clinic Doctors
                </button>
            </div>

            {/* Active Tab View */}
            <div className="transition-all duration-200">
                {activeTab === "independent" ? (
                    <IndependentDoctors />
                ) : (
                    <ClinicDoctors />
                )}
            </div>

        </div>
    );
}
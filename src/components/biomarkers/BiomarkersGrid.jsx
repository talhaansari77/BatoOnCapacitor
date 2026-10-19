import CareText from "@/components/CareText";
import React, { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import BiomarkerCard from "./BiomarkerCard";
import { useLocation } from "../LocationContext";
import { translateCareText } from "@/lib/careArabic";
import { useNavigate } from "react-router-dom";

// biomarkers passed in already have .status computed by BiomarkersSection
export default function BiomarkersGrid({ biomarkers }) {
  const navigate = useNavigate();
  const { t, isRTL } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("importance");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let result = biomarkers;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => (b.marker_name.toLowerCase().includes(q) || translateCareText(b.marker_name).toLowerCase().includes(q)));
    }

    if (filterStatus !== "all") {
      result = result.filter((b) => {
        if (filterStatus === "within_target") return b.status.key === "within_bato_target";
        if (filterStatus === "below_target") return b.status.key === "below_bato_target";
        if (filterStatus === "above_target") return b.status.key === "above_bato_target";
        if (filterStatus === "outside_range") return b.status.key === "outside_general_range";
        if (filterStatus === "needs_review") return b.status.key === "needs_review";
        return true;
      });
    }

    if (sortBy === "out_of_range_first") {
      result = [...result].sort((a, b) => {
        const aOut = a.status.key === "outside_general_range";
        const bOut = b.status.key === "outside_general_range";
        return aOut === bOut ? 0 : aOut ? -1 : 1;
      });
    } else if (sortBy === "alphabetical") {
      result = [...result].sort((a, b) => a.marker_name.localeCompare(b.marker_name));
    } else {
      result = [...result].sort((a, b) => {
        if (a.is_priority && !b.is_priority) return -1;
        if (!a.is_priority && b.is_priority) return 1;
        const statusOrder = {
          outside_general_range: 0, needs_review: 1,
          below_bato_target: 2, above_bato_target: 3, within_bato_target: 4,
        };
        return (statusOrder[a.status.key] ?? 99) - (statusOrder[b.status.key] ?? 99);
      });
    }

    return result;
  }, [biomarkers, searchQuery, filterStatus, sortBy]);

  if (biomarkers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-medium text-[#333435] mb-1"><CareText value={"No biomarkers yet"} /></p>
        <p className="text-xs text-[#7c8689] mb-4"><CareText value={"Your biomarker review will appear here after your BATO team uploads lab results."} /></p>
        <button onClick={() => navigate("/Messages?channel=medical_team&context=health_review")} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(196,170,139,0.1)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.2)" }}><CareText value={"Contact your specialist"} /></button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 relative">
        <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c8689]`} />
        <input
          type="text"
          placeholder={t("Search biomarkers...", "ابحث عن مؤشر...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full py-2.5 rounded-xl border text-sm text-[#333435] outline-none ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"}`}
          style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff" }}
        />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 rounded-lg text-xs font-medium border text-[#333435]"
            style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff" }}
          >
            <option value="all"><CareText value={"All"} /></option>
            <option value="within_target"><CareText value={"Within BATO Target"} /></option>
            <option value="below_target"><CareText value={"Below BATO Target"} /></option>
            <option value="above_target"><CareText value={"Above BATO Target"} /></option>
            <option value="outside_range"><CareText value={"Outside General Range"} /></option>
            <option value="needs_review"><CareText value={"Needs Review"} /></option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7c8689] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 rounded-lg text-xs font-medium border text-[#333435]"
            style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff" }}
          >
            <option value="importance"><CareText value={"Most Important First"} /></option>
            <option value="out_of_range_first"><CareText value={"Out of Range First"} /></option>
            <option value="alphabetical"><CareText value={"Alphabetical"} /></option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7c8689] pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-[#7c8689]"><CareText value={"No biomarkers match your search or filter."} /></p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((biomarker) => (
          <BiomarkerCard
            key={biomarker.id}
            biomarker={biomarker}
            isExpanded={expandedId === biomarker.id}
            onToggle={() => setExpandedId(expandedId === biomarker.id ? null : biomarker.id)}
            isPriority={biomarker.is_priority}
          />
        ))}
      </div>
    </div>
  );
}
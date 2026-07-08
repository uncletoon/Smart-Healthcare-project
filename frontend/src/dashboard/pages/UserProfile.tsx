import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { Hospital, Mail, Phone, MapPin, FileText, CheckCircle, Loader2, Edit3, RotateCcw, Globe, Save } from "lucide-react";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { apiService, Facility, FacilityCategory, LocationItem } from "../services/apiService";

export default function UserProfile() {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [facilityCategories, setFacilityCategories] = useState<FacilityCategory[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    company_categories: "",
    email: "",
    contact: "",
    location: "",
    company_address: "",
    website: "",
    company_description: "",
  });

  const [originalData, setOriginalData] = useState({ ...formData });

  async function loadFacilityData() {
    try {
      setLoading(true);
      setError("");
      
      const [facilitiesList, categoriesData, locationsData] = await Promise.all([
        apiService.getMyFacilityList(),
        apiService.getFacilityCategories(),
        apiService.getLocations(),
      ]);

      setFacilityCategories(categoriesData);
      setLocations(locationsData);

      if (facilitiesList.length > 0) {
        const fac = facilitiesList[0];
        setFacility(fac);
        
        const mapped = {
          company_name: fac.company_name || "",
          company_categories: fac.company_categories ? fac.company_categories.toString() : "",
          email: fac.email || "",
          contact: fac.contact || "",
          location: fac.location ? fac.location.toString() : "",
          company_address: fac.company_address || "",
          website: fac.website || "",
          company_description: fac.company_description || "",
        };

        setFormData(mapped);
        setOriginalData(mapped);
      } else {
        setFacility(null);
        setFormData({
          company_name: "",
          company_categories: categoriesData.length > 0 ? categoriesData[0].id.toString() : "",
          email: "",
          contact: "",
          location: locationsData.length > 0 ? locationsData[0].id.toString() : "",
          company_address: "",
          website: "",
          company_description: "",
        });
      }
    } catch (err: any) {
      console.error("Facility profile load error:", err);
      setError("Failed to load facility data. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacilityData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const payload: Partial<Facility> = {
        company_name: formData.company_name,
        company_categories: formData.company_categories ? parseInt(formData.company_categories) : null,
        email: formData.email,
        contact: formData.contact,
        location: formData.location ? parseInt(formData.location) : null,
        company_address: formData.company_address,
        website: formData.website,
        company_description: formData.company_description,
      };

      if (facility) {
        const updated = await apiService.updateFacility(facility.id, payload);
        setFacility(updated);
        
        const mapped = {
          company_name: updated.company_name || "",
          company_categories: updated.company_categories ? updated.company_categories.toString() : "",
          email: updated.email || "",
          contact: updated.contact || "",
          location: updated.location ? updated.location.toString() : "",
          company_address: updated.company_address || "",
          website: updated.website || "",
          company_description: updated.company_description || "",
        };

        setFormData(mapped);
        setOriginalData(mapped);
      } else {
        const created = await apiService.createFacility(payload);
        setFacility(created);

        const mapped = {
          company_name: created.company_name || "",
          company_categories: created.company_categories ? created.company_categories.toString() : "",
          email: created.email || "",
          contact: created.contact || "",
          location: created.location ? created.location.toString() : "",
          company_address: created.company_address || "",
          website: created.website || "",
          company_description: created.company_description || "",
        };

        setFormData(mapped);
        setOriginalData(mapped);
      }

      setSaved(true);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save facility details.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-teal-600 size-10" />
      </div>
    );
  }

  const getCategoryName = (categoryId: string) => {
    const id = parseInt(categoryId);
    const cat = facilityCategories.find(c => c.id === id);
    return cat ? cat.category_name : "General Facility";
  };

  const getLocationName = (locationId: string) => {
    const id = parseInt(locationId);
    const loc = locations.find(l => l.id === id);
    return loc ? loc.location_name : "Kigali, Rwanda";
  };

  return (
    <>
      <PageMeta
        title="Facility Profile Settings | Smart Healthcare"
        description="Edit public description, contact details, physical address, and categories for your clinic or pharmacy."
      />
      <PageBreadcrumb pageTitle="Facility Profile" />

      {saved && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl shadow-theme-sm transition animate-fade-in">
          <CheckCircle className="shrink-0 size-6" />
          <div>
            <p className="font-semibold text-sm">Settings Saved Successfully!</p>
            <p className="text-xs text-green-600">Your facility profile updates have been registered and saved.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {!facility && (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl shadow-theme-xs">
          <h4 className="font-bold text-base mb-1">Onboarding Check: Facility Profile Required</h4>
          <p className="text-sm">
            Welcome to the Smart Healthcare Admin portal! You must complete your health facility registration profile below before configuring services or tracking appointments.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Banner Card */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-teal-50 dark:bg-teal-950/20 border border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-center">
              <Hospital className="w-12 h-12 text-teal-600" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {formData.company_name || "New Health Facility"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getCategoryName(formData.company_categories)} &bull; {getLocationName(formData.location)}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2.5">
                <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-500 uppercase">Live on Registry</span>
              </div>
            </div>
            {!isEditing && facility && (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                size="md"
                className="flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Form Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Details Card */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-theme-xs space-y-5">
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <FileText className="text-brand-500 size-5" />
              General Details
            </h4>

            <div>
              <Label>Facility Name *</Label>
              <Input
                type="text"
                name="company_name"
                required
                disabled={facility ? !isEditing : false}
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="e.g. Kigali Heights Pharmacy"
              />
            </div>

            <div>
              <Label>Facility Type *</Label>
              <select
                name="company_categories"
                disabled={facility ? !isEditing : false}
                value={formData.company_categories}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white disabled:opacity-75"
              >
                {facilityCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Website (Optional)</Label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input
                  type="url"
                  name="website"
                  disabled={facility ? !isEditing : false}
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white disabled:opacity-75"
                  placeholder="e.g. https://clinic.rw"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-theme-xs space-y-5">
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <MapPin className="text-brand-500 size-5" />
              Contacts & Location
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={facility ? !isEditing : false}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <Label>Phone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                  <input
                    type="text"
                    name="contact"
                    required
                    disabled={facility ? !isEditing : false}
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Province & District *</Label>
              <select
                name="location"
                disabled={facility ? !isEditing : false}
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white disabled:opacity-75"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Physical Address / Street *</Label>
              <Input
                type="text"
                name="company_address"
                required
                disabled={facility ? !isEditing : false}
                value={formData.company_address}
                onChange={handleInputChange}
                placeholder="e.g. Kigali Heights, KG 7 Ave, Gasabo"
              />
            </div>
          </div>
        </div>

        {/* Bio / Description Card */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-theme-xs">
          <Label>Facility Bio / Description *</Label>
          <textarea
            name="company_description"
            rows={4}
            required
            disabled={facility ? !isEditing : false}
            value={formData.company_description}
            onChange={handleInputChange}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white mt-2 resize-none disabled:opacity-75"
            placeholder="Tell patients about your medical specialties, staff credentials, or insurance details..."
          />
        </div>

        {/* Submit Actions */}
        {(isEditing || !facility) && (
          <div className="flex justify-end gap-3.5">
            {facility && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset Settings
              </Button>
            )}
            <Button type="submit" className="flex items-center gap-2">
              <Save size={16} />
              {facility ? "Save Profile Settings" : "Register Facility"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
}

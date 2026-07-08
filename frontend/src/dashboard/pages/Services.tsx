import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Badge from "../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Search, Plus, Trash2, Edit, CheckCircle, Loader2 } from "lucide-react";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { apiService, Service, ServiceCategory } from "../services/apiService";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    service_hours: "",
    is_available: true,
    description: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [servicesData, categoriesData] = await Promise.all([
          apiService.getServices(),
          apiService.getServiceCategories(),
        ]);
        setServices(servicesData);
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setFormData((prev) => ({ ...prev, category: categoriesData[0].id.toString() }));
        }
      } catch (err: any) {
        console.error("Failed to load services data:", err);
        setError("Failed to retrieve services. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_available" ? value === "true" : value,
    }));
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: "",
      category: categories.length > 0 ? categories[0].id.toString() : "",
      price: "",
      service_hours: "",
      is_available: true,
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category ? service.category.toString() : "",
      price: service.price,
      service_hours: service.service_hours,
      is_available: service.is_available,
      description: service.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this service?")) {
      try {
        await apiService.deleteService(id);
        setServices((prev) => prev.filter((item) => item.id !== id));
        triggerNotification("Service deleted successfully!");
      } catch (err) {
        alert("Failed to delete service. Please make sure you are authenticated.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Service> = {
        name: formData.name,
        category: formData.category ? parseInt(formData.category) : null,
        price: formData.price,
        service_hours: formData.service_hours,
        is_available: formData.is_available,
        description: formData.description,
      };

      if (editingService) {
        const updated = await apiService.updateService(editingService.id, payload);
        setServices((prev) =>
          prev.map((item) => (item.id === editingService.id ? updated : item)),
        );
        triggerNotification("Service updated successfully!");
      } else {
        const created = await apiService.createService(payload);
        setServices((prev) => [...prev, created]);
        triggerNotification("New service registered successfully!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "An error occurred while saving the service.");
    }
  };

  const triggerNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return "General";
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "General";
  };

  const filteredServices = services.filter((item) => {
    const query = searchQuery.toLowerCase();
    const catName = getCategoryName(item.category).toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      catName.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-teal-600 size-10" />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Manage Facility Services | Smart Healthcare"
        description="Configure medical consultation, diagnostic, and pharmacy services offered at your facility."
      />
      <PageBreadcrumb pageTitle="Offered Services" />

      {successMessage && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl shadow-theme-sm transition animate-fade-in">
          <CheckCircle className="shrink-0 size-6" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-white/3 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <span className="absolute -translate-y-1/2 left-3.5 top-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search services or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
            />
          </div>
          <Button
            onClick={openAddModal}
            size="md"
            className="flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Service
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Service Details
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Hours / Duration
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-gray-400"
                  >
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow
                    key={service.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/1 transition-colors"
                  >
                    <TableCell className="px-5 py-4 max-w-sm">
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                          {service.name}
                        </span>
                        <span
                          className="block text-theme-xs text-gray-400 truncate mt-0.5"
                          title={service.description}
                        >
                          {service.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {getCategoryName(service.category)}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-semibold text-gray-800 dark:text-white/90 text-sm">
                      {parseFloat(service.price).toLocaleString()} RWF
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {service.service_hours}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={
                          service.is_available ? "success" : "error"
                        }
                      >
                        {service.is_available ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(service)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-teal-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          title="Delete Service"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-150 m-4"
      >
        <div className="relative w-full p-6 bg-white dark:bg-gray-900 rounded-3xl">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            {editingService ? "Edit Service details" : "Add New Service"}
          </h4>
          <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
            Fill in the parameters below to configure this service in the system
            catalog.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Service Name *</Label>
              <Input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., General Consultation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Price (RWF) *</Label>
                <Input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 12000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Est. Hours / Duration *</Label>
                <Input
                  type="text"
                  name="service_hours"
                  required
                  value={formData.service_hours}
                  onChange={handleInputChange}
                  placeholder="e.g., 20 mins or 24/7"
                />
              </div>

              <div>
                <Label>Availability Status *</Label>
                <select
                  name="is_available"
                  value={formData.is_available ? "true" : "false"}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                >
                  <option value="true">Active (Visible to public)</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Indicate instructions, equipment required, or other specifics..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingService ? "Save Changes" : "Create Service"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

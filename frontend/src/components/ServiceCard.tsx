import { Star, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
export interface Service {
  id: string | number;
  image: string;
  title: string;
  rating: number | string;
  clinic: string;
  location: string;
}

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full"
      id={`service-card-${service.id}`}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {service.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-sm font-semibold text-gray-700">{service.rating}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-2">{service.clinic}</p>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-6">
          <MapPin className="w-4 h-4" />
          <span>{service.location}</span>
        </div>

        <div className="mt-auto space-y-2">
          <button
            className="w-full py-2.5 bg-[#1B4B36] hover:bg-[#256045] text-white font-semibold rounded-lg transition-colors cursor-pointer"
            id={`book-btn-${service.id}`}
          >
            Book Appointment
          </button>
          <Link
            to={`/services/${service.id}`}
            className="w-full py-2.5 bg-white hover:bg-gray-50 text-[#1B4B36] border border-[#1B4B36] font-semibold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            id={`details-btn-${service.id}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
